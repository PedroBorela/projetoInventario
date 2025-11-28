import React from 'react';
import { useProcesso } from '../context/ProcessContext';
import InventarioProcess from './InventarioProcess';

const Dashboard = () => {
    const { processo, loading } = useProcesso();

    if (loading) return <div>Carregando...</div>;
    if (!processo) return <div>Selecione um processo para visualizar o dashboard.</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Espólio de {processo.falecido?.nome || 'N/A'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                        <span className="font-semibold">Data do Óbito:</span> {processo.falecido?.dataObito || '-'}
                    </div>
                    <div>
                        <span className="font-semibold">Inventariante:</span> {processo.inventariante?.nome || '-'}
                    </div>
                    <div>
                        <span className="font-semibold">Regime de Bens:</span> {processo.config?.regimeBens || '-'}
                    </div>
                </div>
            </div>

            {/* Reusing the main process view as the dashboard content for now */}
            <InventarioProcess />
        </div>
    );
};

export default Dashboard;
