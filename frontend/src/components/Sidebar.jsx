import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, ListOrdered, Waves, ArrowDownToLine,
  ArrowUpFromLine, Users, HardHat, Tags, CreditCard, FileBarChart,
  CalendarRange, Settings, DatabaseBackup, UserCog, Flame,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/novo-lancamento', label: 'Novo Lançamento', icon: PlusCircle },
  { to: '/lancamentos', label: 'Lançamentos', icon: ListOrdered },
  { to: '/fluxo-caixa', label: 'Fluxo de Caixa', icon: Waves },
  { to: '/contas-receber', label: 'Contas a Receber', icon: ArrowDownToLine },
  { to: '/contas-pagar', label: 'Contas a Pagar', icon: ArrowUpFromLine },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/obras', label: 'Obras', icon: HardHat },
  { to: '/categorias', label: 'Categorias', icon: Tags },
  { to: '/formas-pagamento', label: 'Forma de Pagamento', icon: CreditCard },
  { to: '/relatorios', label: 'Relatórios', icon: FileBarChart },
  { to: '/resumo-mensal', label: 'Resumo Mensal', icon: CalendarRange },
]

const NAV_SUPERVISOR = [
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/backup', label: 'Backup', icon: DatabaseBackup },
  { to: '/usuarios', label: 'Usuários', icon: UserCog },
]

export default function Sidebar() {
  const { isSupervisor } = useAuth()

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-panel border-r border-border h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <Flame size={20} className="text-accent" strokeWidth={2} />
        <div>
          <div className="font-display font-semibold text-sm tracking-wide leading-none">RM SERRALHERIA</div>
          <div className="text-[11px] text-muted leading-none mt-1">Controle Financeiro</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
        {isSupervisor && (
          <>
            <div className="mt-4 mb-2 px-3 text-[10px] uppercase tracking-widest text-muted">Administração</div>
            {NAV_SUPERVISOR.map((item) => (
              <SidebarLink key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors ${
          isActive
            ? 'bg-accent-soft/15 text-accent font-medium'
            : 'text-secondary hover:bg-elevated hover:text-primary'
        }`
      }
    >
      <Icon size={16} strokeWidth={2} />
      {label}
    </NavLink>
  )
}
