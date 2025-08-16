import React from 'react'
import api from '../api'
import IndicatorForm from './IndicatorForm.jsx'
import SearchBar from './SearchBar.jsx'
function VerdictBadge({ verdict }){
  if (verdict === 'malicious') return <span className="badge badge-green">malicious</span>
  if (verdict === 'suspicious') return <span className="badge badge-yellow">suspicious</span>
  return <span className="badge badge-gray">benign</span>
}
export default function IndicatorList() {
  const [rows, setRows] = React.useState([])
  const [sources, setSources] = React.useState([])
  const [user, setUser] = React.useState(() => JSON.parse(localStorage.getItem('user') || '{}'))
  const canEdit = user?.role === 'admin' || user?.role === 'analyst'
  const canDelete = user?.role === 'admin'
  const load = async (qs = {}) => { const params = new URLSearchParams(qs).toString(); const { data } = await api.get('/indicators' + (params ? `?${params}` : '')); setRows(data) }
  const loadSources = async () => { const { data } = await api.get('/sources'); setSources(data) }
  React.useEffect(() => { load(); loadSources() }, [])
  const handleDelete = async (id) => { if (!confirm('Delete this indicator?')) return; try { await api.delete(`/indicators/${id}`); setRows(r => r.filter(x => x.id !== id)) } catch (err) { alert(err.response?.data?.error || 'Delete failed') } }
  return (
    <div className="space-y-3">
      <SearchBar onSearch={(qs) => { load(qs) }} />
      <IndicatorForm onCreated={(row) => setRows([row, ...rows])} sources={sources} canEdit={canEdit} />
      <div className="card overflow-hidden">
        <table className="table">
          <thead className="bg-slate-50">
            <tr><th className="th w-16">ID</th><th className="th">Value</th><th className="th w-28">Type</th><th className="th w-36">Verdict</th><th className="th w-24">Source</th><th className="th w-48">Created</th><th className="th w-24"></th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="td">{r.id}</td>
                <td className="td"><div className="font-mono text-sm">{r.value}</div><div className="text-xs text-slate-500">{r.normalized_value}</div></td>
                <td className="td">{r.type}</td>
                <td className="td"><VerdictBadge verdict={r.verdict} /></td>
                <td className="td">{r.source_id}</td>
                <td className="td">{new Date(r.created_at).toLocaleString()}</td>
                <td className="td">{canDelete && <button className="btn-muted" onClick={() => handleDelete(r.id)}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
