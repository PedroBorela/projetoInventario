import React, { useEffect } from 'react';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useProcesso } from '../context/ProcessContext';

const Layout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { processo, selecionarProcesso } = useProcesso();

    useEffect(() => {
        if (id) {
            selecionarProcesso(id);
        }
    }, [id]);

    const handleExit = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold tracking-wide">Serenity</h1>
                        {processo && (
                            <span className="bg-blue-800 text-xs px-2 py-1 rounded text-blue-200">
                                Espólio de {processo.falecido?.nome}
                            </span>
                        )}
                    </div>
                    <nav className="flex items-center gap-6">
                        <Link to={`/processo/${id}/dashboard`} className="hover:text-accent transition-colors font-medium">Dashboard</Link>
                        <Link to={`/processo/${id}/bens`} className="hover:text-accent transition-colors font-medium">Bens</Link>
                        <Link to={`/processo/${id}/herdeiros`} className="hover:text-accent transition-colors font-medium">Herdeiros</Link>
                        <Link to={`/processo/${id}/dividas`} className="hover:text-accent transition-colors font-medium">Dívidas</Link>
                        <Link to={`/processo/${id}/relatorio`} className="hover:text-accent transition-colors font-medium">Relatório</Link>
                        <button
                            onClick={handleExit}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded transition-colors ml-4"
                        >
                            Sair do Processo
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-400 py-6 mt-auto">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} Serenity - Gestão Inteligente de Inventários. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
