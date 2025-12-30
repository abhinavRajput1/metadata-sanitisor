import React, { useCallback } from 'react';
import { Upload, FilePlus, FileType } from 'lucide-react';

interface FileUploaderProps {
    onUpload: (files: FileList | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUpload(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpload(e.target.files);
    };

    return (
        <div
            className="w-full h-96 border-2 border-dashed border-secondary-300 rounded-2xl flex flex-col items-center justify-center bg-secondary-50 hover:bg-white hover:border-primary-400 transition-all cursor-pointer group shadow-inner hover:shadow-lg"
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => document.getElementById('fileInput')?.click()}
        >
            <input type="file" id="fileInput" multiple className="hidden" onChange={handleChange} />
            <div className="p-6 rounded-full bg-white shadow-sm mb-6 group-hover:scale-110 transition-transform ring-4 ring-secondary-100 group-hover:ring-primary-100">
                <Upload className="w-12 h-12 text-primary-500" />
            </div>
            <h3 className="text-2xl font-bold text-secondary-900">Drop files here to sanitize</h3>
            <p className="text-secondary-500 mt-2 text-lg">or click to browse documents, images, videos</p>

            <div className="mt-8 flex gap-4 text-xs font-semibold text-secondary-500">
                <div className="flex bg-white px-3 py-1.5 rounded-lg border border-secondary-200 shadow-sm items-center gap-2">
                    <FileType className="w-4 h-4 text-blue-500" /> JPG/PNG
                </div>
                <div className="flex bg-white px-3 py-1.5 rounded-lg border border-secondary-200 shadow-sm items-center gap-2">
                    <FileType className="w-4 h-4 text-red-500" /> PDF
                </div>
                <div className="flex bg-white px-3 py-1.5 rounded-lg border border-secondary-200 shadow-sm items-center gap-2">
                    <FileType className="w-4 h-4 text-blue-700" /> DOCX
                </div>
                <div className="flex bg-white px-3 py-1.5 rounded-lg border border-secondary-200 shadow-sm items-center gap-2">
                    <FileType className="w-4 h-4 text-purple-500" /> AV/Media
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
