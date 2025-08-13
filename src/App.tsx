import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Toolbar from './components/Toolbar'
import TodoItem from './components/TodoItem'
import type { Todo, Priority } from './types'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import AutoSizer from './lib/AutoSizer'
import { useLocalStorage } from './hooks/useLocalStorage'

const storeKey = 'todo-react-v1'

type Filter = 'all' | 'active' | 'done'

function uid() { return Math.random().toString(36).slice(2, 9) }
function parseTags(text: string) { return (text.match(/#\w+/g) || []).map(t => t.slice(1).toLowerCase()) }

export default function App() {
  const [data, setData] = useLocalStorage<{ items: Todo[]; filter: Filter; search: string }>(storeKey, {
    items: [], filter: 'all', search: ''
  })

  // Inputs
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [prio, setPrio] = useState<Priority>('med')
  const searchRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Seed once
  useEffect(() => {
    if (data.items.length === 0) {
      setData(v => ({
        ...v,
        items: [
          { id: uid(), title: 'Road trip #weekend', done: false, due: '', prio: 'med', tags: ['weekend'] },
          { id: uid(), title: 'Prepare presentation #work', done: false, due: new Date(Date.now()+86400000).toISOString().slice(0,10), prio: 'high', tags: ['work'] },
          { id: uid(), title: 'Gym session #health', done: true, due: '', prio: 'low', tags: ['health'] }
        ]
      }))
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/') { e.preventDefault(); titleRef.current?.focus() }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function addItem() {
    const raw = title.trim()
    if (!raw) return
    const tags = parseTags(raw)
    const clean = raw.replace(/#\w+/g, '').trim()
    const item: Todo = { id: uid(), title: clean || raw, done: false, due, prio, tags }
    setData(v => ({ ...v, items: [item, ...v.items] }))
    setTitle(''); setDue('')
  }
  function toggle(id: string) {
    setData(v => ({ ...v, items: v.items.map(x => x.id===id ? { ...x, done: !x.done } : x) }))
  }
  function remove(id: string) {
    setData(v => ({ ...v, items: v.items.filter(x => x.id!==id) }))
  }
  function update(id: string, patch: Partial<Todo>) {
    setData(v => ({ ...v, items: v.items.map(x => x.id===id ? { ...x, ...patch, tags: patch.title ? parseTags(patch.title) : x.tags } : x) }))
  }
  function clearDone() {
    setData(v => ({ ...v, items: v.items.filter(x => !x.done) }))
  }
  function setFilter(f: Filter) { setData(v => ({ ...v, filter: f })) }
  function setSearch(text: string) { setData(v => ({ ...v, search: text.toLowerCase().trim() })) }

  const filtered = useMemo(() => {
    let it = data.items
    if (data.filter === 'active') it = it.filter(i=>!i.done)
    if (data.filter === 'done') it = it.filter(i=>i.done)
    if (data.search) it = it.filter(i => (i.title + ' ' + i.tags.join(' ')).toLowerCase().includes(data.search))
    return it
  }, [data.items, data.filter, data.search])

  const stats = useMemo(() => {
    const done = data.items.filter(i=>i.done).length
    return `${done} / ${data.items.length}`
  }, [data.items])

  // Virtualized list row
  const Row = ({ index, style }: ListChildComponentProps) => {
    const t = filtered[index]
    return (
      <div style={style}>
        <TodoItem
          todo={t}
          onToggle={toggle}
          onDelete={remove}
          onUpdate={update}
          onTagClick={(tag) => setSearch(tag)}
        />
      </div>
    )
  }

  return (
    <div className="container">
      <Header />
      <section className="composer card">
        <div className="row">
          <input ref={titleRef} className="input grow" placeholder="What’s the plan? Add a task… Use tags like #work #home" value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') addItem() }} />
        </div>
        <div className="row wrap" style={{marginTop:10, gap:12}}>
          <label className="field">
            <span style={{fontSize:12, color:'rgb(var(--muted))'}}>Due date</span>
            <input className="input" type="date" value={due} onChange={e=>setDue(e.target.value)} />
          </label>
          <label className="field">
            <span style={{fontSize:12, color:'rgb(var(--muted))'}}>Priority</span>
            <select className="input" value={prio} onChange={e=>setPrio(e.target.value as any)}>
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="field grow">
            <span style={{fontSize:12, color:'rgb(var(--muted))'}}>Search</span>
            <input ref={searchRef} className="input" type="search" placeholder="Search… (Ctrl+K)" onChange={(e)=>{ const v=e.target.value; window.clearTimeout((window as any).__t); (window as any).__t = window.setTimeout(()=> setSearch(v), 120) }} />
          </label>
          <button className="btn" onClick={addItem}>Add</button>
        </div>
      </section>

      <Toolbar filter={data.filter} setFilter={setFilter} stats={stats} clearDone={clearDone} />

      <section className="list card" style={{height: '60vh'}}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={filtered.length}
              itemSize={76} // fixed height for speed
              overscanCount={8}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
        {filtered.length===0 && <p className="muted" style={{textAlign:'center', padding:'12px 0', margin:0}}>Nothing here yet ✍️</p>}
      </section>

      <Footer />
    </div>
  )
}
