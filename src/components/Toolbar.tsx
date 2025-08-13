type Props = {
  filter: 'all' | 'active' | 'done'
  setFilter: (f: 'all' | 'active' | 'done') => void
  stats: string
  clearDone: () => void
}
export default function Toolbar({ filter, setFilter, stats, clearDone }: Props) {
  const tab = (key: 'all'|'active'|'done', label: string) => (
    <button className={['chip', filter===key?'active':''].join(' ')} onClick={() => setFilter(key)}>{label}</button>
  )
  return (
    <section className="toolbar card">
      <div className="filters">
        {tab('all', 'All')}
        {tab('active', 'Active')}
        {tab('done', 'Done')}
      </div>
      <div className="right">
        <span className="muted" style={{marginRight:8}}>{stats}</span>
        <button className="chip danger" onClick={clearDone}>Clear Done</button>
      </div>
    </section>
  )
}
