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

    if (!processoId) return <div className="p-8 text-center text-red-500">Nenhum processo selecionado.</div>;

    return (
        <div className="space-y-8">
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
            />
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl text-primary mb-6 flex items-center gap-2">
                    <span>💳</span> {editingId ? 'Editar Dívida' : 'Cadastro de Dívidas'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Tipo de Dívida</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
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
                            <label className="block mb-1 font-medium">Credor</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.credor}
                                onChange={(e) => setFormData({ ...formData, credor: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block mb-1 font-medium">Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-1 font-medium">Status</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                                <option value="negociacao">Em Negociação</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-1 font-medium">Descrição (Opcional)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="bg-accent text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
                            {editingId ? 'Atualizar Dívida' : 'Adicionar Dívida'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl text-primary mb-4">Dívidas Cadastradas</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 font-semibold">Credor</th>
                                <th className="p-3 font-semibold">Tipo</th>
                                <th className="p-3 font-semibold">Valor</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dividas.map((divida) => (
                                <tr key={divida.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{divida.credor}</td>
                                    <td className="p-3 capitalize">{divida.tipo}</td>
                                    <td className="p-3 text-red-600 font-medium">{formatCurrency(divida.valor)}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${divida.status === 'pago' ? 'bg-green-100 text-green-800' :
                                            divida.status === 'negociacao' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {divida.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(divida)}
                                            className="bg-warning text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(divida.id)}
                                            className="bg-error text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {dividas.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500">Nenhuma dívida cadastrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DividasManager;
