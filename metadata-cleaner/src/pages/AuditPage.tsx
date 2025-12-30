import React from 'react';
import { ShieldCheck, Download, Calendar, Search, File } from 'lucide-react';

const AuditPage = () => {
    const logs = [
        { id: 1, file: 'contract_final.pdf', date: '2024-12-29 10:30 AM', action: 'Full Strip', status: 'Success', size: '2.4 MB' },
        { id: 2, file: 'IMG_2042.jpg', date: '2024-12-29 10:28 AM', action: 'GPS Only', status: 'Success', size: '4.1 MB' },
        { id: 3, file: 'budget_2025.xlsx', date: '2024-12-28 04:15 PM', action: 'Full Strip', status: 'Success', size: '1.2 MB' },
        { id: 4, file: 'presentation_v2.pptx', date: '2024-12-28 02:20 PM', action: 'Author Removal', status: 'Success', size: '15.8 MB' },
        { id: 5, file: 'scan_001.pdf', date: '2024-12-27 09:10 AM', action: 'Full Strip', status: 'Success', size: '0.5 MB' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Audit Logs</h1>
                    <p className="text-secondary-500 mt-1">Track all file sanitization activities for compliance.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
                        <input type="text" placeholder="Search logs..." className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none w-full md:w-64" />
                    </div>
                    <button className="px-4 py-2 bg-white border border-secondary-300 rounded-lg text-secondary-700 font-medium hover:bg-secondary-50 transition">Export CSV</button>
                </div>
            </div>

            <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200">
                        <thead className="bg-secondary-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Download Report</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-secondary-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <File className="w-4 h-4 text-secondary-400" />
                                            <span className="font-medium text-secondary-900">{log.file}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-secondary-500 text-sm">{log.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-secondary-700 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 border border-secondary-200">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-secondary-500 text-sm font-mono">{log.size}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                                            <ShieldCheck className="w-3.5 h-3.5" /> {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-secondary-400 hover:text-primary-600 transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditPage;
