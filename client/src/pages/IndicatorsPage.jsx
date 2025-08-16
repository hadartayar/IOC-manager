import React from 'react'
import IndicatorList from '../components/IndicatorList.jsx'
export default function IndicatorsPage() {
  return <div className="space-y-3">
    <div className="flex items-end justify-between">
      <h2 className="text-xl font-semibold">Indicators</h2>
      <div className="text-xs text-slate-500">Manage, search and normalize IOCs</div>
    </div>
    <IndicatorList />
  </div>
}
