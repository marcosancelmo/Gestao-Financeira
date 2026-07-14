import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import KpiCard from '../components/KpiCard.jsx'
import TopBar from '../components/TopBar.jsx'
import api from '../services/api.js'
import { MESES } from '../utils/format.js'
import { TrendingUp, TrendingDown, LineChart } from 'lucide-react'

export default function ResumoMensal() {
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth() + 1)

  const resumo = useQuery({
    queryKey: ['resumo-mensal', ano, mes],
    queryFn: async () => (await api.get('/relatorios/resumo-mensal', { params: { ano, mes } })).data,
  })

  return (
    <div>
      <TopBar title="Resumo Mensal" subtitle="Entradas, saídas e lucro de um mês específico" />
      <div className="p-6 space-y-6">
        <div className="bg-panel border border-border rounded-lg p-4 flex items-center gap-3">
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="input w-40">
            {MESES.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))} className="input w-28">
            {[ano - 1, ano, ano + 1].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard icon={TrendingUp} label="Entradas" value={resumo.data?.entradas} tone="positive" />
          <KpiCard icon={TrendingDown} label="Saídas" value={resumo.data?.saidas} tone="negative" />
          <KpiCard icon={LineChart} label="Lucro" value={resumo.data?.lucro} tone="accent" />
        </div>
      </div>
    </div>
  )
}
