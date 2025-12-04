import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await register(name, email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter mb-2">Serenity<span className="text-secondary">.</span></h1>
                    <p className="text-gray-500">Crie sua conta</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Nome Completo</label>
                        <input
                            type="text"
                            required
                            className="input-dark w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu Nome"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="input-dark w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Senha</label>
                        <input
                            type="password"
                            required
                            className="input-dark w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-secondary text-text-main font-bold py-3 rounded-full hover:bg-gray-200 transition-colors uppercase text-sm"
                    >
                        Criar Conta
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-secondary">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-accent hover:underline">
                        Entrar
                    </Link>
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

export default RegisterPage;
