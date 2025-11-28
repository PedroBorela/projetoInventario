import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useProcesso } from '../context/ProcessContext';
import Modal from '../components/Modal';

const LandingPage = () => {
    const navigate = useNavigate();
    const { selecionarProcesso } = useProcesso();
    const [processos, setProcessos] = useState([]);
    const [showNewProcessModal, setShowNewProcessModal] = useState(false);

    // Modal Feedback State
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // New Process Form State
    const [novoProcesso, setNovoProcesso] = useState({
        falecido: { nome: '', cpf: '', dataObito: '', estadoCivil: '', profissao: '', nacionalidade: '' },
        inventariante: { nome: '', cpf: '', profissao: '', estadoCivil: '', endereco: '' },
        config: { aliquotaITCMD: 4, regimeBens: 'parcial', conjuge: '' }
    });

    useEffect(() => {
        loadProcessos();
    }, []);

    const loadProcessos = async () => {
        try {
            const response = await api.get('/processo');
            setProcessos(response.data);
        } catch (error) {
            console.error("Erro ao carregar processos:", error);
            showFeedback('Erro', 'Não foi possível carregar os processos.', 'error');
        }
    };

    const handleSelectProcess = (id) => {
        selecionarProcesso(id);
        navigate(`/processo/${id}/dashboard`);
    };

    const handleCreateProcess = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/processo', novoProcesso);
            setShowNewProcessModal(false);
            showFeedback('Sucesso', 'Processo criado com sucesso!', 'success');
            loadProcessos();
            // Optional: Auto-select and navigate
            // handleSelectProcess(response.data.id);
        } catch (error) {
            console.error("Erro ao criar processo:", error);
            showFeedback('Erro', 'Erro ao criar novo processo.', 'error');
        }
    };

    const showFeedback = (title, message, type) => {
        setFeedbackModal({ isOpen: true, title, message, type });
    };

    const closeFeedback = () => {
        setFeedbackModal({ ...feedbackModal, isOpen: false });
    };

    // Educational Section State
    const [calcValue, setCalcValue] = useState(1000000);
    const [activeTerm, setActiveTerm] = useState(null);

    const terms = [
        { id: 'monteMor', title: 'Monte Mor', desc: 'Soma total de todos os bens e direitos do falecido (imóveis, veículos, investimentos) antes de descontar as dívidas.' },
        { id: 'dividas', title: 'Dívidas', desc: 'Obrigações financeiras deixadas pelo falecido que devem ser pagas pelo espólio.' },
        { id: 'meacao', title: 'Meação', desc: 'Parte que pertence ao cônjuge/companheiro sobrevivente (geralmente 50%), dependendo do regime de bens.' },
        { id: 'montePartivel', title: 'Monte Partível', desc: 'Valor líquido que será efetivamente dividido entre os herdeiros (Monte Mor - Dívidas - Meação).' },
        { id: 'itcmd', title: 'ITCMD', desc: 'Imposto sobre Transmissão Causa Mortis e Doação. Incide sobre o Monte Partível.' }
    ];

    const simulateCalc = () => {
        const meacao = calcValue * 0.5;
        const itcmd = (calcValue - meacao) * 0.04;
        return { meacao, itcmd, heranca: calcValue - meacao - itcmd };
    };

    const simResult = simulateCalc();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Modal
                isOpen={feedbackModal.isOpen}
                onClose={closeFeedback}
                title={feedbackModal.title}
                message={feedbackModal.message}
                type={feedbackModal.type}
            />

            {/* Hero Section */}
            <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20 px-6 text-center shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <h1 className="text-5xl font-extrabold mb-4 tracking-tight relative z-10">Serenity Inventários</h1>
                <p className="text-xl opacity-90 max-w-2xl mx-auto relative z-10">
                    Gestão inteligente, segura e simplificada para processos de inventário e partilha de bens.
                </p>
                <button
                    onClick={() => setShowNewProcessModal(true)}
                    className="mt-8 bg-white text-blue-800 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 relative z-10"
                >
                    + Iniciar Novo Processo
                </button>
            </header>

            {/* Educational Section: Entenda o Inventário */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Entenda o Processo de Inventário</h2>

                    {/* Interactive Glossary */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
                        {terms.map(term => (
                            <div
                                key={term.id}
                                onClick={() => setActiveTerm(activeTerm === term.id ? null : term.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${activeTerm === term.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-300'}`}
                            >
                                <h3 className="font-bold text-center text-gray-700">{term.title}</h3>
                                {activeTerm === term.id && (
                                    <p className="text-sm text-gray-600 mt-2 text-center animate-fadeIn">{term.desc}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Visual Flow & Calculator */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Visual Flow */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-700 mb-6">Como é calculado?</h3>
                            <div className="flex flex-col gap-2">
                                <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500 flex justify-between items-center">
                                    <span className="font-bold text-green-800">1. Monte Mor</span>
                                    <span className="text-sm text-green-700">Total de Bens</span>
                                </div>
                                <div className="flex justify-center text-gray-400">↓ (-) Dívidas</div>
                                <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500 flex justify-between items-center">
                                    <span className="font-bold text-blue-800">2. Patrimônio Líquido</span>
                                    <span className="text-sm text-blue-700">Bens - Dívidas</span>
                                </div>
                                <div className="flex justify-center text-gray-400">↓ (-) Meação (Cônjuge)</div>
                                <div className="bg-purple-100 p-4 rounded-lg border-l-4 border-purple-500 flex justify-between items-center">
                                    <span className="font-bold text-purple-800">3. Monte Partível</span>
                                    <span className="text-sm text-purple-700">Base para Herança</span>
                                </div>
                                <div className="flex justify-center text-gray-400">↓ (x) Imposto ITCMD</div>
                                <div className="bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500 flex justify-between items-center">
                                    <span className="font-bold text-yellow-800">4. Herança Líquida</span>
                                    <span className="text-sm text-yellow-700">Valor Final aos Herdeiros</span>
                                </div>
                            </div>
                        </div>

                        {/* Mini Calculator */}
                        <div className="bg-gray-50 p-8 rounded-2xl shadow-inner border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-700 mb-4">Simulador Rápido</h3>
                            <p className="text-sm text-gray-500 mb-6">Veja como os valores se comportam (Exemplo com Meação de 50% e ITCMD de 4%).</p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Valor Total dos Bens (R$)</label>
                                <input
                                    type="range"
                                    min="10000" max="5000000" step="10000"
                                    value={calcValue}
                                    onChange={(e) => setCalcValue(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="text-center font-mono text-2xl font-bold text-blue-600 mt-2">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcValue)}
                                </div>
                            </div>

                            <div className="space-y-3 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span>Meação (50%):</span>
                                    <span className="font-semibold text-gray-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simResult.meacao)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Imposto ITCMD (4%):</span>
                                    <span className="font-semibold text-red-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simResult.itcmd)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-green-700 pt-2 border-t">
                                    <span>Para Dividir (Herdeiros):</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simResult.heranca)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-16 px-6 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Passo a Passo no Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { icon: '📝', title: '1. Cadastro', desc: 'Informe os dados do falecido e do inventariante.' },
                        { icon: '🏠', title: '2. Patrimônio', desc: 'Liste todos os bens, direitos e dívidas do espólio.' },
                        { icon: '👥', title: '3. Herdeiros', desc: 'Cadastre os herdeiros e defina a partilha.' },
                        { icon: '⚖️', title: '4. Relatório', desc: 'Gere o esboço formal da partilha em PDF.' }
                    ].map((step, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center border border-gray-100">
                            <div className="text-4xl mb-4">{step.icon}</div>
                            <h3 className="text-xl font-bold mb-2 text-gray-700">{step.title}</h3>
                            <p className="text-gray-600 text-sm">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Process List Section */}
            <section className="py-12 px-6 bg-gray-100">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                        📂 Seus Processos
                    </h2>

                    {processos.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">Nenhum processo encontrado.</p>
                            <button
                                onClick={() => setShowNewProcessModal(true)}
                                className="mt-4 text-blue-600 font-semibold hover:underline"
                            >
                                Comece criando um agora
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {processos.map(proc => (
                                <div key={proc.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-blue-500 cursor-pointer group" onClick={() => handleSelectProcess(proc.id)}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                                Espólio de {proc.falecido?.nome || 'Sem Nome'}
                                            </h3>
                                            <p className="text-sm text-gray-500">Inventariante: {proc.inventariante?.nome || '-'}</p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                            ID: {proc.id}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-4 pt-4 border-t flex justify-between">
                                        <span>Criado em: {new Date().toLocaleDateString()}</span> {/* Placeholder date if not in DB */}
                                        <span className="text-blue-500 font-semibold group-hover:translate-x-1 transition-transform">Acessar &rarr;</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* New Process Modal */}
            {showNewProcessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center sticky top-0">
                            <h2 className="text-xl font-bold">Novo Processo de Inventário</h2>
                            <button onClick={() => setShowNewProcessModal(false)} className="text-white hover:text-gray-200 text-2xl">&times;</button>
                        </div>

                        <form onSubmit={handleCreateProcess} className="p-6 space-y-6">
                            {/* Falecido */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados do Falecido</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required type="text" placeholder="Nome Completo" className="input-field"
                                        value={novoProcesso.falecido.nome} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, nome: e.target.value } })} />
                                    <input required type="text" placeholder="CPF" className="input-field"
                                        value={novoProcesso.falecido.cpf} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, cpf: e.target.value } })} />
                                    <input type="date" placeholder="Data Óbito" className="input-field"
                                        value={novoProcesso.falecido.dataObito} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, dataObito: e.target.value } })} />
                                    <select className="input-field" value={novoProcesso.falecido.estadoCivil} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, estadoCivil: e.target.value } })}>
                                        <option value="">Estado Civil</option>
                                        <option value="casado">Casado(a)</option>
                                        <option value="viuvo">Viúvo(a)</option>
                                        <option value="solteiro">Solteiro(a)</option>
                                        <option value="divorciado">Divorciado(a)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Inventariante */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados do Inventariante</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required type="text" placeholder="Nome Completo" className="input-field"
                                        value={novoProcesso.inventariante.nome} onChange={e => setNovoProcesso({ ...novoProcesso, inventariante: { ...novoProcesso.inventariante, nome: e.target.value } })} />
                                    <input required type="text" placeholder="CPF" className="input-field"
                                        value={novoProcesso.inventariante.cpf} onChange={e => setNovoProcesso({ ...novoProcesso, inventariante: { ...novoProcesso.inventariante, cpf: e.target.value } })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowNewProcessModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Criar Processo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
