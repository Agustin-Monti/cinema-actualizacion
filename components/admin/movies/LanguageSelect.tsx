'use client'

interface LanguageSelectProps {
  value: string
  onChange: (value: string) => void
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const languages = [
    { value: 'Español Latino', label: 'Español Latino' },
    { value: 'Español Castellano', label: 'Español Castellano' },
    { value: 'Subtitulada', label: 'Subtitulada' },
    { value: 'Inglés', label: 'Inglés (VOSE)' },
  ]

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:border-red-500 focus:outline-none"
    >
      {languages.map(lang => (
        <option key={lang.value} value={lang.value}>{lang.label}</option>
      ))}
    </select>
  )
}