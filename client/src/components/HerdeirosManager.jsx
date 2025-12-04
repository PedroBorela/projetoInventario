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
                // Edit: Just update the heir, percentages don't change
                await api.put(`/herdeiros/${editingId}`, payload);
                setEditingId(null);
                showModal('Sucesso', 'Herdeiro atualizado com sucesso!', 'success');
            } else {
                // Add: Create heir, then recalculate all percentages
                await api.post('/herdeiros', payload);

                // Fetch updated list to recalculate
                const response = await api.get(`/herdeiros?processoId=${processoId}`);
                const updatedHeirs = response.data;

                if (updatedHeirs.length > 0) {
                    const share = (100 / updatedHeirs.length).toFixed(2);
                    const updates = updatedHeirs.map(h =>
                        api.put(`/herdeiros/${h.id}`, { ...h, percentual: share })
                    );
                    await Promise.all(updates);
                }

                showModal('Sucesso', 'Herdeiro adicionado e percentuais recalculados!', 'success');
            }

            setFormData({ nome: '', parentesco: '', contato: '' });
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
            contato: herdeiro.contato
        });
        setEditingId(herdeiro.id);
    };

    const handleCancelEdit = () => {
        setFormData({ nome: '', parentesco: '', contato: '' });
        setEditingId(null);
    };

    const handleDelete = (id) => {
        showModal('Confirmar Exclusão', 'Tem certeza que deseja excluir este herdeiro?', 'warning', async () => {
            try {
                await api.delete(`/herdeiros/${id}`);

                // Recalculate percentages for remaining heirs
                const response = await api.get(`/herdeiros?processoId=${processoId}`);
                const remainingHeirs = response.data;

                if (remainingHeirs.length > 0) {
                    const share = (100 / remainingHeirs.length).toFixed(2);
                    const updates = remainingHeirs.map(h =>
                        api.put(`/herdeiros/${h.id}`, { ...h, percentual: share })
                    );
                    await Promise.all(updates);
                }

                loadHerdeiros();
                showModal('Sucesso', 'Herdeiro excluído e percentuais recalculados!', 'success');
            } catch (error) {
                console.error("Error deleting herdeiro", error);
                showModal('Erro', 'Erro ao excluir herdeiro.', 'error');
            }
        });
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
                    {editingId ? 'Editar Herdeiro' : 'Cadastro de Herdeiros'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Nome Completo</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Grau de Parentesco</label>
                            <select
                                className="input-dark"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Contato (Telefone/Email)</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.contato}
                                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="bg-secondary text-text-main px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors uppercase text-sm">
                            {editingId ? 'Atualizar Herdeiro' : 'Adicionar Herdeiro'}
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
                    Herdeiros Cadastrados
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {herdeiros.length === 0 ? (
                        <div className="col-span-full text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-400">
                            Nenhum herdeiro cadastrado.
                        </div>
                    ) : (
                        herdeiros.map((herdeiro) => (
                            <div key={herdeiro.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                        {herdeiro.parentesco}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(herdeiro)} className="text-gray-400 hover:text-primary">✎</button>
                                        <button onClick={() => handleDelete(herdeiro.id)} className="text-gray-400 hover:text-red-500">🗑</button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-text-main mb-1 truncate" title={herdeiro.nome}>
                                    {herdeiro.nome}
                                </h3>

                                <div className="text-2xl font-bold text-primary mb-4">
                                    {herdeiro.percentual}%
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 border-t border-gray-100 pt-3">
                                    <div className="truncate">Contato: {herdeiro.contato || '-'}</div>
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

export default HerdeirosManager;
