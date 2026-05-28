"""
Audit logger – stores sanitization logs as a JSON lines file.

Each line in the log file is a self-contained JSON object so appends
are atomic and the file is never fully re-serialized.

On serverless platforms (e.g. Vercel) the /tmp filesystem is ephemeral
and not shared across invocations, so logs written during one request
will not be visible in subsequent requests. An in-memory fallback list
is maintained so that logs created within the *current* process lifetime
are always returned.
"""

import hashlib
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

LOG_DIR = Path("/tmp/logs")
LOG_FILE = LOG_DIR / "audit.jsonl"

_lock = threading.Lock()

# In-memory list used as a fallback when the filesystem is ephemeral.
_memory_logs: list[dict] = []


def _ensure_log_dir() -> None:
    """Lazily create the log directory (may fail on read-only FS)."""
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
    except OSError:
        pass


def compute_sha256(file_path: Path) -> str:
    """Compute the SHA-256 hash of a file without loading it entirely into memory."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def _format_size(size_bytes: int) -> str:
    """Human-readable file size."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def log_event(
    *,
    filename: str,
    action: str,
    status: str,
    file_size_bytes: int,
    file_id: Optional[str] = None,
    file_hash: Optional[str] = None,
    ip_address: Optional[str] = None,
    metadata_keys_removed: Optional[list[str]] = None,
) -> dict:
    """Append a sanitization event to the audit log and return the entry."""
    entry = {
        "id": os.urandom(8).hex(),
        "file_id": file_id,
        "filename": filename,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "status": status,
        "file_size": _format_size(file_size_bytes),
        "file_size_bytes": file_size_bytes,
        "file_hash_sha256": file_hash,
        "ip_address": ip_address,
        "metadata_keys_removed": metadata_keys_removed or [],
    }

    with _lock:
        # Always keep in memory
        _memory_logs.append(entry)

        # Best-effort persist to disk
        try:
            _ensure_log_dir()
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except OSError:
            pass  # Disk write failed; in-memory copy is still saved

    return entry


def get_logs(limit: int = 100, offset: int = 0, include_ip: bool = False) -> list[dict]:
    """Read the most recent log entries (newest first).

    Tries to read from the JSONL file first. If the file doesn't exist or
    is empty (common on serverless), falls back to the in-memory list.

    Args:
        include_ip: When False (default), the ``ip_address`` field is
                    stripped from every entry so only admins can access it.
    """
    entries: list[dict] = []

    # Try reading from disk
    try:
        if LOG_FILE.exists():
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        try:
                            entries.append(json.loads(line))
                        except json.JSONDecodeError:
                            continue
    except OSError:
        pass

    # Merge in-memory entries that aren't already on disk
    if _memory_logs:
        disk_ids = {e.get("id") for e in entries}
        for entry in _memory_logs:
            if entry.get("id") not in disk_ids:
                entries.append(entry)

    # Newest first
    entries.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
    page = entries[offset : offset + limit]

    if not include_ip:
        for entry in page:
            entry.pop("ip_address", None)

    return page


def get_log_count() -> int:
    """Return the total number of log entries."""
    count = 0

    try:
        if LOG_FILE.exists():
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        count += 1
    except OSError:
        pass

    # Add in-memory entries not on disk
    if _memory_logs:
        disk_count = count
        # If disk has entries, some memory entries might overlap
        if disk_count > 0:
            try:
                disk_ids: set[str] = set()
                if LOG_FILE.exists():
                    with open(LOG_FILE, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line:
                                try:
                                    obj = json.loads(line)
                                    disk_ids.add(obj.get("id", ""))
                                except json.JSONDecodeError:
                                    pass
                for entry in _memory_logs:
                    if entry.get("id") not in disk_ids:
                        count += 1
            except OSError:
                count = max(count, len(_memory_logs))
        else:
            count = len(_memory_logs)

    return count
