'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface DurationInputProps {
  value: number
  onChange: (minutes: number) => void
}

export function DurationInput({ value, onChange }: DurationInputProps) {
  const [hours, setHours] = useState(Math.floor(value / 60))
  const [minutes, setMinutes] = useState(value % 60)

  useEffect(() => {
    setHours(Math.floor(value / 60))
    setMinutes(value % 60)
  }, [value])

  const handleHoursChange = (h: number) => {
    setHours(h)
    onChange(h * 60 + minutes)
  }

  const handleMinutesChange = (m: number) => {
    const normalizedM = Math.min(59, Math.max(0, m))
    setMinutes(normalizedM)
    onChange(hours * 60 + normalizedM)
  }

  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        Duración
      </label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            min={0}
            max={5}
            value={hours}
            onChange={(e) => handleHoursChange(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-center focus:border-red-500 focus:outline-none"
          />
          <p className="text-gray-500 text-xs text-center mt-1">Horas</p>
        </div>
        <span className="text-gray-500 text-xl">:</span>
        <div className="flex-1">
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => handleMinutesChange(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-center focus:border-red-500 focus:outline-none"
          />
          <p className="text-gray-500 text-xs text-center mt-1">Minutos</p>
        </div>
      </div>
    </div>
  )
}