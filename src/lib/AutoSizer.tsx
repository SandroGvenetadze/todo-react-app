import { ReactNode, useEffect, useRef, useState } from 'react'

type Props = { children: (size: { width: number; height: number }) => ReactNode }

export default function AutoSizer({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return <div ref={ref} style={{ width: '100%', height: '100%' }}>{size.width && size.height ? children(size) : null}</div>
}
