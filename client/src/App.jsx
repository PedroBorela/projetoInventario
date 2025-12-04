import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProcessProvider } from './context/ProcessContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CustomCursor from './components/CustomCursor';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BensManager from './components/BensManager';
import HerdeirosManager from './components/HerdeirosManager';
import DividasManager from './components/DividasManager';
import InventarioProcess from './components/InventarioProcess';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Carregando...</div>;

    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <ProcessProvider>
                <CustomCursor />
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/" element={<LandingPage />} />

                        <Route path="/processo/:id" element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="bens" element={<BensManager />} />
                            <Route path="herdeiros" element={<HerdeirosManager />} />
                            <Route path="dividas" element={<DividasManager />} />
                            <Route path="relatorio" element={<InventarioProcess />} />
                        </Route>
                    </Routes>
                </Router>
            </ProcessProvider>
        </AuthProvider>
    );
}

export default App;
