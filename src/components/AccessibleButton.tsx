'use client'
import { ButtonHTMLAttributes, ReactNode, useRef } from 'react'
import { useApp } from '@/context/AppContext'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  announce?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
}

const variants = {
  primary: 'bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-300 focus:ring-amber-300',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-500 focus:ring-gray-400',
  danger: 'bg-red-700 hover:bg-red-600 text-white border-2 border-red-500 focus:ring-red-400',
  ghost: 'bg-transparent hover:bg-gray-700 text-white border-2 border-gray-600 focus:ring-gray-400',
}

const sizes = {
  sm: 'px-3 py-2 text-base min-h-[44px]',
  md: 'px-5 py-3 text-lg min-h-[52px]',
  lg: 'px-6 py-4 text-xl min-h-[60px]',
  xl: 'px-8 py-5 text-2xl min-h-[72px]',
}

export default function AccessibleButton({
  children, announce: announceText, variant = 'primary', size = 'lg',
  icon, className = '', onClick, ...props
}: Props) {
  const { announce } = useApp()
  const ref = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (announceText) announce(announceText)
    onClick?.(e)
  }

  const handleFocus = () => {
    const label = ref.current?.getAttribute('aria-label') || ref.current?.textContent || ''
    if (label) announce(label)
  }

  return (
    <button
      ref={ref}
      className={`
        rounded-xl font-bold transition-all duration-150
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2 justify-center
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      onClick={handleClick}
      onFocus={handleFocus}
      {...props}
    >
      {icon && <span aria-hidden="true" className="text-2xl">{icon}</span>}
      {children}
    </button>
  )
}
