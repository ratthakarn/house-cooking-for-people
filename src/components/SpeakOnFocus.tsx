'use client'
import React, { useEffect, useRef, ReactNode } from 'react'
import { useApp } from '@/context/AppContext'

interface Props {
  text: string
  children: ReactNode
  as?: keyof React.JSX.IntrinsicElements
  className?: string
}

export default function SpeakOnFocus({ text, children, as: Tag = 'div', className }: Props) {
  const { announce } = useApp()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onFocus = () => announce(text)
    el.addEventListener('focusin', onFocus)
    return () => el.removeEventListener('focusin', onFocus)
  }, [text, announce])

  const El = Tag as React.ElementType
  return <El ref={ref} className={className}>{children}</El>
}
