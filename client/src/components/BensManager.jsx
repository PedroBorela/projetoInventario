import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';
import { useProcesso } from '../context/ProcessContext';

const BensManager = () => {
    const { processoId } = useProcesso();
    const [bens, setBens] = useState([]);
    const [formData, setFormData] = useState({
        tipo: 'imovel',
        descricao: '',
        valorMercado: '',
        valorVenal: '',
        // Campos específicos
        matricula: '',
        cartorio: '',
        inscricaoMunicipal: '',
        placa: '',
        renavam: '',
        banco: '',
        agencia: '',
        conta: '',
        tipoInvestimento: ''
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
            loadBens();
        }
    }, [processoId]);

    const loadBens = async () => {
        try {
            const response = await api.get(`/bens?processoId=${processoId}`);
            setBens(response.data);
        } catch (error) {
            console.error("Error loading bens", error);
            showModal('Erro', 'Erro ao carregar bens.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!processoId) {
            showModal('Erro', 'Nenhum processo selecionado.', 'error');
            return;
        }

        try {
            const payload = { ...formData, processoId }; // Include processoId
            if (editingId) {
                await api.put(`/bens/${editingId}`, payload);
                setEditingId(null);
                showModal('Sucesso', 'Bem atualizado com sucesso!', 'success');
            } else {
                await api.post('/bens', payload);
                showModal('Sucesso', 'Bem adicionado com sucesso!', 'success');
            }
            // Reset form
            setFormData({
                tipo: 'imovel', descricao: '', valorMercado: '', valorVenal: '',
                matricula: '', cartorio: '', inscricaoMunicipal: '',
                placa: '', renavam: '', banco: '', agencia: '', conta: '', tipoInvestimento: ''
            });
            loadBens();
        } catch (error) {
            console.error("Error saving bem", error);
            showModal('Erro', 'Erro ao salvar bem.', 'error');
        }
    };

    const handleEdit = (bem) => {
        setFormData({
            tipo: bem.tipo,
            descricao: bem.descricao,
            valorMercado: bem.valorMercado || bem.valor || '',
            valorVenal: bem.valorVenal || '',
            matricula: bem.matricula || '',
            cartorio: bem.cartorio || '',
            inscricaoMunicipal: bem.inscricaoMunicipal || '',
            placa: bem.placa || '',
            renavam: bem.renavam || '',
            banco: bem.banco || '',
            agencia: bem.agencia || '',
            conta: bem.conta || '',
            tipoInvestimento: bem.tipoInvestimento || ''
        });
        setEditingId(bem.id);
    };

    const handleCancelEdit = () => {
        setFormData({
            tipo: 'imovel', descricao: '', valorMercado: '', valorVenal: '',
            matricula: '', cartorio: '', inscricaoMunicipal: '',
            placa: '', renavam: '', banco: '', agencia: '', conta: '', tipoInvestimento: ''
        });
        setEditingId(null);
    };

    const handleDelete = (id) => {
        showModal('Confirmar Exclusão', 'Tem certeza que deseja excluir este bem?', 'warning', async () => {
            try {
                await api.delete(`/bens/${id}`);
                loadBens();
                showModal('Sucesso', 'Bem excluído com sucesso!', 'success');
            } catch (error) {
                console.error("Error deleting bem", error);
                showModal('Erro', 'Erro ao excluir bem.', 'error');
            }
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const renderSpecificFields = () => {
        switch (formData.tipo) {
            case 'imovel':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="col-span-3 font-bold text-gray-500 text-sm uppercase tracking-wider">Detalhes do Imóvel</div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">Matrícula</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.matricula}
                                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">Cartório</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.cartorio}
                                onChange={(e) => setFormData({ ...formData, cartorio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">Inscrição Municipal (IPTU)</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.inscricaoMunicipal}
                                onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 'veiculo':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="col-span-2 font-bold text-gray-500 text-sm uppercase tracking-wider">Detalhes do Veículo</div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">Placa</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.placa}
                                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">RENAVAM</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.renavam}
                                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 'conta-bancaria':
            case 'investimento':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="col-span-3 font-bold text-gray-500 text-sm uppercase tracking-wider">Detalhes Financeiros</div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">Banco</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.banco}
                                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">Agência</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.agencia}
                                onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-500">Conta</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.conta}
                                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                            />
                        </div>
                        {formData.tipo === 'investimento' && (
                            <div className="col-span-3">
                                <label className="block mb-2 text-sm text-gray-500">Tipo de Investimento</label>
                                <input
                                    type="text"
                                    placeholder="Ex: CDB, Ações, Tesouro Direto"
                                    className="input-dark"
                                    value={formData.tipoInvestimento}
                                    onChange={(e) => setFormData({ ...formData, tipoInvestimento: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
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
                    {editingId ? 'Editar Bem' : 'Cadastro de Bens'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo e Descrição */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Tipo de Bem</label>
                            <select
                                className="input-dark"
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="imovel">Imóvel</option>
                                <option value="veiculo">Veículo</option>
                                <option value="investimento">Investimento</option>
                                <option value="conta-bancaria">Conta Bancária</option>
                                <option value="objeto-pessoal">Objeto Pessoal</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Descrição</label>
                            <input
                                type="text"
                                className="input-dark"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Valores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 font-medium text-primary">Valor de Mercado (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input-dark border-accent/50 focus:border-accent focus:ring-1 focus:ring-accent"
                                value={formData.valorMercado}
                                onChange={(e) => setFormData({ ...formData, valorMercado: e.target.value })}
                                required
                                placeholder="Para partilha"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-500">Valor Venal (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input-dark"
                                value={formData.valorVenal}
                                onChange={(e) => setFormData({ ...formData, valorVenal: e.target.value })}
                                placeholder="Para impostos (opcional)"
                            />
                        </div>
                    </div>

                    {/* Campos Específicos */}
                    {renderSpecificFields()}

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="bg-secondary text-text-main px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors uppercase text-sm">
                            {editingId ? 'Atualizar Bem' : 'Adicionar Bem'}
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
                    Bens Cadastrados
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bens.length === 0 ? (
                        <div className="col-span-full text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-400">
                            Nenhum bem cadastrado.
                        </div>
                    ) : (
                        bens.map((bem) => (
                            <div key={bem.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                        {bem.tipo}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(bem)} className="text-gray-400 hover:text-primary">✎</button>
                                        <button onClick={() => handleDelete(bem.id)} className="text-gray-400 hover:text-red-500">🗑</button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-text-main mb-1 truncate" title={bem.descricao}>
                                    {bem.descricao}
                                </h3>

                                <div className="text-2xl font-bold text-primary mb-4">
                                    {formatCurrency(bem.valorMercado || bem.valor)}
                                </div>

                                <div className="space-y-2 text-sm text-gray-500 border-t border-gray-100 pt-3">
                                    <div className="flex justify-between">
                                        <span>Venal:</span>
                                        <span className="text-text-main">{formatCurrency(bem.valorVenal)}</span>
                                    </div>
                                    {bem.tipo === 'imovel' && <div className="truncate">Mat: {bem.matricula || '-'}</div>}
                                    {bem.tipo === 'veiculo' && <div className="truncate">Placa: {bem.placa || '-'}</div>}
                                    {(bem.tipo === 'conta-bancaria' || bem.tipo === 'investimento') && <div className="truncate">Banco: {bem.banco || '-'}</div>}
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

export default BensManager;
