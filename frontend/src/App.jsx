import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import { PrivateRoute, SupervisorRoute } from './routes/guards.jsx'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NovoLancamento from './pages/NovoLancamento.jsx'
import Lancamentos from './pages/Lancamentos.jsx'
import FluxoCaixa from './pages/FluxoCaixa.jsx'
import ContasReceber from './pages/ContasReceber.jsx'
import ContasPagar from './pages/ContasPagar.jsx'
import Clientes from './pages/Clientes.jsx'
import Obras from './pages/Obras.jsx'
import Categorias from './pages/Categorias.jsx'
import FormasPagamento from './pages/FormasPagamento.jsx'
import Relatorios from './pages/Relatorios.jsx'
import ResumoMensal from './pages/ResumoMensal.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import Backup from './pages/Backup.jsx'
import Usuarios from './pages/Usuarios.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/novo-lancamento" element={<NovoLancamento />} />
        <Route path="/lancamentos" element={<Lancamentos />} />
        <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
        <Route path="/contas-receber" element={<ContasReceber />} />
        <Route path="/contas-pagar" element={<ContasPagar />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/obras" element={<Obras />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/formas-pagamento" element={<FormasPagamento />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/resumo-mensal" element={<ResumoMensal />} />

        <Route path="/configuracoes" element={<SupervisorRoute><Configuracoes /></SupervisorRoute>} />
        <Route path="/backup" element={<SupervisorRoute><Backup /></SupervisorRoute>} />
        <Route path="/usuarios" element={<SupervisorRoute><Usuarios /></SupervisorRoute>} />
      </Route>
    </Routes>
  )
}
