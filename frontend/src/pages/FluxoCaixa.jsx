import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TopBar from '../components/TopBar.jsx'
import DataTable from '../components/DataTable.jsx'
import api from '../services/api.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function FluxoCaixa() {
  const fluxo = useQuery({
    queryKey: ['fluxo-caixa'],
    queryFn: async () => (await api.get('/dashboard/fluxo-caixa')).data,
  })

  const columns = [
    { key: 'data', label: 'Data', render: (r) => formatDate(r.data) },
    { key: 'entradas', label: 'Entradas', mono: true, render: (r) => <span className="text-positive">{formatCurrency(r.entradas)}</span> },
    { key: 'saidas', label: 'Saídas', mono: true, render: (r) => <span className="text-negative">{formatCurrency(r.saidas)}</span> },
    { key: 'saldo', label: 'Saldo Acumulado', mono: true, render: (r) => formatCurrency(r.saldo) },
  ]

  return (
    <div>
      <TopBar title="Fluxo de Caixa" subtitle="Movimentação diária do mês corrente" />
      <div className="p-6 space-y-4">
        <div className="bg-panel border border-border rounded-lg p-4">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fluxo.data || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(60 55 47)" />
              <XAxis dataKey="data" stroke="rgb(163 154 139)" fontSize={11} tickFormatter={(v) => v?.slice(8, 10)} />
              <YAxis stroke="rgb(163 154 139)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(v) => formatDate(v)} />
              <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#c8622f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <DataTable columns={columns} rows={fluxo.data || []} />
      </div>
    </div>
  )
}
