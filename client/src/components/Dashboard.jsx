import React, { useEffect, useState } from 'react';
import { useProcesso } from '../context/ProcessContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { processo, loading, processoId } = useProcesso();
    const [stats, setStats] = useState({
        totalBens: 0,
        totalDividas: 0,
        totalHerdeiros: 0,
        monteMor: 0,
        montePartivel: 0,
        meacao: 0,
        impostoEstimado: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (processoId) {
            fetchDashboardData();
        }
    }, [processoId]);

    const fetchDashboardData = async () => {
        try {
            setLoadingStats(true);
            const [bensRes, dividasRes, herdeirosRes] = await Promise.all([
                api.get(`/bens?processoId=${processoId}`),
                api.get(`/dividas?processoId=${processoId}`),
                api.get(`/herdeiros?processoId=${processoId}`)
            ]);

            const bens = bensRes.data;
            const dividas = dividasRes.data;
            const herdeiros = herdeirosRes.data;

            const totalBens = bens.reduce((acc, bem) => acc + Number(bem.valorMercado || bem.valor || 0), 0);
            const totalDividas = dividas.reduce((acc, div) => acc + Number(div.valor || 0), 0);

            // Basic calculation logic (simplified)
            const meacao = processo?.config?.regimeBens === 'comunhao_universal' ? totalBens * 0.5 :
                processo?.config?.regimeBens === 'parcial' ? totalBens * 0.5 : 0; // Simplified assumption

            const monteMor = totalBens;
            const montePartivel = Math.max(0, monteMor - totalDividas - meacao);
            const aliquota = processo?.config?.aliquotaITCMD || 4;
            const impostoEstimado = montePartivel * (aliquota / 100);

            setStats({
                totalBens: bens.length,
                totalDividas: dividas.length,
                totalHerdeiros: herdeiros.length,
                monteMor,
                montePartivel,
                meacao,
                impostoEstimado,
                dividasValue: totalDividas
            });
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (loading || loadingStats) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
    );

    if (!processo) return <div className="text-secondary">Selecione um processo para visualizar o dashboard.</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-text-main">Visão Geral</h1>
                    <p className="text-gray-500 mt-1">
                        Acompanhamento do inventário de <span className="text-primary font-bold">{processo.falecido?.nome}</span>
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Status do Processo</div>
                    <div className="text-primary font-bold uppercase tracking-wider">Em Andamento</div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Monte Mor Card */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">💰</span>
                    </div>
                    <div className="text-gray-500 text-sm font-medium mb-2">Monte Mor (Total Bens)</div>
                    <div className="text-2xl font-bold text-text-main">{formatCurrency(stats.monteMor)}</div>
                    <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                        <span className="text-text-main font-bold">{stats.totalBens}</span> bens cadastrados
                    </div>
                </div>

                {/* Dívidas Card */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">📉</span>
                    </div>
                    <div className="text-gray-500 text-sm font-medium mb-2">Total Dívidas</div>
                    <div className="text-2xl font-bold text-error">{formatCurrency(stats.dividasValue)}</div>
                    <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                        <span className="text-text-main font-bold">{stats.totalDividas}</span> dívidas cadastradas
                    </div>
                </div>

                {/* Monte Partível Card */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">⚖️</span>
                    </div>
                    <div className="text-gray-500 text-sm font-medium mb-2">Monte Partível</div>
                    <div className="text-2xl font-bold text-success">{formatCurrency(stats.montePartivel)}</div>
                    <div className="mt-4 text-xs text-gray-400">
                        Líquido para partilha
                    </div>
                </div>

                {/* ITCMD Card */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl">🏛️</span>
                    </div>
                    <div className="text-gray-500 text-sm font-medium mb-2">Estimativa ITCMD</div>
                    <div className="text-2xl font-bold text-warning">{formatCurrency(stats.impostoEstimado)}</div>
                    <div className="mt-4 text-xs text-gray-400">
                        Alíquota base: <span className="text-text-main font-bold">{processo.config?.aliquotaITCMD || 4}%</span>
                    </div>
                </div>
            </div>

            {/* Visualizations Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Distribution Bar Chart (CSS based) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-text-main mb-6">Distribuição do Patrimônio</h3>

                    <div className="space-y-6">
                        {/* Meação Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Meação (Cônjuge)</span>
                                <span className="text-text-main font-medium">{formatCurrency(stats.meacao)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${stats.monteMor > 0 ? (stats.meacao / stats.monteMor) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Dívidas Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Dívidas e Obrigações</span>
                                <span className="text-text-main font-medium">{formatCurrency(stats.dividasValue)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-error h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${stats.monteMor > 0 ? (stats.dividasValue / stats.monteMor) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* ITCMD Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Impostos (ITCMD)</span>
                                <span className="text-text-main font-medium">{formatCurrency(stats.impostoEstimado)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-warning h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${stats.monteMor > 0 ? (stats.impostoEstimado / stats.monteMor) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Herança Líquida Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Herança Líquida (Herdeiros)</span>
                                <span className="text-text-main font-medium">{formatCurrency(stats.montePartivel - stats.impostoEstimado)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-success h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${stats.monteMor > 0 ? ((stats.montePartivel - stats.impostoEstimado) / stats.monteMor) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Next Steps */}
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-bold text-text-main mb-6">Ações Rápidas</h3>
                    <div className="space-y-3 flex-grow">
                        <Link to={`/processo/${processoId}/bens`} className="block p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all group">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-text-main group-hover:text-primary transition-colors">Gerenciar Bens</span>
                                <span className="text-gray-400">→</span>
                            </div>
                        </Link>
                        <Link to={`/processo/${processoId}/herdeiros`} className="block p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all group">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-text-main group-hover:text-primary transition-colors">Gerenciar Herdeiros</span>
                                <span className="text-gray-400">→</span>
                            </div>
                        </Link>
                        <Link to={`/processo/${processoId}/dividas`} className="block p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all group">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-text-main group-hover:text-primary transition-colors">Gerenciar Dívidas</span>
                                <span className="text-gray-400">→</span>
                            </div>
                        </Link>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <Link to={`/processo/${processoId}/relatorio`} className="w-full block text-center bg-secondary text-text-main font-bold py-3 rounded-full hover:bg-gray-200 transition-colors uppercase text-sm">
                            Ver Relatório Completo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
