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

        doc.setFontSize(20);
        doc.text(`Inventário e Partilha - Espólio de ${dadosFalecido.nome}`, 20, 20);

        doc.setFontSize(12);
        doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 30);

        doc.setFontSize(14);
        doc.text('1. Resumo Financeiro', 20, 45);
        doc.setFontSize(12);
        doc.text(`Monte Mor (Mercado): ${formatCurrency(valorTotalBensMercado)}`, 20, 55);
        doc.text(`Dívidas: ${formatCurrency(valorTotalDividas)}`, 20, 65);
        doc.text(`Patrimônio Líquido: ${formatCurrency(monteMorLiquido)}`, 20, 75);
        doc.text(`Meação: ${formatCurrency(valorMeacao)}`, 20, 85);
        doc.text(`Monte Partível: ${formatCurrency(montePartivel)}`, 20, 95);
        doc.text(`ITCMD Estimado: ${formatCurrency(valorITCMD)}`, 20, 105);

        doc.setFontSize(14);
        doc.text('2. Herdeiros e Partilha (Estimada)', 20, 120);

        let yPos = 130;
        herdeiros.forEach((herdeiro) => {
            const quinhao = montePartivel * (herdeiro.percentual / 100);
            doc.setFontSize(12);
            doc.text(`${herdeiro.nome} (${herdeiro.parentesco}) - ${herdeiro.percentual}%`, 20, yPos);
            doc.text(`Quinhão Estimado: ${formatCurrency(quinhao)}`, 120, yPos);
            yPos += 10;
        });

        doc.save(`inventario_${dadosFalecido.nome || 'processo'}.pdf`);
        showModal('Sucesso', 'Relatório gerado com sucesso!', 'success');
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="container mx-auto p-4">
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
            <div className="text-sm text-gray-500">Status: Em andamento</div>

            {/* SEÇÃO 1: DADOS CADASTRAIS */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">1. Qualificação das Partes</h3>
                    <button
                        onClick={saveProcessData}
                        className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Salvar Dados
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Autor da Herança */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-700 border-b pb-1">Autor da Herança (Falecido)</h4>
                        <input
                            type="text" placeholder="Nome Completo"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={dadosFalecido.nome || ''}
                            onChange={(e) => setDadosFalecido({ ...dadosFalecido, nome: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text" placeholder="CPF"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={dadosFalecido.cpf || ''}
                                onChange={(e) => setDadosFalecido({ ...dadosFalecido, cpf: e.target.value })}
                            />
                            <input
                                type="date" placeholder="Data Óbito"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={dadosFalecido.dataObito || ''}
                                onChange={(e) => setDadosFalecido({ ...dadosFalecido, dataObito: e.target.value })}
                            />
                        </div>
                        <select
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-700 border-b pb-1">Inventariante</h4>
                        <input
                            type="text" placeholder="Nome Completo"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={inventariante.nome || ''}
                            onChange={(e) => setInventariante({ ...inventariante, nome: e.target.value })}
                        />
                        <input
                            type="text" placeholder="CPF"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={inventariante.cpf || ''}
                            onChange={(e) => setInventariante({ ...inventariante, cpf: e.target.value })}
                        />
                        <input
                            type="text" placeholder="Endereço Completo"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={inventariante.endereco || ''}
                            onChange={(e) => setInventariante({ ...inventariante, endereco: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Configurações do Processo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded border">
                    <h3 className="font-semibold mb-3 text-gray-800">Configurações Fiscais e Legais</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Alíquota ITCMD (%)</label>
                            <input
                                type="number"
                                value={config.aliquotaITCMD || 0}
                                onChange={(e) => setConfig({ ...config, aliquotaITCMD: Number(e.target.value) })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Regime de Bens</label>
                            <select
                                value={config.regimeBens || 'universal'}
                                onChange={(e) => setConfig({ ...config, regimeBens: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="universal">Comunhão Universal de Bens</option>
                                <option value="parcial">Comunhão Parcial de Bens</option>
                                <option value="separacao">Separação Total de Bens</option>
                            </select>
                        </div>
                        {config.regimeBens !== 'separacao' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Nome do Cônjuge (Meeiro)</label>
                                <input
                                    type="text"
                                    value={config.conjuge || ''}
                                    onChange={(e) => setConfig({ ...config, conjuge: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="Nome do cônjuge sobrevivente"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumo Financeiro na Tela */}
                <div className="bg-white p-4 rounded border shadow-sm">
                    <h3 className="font-semibold mb-3 text-gray-800">Resumo Financeiro em Tempo Real</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Monte Mor (Mercado):</span>
                            <span className="font-bold">{formatCurrency(valorTotalBensMercado)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Monte Mor (Venal - Base Cálculo):</span>
                            <span>{formatCurrency(valorTotalBensVenal)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>(-) Dívidas Totais:</span>
                            <span>{formatCurrency(valorTotalDividas)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-gray-700">
                            <span>Patrimônio Líquido:</span>
                            <span>{formatCurrency(monteMorLiquido)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                            <span>(-) Meação ({config.regimeBens}):</span>
                            <span>{formatCurrency(valorMeacao)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-700 text-lg mt-2 p-2 bg-green-50 rounded">
                            <span>(=) Monte Partível (Herança):</span>
                            <span>{formatCurrency(montePartivel)}</span>
                        </div>
                        <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800 text-center">
                            <strong>Imposto ITCMD Estimado:</strong><br />
                            <span className="text-xl">{formatCurrency(valorITCMD)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de Progresso e Sugestões */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between mb-2">
                    <span className="font-medium">Progresso do Inventário</span>
                    <span className={`font-bold ${progresso === 100 ? 'text-green-600' : 'text-blue-600'}`}>{progresso.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-4 rounded-full transition-all duration-500 ${progresso === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progresso}%` }}
                    ></div>
                </div>

                {sugestoes.length > 0 && (
                    <div className="mt-4 bg-gray-50 p-4 rounded">
                        <h5 className="text-sm font-bold text-gray-500 mb-2">Pendências e Ações:</h5>
                        <ul className="space-y-2">
                            {sugestoes.map((sugestao, index) => (
                                <li key={index} className="text-sm flex items-start gap-2">
                                    <span className="mt-0.5">{sugestao.tipo === 'erro' ? '❌' : sugestao.tipo === 'atencao' ? '⚠️' : '✅'}</span>
                                    <span className={sugestao.tipo === 'erro' ? 'text-red-600' : sugestao.tipo === 'atencao' ? 'text-orange-600' : 'text-green-600'}>
                                        {sugestao.msg}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Botão de Gerar Relatório */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={gerarRelatorioProfissional}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg shadow-lg flex items-center gap-3 text-lg font-semibold transition-transform transform hover:scale-105"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Baixar Inventário e Partilha (PDF)
                </button>
            </div>

        </div>
    );
};

export default InventarioProcess;