'use client'

import { cn } from '@/lib/utils'

interface StatusSwitchProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  color?: 'green' | 'yellow' | 'red'
}

export function StatusSwitch({ label, description, checked, onChange, color = 'green' }: StatusSwitchProps) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-colors cursor-pointer"
    >
      <div className="text-left">
        <p className="text-white font-heading font-semibold text-sm">{label}</p>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
      </div>
      <div className={cn(
        'relative w-14 h-8 rounded-full transition-colors flex-shrink-0',
        checked ? colors[color] : 'bg-gray-700'
      )}>
        <div className={cn(
          'absolute top-1 w-6 h-6 bg-white rounded-full transition-all',
          checked ? 'left-7' : 'left-1'
        )} />
      </div>
    </button>
  )
}