import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const ProcessContext = createContext();

export const ProcessProvider = ({ children }) => {
    const [processoId, setProcessoId] = useState(null);
    const [processo, setProcesso] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedId = localStorage.getItem('processoId');
        if (storedId) {
            setProcessoId(storedId);
            fetchProcesso(storedId);
        }
    }, []);

    const fetchProcesso = async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`/processo/${id}`);
            setProcesso(response.data);
        } catch (error) {
            console.error("Erro ao buscar processo:", error);
            // Se der erro (ex: 404), limpa o estado
            setProcessoId(null);
            setProcesso(null);
            localStorage.removeItem('processoId');
        } finally {
            setLoading(false);
        }
    };

    const selecionarProcesso = (id) => {
        setProcessoId(id);
        localStorage.setItem('processoId', id);
        fetchProcesso(id);
    };

    const limparProcesso = () => {
        setProcessoId(null);
        setProcesso(null);
        localStorage.removeItem('processoId');
    };

    return (
        <ProcessContext.Provider value={{
            processoId,
            processo,
            loading,
            selecionarProcesso,
            limparProcesso,
            fetchProcesso // Expose refresh function
        }}>
            {children}
        </ProcessContext.Provider>
    );
};

export const useProcesso = () => useContext(ProcessContext);
