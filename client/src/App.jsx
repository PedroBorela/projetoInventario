import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProcessProvider } from './context/ProcessContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import BensManager from './components/BensManager';
import HerdeirosManager from './components/HerdeirosManager';
import DividasManager from './components/DividasManager';
import InventarioProcess from './components/InventarioProcess';
import LandingPage from './pages/LandingPage';

function App() {
    return (
        <ProcessProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/processo/:id" element={<Layout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="bens" element={<BensManager />} />
                        <Route path="herdeiros" element={<HerdeirosManager />} />
                        <Route path="dividas" element={<DividasManager />} />
                        <Route path="relatorio" element={<InventarioProcess />} />
                    </Route>
                </Routes>
            </Router>
        </ProcessProvider>
    );
}

export default App;
