import React from 'react'
export default function SearchBar({ onSearch }) {
  const [q, setQ] = React.useState('')
  const [type, setType] = React.useState('')
  const [verdict, setVerdict] = React.useState('')
  const [tag, setTag] = React.useState('')
  const submit = (e) => { e.preventDefault(); onSearch({ q, type, verdict, tag }) }
  return (
    <form onSubmit={submit} className="card p-3 mb-4">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-5"><input className="input" placeholder='Search…' value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="col-span-2">
          <select className="select" value={type} onChange={e => setType(e.target.value)}>
            <option value=''>Type</option><option value='ip'>IP</option><option value='domain'>Domain</option><option value='md5'>MD5</option><option value='sha1'>SHA1</option><option value='sha256'>SHA256</option>
          </select>
        </div>
        <div className="col-span-2">
          <select className="select" value={verdict} onChange={e => setVerdict(e.target.value)}>
            <option value=''>Verdict</option><option value='malicious'>malicious</option><option value='suspicious'>suspicious</option><option value='benign'>benign</option>
          </select>
        </div>
        <div className="col-span-2"><input className="input" placeholder='Tag name' value={tag} onChange={e => setTag(e.target.value)} /></div>
        <div className="col-span-1"><button className="btn w-full">Search</button></div>
      </div>
    </form>
  )
}
