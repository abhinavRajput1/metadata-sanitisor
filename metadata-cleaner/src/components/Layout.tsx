import React from 'react';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = React.useState(false);
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-secondary-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <ShieldCheck className="h-8 w-8 text-primary-500" />
                        <span className="text-xl font-bold text-secondary-900 tracking-tight">MetaClean</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8">
                        <NavLink to="/" active={isActive('/')}>Home</NavLink>
                        <NavLink to="/tool" active={isActive('/tool')}>Sanitize Tool</NavLink>
                        <NavLink to="/audit" active={isActive('/audit')}>Audit Logs</NavLink>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/tool" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary-200">
                            Launch App
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-secondary-600 hover:text-primary-600 p-2">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-secondary-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
                        <MobileNavLink to="/tool" onClick={() => setIsOpen(false)}>Sanitize Tool</MobileNavLink>
                        <MobileNavLink to="/audit" onClick={() => setIsOpen(false)}>Audit Logs</MobileNavLink>
                    </div>
                </div>
            )}
        </nav>
    );
};

const NavLink = ({ to, children, active }: { to: string, children: React.ReactNode, active: boolean }) => (
    <Link to={to} className={`${active ? 'text-primary-600 font-semibold' : 'text-secondary-600 hover:text-primary-600'} transition-colors text-sm font-medium`}>
        {children}
    </Link>
);

const MobileNavLink = ({ to, children, onClick }: { to: string, children: React.ReactNode, onClick: () => void }) => (
    <Link to={to} onClick={onClick} className="block px-3 py-2 rounded-md text-base font-medium text-secondary-700 hover:text-primary-600 hover:bg-secondary-50">
        {children}
    </Link>
);

const Footer = () => (
    <footer className="bg-white border-t border-secondary-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-6 w-6 text-primary-500" />
                        <span className="text-lg font-bold text-secondary-900">MetaClean</span>
                    </div>
                    <p className="text-sm text-secondary-500">Securely strip metadata from your files without them ever leaving your browser. Privacy by design.</p>
                </div>

                <div>
                    <h3 className="font-semibold text-secondary-900 mb-4">Product</h3>
                    <ul className="space-y-2 text-sm text-secondary-500">
                        <li><Link to="/tool" className="hover:text-primary-600">Web Sanitizer</Link></li>
                        <li><Link to="#" className="hover:text-primary-600">Browser Extension</Link></li>
                        <li><Link to="#" className="hover:text-primary-600">Enterprise API</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-secondary-900 mb-4">Resources</h3>
                    <ul className="space-y-2 text-sm text-secondary-500">
                        <li><Link to="#" className="hover:text-primary-600">Documentation</Link></li>
                        <li><Link to="#" className="hover:text-primary-600">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-secondary-100 text-center text-sm text-secondary-400">
                &copy; {new Date().getFullYear()} MetaClean. All rights reserved. Zero Data Retention Policy.
            </div>
        </div>
    </footer>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col bg-secondary-50 font-sans">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
