import React, { useState } from 'react';
import FileUploader from '../components/tool/FileUploader';
import { type Metadata } from '../utils/metadata';
import {
    FileText, Image, CheckCircle, AlertTriangle, Shield,
    Download, RefreshCw, File, Film, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FileStatus = 'scanning' | 'ready' | 'sanitizing' | 'done';

interface FileItem {
    id: string;
    file: File;
    status: FileStatus;
    metadata: Metadata;
    progress: number;
}

const ToolPage = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleUpload = async (uploadedFiles: FileList | null) => {
        if (!uploadedFiles) return;

        const newFiles: FileItem[] = Array.from(uploadedFiles).map(f => ({
            id: Math.random().toString(36).substring(7), // Temporary ID until upload
            file: f,
            status: 'scanning',
            metadata: {},
            progress: 0
        }));

        setFiles(prev => [...prev, ...newFiles]);
        if (!selectedId && newFiles.length > 0) setSelectedId(newFiles[0].id);

        // Upload files to backend
        for (const fileItem of newFiles) {
            const formData = new FormData();
            formData.append('file', fileItem.file);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) throw new Error('Upload failed');

                const data = await response.json();

                setFiles(prev => prev.map(f => {
                    if (f.file === fileItem.file) { // Match by file object reference since ID changes
                        return {
                            ...f,
                            id: data.id,
                            status: 'ready',
                            metadata: data.metadata,
                            progress: 100
                        };
                    }
                    return f;
                }));

                // If this was the selected item, update selected ID
                if (selectedId === fileItem.id) setSelectedId(data.id);

            } catch (error) {
                console.error("Upload error:", error);
                setFiles(prev => prev.map(f => f.file === fileItem.file ? { ...f, status: 'scanning' /* error state TODO */ } : f));
            }
        }
    };

    const handleSanitize = async (id: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'sanitizing', progress: 0 } : f));

        try {
            const response = await fetch(`/api/sanitize/${id}`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Sanitization failed');

            // Simulate progress for UX since backend is sync for now
            let p = 0;
            const interval = setInterval(() => {
                p += 20;
                setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: p } : f));
                if (p >= 100) {
                    clearInterval(interval);
                    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done' } : f));
                }
            }, 100);

        } catch (error) {
            console.error("Sanitize error:", error);
        }
    };

    const handleSanitizeAll = () => {
        files.filter(f => f.status === 'ready').forEach(f => handleSanitize(f.id));
    };

    const handleDownload = (id: string, _filename: string) => {
        window.open(`/api/download/${id}`, '_blank');
    };

    const selectedFile = files.find(f => f.id === selectedId);

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="w-5 h-5 text-purple-500" />;
        if (type.startsWith('video/')) return <Film className="w-5 h-5 text-pink-500" />;
        if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-yellow-500" />;
        if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
        return <File className="w-5 h-5 text-blue-500" />;
    };

    if (files.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-secondary-900">Metadata Sanitizer</h1>
                    <p className="text-secondary-500">Upload your files to begin scanning for hidden data.</p>
                </div>
                <FileUploader onUpload={handleUpload} />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex bg-white overflow-hidden">
            {/* Sidebar - File List */}
            <div className="w-1/3 border-r border-secondary-200 flex flex-col bg-secondary-50">
                <div className="p-4 border-b border-secondary-200 bg-white flex justify-between items-center">
                    <h2 className="font-bold text-secondary-700">Files ({files.length})</h2>
                    <button onClick={() => document.getElementById('addMore')?.click()} className="text-primary-600 text-sm font-medium hover:text-primary-700">+ Add More</button>
                    <input type="file" id="addMore" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    <AnimatePresence>
                        {files.map(file => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={() => setSelectedId(file.id)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedId === file.id ? 'bg-white border-primary-500 shadow-md ring-1 ring-primary-100' : 'bg-transparent border-transparent hover:bg-secondary-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {getFileIcon(file.file.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-secondary-900 truncate">{file.file.name}</p>
                                        <p className="text-xs text-secondary-500">{(file.file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    {file.status === 'scanning' && <RefreshCw className="w-4 h-4 animate-spin text-secondary-400" />}
                                    {file.status === 'ready' && <AlertTriangle className={`w-4 h-4 ${file.metadata["Risk Level"] === 'High' ? 'text-red-500' : 'text-yellow-500'}`} />}
                                    {file.status === 'sanitizing' && <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}
                                    {file.status === 'done' && <CheckCircle className="w-4 h-4 text-primary-500" />}
                                </div>
                                {file.status === 'sanitizing' && (
                                    <div className="h-1 w-full bg-secondary-200 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500 transition-all duration-200" style={{ width: `${file.progress}%` }} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="p-4 border-t border-secondary-200 bg-white">
                    <button
                        onClick={handleSanitizeAll}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                    >
                        <Shield className="w-4 h-4" /> Sanitize All
                    </button>
                </div>
            </div>

            {/* Main Content - Metadata Viewer */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50">
                {selectedFile ? (
                    <div className="h-full flex flex-col p-8 overflow-y-auto">
                        <header className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-secondary-900 break-all">{selectedFile.file.name}</h1>
                                <p className="text-secondary-500 flex items-center gap-2 mt-1">
                                    {selectedFile.status === 'ready' && <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded text-xs font-bold">Risk Found</span>}
                                    {selectedFile.status === 'done' && <span className="text-primary-600 bg-primary-100 px-2 py-0.5 rounded text-xs font-bold">Secure</span>}
                                    <span className="text-xs uppercase tracking-wider">{selectedFile.file.type || 'Unknown Type'}</span>
                                </p>
                            </div>
                            <div>
                                {selectedFile.status === 'ready' && (
                                    <button onClick={() => handleSanitize(selectedFile.id)} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow">
                                        Remove Metadata
                                    </button>
                                )}
                                {selectedFile.status === 'done' && (
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg font-semibold hover:bg-secondary-200 transition">
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleDownload(selectedFile.id, selectedFile.file.name)}
                                            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow flex gap-2 items-center"
                                        >
                                            <Download className="w-4 h-4" /> Download
                                        </button>
                                    </div>
                                )}
                            </div>
                        </header>

                        {selectedFile.status === 'scanning' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-secondary-400">
                                <RefreshCw className="w-12 h-12 animate-spin mb-4" />
                                <p>Analyzing file structure...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Risk Panel */}
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Detected Sensitivity
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(selectedFile.metadata).map(([key, value]) => {
                                                if (key === 'Risk Level' || key.includes('Name') || key.includes('Size') || key.includes('Modified')) return null;
                                                return (
                                                    <div key={key} className="flex justify-between items-center py-2 border-b border-secondary-50 last:border-0 hover:bg-secondary-50 px-2 rounded cursor-default">
                                                        <span className="text-secondary-500 text-sm font-medium">{key}</span>
                                                        <span className="text-secondary-900 text-sm font-semibold text-right max-w-[200px] truncate" title={value}>{value}</span>
                                                    </div>
                                                )
                                            })}
                                            {Object.keys(selectedFile.metadata).length <= 4 && (
                                                <p className="text-secondary-400 text-sm italic py-2">No sensitive metadata detected in this category.</p>
                                            )}
                                        </div>
                                    </div>

                                    {selectedFile.status === 'done' && (
                                        <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100">
                                            <h3 className="text-lg font-bold text-primary-900 mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" /> Sanitization Report
                                            </h3>
                                            <p className="text-primary-800 text-sm mb-4">The following items have been permanently stripped from the file:</p>
                                            <ul className="list-disc pl-5 text-sm text-primary-700 space-y-1">
                                                <li>GPS Coordinates</li>
                                                <li>Camera Serial Number</li>
                                                <li>Author Name</li>
                                                <li>Revision History</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Preview / Comparison */}
                                <div className="bg-secondary-50 rounded-2xl border border-secondary-200 flex items-center justify-center p-8 min-h-[400px]">
                                    {/* Placeholder for file preview */}
                                    <div className="text-center">
                                        <File className="w-24 h-24 text-secondary-300 mx-auto mb-4" />
                                        <p className="text-secondary-500 font-medium">{selectedFile.file.name}</p>
                                        <p className="text-secondary-400 text-sm">Preview not available for secure documents</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-secondary-400">
                        <p>Select a file to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolPage;
