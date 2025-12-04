import React, { useEffect } from 'react';
import { Link, Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProcesso } from '../context/ProcessContext';

const Layout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { processo, selecionarProcesso } = useProcesso();

    useEffect(() => {
        if (id) {
            selecionarProcesso(id);
        }
    }, [id]);

    const handleExit = () => {
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background font-sans text-text-main flex flex-col">
            {/* Header */}
            <header className="bg-primary border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-md">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity text-white">
                            Serenity<span className="text-secondary">.</span>
                        </Link>
                        {processo && (
                            <span className="bg-white/5 border border-white/10 text-xs px-3 py-1 rounded-full text-secondary">
                                Espólio de <span className="text-white font-medium">{processo.falecido?.nome}</span>
                            </span>
                        )}
                    </div>
                    <nav className="flex items-center gap-1 bg-black/10 p-1 rounded-full border border-white/10 relative">
                        {[
                            { path: `/processo/${id}/dashboard`, label: 'Dashboard' },
                            { path: `/processo/${id}/bens`, label: 'Bens' },
                            { path: `/processo/${id}/herdeiros`, label: 'Herdeiros' },
                            { path: `/processo/${id}/dividas`, label: 'Dívidas' },
                            { path: `/processo/${id}/relatorio`, label: 'Relatório' },
                        ].map((link) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors z-10 ${active ? 'text-primary' : 'text-gray-300 hover:text-white'
                                        }`}
                                >
                                    {active && (
                                        <span className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm animate-slide-in" style={{ transition: 'all 0.3s ease' }}></span>
                                    )}
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <button
                        onClick={handleExit}
                        className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-4"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-8 mt-auto bg-gray-50">
                <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Serenity. Gestão Inteligente de Inventários.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
