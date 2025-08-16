import React from 'react'
import { NavLink } from 'react-router-dom'
export default function Navbar({ user, onLogout }) {
  const linkClass = ({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`
  return (
    <nav className="flex items-center gap-2">
      <NavLink to='/indicators' className={linkClass}>Indicators</NavLink>
      <NavLink to='/sources' className={linkClass}>Sources</NavLink>
      <NavLink to='/tags' className={linkClass}>Tags</NavLink>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{user.username} ({user.role})</span>
        <button className="btn-muted" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  )
}
