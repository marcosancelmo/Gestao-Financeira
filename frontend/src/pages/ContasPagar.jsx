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

const STATUS = ['Pendente', 'Pago', 'Atrasado']

export default function ContasPagar() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, control } = useForm()

  const contas = useQuery({ queryKey: ['contas-pagar'], queryFn: async () => (await api.get('/contas-pagar/')).data })
  const categorias = useQuery({
    queryKey: ['categorias', 'saida'],
    queryFn: async () => (await api.get('/categorias/', { params: { tipo: 'saida' } })).data,
  })
  const categoriaOptions = (categorias.data || []).map((c) => ({ value: c.id, label: c.nome }))

  function abrirNovo() {
    setEditing(null)
    reset({ fornecedor: '', categoria_id: '', valor: '', vencimento: '', status: 'Pendente', observacoes: '' })
    setModalOpen(true)
  }

  function abrirEdicao(row) {
    setEditing(row)
    reset({ ...row, categoria_id: row.categoria_id || '' })
    setModalOpen(true)
  }

  async function onSubmit(values) {
    const payload = {
      ...values,
      categoria_id: values.categoria_id ? Number(values.categoria_id) : null,
      valor: parseFloat(values.valor),
    }
    if (editing) {
      await api.put(`/contas-pagar/${editing.id}`, payload)
    } else {
      await api.post('/contas-pagar/', payload)
    }
    queryClient.invalidateQueries({ queryKey: ['contas-pagar'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
    setModalOpen(false)
  }

  async function excluir(row) {
    if (!confirm('Remover esta conta a pagar?')) return
    await api.delete(`/contas-pagar/${row.id}`)
    queryClient.invalidateQueries({ queryKey: ['contas-pagar'] })
  }

  const columns = [
    { key: 'fornecedor', label: 'Fornecedor' },
    { key: 'valor', label: 'Valor', mono: true, render: (r) => formatCurrency(r.valor) },
    { key: 'vencimento', label: 'Vencimento', render: (r) => formatDate(r.vencimento) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div>
      <TopBar title="Contas a Pagar" subtitle="Obrigações e pagamentos a fornecedores" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={abrirNovo} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <Plus size={15} /> Nova Conta a Pagar
          </button>
        </div>
        <DataTable columns={columns} rows={contas.data || []} onEdit={abrirEdicao} onDelete={excluir} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Conta' : 'Nova Conta a Pagar'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Fornecedor"><input {...register('fornecedor', { required: true })} className="input" /></F>
          <F label="Categoria">
            <Controller name="categoria_id" control={control} render={({ field }) => (
              <ComboBox options={categoriaOptions} value={field.value} onChange={field.onChange} placeholder="Selecionar categoria..." />
            )} />
          </F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Valor (R$)"><input type="number" step="0.01" {...register('valor', { required: true })} className="input font-mono" /></F>
            <F label="Vencimento"><input type="date" {...register('vencimento', { required: true })} className="input" /></F>
          </div>
          <F label="Status">
            <select {...register('status')} className="input">
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </F>
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
  const map = { Pago: 'text-positive', Pendente: 'text-secondary', Atrasado: 'text-negative' }
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
