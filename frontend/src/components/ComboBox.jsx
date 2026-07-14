import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

/**
 * ComboBox: dropdown with search that also allows free typing.
 * options: [{ value, label }]
 * onCreate: optional callback(label) fired when the user types a value not in the list and confirms it
 */
export default function ComboBox({
  options = [],
  value,
  onChange,
  onCreate,
  placeholder = 'Selecionar ou digitar...',
  allowCreate = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)

  const selected = options.find((o) => String(o.value) === String(value))

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  const exactMatch = options.some((o) => o.label.toLowerCase() === query.toLowerCase())

  function selectOption(opt) {
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  async function handleCreate() {
    if (!query.trim() || !onCreate) return
    const created = await onCreate(query.trim())
    if (created) {
      onChange(created.value)
    }
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-elevated border border-border rounded-md px-3 py-2 text-sm text-left hover:border-accent transition-colors"
      >
        <span className={selected ? 'text-primary' : 'text-muted'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className="text-muted shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-elevated border border-border rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ou digitar novo..."
            className="px-3 py-2 text-sm bg-panel border-b border-border outline-none"
          />
          <div className="overflow-y-auto">
            {filtered.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => selectOption(opt)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent-soft/15 hover:text-accent transition-colors"
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted">Nenhum resultado</div>
            )}
            {allowCreate && query.trim() && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-accent hover:bg-accent-soft/15 border-t border-border"
              >
                <Plus size={13} /> Criar "{query.trim()}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
