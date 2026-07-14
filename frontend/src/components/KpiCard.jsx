import React from 'react'
import { formatCurrency } from '../utils/format.js'

const TONES = {
  accent: { text: 'text-accent', bg: 'bg-accent-soft/15' },
  positive: { text: 'text-positive', bg: 'bg-positive-soft/15' },
  negative: { text: 'text-negative', bg: 'bg-negative-soft/15' },
  neutral: { text: 'text-secondary', bg: 'bg-elevated' },
}

export default function KpiCard({ icon: Icon, label, value, tone = 'neutral', description, isCurrency = true }) {
  const t = TONES[tone] || TONES.neutral
  return (
    <div className="bracket-frame bg-panel border border-border rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${t.bg}`}>
          <Icon size={16} className={t.text} strokeWidth={2} />
        </div>
      </div>
      <div className={`font-mono text-xl font-semibold ${t.text}`}>
        {isCurrency ? formatCurrency(value) : value}
      </div>
      {description && <div className="text-[11px] text-muted">{description}</div>}
    </div>
  )
}
