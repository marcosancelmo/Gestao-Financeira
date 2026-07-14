import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import ComboBox from '../components/ComboBox.jsx'
import api from '../services/api.js'
import { formatCurrency, formatDate } from '../utils/format.js'

const STATUS = ['Pendente', 'Parcial', 'Recebido', 'Atrasado']

export default function ContasReceber() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, control } = useForm()

  const contas = useQuery({ queryKey: ['contas-receber'], queryFn: async () => (await api.get('/contas-receber/')).data })
  const clientes = useQuery({ queryKey: ['clientes'], queryFn: async () => (await api.get('/clientes/')).data })
  const clienteOptions = (clientes.data || []).map((c) => ({ value: c.id, label: c.nome }))

  function abrirNovo() {
    setEditing(null)
    reset({ cliente_id: '', valor: '', vencimento: '', status: 'Pendente', valor_recebido: '', observacoes: '' })
    setModalOpen(true)
  }

  function abrirEdicao(row) {
    setEditing(row)
    reset({ ...row, cliente_id: row.cliente_id })
    setModalOpen(true)
  }

  async function onSubmit(values) {
    const payload = {
      ...values,
      cliente_id: Number(values.cliente_id),
      valor: parseFloat(values.valor),
      valor_recebido: parseFloat(values.valor_recebido || 0),
    }
    if (editing) {
      await api.put(`/contas-receber/${editing.id}`, payload)
    } else {
      await api.post('/contas-receber/', payload)
    }
    queryClient.invalidateQueries({ queryKey: ['contas-receber'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    setModalOpen(false)
  }

  async function excluir(row) {
    if (!confirm('Remover esta conta a receber?')) return
    await api.delete(`/contas-receber/${row.id}`)
    queryClient.invalidateQueries({ queryKey: ['contas-receber'] })
  }

  const columns = [
    { key: 'cliente', label: 'Cliente', render: (r) => r.cliente?.nome },
    { key: 'valor', label: 'Valor', mono: true, render: (r) => formatCurrency(r.valor) },
    { key: 'valor_recebido', label: 'Recebido', mono: true, render: (r) => formatCurrency(r.valor_recebido) },
    { key: 'vencimento', label: 'Vencimento', render: (r) => formatDate(r.vencimento) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <TopBar title="Contas a Receber" subtitle="Recebimentos previstos de clientes" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={abrirNovo} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <Plus size={15} /> Nova Conta a Receber
          </button>
        </div>
        <DataTable columns={columns} rows={contas.data || []} onEdit={abrirEdicao} onDelete={excluir} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Conta' : 'Nova Conta a Receber'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Cliente">
            <Controller name="cliente_id" control={control} rules={{ required: true }} render={({ field }) => (
              <ComboBox options={clienteOptions} value={field.value} onChange={field.onChange} placeholder="Selecionar cliente..." />
            )} />
          </F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Valor (R$)"><input type="number" step="0.01" {...register('valor', { required: true })} className="input font-mono" /></F>
            <F label="Vencimento"><input type="date" {...register('vencimento', { required: true })} className="input" /></F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Valor Recebido (R$)"><input type="number" step="0.01" {...register('valor_recebido')} className="input font-mono" /></F>
            <F label="Status">
              <select {...register('status')} className="input">
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </F>
          </div>
          <F label="Observações"><textarea {...register('observacoes')} className="input min-h-[70px]" /></F>
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    Recebido: 'text-positive',
    Parcial: 'text-accent',
    Pendente: 'text-secondary',
    Atrasado: 'text-negative',
  }
  return <span className={map[status] || 'text-secondary'}>{status}</span>
}

function F({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">{label}</label>
      {children}
    </div>
  )
}
