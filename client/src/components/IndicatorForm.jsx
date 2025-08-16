import React from 'react'
import api from '../api'
export default function IndicatorForm({ onCreated, sources, canEdit=true, existing }) {
  const [value, setValue] = React.useState(existing?.value || '')
  const [verdict, setVerdict] = React.useState(existing?.verdict || 'suspicious')
  const [sourceId, setSourceId] = React.useState(existing?.source_id || (sources[0]?.id ?? ''))
  const [tags, setTags] = React.useState(existing?.tags?.join(',') || '')
  const [error, setError] = React.useState('')
  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); if (!canEdit) return;
    try {
      const payload = { value, verdict, source_id: sourceId, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }
      const { data } = existing?.id ? await api.patch(`/indicators/${existing.id}`, payload) : await api.post('/indicators', payload)
      onCreated?.(data); setValue(''); setTags(''); setVerdict('suspicious')
    } catch (err) { setError(err.response?.data?.error || 'Save failed') }
  }
  return (
    <form onSubmit={onSubmit} className="card p-3 mb-3">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-5"><input className="input" placeholder='Indicator value (IP, domain, hash)' value={value} onChange={e => setValue(e.target.value)} required disabled={!canEdit} /></div>
        <div className="col-span-2">
          <select className="select" value={verdict} onChange={e => setVerdict(e.target.value)} disabled={!canEdit}>
            <option value='malicious'>malicious</option><option value='suspicious'>suspicious</option><option value='benign'>benign</option>
          </select>
        </div>
        <div className="col-span-3">
          <select className="select" value={sourceId} onChange={e => setSourceId(e.target.value)} disabled={!canEdit}>
            {sources.map(s => <option key={s.id} value={s.id}>{s.name} ({s.reliability})</option>)}
          </select>
        </div>
        <div className="col-span-2"><input className="input" placeholder='tags (comma separated)' value={tags} onChange={e => setTags(e.target.value)} disabled={!canEdit} /></div>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="btn" disabled={!canEdit}>{existing?.id ? 'Update' : 'Add'}</button>
        {error && <div className="text-red-600">{error}</div>}
      </div>
    </form>
  )
}
