import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import TopBar from '../components/TopBar.jsx'
import DataTable from '../components/DataTable.jsx'
import api from '../services/api.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function Relatorios() {
  const [ano, setAno] = useState(new Date().getFullYear())

  const retiradas = useQuery({
    queryKey: ['retiradas-pessoais', ano],
    queryFn: async () => (await api.get('/relatorios/retiradas-pessoais', { params: { ano } })).data,
  })

  const columns = [
    { key: 'data', label: 'Data', render: (r) => formatDate(r.data) },
    { key: 'descricao', label: 'Descrição' },
    { key: 'valor', label: 'Valor', mono: true, render: (r) => <span className="text-destaque">{formatCurrency(r.valor)}</span> },
  ]

  return (
    <div>
      <TopBar title="Relatórios" subtitle="Retiradas pessoais e demais relatórios financeiros" />
      <div className="p-6 space-y-4">
        <div className="bg-panel border border-border rounded-lg p-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-destaque">Retiradas Pessoais - Ronaldo</h3>
            <p className="text-xs text-muted mt-1">Total no ano: {formatCurrency(retiradas.data?.total)}</p>
          </div>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))} className="input w-32">
            {[ano - 1, ano, ano + 1].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <DataTable columns={columns} rows={retiradas.data?.lancamentos || []} emptyLabel="Nenhuma retirada pessoal registrada neste ano." />

        <div className="bg-panel border border-border rounded-lg p-4 text-sm text-muted">
          Outros relatórios (financeiro mensal/anual, despesas, receitas, clientes, obras e comparativos)
          podem ser acompanhados diretamente no Dashboard e em Resumo Mensal. Exportação em PDF e Excel
          está planejada para uma próxima etapa — por enquanto, os Lançamentos podem ser exportados em CSV.
        </div>
      </div>
    </div>
  )
}
