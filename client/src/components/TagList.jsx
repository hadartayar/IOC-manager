import React from 'react'
import api from '../api'
export default function TagList() {
  const [rows, setRows] = React.useState([])
  const [name, setName] = React.useState('')
  const [error, setError] = React.useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user?.role === 'admin'
  const load = async () => { const { data } = await api.get('/tags'); setRows(data) }
  React.useEffect(() => { load() }, [])
  const add = async (e) => {
    e.preventDefault(); if (!isAdmin) return; setError('')
    try { const { data } = await api.post('/tags', { name }); setRows([data, ...rows]); setName('') }
    catch (err) { setError(err.response?.data?.error || 'Add failed') }
  }
  return (
    <div className="space-y-3">
      {isAdmin && (
        <form onSubmit={add} className="card p-3 flex gap-2 items-start">
          <input className="input flex-1" placeholder='New tag name' value={name} onChange={e => setName(e.target.value)} required />
          <button className="btn">Add</button>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      )}
      <div className="card overflow-hidden">
        <table className="table">
          <thead className="bg-slate-50"><tr><th className="th w-16">ID</th><th className="th">Name</th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id} className="hover:bg-slate-50/60"><td className="td">{r.id}</td><td className="td">{r.name}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}
