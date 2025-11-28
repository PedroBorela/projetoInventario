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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="col-span-3 font-medium text-gray-700">Detalhes do Imóvel</div>
                        <div>
                            <label className="block mb-1 text-sm">Matrícula</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.matricula}
                                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Cartório</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.cartorio}
                                onChange={(e) => setFormData({ ...formData, cartorio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Inscrição Municipal (IPTU)</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.inscricaoMunicipal}
                                onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 'veiculo':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="col-span-2 font-medium text-gray-700">Detalhes do Veículo</div>
                        <div>
                            <label className="block mb-1 text-sm">Placa</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.placa}
                                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">RENAVAM</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.renavam}
                                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                            />
                        </div>
                    </div>
                );
            case 'conta-bancaria':
            case 'investimento':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                        <div className="col-span-3 font-medium text-gray-700">Detalhes Financeiros</div>
                        <div>
                            <label className="block mb-1 text-sm">Banco</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.banco}
                                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Agência</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.agencia}
                                onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm">Conta</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={formData.conta}
                                onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                            />
                        </div>
                        {formData.tipo === 'investimento' && (
                            <div className="col-span-3">
                                <label className="block mb-1 text-sm">Tipo de Investimento</label>
                                <input
                                    type="text"
                                    placeholder="Ex: CDB, Ações, Tesouro Direto"
                                    className="w-full p-2 border border-gray-300 rounded"
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
                    <span>🏠</span> {editingId ? 'Editar Bem' : 'Cadastro de Bens'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo e Descrição */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Tipo de Bem</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
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
                            <label className="block mb-1 font-medium">Descrição</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Valores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-blue-700">Valor de Mercado (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 border border-blue-200 rounded focus:outline-none focus:border-blue-500 bg-blue-50"
                                value={formData.valorMercado}
                                onChange={(e) => setFormData({ ...formData, valorMercado: e.target.value })}
                                required
                                placeholder="Para partilha"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-600">Valor Venal (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500 bg-gray-50"
                                value={formData.valorVenal}
                                onChange={(e) => setFormData({ ...formData, valorVenal: e.target.value })}
                                placeholder="Para impostos (opcional)"
                            />
                        </div>
                    </div>

                    {/* Campos Específicos */}
                    {renderSpecificFields()}

                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="bg-accent text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors">
                            {editingId ? 'Atualizar Bem' : 'Adicionar Bem'}
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
                <h2 className="text-xl text-primary mb-4">Bens Cadastrados</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-3 font-semibold">Tipo</th>
                                <th className="p-3 font-semibold">Descrição</th>
                                <th className="p-3 font-semibold">Valor Mercado</th>
                                <th className="p-3 font-semibold">Valor Venal</th>
                                <th className="p-3 font-semibold">Detalhes</th>
                                <th className="p-3 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bens.map((bem) => (
                                <tr key={bem.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 capitalize">{bem.tipo}</td>
                                    <td className="p-3">{bem.descricao}</td>
                                    <td className="p-3 text-blue-700 font-medium">
                                        {formatCurrency(bem.valorMercado || bem.valor)}
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {formatCurrency(bem.valorVenal)}
                                    </td>
                                    <td className="p-3 text-sm text-gray-500">
                                        {bem.tipo === 'imovel' && `Mat: ${bem.matricula || '-'}`}
                                        {bem.tipo === 'veiculo' && `Placa: ${bem.placa || '-'}`}
                                        {(bem.tipo === 'conta-bancaria' || bem.tipo === 'investimento') && `Banco: ${bem.banco || '-'}`}
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(bem)}
                                            className="bg-warning text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(bem.id)}
                                            className="bg-error text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {bens.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-4 text-center text-gray-500">Nenhum bem cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BensManager;
