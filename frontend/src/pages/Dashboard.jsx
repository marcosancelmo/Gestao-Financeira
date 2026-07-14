import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, Landmark, ArrowDownToLine,
  ArrowUpFromLine, PiggyBank, LineChart as LineChartIcon, Clock,
} from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import KpiCard from '../components/KpiCard.jsx'
import api from '../services/api.js'
import { formatCurrency, MESES } from '../utils/format.js'

const PIE_COLORS = ['#c8622f', '#5f9169', '#b8543f', '#8a6d4f', '#4f7d8a', '#a3806b', '#6f6759']

export default function Dashboard() {
  const resumo = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: async () => (await api.get('/dashboard/resumo')).data,
    refetchInterval: 30000,
  })

  const mensal = useQuery({
    queryKey: ['dashboard-mensal'],
    queryFn: async () => (await api.get('/dashboard/entradas-saidas-mensal')).data,
  })

  const despesas = useQuery({
    queryKey: ['dashboard-despesas-categoria'],
    queryFn: async () => (await api.get('/dashboard/despesas-por-categoria')).data,
  })

  const receitas = useQuery({
    queryKey: ['dashboard-receitas-categoria'],
    queryFn: async () => (await api.get('/dashboard/receitas-por-categoria')).data,
  })

  const formas = useQuery({
    queryKey: ['dashboard-formas'],
    queryFn: async () => (await api.get('/dashboard/formas-pagamento-uso')).data,
  })

  const comparativo = useQuery({
    queryKey: ['dashboard-comparativo'],
    queryFn: async () => (await api.get('/dashboard/comparativo-anual')).data,
  })

  const fluxo = useQuery({
    queryKey: ['dashboard-fluxo'],
    queryFn: async () => (await api.get('/dashboard/fluxo-caixa')).data,
  })

  const d = resumo.data

  const mensalFormatado = (mensal.data || []).map((m) => ({ ...m, mesLabel: MESES[m.mes - 1].slice(0, 3) }))

  return (
    <div>
      <TopBar title="Dashboard" subtitle="Visão geral do financeiro da empresa" />
      <div className="p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard icon={TrendingUp} label="Entradas do Mês" value={d?.entradas_mes} tone="positive" />
          <KpiCard icon={TrendingDown} label="Saídas do Mês" value={d?.saidas_mes} tone="negative" />
          <KpiCard icon={LineChartIcon} label="Lucro Líquido" value={d?.lucro_liquido} tone="accent" />
          <KpiCard icon={Wallet} label="Saldo em Caixa" value={d?.saldo_caixa} tone="accent" />
          <KpiCard icon={Landmark} label="Saldo Bancário" value={d?.saldo_bancario} tone="neutral" />
          <KpiCard icon={ArrowDownToLine} label="Contas a Receber" value={d?.contas_receber} tone="positive" />
          <KpiCard icon={ArrowUpFromLine} label="Contas a Pagar" value={d?.contas_pagar} tone="negative" />
          <KpiCard icon={PiggyBank} label="Retirada Pessoal" value={d?.retirada_pessoal} tone="neutral" description="Categoria Saída Pessoal - Ronaldo" />
          <KpiCard icon={TrendingUp} label="Lucro do Ano" value={d?.lucro_ano} tone="accent" />
          <KpiCard
            icon={Clock}
            label="Última Atualização"
            value={d ? new Date(d.ultima_atualizacao).toLocaleTimeString('pt-BR') : '-'}
            tone="neutral"
            isCurrency={false}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartCard title="Entradas x Saídas por Mês">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mensalFormatado}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(60 55 47)" />
                <XAxis dataKey="mesLabel" stroke="rgb(163 154 139)" fontSize={12} />
                <YAxis stroke="rgb(163 154 139)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="entradas" name="Entradas" fill="#5f9169" radius={[3, 3, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="#b8543f" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Fluxo de Caixa (mês atual)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={fluxo.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(60 55 47)" />
                <XAxis dataKey="data" stroke="rgb(163 154 139)" fontSize={11} tickFormatter={(v) => v?.slice(8, 10)} />
                <YAxis stroke="rgb(163 154 139)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="saldo" name="Saldo Acumulado" stroke="#c8622f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ChartCard title="Despesas por Categoria">
            <PieChartBlock data={despesas.data} dataKey="valor" nameKey="categoria" />
          </ChartCard>
          <ChartCard title="Receitas por Categoria">
            <PieChartBlock data={receitas.data} dataKey="valor" nameKey="categoria" />
          </ChartCard>
          <ChartCard title="Forma de Pagamento Utilizada">
            <PieChartBlock data={formas.data} dataKey="valor" nameKey="forma" />
          </ChartCard>
          <ChartCard title="Comparativo Anual">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparativo.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(60 55 47)" />
                <XAxis dataKey="ano" stroke="rgb(163 154 139)" fontSize={12} />
                <YAxis stroke="rgb(163 154 139)" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="lucro" name="Lucro" fill="#c8622f" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-panel border border-border rounded-lg p-4">
      <h3 className="font-display text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  )
}

function PieChartBlock({ data, dataKey, nameKey }) {
  if (!data || data.length === 0) {
    return <div className="h-[220px] flex items-center justify-center text-muted text-sm">Sem dados ainda</div>
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={45} outerRadius={75} paddingAngle={2}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-elevated border border-border rounded-md px-3 py-2 text-xs shadow-lg">
      {label && <div className="text-muted mb-1">{label}</div>}
      {payload.map((p, idx) => (
        <div key={idx} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </div>
      ))}
    </div>
  )
}
