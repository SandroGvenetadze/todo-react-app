import { useState } from 'react'
import type { Todo } from '../types'
import clsx from 'clsx'
import dayjs from 'dayjs'

type Props = {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, patch: Partial<Todo>) => void
  onTagClick: (tag: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate, onTagClick }: Props) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.title)

  const onEditEnd = () => {
    setEditing(false)
    const t = text.trim()
    if (t && t !== todo.title) onUpdate(todo.id, { title: t })
    else setText(todo.title)
  }

  const due = todo.due ? dayjs(todo.due).format('MM/YY') : ''
  return (
    <div className="item">
      <div className={clsx('checkbox', todo.done && 'done')} role="checkbox" aria-checked={todo.done} onClick={() => onToggle(todo.id)}>
        {todo.done ? '✔' : ''}
      </div>
      <div className="content">
        {editing ? (
          <input className="input" autoFocus value={text} onChange={e=>setText(e.target.value)} onBlur={onEditEnd} onKeyDown={e=>{ if(e.key==='Enter') onEditEnd(); if(e.key==='Escape'){ setText(todo.title); setEditing(false);}}} />
        ) : (
          <div className={clsx('titleText', todo.done && 'done')} onDoubleClick={()=>setEditing(true)} title={todo.title}>
            {todo.title}
          </div>
        )}
        <div className="meta">
          <span className={clsx('prio', todo.prio)}>{todo.prio==='med'?'Medium':todo.prio==='low'?'Low':'High'}</span>
          {due && <span className="tag date">{due}</span>}
          {todo.tags.map(t => (
            <span className="tag" key={t} onClick={()=>onTagClick(t)}>#{t}</span>
          ))}
        </div>
      </div>
      <div className="actions">
        <button className="icon-btn" onClick={()=>setEditing(true)} title="Edit">✎</button>
        <button className="icon-btn" onClick={()=>onDelete(todo.id)} title="Delete">🗑</button>
      </div>
    </div>
  )
}
