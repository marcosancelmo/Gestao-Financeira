import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Search, Trash2 } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import DataTable from '../components/DataTable.jsx'
import api from '../services/api.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function Lancamentos() {
  const queryClient = useQueryClient()
  const [filtros, setFiltros] = useState({
    data_inicio: '', data_fim: '', categoria_id: '', cliente_id: '',
    obra_id: '', responsavel: '', forma_pagamento_id: '', tipo: '', q: '',
  })

  const categorias = useQuery({ queryKey: ['categorias-all'], queryFn: async () => (await api.get('/categorias/')).data })
  const clientes = useQuery({ queryKey: ['clientes'], queryFn: async () => (await api.get('/clientes/')).data })
  const obras = useQuery({ queryKey: ['obras'], queryFn: async () => (await api.get('/obras/')).data })
  const formas = useQuery({ queryKey: ['formas-pagamento'], queryFn: async () => (await api.get('/formas-pagamento/')).data })

  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''))

  const lancamentos = useQuery({
    queryKey: ['lancamentos', params],
    queryFn: async () => (await api.get('/lancamentos/', { params: { ...params, limit: 300 } })).data,
  })

  function updateFiltro(key, value) {
    setFiltros((prev) => ({ ...prev, [key]: value }))
  }

  async function excluir(row) {
    if (!confirm(`Excluir o lançamento #${row.numero}?`)) return
    await api.delete(`/lancamentos/${row.id}`)
    queryClient.invalidateQueries({ queryKey: ['lancamentos'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
  }

  async function exportarCsv() {
    const response = await api.get('/lancamentos/export/csv', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'lancamentos.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const columns = [
    { key: 'numero', label: '#', mono: true },
    { key: 'data', label: 'Data', render: (r) => formatDate(r.data) },
    { key: 'tipo', label: 'Tipo', render: (r) => (
      <span className={r.tipo === 'entrada' ? 'text-positive' : 'text-negative'}>
        {r.tipo === 'entrada' ? 'Entrada' : 'Saída'}
      </span>
    ) },
    { key: 'categoria', label: 'Categoria', render: (r) => (
      <span className={r.destaque ? 'text-destaque font-medium' : ''}>{r.categoria?.nome}</span>
    ) },
    { key: 'valor', label: 'Valor', mono: true, render: (r) => (
      <span className={r.tipo === 'entrada' ? 'text-positive' : 'text-negative'}>{formatCurrency(r.valor)}</span>
    ) },
    { key: 'cliente', label: 'Cliente', render: (r) => r.cliente?.nome || '-' },
    { key: 'obra', label: 'Obra', render: (r) => r.obra?.nome || '-' },
    { key: 'forma_pagamento', label: 'Pagamento', render: (r) => r.forma_pagamento?.nome },
    { key: 'responsavel', label: 'Responsável' },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={
        r.status === 'pago' ? 'text-positive' : r.status === 'cancelado' ? 'text-muted' : 'text-accent'
      }>{r.status}</span>
    ) },
  ]

  return (
    <div>
      <TopBar title="Lançamentos" subtitle="Tabela completa com filtros avançados" />
      <div className="p-6 space-y-4">
        <div className="bg-panel border border-border rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          <input type="date" value={filtros.data_inicio} onChange={(e) => updateFiltro('data_inicio', e.target.value)} className="input" />
          <input type="date" value={filtros.data_fim} onChange={(e) => updateFiltro('data_fim', e.target.value)} className="input" />
          <select value={filtros.tipo} onChange={(e) => updateFiltro('tipo', e.target.value)} className="input">
            <option value="">Tipo (todos)</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <select value={filtros.categoria_id} onChange={(e) => updateFiltro('categoria_id', e.target.value)} className="input">
            <option value="">Categoria (todas)</option>
            {(categorias.data || []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select value={filtros.cliente_id} onChange={(e) => updateFiltro('cliente_id', e.target.value)} className="input">
            <option value="">Cliente (todos)</option>
            {(clientes.data || []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select value={filtros.obra_id} onChange={(e) => updateFiltro('obra_id', e.target.value)} className="input">
            <option value="">Obra (todas)</option>
            {(obras.data || []).map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
          </select>
          <select value={filtros.responsavel} onChange={(e) => updateFiltro('responsavel', e.target.value)} className="input">
            <option value="">Responsável (todos)</option>
            <option value="Ronaldo">Ronaldo</option>
            <option value="Felipe">Felipe</option>
            <option value="Administrador">Administrador</option>
          </select>
          <select value={filtros.forma_pagamento_id} onChange={(e) => updateFiltro('forma_pagamento_id', e.target.value)} className="input">
            <option value="">Pagamento (todos)</option>
            {(formas.data || []).map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          <div className="relative col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Pesquisar descrição..."
              value={filtros.q}
              onChange={(e) => updateFiltro('q', e.target.value)}
              className="input pl-8"
            />
          </div>
          <button
            onClick={exportarCsv}
            className="flex items-center justify-center gap-2 bg-elevated hover:bg-border border border-border rounded-md text-sm px-3 py-2 transition-colors"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>

        <DataTable columns={columns} rows={lancamentos.data || []} onDelete={excluir} />
      </div>
    </div>
  )
}
