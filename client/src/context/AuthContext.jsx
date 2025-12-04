import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                api.defaults.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error("Erro ao recuperar sessão:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user } = response.data;

            if (!user || !access_token) {
                throw new Error('Dados de login inválidos recebidos do servidor');
            }

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            api.defaults.headers.Authorization = `Bearer ${access_token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error("Login error", error);
            return { success: false, message: error.response?.data?.message || 'Erro ao fazer login' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            const { access_token, user } = response.data;

            if (!user || !access_token) {
                throw new Error('Dados de registro inválidos recebidos do servidor');
            }

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            api.defaults.headers.Authorization = `Bearer ${access_token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error("Register error", error);
            return { success: false, message: error.response?.data?.message || 'Erro ao registrar' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        api.defaults.headers.Authorization = undefined;
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
