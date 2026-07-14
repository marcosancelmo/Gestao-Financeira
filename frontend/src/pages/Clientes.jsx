import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import api from '../services/api.js'

export default function Clientes() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const clientes = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => (await api.get('/clientes/')).data,
  })

  function abrirNovo() {
    setEditing(null)
    reset({ nome: '', cpf_cnpj: '', telefone: '', whatsapp: '', email: '', endereco: '', cidade: '', observacoes: '' })
    setModalOpen(true)
  }

  function abrirEdicao(row) {
    setEditing(row)
    reset(row)
    setModalOpen(true)
  }

  async function onSubmit(values) {
    if (editing) {
      await api.put(`/clientes/${editing.id}`, values)
    } else {
      await api.post('/clientes/', values)
    }
    queryClient.invalidateQueries({ queryKey: ['clientes'] })
    setModalOpen(false)
  }

  async function excluir(row) {
    if (!confirm(`Remover o cliente "${row.nome}"?`)) return
    await api.delete(`/clientes/${row.id}`)
    queryClient.invalidateQueries({ queryKey: ['clientes'] })
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cpf_cnpj', label: 'CPF/CNPJ' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'email', label: 'E-mail' },
    { key: 'cidade', label: 'Cidade' },
  ]

  return (
    <div>
      <TopBar title="Clientes" subtitle="Cadastro e histórico financeiro de clientes" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={abrirNovo} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium">
            <Plus size={15} /> Novo Cliente
          </button>
        </div>
        <DataTable columns={columns} rows={clientes.data || []} onEdit={abrirEdicao} onDelete={excluir} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <F label="Nome"><input {...register('nome', { required: true })} className="input" /></F>
          <div className="grid grid-cols-2 gap-4">
            <F label="CPF/CNPJ"><input {...register('cpf_cnpj')} className="input" /></F>
            <F label="Telefone"><input {...register('telefone')} className="input" /></F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="WhatsApp"><input {...register('whatsapp')} className="input" /></F>
            <F label="E-mail"><input {...register('email')} className="input" /></F>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Endereço"><input {...register('endereco')} className="input" /></F>
            <F label="Cidade"><input {...register('cidade')} className="input" /></F>
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

function F({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">{label}</label>
      {children}
    </div>
  )
}
