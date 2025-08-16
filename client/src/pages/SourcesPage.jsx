import React from 'react'
import SourceList from '../components/SourceList.jsx'
export default function SourcesPage() {
  return <div className="space-y-3">
    <div className="flex items-end justify-between">
      <h2 className="text-xl font-semibold">Sources</h2>
      <div className="text-xs text-slate-500">Define source reliability</div>
    </div>
    <SourceList />
  </div>
}
