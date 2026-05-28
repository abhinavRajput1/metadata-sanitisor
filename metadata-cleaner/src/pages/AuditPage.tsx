import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Download, Search, File, RefreshCw, Inbox, Lock, Unlock, Hash, AlertTriangle, Info } from 'lucide-react';

interface LogEntry {
    id: string;
    file_id: string | null;
    filename: string;
    timestamp: string;
    action: string;
    status: string;
    file_size: string;
    file_size_bytes: number;
    file_hash_sha256: string | null;
    ip_address?: string;
    metadata_keys_removed: string[];
}

const AuditPage = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [adminInput, setAdminInput] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminPrompt, setShowAdminPrompt] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const isHosted = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

    const fetchLogs = useCallback(async () => {
        try {
            setFetchError(false);
            const params = new URLSearchParams({ limit: '100', offset: '0' });
            if (adminKey) params.set('admin_key', adminKey);
            const res = await fetch(`/api/logs?${params}`);
            if (!res.ok) throw new Error('Failed to fetch logs');
            const data = await res.json();
            setLogs(data.logs ?? []);
            setTotal(data.total ?? 0);
            setIsAdmin(data.admin ?? false);
        } catch (err) {
            console.error('Failed to load audit logs:', err);
            setFetchError(true);
        } finally {
            setLoading(false);
        }
    }, [adminKey]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10_000);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const filteredLogs = logs.filter(log =>
        log.filename.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.status.toLowerCase().includes(search.toLowerCase()) ||
        (log.file_hash_sha256 && log.file_hash_sha256.toLowerCase().includes(search.toLowerCase()))
    );

    const handleExportCSV = () => {
        if (filteredLogs.length === 0) return;

        const headers = ['File Name', 'Timestamp', 'Action', 'Status', 'File Size', 'SHA-256 Hash'];
        if (isAdmin) headers.push('IP Address');

        const rows = filteredLogs.map(log => {
            const row = [
                log.filename,
                formatDate(log.timestamp),
                log.action,
                log.status,
                log.file_size,
                log.file_hash_sha256 || '',
            ];
            if (isAdmin) row.push(log.ip_address || '');
            return row;
        });

        const csv = [headers, ...rows].map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleAdminLogin = () => {
        setAdminKey(adminInput);
        setShowAdminPrompt(false);
        setLoading(true);
    };

    const handleAdminLogout = () => {
        setAdminKey('');
        setAdminInput('');
        setIsAdmin(false);
        setLoading(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Audit Logs</h1>
                    <p className="text-secondary-500 mt-1">
                        Track all file sanitization activities for compliance.
                        {total > 0 && <span className="ml-2 text-secondary-400">({total} total entries)</span>}
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto items-center flex-wrap">
                    {/* Admin toggle */}
                    {isAdmin ? (
                        <button
                            onClick={handleAdminLogout}
                            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 text-sm font-medium hover:bg-amber-100 transition"
                            title="Admin mode active — click to logout"
                        >
                            <Unlock className="w-3.5 h-3.5" /> Admin
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowAdminPrompt(!showAdminPrompt)}
                            className="p-2 bg-white border border-secondary-300 rounded-lg text-secondary-400 hover:text-secondary-600 hover:border-secondary-400 transition"
                            title="Admin login to view IP addresses"
                        >
                            <Lock className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={fetchLogs}
                        className="p-2 bg-white border border-secondary-300 rounded-lg text-secondary-500 hover:text-primary-600 hover:border-primary-300 transition"
                        title="Refresh logs"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none w-full md:w-64"
                        />
                    </div>
                    <button
                        onClick={handleExportCSV}
                        disabled={filteredLogs.length === 0}
                        className="px-4 py-2 bg-white border border-secondary-300 rounded-lg text-secondary-700 font-medium hover:bg-secondary-50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Admin key prompt */}
            {showAdminPrompt && !isAdmin && (
                <div className="mb-6 p-4 bg-secondary-50 border border-secondary-200 rounded-xl flex items-center gap-3">
                    <Lock className="w-5 h-5 text-secondary-400 shrink-0" />
                    <input
                        type="password"
                        placeholder="Enter admin secret..."
                        value={adminInput}
                        onChange={(e) => setAdminInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                        className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                        autoFocus
                    />
                    <button
                        onClick={handleAdminLogin}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition"
                    >
                        Unlock
                    </button>
                    <button
                        onClick={() => { setShowAdminPrompt(false); setAdminInput(''); }}
                        className="px-3 py-2 text-secondary-500 hover:text-secondary-700 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-secondary-400">
                    <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium">Loading audit logs…</p>
                </div>
            ) : fetchError ? (
                <div className="flex flex-col items-center justify-center py-24 text-secondary-400">
                    <AlertTriangle className="w-12 h-12 mb-4 text-amber-400" />
                    <p className="font-medium text-lg text-secondary-600">Could not load audit logs</p>
                    <p className="text-sm mt-1">The logging API may be unavailable. Try refreshing.</p>
                    <button
                        onClick={fetchLogs}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-secondary-400">
                    <Inbox className="w-12 h-12 mb-4" />
                    <p className="font-medium text-lg">
                        {search ? 'No logs match your search.' : 'No sanitization logs yet.'}
                    </p>
                    <p className="text-sm mt-1">
                        {search ? 'Try a different search term.' : 'Sanitize a file and your activity will appear here.'}
                    </p>
                    {isHosted && !search && (
                        <div className="mt-6 max-w-md mx-auto p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm flex items-start gap-3">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Hosted environment detected</p>
                                <p className="mt-1 text-blue-600">
                                    Audit logs on Vercel are session-based and not persisted across deployments.
                                    Sanitize a file to see logs for this session. For persistent logging, run the app locally or connect a database.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-secondary-200">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">SHA-256</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                                    {isAdmin && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-amber-600 uppercase tracking-wider">IP Address</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-200">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-secondary-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <File className="w-4 h-4 text-secondary-400" />
                                                <span className="font-medium text-secondary-900">{log.filename}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-secondary-500 text-sm">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-secondary-700 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 border border-secondary-200">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-secondary-500 text-sm font-mono">{log.file_size}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-secondary-400 text-xs font-mono">
                                            {log.file_hash_sha256 ? (
                                                <span
                                                    className="inline-flex items-center gap-1 cursor-default"
                                                    title={log.file_hash_sha256}
                                                >
                                                    <Hash className="w-3 h-3 text-secondary-300" />
                                                    {log.file_hash_sha256.slice(0, 12)}…
                                                </span>
                                            ) : (
                                                <span className="text-secondary-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-full ${
                                                log.status === 'Success'
                                                    ? 'text-emerald-600 bg-emerald-50'
                                                    : 'text-red-600 bg-red-50'
                                            }`}>
                                                <ShieldCheck className="w-3.5 h-3.5" /> {log.status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-amber-700 bg-amber-50/50">
                                                {log.ip_address || '—'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditPage;
