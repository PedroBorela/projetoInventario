import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProcesso } from '../context/ProcessContext';
import api from '../services/api';
import Modal from './Modal';
import { jsPDF } from 'jspdf';

const InventarioProcess = () => {
    const { processo, loading, fetchProcesso } = useProcesso();
    const { id } = useParams();

    const [dadosFalecido, setDadosFalecido] = useState({
        nome: '',
        cpf: '',
        dataObito: '',
        estadoCivil: ''
    });
    const [inventariante, setInventariante] = useState({
        nome: '',
        cpf: '',
        endereco: ''
    });
    const [config, setConfig] = useState({
        aliquotaITCMD: 4,
        regimeBens: 'universal',
        conjuge: ''
    });
    const [progresso, setProgresso] = useState(0);
    const [sugestoes, setSugestoes] = useState([]);

    // Data states
    const [bens, setBens] = useState([]);
    const [herdeiros, setHerdeiros] = useState([]);
    const [dividas, setDividas] = useState([]);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });

    const showModal = (title, message, type = 'info') => {
        setModalConfig({ title, message, type });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    useEffect(() => {
        if (processo) {
            setDadosFalecido(processo.falecido || {});
            setInventariante(processo.inventariante || {});
            setConfig(processo.config || {});
            loadRelatedData();
        }
    }, [processo]);

    const loadRelatedData = async () => {
        if (!processo?.id) return;
        try {
            const [bensRes, herdeirosRes, dividasRes] = await Promise.all([
                api.get(`/bens?processoId=${processo.id}`),
                api.get(`/herdeiros?processoId=${processo.id}`),
                api.get(`/dividas?processoId=${processo.id}`)
            ]);
            setBens(bensRes.data);
            setHerdeiros(herdeirosRes.data);
            setDividas(dividasRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados relacionados:", error);
        }
    };

    // Calculations
    const valorTotalBensMercado = bens.reduce((acc, bem) => acc + Number(bem.valorMercado || bem.valor || 0), 0);
    const valorTotalBensVenal = bens.reduce((acc, bem) => acc + Number(bem.valorVenal || 0), 0);
    const valorTotalDividas = dividas.reduce((acc, divida) => acc + Number(divida.valor || 0), 0);

    const monteMorLiquido = valorTotalBensMercado - valorTotalDividas;

    let valorMeacao = 0;
    if (config.regimeBens === 'universal') {
        valorMeacao = monteMorLiquido * 0.5;
    } else if (config.regimeBens === 'parcial') {
        // Simplificação: assumindo 50% para parcial também, idealmente precisaria saber quais bens são comuns
        valorMeacao = monteMorLiquido * 0.5;
    }

    const montePartivel = Math.max(0, monteMorLiquido - valorMeacao);
    const valorITCMD = montePartivel * (config.aliquotaITCMD / 100);

    // Progress Calculation
    useEffect(() => {
        let completedSteps = 0;
        const totalSteps = 6; // Falecido, Inventariante, Bens, Herdeiros, Dividas, Partilha 100%

        if (dadosFalecido.nome && dadosFalecido.cpf) completedSteps++;
        if (inventariante.nome && inventariante.cpf) completedSteps++;
        if (bens.length > 0) completedSteps++;
        if (herdeiros.length > 0) completedSteps++;
        // Dividas is optional, but we can check if it was reviewed or just give a point for reaching here
        completedSteps++;

        const totalPercentual = herdeiros.reduce((acc, h) => acc + Number(h.percentual || 0), 0);
        const isPartilhaCompleta = Math.abs(totalPercentual - 100) < 0.1;

        if (isPartilhaCompleta) completedSteps++;

        setProgresso((completedSteps / totalSteps) * 100);

        const newSugestoes = [];
        if (!dadosFalecido.nome) newSugestoes.push({ tipo: 'erro', msg: 'Preencha os dados do falecido.' });
        if (!inventariante.nome) newSugestoes.push({ tipo: 'erro', msg: 'Preencha os dados do inventariante.' });
        if (bens.length === 0) newSugestoes.push({ tipo: 'atencao', msg: 'Cadastre os bens do espólio.' });
        if (herdeiros.length === 0) newSugestoes.push({ tipo: 'atencao', msg: 'Cadastre os herdeiros.' });
        if (!isPartilhaCompleta) newSugestoes.push({ tipo: 'erro', msg: `A partilha soma ${totalPercentual}%. Deve totalizar 100%.` });

        setSugestoes(newSugestoes);

    }, [dadosFalecido, inventariante, bens, herdeiros, dividas]);


    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const saveProcessData = async () => {
        try {
            const updatedProcess = {
                ...processo,
                falecido: dadosFalecido,
                inventariante: inventariante,
                config: config
            };
            await api.put(`/processo/${id}`, updatedProcess);
            fetchProcesso(id); // Refresh context
            showModal('Sucesso', 'Dados salvos com sucesso!', 'success');
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
            showModal('Erro', 'Erro ao salvar dados.', 'error');
        }
    };

    const gerarRelatorioProfissional = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Helper to draw a cell
        const drawCell = (text, x, y, w, h, isHeader = false) => {
            if (isHeader) {
                doc.setFillColor(230, 230, 230);
                doc.rect(x, y, w, h, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0);
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(50);
            }
            doc.setDrawColor(200);
            doc.rect(x, y, w, h);

            // Text alignment (simple left align with padding)
            doc.text(String(text), x + 2, y + h - 2.5);
        };

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`Inventário e Partilha`, pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Espólio de: ${dadosFalecido.nome || 'N/A'}`, pageWidth / 2, 28, { align: 'center' });
        doc.text(`Data: ${new Date().toLocaleDateString()}`, pageWidth / 2, 34, { align: 'center' });

        let y = 50;
        const startX = 14;
        const rowH = 8;

        // --- Table 1: Resumo Financeiro ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('1. Resumo Financeiro', startX, y);
        y += 6;

        const col1W = 110;
        const col2W = 70;

        // Header
        doc.setFontSize(10);
        drawCell('Descrição', startX, y, col1W, rowH, true);
        drawCell('Valor (R$)', startX + col1W, y, col2W, rowH, true);
        y += rowH;

        // Rows
        const financialData = [
            ['Monte Mor (Valor de Mercado)', formatCurrency(valorTotalBensMercado)],
            ['(-) Dívidas Totais', formatCurrency(valorTotalDividas)],
            ['(=) Patrimônio Líquido', formatCurrency(monteMorLiquido)],
            [`(-) Meação (${config.regimeBens})`, formatCurrency(valorMeacao)],
            ['(=) Monte Partível (Herança)', formatCurrency(montePartivel)],
            ['ITCMD Estimado', formatCurrency(valorITCMD)]
        ];

        financialData.forEach(([desc, val]) => {
            drawCell(desc, startX, y, col1W, rowH);
            drawCell(val, startX + col1W, y, col2W, rowH);
            y += rowH;
        });

        y += 15;

        // --- Table 2: Partilha ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('2. Partilha entre Herdeiros', startX, y);
        y += 6;

        // Headers
        const hCol1 = 60; // Nome
        const hCol2 = 40; // Parentesco
        const hCol3 = 30; // %
        const hCol4 = 50; // Valor

        doc.setFontSize(10);
        drawCell('Herdeiro', startX, y, hCol1, rowH, true);
        drawCell('Parentesco', startX + hCol1, y, hCol2, rowH, true);
        drawCell('Parte %', startX + hCol1 + hCol2, y, hCol3, rowH, true);
        drawCell('Quinhão (R$)', startX + hCol1 + hCol2 + hCol3, y, hCol4, rowH, true);
        y += rowH;

        if (herdeiros.length === 0) {
            drawCell('Nenhum herdeiro cadastrado', startX, y, hCol1 + hCol2 + hCol3 + hCol4, rowH);
        } else {
            herdeiros.forEach(h => {
                const quinhao = montePartivel * (h.percentual / 100);
                drawCell(h.nome, startX, y, hCol1, rowH);
                drawCell(h.parentesco, startX + hCol1, y, hCol2, rowH);
                drawCell(`${h.percentual}%`, startX + hCol1 + hCol2, y, hCol3, rowH);
                drawCell(formatCurrency(quinhao), startX + hCol1 + hCol2 + hCol3, y, hCol4, rowH);
                y += rowH;
            });
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Gerado por Serenity Inventários', pageWidth / 2, 280, { align: 'center' });

        doc.save(`inventario_${dadosFalecido.nome || 'processo'}.pdf`);
        showModal('Sucesso', 'Relatório gerado com sucesso!', 'success');
    };

    if (loading) return <div className="text-white">Carregando...</div>;

    return (
        <div className="space-y-8">
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

            {/* SEÇÃO 1: DADOS CADASTRAIS */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Qualificação das Partes
                    </h3>
                    <button
                        onClick={saveProcessData}
                        className="bg-secondary text-text-main px-6 py-2 rounded-full font-bold uppercase text-sm hover:bg-gray-200 transition-colors"
                    >
                        Salvar Dados
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Autor da Herança */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Autor da Herança (Falecido)</h4>
                        <input
                            type="text" placeholder="Nome Completo"
                            className="input-dark"
                            value={dadosFalecido.nome || ''}
                            onChange={(e) => setDadosFalecido({ ...dadosFalecido, nome: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text" placeholder="CPF"
                                className="input-dark"
                                value={dadosFalecido.cpf || ''}
                                onChange={(e) => setDadosFalecido({ ...dadosFalecido, cpf: e.target.value })}
                            />
                            <input
                                type="date" placeholder="Data Óbito"
                                className="input-dark"
                                value={dadosFalecido.dataObito || ''}
                                onChange={(e) => setDadosFalecido({ ...dadosFalecido, dataObito: e.target.value })}
                            />
                        </div>
                        <select
                            className="input-dark"
                            value={dadosFalecido.estadoCivil || ''}
                            onChange={(e) => setDadosFalecido({ ...dadosFalecido, estadoCivil: e.target.value })}
                        >
                            <option value="">Selecione Estado Civil</option>
                            <option value="casado">Casado(a)</option>
                            <option value="viuvo">Viúvo(a)</option>
                            <option value="solteiro">Solteiro(a)</option>
                            <option value="divorciado">Divorciado(a)</option>
                            <option value="uniao_estavel">União Estável</option>
                        </select>
                    </div>

                    {/* Inventariante */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">Inventariante</h4>
                        <input
                            type="text" placeholder="Nome Completo"
                            className="input-dark"
                            value={inventariante.nome || ''}
                            onChange={(e) => setInventariante({ ...inventariante, nome: e.target.value })}
                        />
                        <input
                            type="text" placeholder="CPF"
                            className="input-dark"
                            value={inventariante.cpf || ''}
                            onChange={(e) => setInventariante({ ...inventariante, cpf: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Endereço Completo"
                            className="input-dark"
                            value={inventariante.endereco || ''}
                            onChange={(e) => setInventariante({ ...inventariante, endereco: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Configurações e Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Configurações
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Alíquota ITCMD (%)</label>
                            <input
                                type="number"
                                value={config.aliquotaITCMD || 0}
                                onChange={(e) => setConfig({ ...config, aliquotaITCMD: Number(e.target.value) })}
                                className="input-dark"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Regime de Bens</label>
                            <select
                                value={config.regimeBens || 'universal'}
                                onChange={(e) => setConfig({ ...config, regimeBens: e.target.value })}
                                className="input-dark"
                            >
                                <option value="universal">Comunhão Universal de Bens</option>
                                <option value="parcial">Comunhão Parcial de Bens</option>
                                <option value="separacao">Separação Total de Bens</option>
                            </select>
                        </div>
                        {config.regimeBens !== 'separacao' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Nome do Cônjuge (Meeiro)</label>
                                <input
                                    type="text"
                                    value={config.conjuge || ''}
                                    onChange={(e) => setConfig({ ...config, conjuge: e.target.value })}
                                    className="input-dark"
                                    placeholder="Nome do cônjuge sobrevivente"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumo Financeiro na Tela */}
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Resumo Financeiro
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500">Monte Mor (Mercado)</span>
                            <span className="font-bold text-text-main">{formatCurrency(valorTotalBensMercado)}</span>
                        </div>
                        <div className="flex justify-between px-3 text-gray-500">
                            <span>Monte Mor (Venal)</span>
                            <span>{formatCurrency(valorTotalBensVenal)}</span>
                        </div>
                        <div className="flex justify-between px-3 text-red-500">
                            <span>(-) Dívidas Totais</span>
                            <span>{formatCurrency(valorTotalDividas)}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-text-main px-3">
                            <span>Patrimônio Líquido</span>
                            <span>{formatCurrency(monteMorLiquido)}</span>
                        </div>
                        <div className="flex justify-between px-3 text-primary">
                            <span>(-) Meação ({config.regimeBens})</span>
                            <span>{formatCurrency(valorMeacao)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-600 text-lg mt-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                            <span>(=) Monte Partível</span>
                            <span>{formatCurrency(montePartivel)}</span>
                        </div>
                        <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-700 text-center">
                            <strong className="block text-xs uppercase tracking-wider mb-1">ITCMD Estimado</strong>
                            <span className="text-2xl font-bold">{formatCurrency(valorITCMD)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de Progresso e Sugestões */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                <div className="flex justify-between mb-4">
                    <span className="font-bold text-text-main">Progresso do Inventário</span>
                    <span className={`font-bold ${progresso === 100 ? 'text-green-600' : 'text-primary'}`}>{progresso.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progresso === 100 ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${progresso}%` }}
                    ></div>
                </div>

                {sugestoes.length > 0 && (
                    <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h5 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Pendências e Ações</h5>
                        <ul className="space-y-3">
                            {sugestoes.map((sugestao, index) => (
                                <li key={index} className="text-sm flex items-start gap-3">
                                    <span className="mt-0.5 text-lg">{sugestao.tipo === 'erro' ? '❌' : sugestao.tipo === 'atencao' ? '⚠️' : '✅'}</span>
                                    <span className={`font-medium ${sugestao.tipo === 'erro' ? 'text-red-500' : sugestao.tipo === 'atencao' ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {sugestao.msg}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Botão de Gerar Relatório */}
            <div className="flex justify-end">
                <button
                    onClick={gerarRelatorioProfissional}
                    className="bg-green-600 text-white px-8 py-4 rounded-full shadow-lg shadow-green-600/20 flex items-center gap-3 text-lg font-bold hover:bg-green-700 transition-all hover:scale-105"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Baixar Relatório PDF
                </button>
            </div>

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
            `}</style>
        </div>
    );
};

export default InventarioProcess;