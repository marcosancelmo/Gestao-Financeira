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

const SITUACOES = ['Em andamento', 'Concluída', 'Cancelada']

export default function Obras() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, control } = useForm()

  const obras = useQuery({ queryKey: ['obras'], queryFn: async () => (await api.get('/obras/')).data })
  const clientes = useQuery({ queryKey: ['clientes'], queryFn: async () => (await api.get('/clientes/')).data })
  const clienteOptions = (clientes.data || []).map((c) => ({ value: c.id, label: c.nome }))

  function abrirNovo() {
    setEditing(null)
    reset({ nome: '', cliente_id: '', valor_contratado: '', data_inicio: '', previsao: '', situacao: 'Em andamento', lucro_estimado: '', lucro_realizado: '' })
    setModalOpen(true)
  }

  function abrirEdicao(row) {
    setEditing(row)
    reset({ ...row, cliente_id: row.cliente_id || '' })
    setModalOpen(true)
  }

  async function onSubmit(values) {
    const payload = {
      ...values,
      cliente_id: values.cliente_id ? Number(values.cliente_id) : null,
      valor_contratado: parseFloat(values.valor_contratado || 0),
      lucro_estimado: parseFloat(values.lucro_estimado || 0),
      lucro_realizado: parseFloat(values.lucro_realizado || 0),
      data_inicio: values.data_inicio || null,
      previsao: values.previsao || null,
    }
    if (editing) {
      await api.put(`/obras/${editing.id}`, payload)
    } else {
      await api.post('/obras/', payload)
    }
    queryClient.invalidateQueries({ queryKey: ['obras'] })
    setModalOpen(false)
  }

  async function excluir(row) {
    if (!confirm(`Remover a obra "${row.nome}"?`)) return
    await api.delete(`/obras/${row.id}`)
    queryClient.invalidateQueries({ queryKey: ['obras'] })
  }

  const columns = [
    { key: 'nome', label: 'Obra' },
    { key: 'situacao', label: 'Situação' },
    { key: 'valor_contratado', label: 'Valor Contratado', mono: true, render: (r) => formatCurrency(r.valor_contratado) },
    { key: 'data_inicio', label: 'Início', render: (r) => formatDate(r.data_inicio) },
    { key: 'previsao', label: 'Previsão', render: (r) => formatDate(r.previsao) },
    { key: 'lucro_realizado', label: 'Lucro Realizado', mono: true, render: (r) => formatCurrency(r.lucro_realizado) },
  ]

  return (
    <div>
      <TopBar title="Obras" subtitle="Cadastro de obras e vínculo com clientes" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={abrirNovo} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <Plus size={15} /> Nova Obra
          </button>
        </div>
        <DataTable columns={columns} rows={obras.data || []} onEdit={abrirEdicao} onDelete={excluir} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Obra' : 'Nova Obra'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Nome"><input {...register('nome', { required: true })} className="input" /></F>
          <F label="Cliente">
            <Controller name="cliente_id" control={control} render={({ field }) => (
              <ComboBox options={clienteOptions} value={field.value} onChange={field.onChange} placeholder="Sem cliente vinculado" />
            )} />
          </F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Valor Contratado (R$)"><input type="number" step="0.01" {...register('valor_contratado')} className="input font-mono" /></F>
            <F label="Situação">
              <select {...register('situacao')} className="input">
                {SITUACOES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Data Início"><input type="date" {...register('data_inicio')} className="input" /></F>
            <F label="Previsão"><input type="date" {...register('previsao')} className="input" /></F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Lucro Estimado (R$)"><input type="number" step="0.01" {...register('lucro_estimado')} className="input font-mono" /></F>
            <F label="Lucro Realizado (R$)"><input type="number" step="0.01" {...register('lucro_realizado')} className="input font-mono" /></F>
          </div>
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  )
}

function F({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">{label}</label>
      {children}
    </div>
  )
}
