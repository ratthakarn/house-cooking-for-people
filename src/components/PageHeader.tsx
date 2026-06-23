'use client'
import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'

interface Props {
  title: string
  subtitle?: string
  icon?: string
}

export default function PageHeader({ title, subtitle, icon }: Props) {
  const { announce, settings } = useApp()

  useEffect(() => {
    const msg = subtitle ? `${title} ${subtitle}` : title
    announce(msg)
  }, [])

  const titleSize = settings.fontSize === 'xlarge' ? 'text-4xl' : settings.fontSize === 'large' ? 'text-3xl' : 'text-2xl'
  const subSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'

  return (
    <header className="bg-gray-800 border-b-4 border-amber-500 px-4 py-4">
      <div className="flex items-center gap-3">
        {icon && <span className="text-5xl" aria-hidden="true">{icon}</span>}
        <div>
          <h1 className={`font-bold text-amber-400 ${titleSize}`}>{title}</h1>
          {subtitle && <p className={`text-gray-300 ${subSize}`}>{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
