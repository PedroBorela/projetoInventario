import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';
import { useProcesso } from '../context/ProcessContext';

const HerdeirosManager = () => {
    const { processoId } = useProcesso();
    const [herdeiros, setHerdeiros] = useState([]);
    const [formData, setFormData] = useState({
        nome: '',
        parentesco: '',
        percentual: '',
        contato: ''
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
            loadHerdeiros();
        }
    }, [processoId]);

    const loadHerdeiros = async () => {
        try {
            const response = await api.get(`/herdeiros?processoId=${processoId}`);
            setHerdeiros(response.data);
        } catch (error) {
            console.error("Error loading herdeiros", error);
            showModal('Erro', 'Erro ao carregar herdeiros.', 'error');
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
                await api.put(`/herdeiros/${editingId}`, payload);
                setEditingId(null);
                showModal('Sucesso', 'Herdeiro atualizado com sucesso!', 'success');
            } else {
                await api.post('/herdeiros', payload);
                showModal('Sucesso', 'Herdeiro adicionado com sucesso!', 'success');
            }
            setFormData({ nome: '', parentesco: '', percentual: '', contato: '' });
            loadHerdeiros();
        } catch (error) {
            console.error("Error saving herdeiro", error);
            showModal('Erro', 'Erro ao salvar herdeiro.', 'error');
        }
    };

    const handleEdit = (herdeiro) => {
        setFormData({
            nome: herdeiro.nome,
            parentesco: herdeiro.parentesco,
            percentual: herdeiro.percentual,
            contato: herdeiro.contato
        });
        setEditingId(herdeiro.id);
    };

    const handleCancelEdit = () => {
        setFormData({ nome: '', parentesco: '', percentual: '', contato: '' });
        setEditingId(null);
    };

    const handleDelete = (id) => {
        showModal('Confirmar Exclusão', 'Tem certeza que deseja excluir este herdeiro?', 'warning', async () => {
            try {
                await api.delete(`/herdeiros/${id}`);
                loadHerdeiros();
                showModal('Sucesso', 'Herdeiro excluído com sucesso!', 'success');
            } catch (error) {
                console.error("Error deleting herdeiro", error);
                showModal('Erro', 'Erro ao excluir herdeiro.', 'error');
            }
        });
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
                    <span>👥</span> {editingId ? 'Editar Herdeiro' : 'Cadastro de Herdeiros'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Nome Completo</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Grau de Parentesco</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.parentesco}
                                onChange={(e) => setFormData({ ...formData, parentesco: e.target.value })}
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="viuvo">Viúvo(a)</option>
                                <option value="filho">Filho(a)</option>
                                <option value="neto">Neto(a)</option>
                                <option value="pai">Pai/Mãe</option>
                                <option value="irmao">Irmão(ã)</option>
                                <option value="sobrinho">Sobrinho(a)</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Percentual da Herança (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.percentual}
                                onChange={(e) => setFormData({ ...formData, percentual: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Contato (Telefone/Email)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.contato}
                                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="bg-accent text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
                            {editingId ? 'Atualizar Herdeiro' : 'Adicionar Herdeiro'}
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
                <h2 className="text-xl text-primary mb-4">Herdeiros Cadastrados</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 font-semibold">Nome</th>
                                <th className="p-3 font-semibold">Parentesco</th>
                                <th className="p-3 font-semibold">Percentual</th>
                                <th className="p-3 font-semibold">Contato</th>
                                <th className="p-3 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {herdeiros.map((herdeiro) => (
                                <tr key={herdeiro.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{herdeiro.nome}</td>
                                    <td className="p-3 capitalize">{herdeiro.parentesco}</td>
                                    <td className="p-3">{herdeiro.percentual}%</td>
                                    <td className="p-3">{herdeiro.contato}</td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(herdeiro)}
                                            className="bg-warning text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(herdeiro.id)}
                                            className="bg-error text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {herdeiros.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500">Nenhum herdeiro cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HerdeirosManager;
