export type Priority = 'low' | 'med' | 'high'

export interface Todo {
  id: string
  title: string
  done: boolean
  due?: string // ISO date yyyy-mm-dd
  prio: Priority
  tags: string[]
}
