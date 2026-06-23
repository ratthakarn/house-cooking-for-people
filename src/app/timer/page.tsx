'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import PageHeader from '@/components/PageHeader'
import AccessibleButton from '@/components/AccessibleButton'

export default function TimerPage() {
  const { announce, settings } = useApp()
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(300)
  const [remaining, setRemaining] = useState(300)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const textSize = settings.fontSize === 'xlarge' ? 'text-2xl' : settings.fontSize === 'large' ? 'text-xl' : 'text-lg'
  const timerSize = settings.fontSize === 'xlarge' ? 'text-8xl' : settings.fontSize === 'large' ? 'text-7xl' : 'text-6xl'

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const start = useCallback(() => {
    if (remaining === 0) return
    setFinished(false)
    setRunning(true)
    announce('เริ่มจับเวลา')
  }, [remaining, announce])

  const pause = useCallback(() => {
    stop()
    announce(`หยุดชั่วคราว เหลือ ${fmt(remaining)}`)
  }, [stop, remaining, announce])

  const reset = useCallback(() => {
    stop()
    const total = minutes * 60 + seconds
    setTotalSeconds(total)
    setRemaining(total)
    setFinished(false)
    announce(`ตั้งเวลา ${minutes} นาที ${seconds} วินาที`)
  }, [stop, minutes, seconds, announce])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          setFinished(true)
          announce('หมดเวลาแล้ว! กรุณาตรวจสอบอาหาร')
          return 0
        }
        const next = prev - 1
        if (next % 60 === 0 && next > 0) {
          announce(`เหลือ ${next / 60} นาที`)
        }
        return next
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, announce])

  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference * (1 - progress / 100)

  const presets = [
    { label: '3 นาที', m: 3, s: 0 },
    { label: '5 นาที', m: 5, s: 0 },
    { label: '10 นาที', m: 10, s: 0 },
    { label: '15 นาที', m: 15, s: 0 },
    { label: '20 นาที', m: 20, s: 0 },
    { label: '30 นาที', m: 30, s: 0 },
  ]

  const setPreset = (m: number, s: number) => {
    stop()
    setMinutes(m)
    setSeconds(s)
    const total = m * 60 + s
    setTotalSeconds(total)
    setRemaining(total)
    setFinished(false)
    announce(`ตั้งเวลา ${m} นาที`)
  }

  return (
    <div>
      <PageHeader title="นาฬิกาจับเวลา" subtitle="จับเวลาทำอาหาร" icon="⏱️" />

      <div className="p-4 space-y-6">
        {finished && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-amber-500 text-black rounded-2xl border-4 border-amber-300 p-4 text-center"
          >
            <p className={`font-bold ${settings.fontSize === 'xlarge' ? 'text-3xl' : 'text-2xl'}`}>
              🔔 หมดเวลาแล้ว!
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <div className="relative w-72 h-72">
            <svg viewBox="0 0 280 280" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle cx="140" cy="140" r="120" fill="none" stroke="#374151" strokeWidth="16" />
              <circle
                cx="140" cy="140" r="120" fill="none"
                stroke={finished ? '#f59e0b' : running ? '#22c55e' : '#f59e0b'}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center"
              aria-live="polite"
              aria-label={`เวลาที่เหลือ ${fmt(remaining)}`}
            >
              <span className={`font-bold font-mono ${timerSize} ${finished ? 'text-amber-400' : 'text-white'}`}>
                {fmt(remaining)}
              </span>
            </div>
          </div>
        </div>

        {!running && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="timerMin" className={`block text-amber-300 font-bold mb-2 ${textSize}`}>นาที</label>
              <input
                id="timerMin"
                type="number"
                min={0}
                max={99}
                value={minutes}
                onChange={e => setMinutes(+e.target.value)}
                onFocus={() => announce('ตั้งจำนวนนาที')}
                className={`w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white text-center font-bold
                  focus:border-amber-500 focus:outline-none ${settings.fontSize === 'xlarge' ? 'text-3xl' : 'text-2xl'}`}
              />
            </div>
            <div>
              <label htmlFor="timerSec" className={`block text-amber-300 font-bold mb-2 ${textSize}`}>วินาที</label>
              <input
                id="timerSec"
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={e => setSeconds(+e.target.value)}
                onFocus={() => announce('ตั้งจำนวนวินาที')}
                className={`w-full bg-gray-800 border-2 border-gray-600 rounded-xl px-4 py-3 text-white text-center font-bold
                  focus:border-amber-500 focus:outline-none ${settings.fontSize === 'xlarge' ? 'text-3xl' : 'text-2xl'}`}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!running ? (
            <>
              <AccessibleButton size="xl" icon="▶️" onClick={remaining > 0 ? start : reset} className="flex-1" announce="เริ่มจับเวลา">
                เริ่ม
              </AccessibleButton>
              <AccessibleButton size="xl" variant="secondary" icon="🔄" onClick={reset} announce="ตั้งค่าใหม่">
                ตั้งค่า
              </AccessibleButton>
            </>
          ) : (
            <>
              <AccessibleButton size="xl" variant="secondary" icon="⏸️" onClick={pause} className="flex-1" announce="หยุดชั่วคราว">
                หยุดชั่วคราว
              </AccessibleButton>
              <AccessibleButton size="xl" variant="danger" icon="⏹️" onClick={() => { stop(); setRemaining(totalSeconds); setFinished(false) }} announce="หยุดและรีเซ็ต">
                หยุด
              </AccessibleButton>
            </>
          )}
        </div>

        <div>
          <p className={`text-amber-300 font-bold mb-3 ${textSize}`}>⚡ ตั้งค่าด่วน</p>
          <div className="grid grid-cols-3 gap-2">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => setPreset(p.m, p.s)}
                onFocus={() => announce(`ตั้งเวลา ${p.label}`)}
                className={`py-3 rounded-xl font-bold border-2 border-gray-600 bg-gray-800 text-white
                  hover:border-amber-500 hover:bg-gray-700 transition-colors
                  focus:outline-none focus:ring-4 focus:ring-amber-400 ${textSize}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 p-4">
          <p className={`text-amber-300 font-bold mb-2 ${textSize}`}>ℹ️ วิธีใช้</p>
          <ul className={`text-gray-300 space-y-1 ${textSize}`}>
            <li>• ตั้งเวลาในช่องนาทีและวินาที หรือกดปุ่มด่วน</li>
            <li>• กด "เริ่ม" เพื่อจับเวลา</li>
            <li>• เมื่อหมดเวลา ระบบจะแจ้งด้วยเสียง</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
