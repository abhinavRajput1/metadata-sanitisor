import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, ShieldOff, FileCheck, Lock, Eye, Zap, Search, Globe, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    { icon: Search, title: "Hidden Metadata Detection", desc: "Reveals author, location, device info embedded in files." },
    { icon: ShieldOff, title: "Selective Sanitization", desc: "Choose exactly what to keep and what to strip." },
    { icon: Lock, title: "100% Client-Side", desc: "Files never leave your device. Zero retention policy." },
    { icon: Zap, title: "Bulk Processing", desc: "Process hundreds of documents and images in seconds." },
];

const LandingPage = () => {
    return (
        <div className="flex flex-col">
            {/* Hero */}
            <section className="relative overflow-hidden pt-20 pb-32">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-50 via-white to-secondary-50 -z-10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <span className="inline-block py-1 px-3 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold tracking-wide uppercase mb-6 border border-primary-200">
                            Privacy First Security
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-secondary-900 tracking-tight mb-6 leading-tight">
                            Share Files. <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Not Your Identity.</span>
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-secondary-600 mb-10 leading-relaxed">
                            Automatically remove hidden metadata from photos, documents, and videos before sharing. Prevent accidental data leakage with our secure, browser-based tool.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/tool" className="px-8 py-4 bg-primary-600 rounded-lg text-white font-bold text-lg hover:bg-primary-700 transition shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                <Upload className="w-5 h-5" />
                                Start Cleaning Files
                            </Link>
                            <button className="px-8 py-4 bg-white border border-secondary-200 rounded-lg text-secondary-700 font-bold text-lg hover:bg-secondary-50 transition shadow-sm flex items-center justify-center gap-2">
                                How it Works
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-secondary-900">Why Clean Your Metadata?</h2>
                        <p className="mt-4 text-secondary-500 text-lg">Every file you share carries invisible data like GPS coordinates, author names, and timestamps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="p-8 rounded-2xl bg-secondary-50 hover:bg-white border border-transparent hover:border-secondary-100 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <f.icon className="h-7 w-7 text-primary-500" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary-900 mb-3">{f.title}</h3>
                                <p className="text-secondary-500 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 bg-secondary-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl -translate-x-1/2 translate-y-1/2" />

                <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to secure your files?</h2>
                    <p className="text-secondary-400 mb-10 text-lg">No signup required. Completely free and runs entirely in your browser.</p>
                    <Link to="/tool" className="inline-flex items-center gap-2 px-10 py-4 bg-primary-500 rounded-lg text-white font-bold text-lg hover:bg-primary-600 transition shadow-lg hover:shadow-primary-500/20">
                        Launch Sanitizer
                        <ShieldOff className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
