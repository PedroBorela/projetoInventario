import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useProcesso } from '../context/ProcessContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Carousel from '../components/Carousel';
import CurvedLoop from '../components/CurvedLoop';

const LandingPage = () => {
    const navigate = useNavigate();
    const { selecionarProcesso } = useProcesso();
    const { user, logout } = useAuth();
    const [processos, setProcessos] = useState([]);
    const [showNewProcessModal, setShowNewProcessModal] = useState(false);

    // Modal Feedback State
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, processId: null });

    // New Process Form State
    const [novoProcesso, setNovoProcesso] = useState({
        falecido: { nome: '', cpf: '', dataObito: '', estadoCivil: '', profissao: '', nacionalidade: '' },
        inventariante: { nome: '', cpf: '', profissao: '', estadoCivil: '', endereco: '' },
        config: { aliquotaITCMD: 4, regimeBens: 'parcial', conjuge: '' }
    });

    useEffect(() => {
        if (user) {
            loadProcessos();
        }
    }, [user]);

    const loadProcessos = async () => {
        try {
            const response = await api.get('/processo');
            setProcessos(response.data);
        } catch (error) {
            console.error("Erro ao carregar processos:", error);
            // Don't show error if it's just 404 or empty
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
        } catch (error) {
            console.error("Erro ao criar processo:", error);
            showFeedback('Erro', 'Erro ao criar novo processo.', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ isOpen: true, processId: id });
    };

    const confirmDeleteProcess = async () => {
        const id = deleteModal.processId;
        if (!id) return;

        try {
            await api.delete(`/processo/${id}`);
            showFeedback('Sucesso', 'Processo excluído com sucesso!', 'success');
            loadProcessos();
        } catch (error) {
            console.error("Erro ao excluir processo:", error);
            showFeedback('Erro', 'Erro ao excluir processo.', 'error');
        } finally {
            setDeleteModal({ isOpen: false, processId: null });
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

    const slides = [
        {
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600',
            title: 'Gestão de Inventário Simplificada',
            description: 'Organize bens, herdeiros e partilhas em uma plataforma segura e intuitiva. Otimize seu tempo e elimine a burocracia.'
        },
        {
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600',
            title: 'Segurança Jurídica',
            description: 'Garanta que todos os processos estejam em conformidade com a legislação vigente, evitando erros e retrabalho.'
        },
        {
            image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1600',
            title: 'Paz de Espírito para Famílias',
            description: 'Facilite momentos difíceis com uma ferramenta que traz clareza e transparência para todos os envolvidos.'
        }
    ];

    return (
        <div className="min-h-screen bg-background font-sans text-text-main selection:bg-accent selection:text-white">


            {/* Navbar / Header */}
            <header className="bg-primary text-white shadow-md">
                <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                    <div className="text-2xl font-bold tracking-tighter">Serenity<span className="text-secondary">.</span></div>
                    <div className="flex gap-4 items-center">
                        {user ? (
                            <>
                                <span className="text-gray-200 text-sm hidden md:block">Olá, {user.name}</span>
                                <button
                                    onClick={() => setShowNewProcessModal(true)}
                                    className="bg-secondary text-text-main px-6 py-2 rounded-full font-bold uppercase text-sm hover:bg-white transition-colors"
                                >
                                    Novo Processo
                                </button>
                                <button onClick={logout} className="text-gray-200 hover:text-white">Sair</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-white hover:text-secondary font-medium px-4">Entrar</Link>
                                <Link to="/register" className="bg-secondary text-text-main px-6 py-2 rounded-full font-bold uppercase text-sm hover:bg-white transition-colors">
                                    Criar Conta
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-6 pb-20 space-y-6">

                {/* Pre-Carousel CTA */}
                <div className="text-center py-12 space-y-6 relative">
                    {/* Curved Loop Decoration */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 overflow-hidden z-0">
                        <CurvedLoop
                            marqueeText="Serenity ✦ Inventário Simplificado ✦ Segurança Jurídica ✦"
                            speed={0.5}
                            curveAmount={100}
                            className="text-secondary"
                        />
                    </div>


                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary relative z-10">
                        Simplifique o <span className="text-secondary">Inventário Familiar</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Uma solução completa para advogados e famílias. Organize, calcule e finalize processos com segurança e agilidade.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-3 rounded-full font-bold uppercase text-sm border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                        >
                            Saiba Mais
                        </button>
                        {!user && (
                            <Link
                                to="/register"
                                className="px-8 py-3 rounded-full font-bold uppercase text-sm bg-secondary text-text-main hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl"
                            >
                                Começar Agora
                            </Link>
                        )}
                    </div>
                </div>

                {/* Hero Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Hero Card - Replaced by Carousel */}
                    <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-xl">
                        <Carousel slides={slides} />
                    </div>

                    {/* Stats / Info Card */}
                    <div className="bg-white rounded-2xl p-8 text-text-main flex flex-col justify-between relative overflow-hidden shadow-xl border border-gray-100">
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                        <div>
                            <div className="text-primary text-sm font-bold uppercase tracking-wider mb-2">Efficiency</div>
                            <h3 className="text-3xl font-bold">100% Digital</h3>
                            <p className="text-gray-500 mt-2 text-sm">Adeus papelada. Tudo na nuvem.</p>

                            <ul className="mt-6 space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Automação de cálculos
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Geração de documentos
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span> Gestão centralizada
                                </li>
                            </ul>
                        </div>
                        <div className="mt-8">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-bold text-primary">70%</span>
                                <span className="text-gray-500 mb-1">menos tempo gasto</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process List Section (Only if logged in) */}
                {user && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">


                        <div className="md:col-span-4 relative z-10">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-accent rounded-full"></span>
                                Seus Processos
                            </h2>
                        </div>

                        {processos.length === 0 ? (
                            <div className="md:col-span-4 bg-surface rounded-2xl p-12 border border-white/5 text-center border-dashed border-gray-800">
                                <p className="text-secondary text-lg">Nenhum processo encontrado.</p>
                                <button
                                    onClick={() => setShowNewProcessModal(true)}
                                    className="mt-4 text-accent font-medium hover:underline"
                                >
                                    Criar o primeiro processo &rarr;
                                </button>
                            </div>
                        ) : (
                            processos.map(proc => (
                                <div
                                    key={proc.id}
                                    onClick={() => handleSelectProcess(proc.id)}
                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-primary">↗</span>
                                    </div>
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-xl">
                                        📁
                                    </div>
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors truncate text-text-main">
                                        {proc.falecido?.nome || 'Sem Nome'}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Inv: {proc.inventariante?.nome || '-'}
                                    </p>
                                    <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span>ID: {String(proc.id).substring(0, 8)}...</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(proc.id);
                                            }}
                                            className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                                            title="Excluir Processo"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Calculation Logic Section */}
                <div id="como-funciona" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold leading-tight text-text-main">
                            Entenda a Lógica do <br />
                            <span className="text-primary">Cálculo de Partilha</span>
                        </h2>
                        <p className="text-gray-600 text-lg">
                            O processo de inventário segue uma ordem legal de deduções antes de chegar ao valor final que será distribuído entre os herdeiros.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-text-main">Levantamento do Monte Mor</h4>
                                    <p className="text-sm text-gray-600">Soma-se o valor de mercado de todos os bens e direitos.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-text-main">Dedução da Meação</h4>
                                    <p className="text-sm text-gray-600">Se houver cônjuge e dependendo do regime de bens, 50% do patrimônio comum é separado (não entra na herança).</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-text-main">Pagamento de Dívidas</h4>
                                    <p className="text-sm text-gray-600">As dívidas do falecido são quitadas com o patrimônio restante.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">4</div>
                                <div>
                                    <h4 className="font-bold text-text-main">Cálculo do Imposto (ITCMD)</h4>
                                    <p className="text-sm text-gray-600">Aplica-se a alíquota (geralmente 4% a 8%) sobre o saldo restante (Monte Partível).</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl relative">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
                        <h3 className="text-xl font-bold mb-6 text-center text-text-main">Exemplo Prático</h3>

                        <div className="space-y-2 font-mono text-sm">
                            <div className="flex justify-between p-3 bg-gray-50 rounded">
                                <span>Total Bens</span>
                                <span className="text-text-main">R$ 1.000.000</span>
                            </div>
                            <div className="flex justify-center text-gray-500 text-xs py-1">↓ (-) Meação (50%)</div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded border-l-2 border-blue-500">
                                <span>Meação</span>
                                <span className="text-blue-600">R$ 500.000</span>
                            </div>
                            <div className="flex justify-center text-gray-500 text-xs py-1">↓ Saldo: R$ 500.000</div>
                            <div className="flex justify-center text-gray-500 text-xs py-1">↓ (-) Dívidas (Ex: R$ 50.000)</div>
                            <div className="flex justify-between p-3 bg-gray-50 rounded border-l-2 border-red-500">
                                <span>Monte Partível</span>
                                <span className="text-text-main">R$ 450.000</span>
                            </div>
                            <div className="flex justify-center text-gray-500 text-xs py-1">↓ (-) ITCMD (4%)</div>
                            <div className="flex justify-between p-3 bg-primary/10 rounded border border-primary/20">
                                <span className="font-bold text-primary">Herança Líquida</span>
                                <span className="font-bold text-text-main">R$ 432.000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Bento Grid Section - Powerful Features */}
                <div className="py-12">
                    <h2 className="text-3xl font-bold text-center mb-10 text-text-main">
                        Recursos <span className="text-primary">Poderosos</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]">
                        {/* Card 1: Security (Large) */}
                        <div className="md:col-span-2 md:row-span-2 bg-primary rounded-2xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Gestão Completa de Ativos</h3>
                                    <p className="text-gray-200">Cadastre imóveis, veículos e investimentos em um só lugar. O sistema calcula automaticamente o valor total do espólio e a partilha ideal.</p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm w-fit">
                                    <span className="text-2xl">🔒 256-bit Encryption</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Support (Medium) */}
                        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-center gap-4 hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center text-3xl shrink-0">
                                💬
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main">Partilha Inteligente</h3>
                                <p className="text-gray-500 text-sm">Simule cenários de distribuição com equidade.</p>
                            </div>
                        </div>

                        {/* Card 3: Mobile (Medium) */}
                        <div className="md:col-span-1 bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-center items-center text-center hover:bg-gray-100 transition-colors">
                            <div className="text-4xl mb-3">📄</div>
                            <h3 className="font-bold text-text-main">Relatórios</h3>
                            <p className="text-xs text-gray-500">Minutas e declarações em 1 clique.</p>
                        </div>

                        {/* Card 4: Export (Medium) */}
                        <div className="md:col-span-1 bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-center items-center text-center hover:bg-gray-100 transition-colors">
                            <div className="text-4xl mb-3">🤝</div>
                            <h3 className="font-bold text-text-main">Colaboração</h3>
                            <p className="text-xs text-gray-500">Convide herdeiros e advogados.</p>
                        </div>
                    </div>
                </div>

                {/* Educational Section (Bento Style) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="md:col-span-3">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-accent rounded-full"></span>
                            Entenda o Processo
                        </h2>
                    </div>

                    {/* Glossary */}
                    <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-bold mb-6 text-text-main">Glossário Interativo</h3>
                        <div className="flex flex-wrap gap-3">
                            {terms.map(term => (
                                <button
                                    key={term.id}
                                    onClick={() => setActiveTerm(activeTerm === term.id ? null : term.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${activeTerm === term.id
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-transparent text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {term.title}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 h-24 flex items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                            {activeTerm ? (
                                <p className="text-center text-text-main animate-fadeIn">
                                    {terms.find(t => t.id === activeTerm)?.desc}
                                </p>
                            ) : (
                                <p className="text-center text-gray-400 italic">Clique em um termo para ver a definição.</p>
                            )}
                        </div>
                    </div>

                    {/* Calculator */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col">
                        <h3 className="text-xl font-bold mb-6 text-text-main">Simulador</h3>
                        <div className="mb-6">
                            <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">Valor Total (R$)</label>
                            <input
                                type="range"
                                min="10000" max="5000000" step="10000"
                                value={calcValue}
                                onChange={(e) => setCalcValue(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="text-2xl font-bold mt-2 text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(calcValue)}
                            </div>
                        </div>
                        <div className="space-y-3 mt-auto pt-6 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Meação (50%)</span>
                                <span className="text-text-main">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(simResult.meacao)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">ITCMD (4%)</span>
                                <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(simResult.itcmd)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 text-success">
                                <span>Herança Líquida</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(simResult.heranca)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* New Process Modal (Light Mode) */}
            {showNewProcessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-text-main">Novo Processo</h2>
                            <button onClick={() => setShowNewProcessModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        <form onSubmit={handleCreateProcess} className="p-8 space-y-8">
                            {/* Falecido */}
                            <div>
                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Dados do Falecido</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required type="text" placeholder="Nome Completo" className="input-dark"
                                        value={novoProcesso.falecido.nome} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, nome: e.target.value } })} />
                                    <input required type="text" placeholder="CPF" className="input-dark"
                                        value={novoProcesso.falecido.cpf} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, cpf: e.target.value } })} />
                                    <input type="date" className="input-dark"
                                        value={novoProcesso.falecido.dataObito} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, dataObito: e.target.value } })} />
                                    <select className="input-dark" value={novoProcesso.falecido.estadoCivil} onChange={e => setNovoProcesso({ ...novoProcesso, falecido: { ...novoProcesso.falecido, estadoCivil: e.target.value } })}>
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
                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Dados do Inventariante</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required type="text" placeholder="Nome Completo" className="input-dark"
                                        value={novoProcesso.inventariante.nome} onChange={e => setNovoProcesso({ ...novoProcesso, inventariante: { ...novoProcesso.inventariante, nome: e.target.value } })} />
                                    <input required type="text" placeholder="CPF" className="input-dark"
                                        value={novoProcesso.inventariante.cpf} onChange={e => setNovoProcesso({ ...novoProcesso, inventariante: { ...novoProcesso.inventariante, cpf: e.target.value } })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setShowNewProcessModal(false)} className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
                                <button type="submit" className="px-8 py-2 bg-secondary text-text-main rounded-full font-bold hover:bg-gray-200 transition-colors uppercase text-sm">Criar Processo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .input-dark {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    border-radius: 0.75rem;
                    color: #333333;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-dark:focus {
                    border-color: #264593;
                    box-shadow: 0 0 0 1px #264593;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
            <Modal
                isOpen={feedbackModal.isOpen}
                onClose={closeFeedback}
                title={feedbackModal.title}
                message={feedbackModal.message}
                type={feedbackModal.type}
            />

            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, processId: null })}
                title="Excluir Processo"
                message="Tem certeza que deseja excluir este processo? Todos os dados (bens, herdeiros, dívidas) serão perdidos permanentemente."
                type="warning"
                onConfirm={confirmDeleteProcess}
            />
        </div>
    );
};

export default LandingPage;
