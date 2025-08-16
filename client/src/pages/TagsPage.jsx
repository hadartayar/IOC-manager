import React from 'react'
import TagList from '../components/TagList.jsx'
export default function TagsPage() {
  return <div className="space-y-3">
    <div className="flex items-end justify-between">
      <h2 className="text-xl font-semibold">Tags</h2>
      <div className="text-xs text-slate-500">Organize indicators by tags</div>
    </div>
    <TagList />
  </div>
}
