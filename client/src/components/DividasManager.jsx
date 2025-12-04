import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';
import { useProcesso } from '../context/ProcessContext';

const DividasManager = () => {
    const { processoId } = useProcesso();
    const [dividas, setDividas] = useState([]);
    const [formData, setFormData] = useState({
        tipo: 'imposto',
        credor: '',
        valor: '',
        status: 'pendente',
        descricao: ''
    });
    const [editingId, setEditingId] = useState(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info', onConfirm: null });

    const showModal = (title, message, type = 'info', onConfirm = null) => {
        setModalConfig({ title, message, type, onConfirm });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    useEffect(() => {
        if (processoId) {
            loadDividas();
        }
    }, [processoId]);

    const loadDividas = async () => {
        try {
            const response = await api.get(`/dividas?processoId=${processoId}`);
            setDividas(response.data);
        } catch (error) {
            console.error("Error loading dividas", error);
            showModal('Erro', 'Erro ao carregar dívidas.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!processoId) {
            showModal('Erro', 'Nenhum processo selecionado.', 'error');
            return;
        }

        try {
            const payload = { ...formData, processoId };
            if (editingId) {
                await api.put(`/dividas/${editingId}`, payload);
                setEditingId(null);
                showModal('Sucesso', 'Dívida atualizada com sucesso!', 'success');
            } else {
                await api.post('/dividas', payload);
                showModal('Sucesso', 'Dívida adicionada com sucesso!', 'success');
            }
            setFormData({ tipo: 'imposto', credor: '', valor: '', status: 'pendente', descricao: '' });
            loadDividas();
        } catch (error) {
            console.error("Error saving divida", error);
            showModal('Erro', 'Erro ao salvar dívida.', 'error');
        }
    };

    const handleEdit = (divida) => {
        setFormData({
            tipo: divida.tipo,
            credor: divida.credor,
            valor: divida.valor,
            status: divida.status,
            descricao: divida.descricao || ''
        });
        setEditingId(divida.id);
    };

    const handleCancelEdit = () => {
        setFormData({ tipo: 'imposto', credor: '', valor: '', status: 'pendente', descricao: '' });
        setEditingId(null);
    };

    const handleDelete = (id) => {
        showModal('Confirmar Exclusão', 'Tem certeza que deseja excluir esta dívida?', 'warning', async () => {
            try {
                await api.delete(`/dividas/${id}`);
                loadDividas();
                showModal('Sucesso', 'Dívida excluída com sucesso!', 'success');
            } catch (error) {
                console.error("Error deleting divida", error);
                showModal('Erro', 'Erro ao excluir dívida.', 'error');
            }
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (!processoId) return <div className="p-8 text-center text-error">Nenhum processo selecionado.</div>;

    return (
        <div className="space-y-8">
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
            />

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    {editingId ? 'Editar Dívida' : 'Cadastro de Dívidas'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Tipo de Dívida</label>
                            <select
                                className="input-dark"
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            >
                                <option value="imposto">Imposto (IPTU/IPVA)</option>
                                <option value="cartao-credito">Cartão de Crédito</option>
                                <option value="emprestimo">Empréstimo/Financiamento</option>
                                <option value="condominio">Condomínio</option>
                                <option value="funeral">Despesas Funerárias</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Credor</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.credor}
                                onChange={(e) => setFormData({ ...formData, credor: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1">
                            <label className="block mb-2 font-medium text-primary">Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input-dark border-accent/50 focus:border-accent focus:ring-1 focus:ring-accent"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-2 font-medium text-gray-500">Status</label>
                            <select
                                className="input-dark"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                                <option value="negociacao">Em Negociação</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-2 font-medium text-gray-500">Descrição (Opcional)</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="bg-secondary text-text-main px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors uppercase text-sm">
                            {editingId ? 'Atualizar Dívida' : 'Adicionar Dívida'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="bg-transparent border border-gray-300 text-gray-500 px-6 py-2 rounded-full hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Dívidas Cadastradas
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dividas.length === 0 ? (
                        <div className="col-span-full text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-400">
                            Nenhuma dívida cadastrada.
                        </div>
                    ) : (
                        dividas.map((divida) => (
                            <div key={divida.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${divida.status === 'pago' ? 'bg-green-100 text-green-600' :
                                        divida.status === 'negociacao' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {divida.status}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(divida)} className="text-gray-400 hover:text-primary">✎</button>
                                        <button onClick={() => handleDelete(divida.id)} className="text-gray-400 hover:text-red-500">🗑</button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-text-main mb-1 truncate" title={divida.credor}>
                                    {divida.credor}
                                </h3>

                                <div className="text-2xl font-bold text-error mb-4">
                                    {formatCurrency(divida.valor)}
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 border-t border-gray-100 pt-3">
                                    <div className="flex justify-between">
                                        <span>Tipo:</span>
                                        <span className="text-text-main capitalize">{divida.tipo}</span>
                                    </div>
                                    {divida.descricao && <div className="truncate italic">{divida.descricao}</div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
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

export default DividasManager;
