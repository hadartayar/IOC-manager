import React from 'react'
import api from '../api'
export default function SourceList() {
  const [rows, setRows] = React.useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user?.role === 'admin'
  const load = async () => { const { data } = await api.get('/sources'); setRows(data) }
  React.useEffect(() => { load() }, [])
  const [form, setForm] = React.useState({ name:'', reliability: 50, url: '', description: '' })
  const [error, setError] = React.useState('')
  const onSubmit = async (e) => {
    e.preventDefault(); if (!isAdmin) return; setError('')
    try { const { data } = await api.post('/sources', form); setRows([data, ...rows]); setForm({ name:'', reliability: 50, url: '', description: '' }) }
    catch (err) { setError(err.response?.data?.error || 'Save failed') }
  }
  return (
    <div className="space-y-3">
      {isAdmin && (
        <form onSubmit={onSubmit} className="card p-3">
          <div className="grid grid-cols-12 gap-2">
            <input className="input col-span-3" placeholder='Name' value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="input col-span-2" type='number' min='0' max='100' placeholder='Reliability' value={form.reliability} onChange={e => setForm({ ...form, reliability: e.target.value })} />
            <input className="input col-span-3" placeholder='URL' value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            <input className="input col-span-3" placeholder='Description' value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="col-span-1 flex items-center"><button className="btn w-full">Add</button></div>
          </div>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
      <div className="card overflow-hidden">
        <table className="table">
          <thead className="bg-slate-50"><tr><th className="th w-16">ID</th><th className="th">Name</th><th className="th w-32">Reliability</th><th className="th">URL</th><th className="th">Description</th></tr></thead>
          <tbody>{rows.map(r => (<tr key={r.id} className="hover:bg-slate-50/60"><td className="td">{r.id}</td><td className="td">{r.name}</td><td className="td">{r.reliability}</td><td className="td">{r.url ? <a className="text-slate-700 underline" href={r.url} target='_blank'>{r.url}</a> : '-'}</td><td className="td">{r.description || '-'}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}
