import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, Paperclip, CheckCircle2 } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import ComboBox from '../components/ComboBox.jsx'
import api from '../services/api.js'

const RESPONSAVEIS = [
  { value: 'Ronaldo', label: 'Ronaldo' },
  { value: 'Felipe', label: 'Felipe' },
  { value: 'Administrador', label: 'Administrador' },
]

const STATUS = [
  { value: 'pago', label: 'Pago' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function NovoLancamento() {
  const queryClient = useQueryClient()
  const [tipo, setTipo] = useState('entrada')
  const [anexo, setAnexo] = useState(null)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const { register, handleSubmit, control, reset, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      data: new Date().toISOString().slice(0, 10),
      tipo: 'entrada',
      responsavel: 'Ronaldo',
      status: 'pago',
    },
  })

  const categorias = useQuery({
    queryKey: ['categorias', tipo],
    queryFn: async () => (await api.get('/categorias/', { params: { tipo } })).data,
  })

  const clientes = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => (await api.get('/clientes/')).data,
  })

  const obras = useQuery({
    queryKey: ['obras'],
    queryFn: async () => (await api.get('/obras/')).data,
  })

  const formasPagamento = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: async () => (await api.get('/formas-pagamento/')).data,
  })

  async function criarCategoria(nome) {
    const { data } = await api.post('/categorias/', { nome, tipo })
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    return { value: data.id, label: data.nome }
  }

  async function onSubmit(values) {
    setErro('')
    setSucesso(false)
    try {
      const payload = {
        ...values,
        valor: parseFloat(values.valor),
        categoria_id: Number(values.categoria_id),
        forma_pagamento_id: Number(values.forma_pagamento_id),
        cliente_id: values.cliente_id ? Number(values.cliente_id) : null,
        obra_id: values.obra_id ? Number(values.obra_id) : null,
      }
      const { data } = await api.post('/lancamentos/', payload)

      if (anexo) {
        const formData = new FormData()
        formData.append('file', anexo)
        await api.post(`/lancamentos/${data.id}/anexos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard-resumo'] })
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] })
      setSucesso(true)
      setAnexo(null)
      reset({
        data: new Date().toISOString().slice(0, 10),
        tipo,
        responsavel: values.responsavel,
        status: 'pago',
      })
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao salvar lançamento.')
    }
  }

  const categoriaOptions = (categorias.data || []).map((c) => ({ value: c.id, label: c.nome }))
  const clienteOptions = (clientes.data || []).map((c) => ({ value: c.id, label: c.nome }))
  const obraOptions = (obras.data || []).map((o) => ({ value: o.id, label: o.nome }))
  const formaOptions = (formasPagamento.data || []).map((f) => ({ value: f.id, label: f.nome }))

  return (
    <div>
      <TopBar title="Novo Lançamento" subtitle="Registrar uma entrada ou saída financeira" />
      <div className="p-6 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-panel border border-border rounded-lg p-6 space-y-5">
          {/* Tipo toggle */}
          <div className="flex gap-2">
            {['entrada', 'saida'].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => { setTipo(t); reset((prev) => ({ ...prev, tipo: t, categoria_id: '' })) }}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium border transition-colors ${
                  tipo === t
                    ? t === 'entrada'
                      ? 'bg-positive-soft/15 border-positive text-positive'
                      : 'bg-negative-soft/15 border-negative text-negative'
                    : 'border-border text-secondary hover:bg-elevated'
                }`}
              >
                {t === 'entrada' ? 'Entrada' : 'Saída'}
              </button>
            ))}
          </div>
          <input type="hidden" {...register('tipo')} value={tipo} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Data" error={errors.data}>
              <input type="date" {...register('data', { required: true })} className="input" />
            </Field>
            <Field label="Valor (R$)" error={errors.valor}>
              <input type="number" step="0.01" min="0" placeholder="0,00" {...register('valor', { required: true, min: 0.01 })} className="input font-mono" />
            </Field>
          </div>

          <Field label="Classificação (Categoria)">
            <Controller
              name="categoria_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <ComboBox
                  options={categoriaOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onCreate={criarCategoria}
                  allowCreate
                  placeholder="Selecionar ou digitar nova categoria..."
                />
              )}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente (opcional)">
              <Controller
                name="cliente_id"
                control={control}
                render={({ field }) => (
                  <ComboBox options={clienteOptions} value={field.value} onChange={field.onChange} placeholder="Sem cliente vinculado" />
                )}
              />
            </Field>
            <Field label="Obra (opcional)">
              <Controller
                name="obra_id"
                control={control}
                render={({ field }) => (
                  <ComboBox options={obraOptions} value={field.value} onChange={field.onChange} placeholder="Sem obra vinculada" />
                )}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Forma de Pagamento">
              <Controller
                name="forma_pagamento_id"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <ComboBox options={formaOptions} value={field.value} onChange={field.onChange} placeholder="Selecionar..." />
                )}
              />
            </Field>
            <Field label="Responsável">
              <select {...register('responsavel', { required: true })} className="input">
                {RESPONSAVEIS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Descrição">
            <input {...register('descricao')} className="input" placeholder="Ex: Venda de portão residencial" />
          </Field>

          <Field label="Observações">
            <textarea {...register('observacoes')} className="input min-h-[70px]" placeholder="Detalhes adicionais (opcional)" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select {...register('status')} className="input">
                {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Comprovante (imagem, PDF ou XML)">
              <label className="input flex items-center gap-2 cursor-pointer text-secondary">
                <Paperclip size={14} />
                <span className="truncate">{anexo ? anexo.name : 'Anexar arquivo...'}</span>
                <input type="file" accept=".png,.jpg,.jpeg,.pdf,.xml" className="hidden" onChange={(e) => setAnexo(e.target.files?.[0] || null)} />
              </label>
            </Field>
          </div>

          {erro && <div className="text-sm text-negative bg-negative-soft/15 border border-negative/30 rounded-md px-3 py-2">{erro}</div>}
          {sucesso && (
            <div className="text-sm text-positive bg-positive-soft/15 border border-positive/30 rounded-md px-3 py-2 flex items-center gap-2">
              <CheckCircle2 size={15} /> Lançamento salvo com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save size={15} />
            {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children, error }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-muted mb-1.5">{label}</label>
      {children}
      {error && <span className="text-[11px] text-negative mt-1 block">Campo obrigatório</span>}
    </div>
  )
}
