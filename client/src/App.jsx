import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Navbar from './components/Navbar.jsx'
export default function App() {
  const [user, setUser] = React.useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })
  const navigate = useNavigate()
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); navigate('/') }
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-2xl">🛡️</div>
          <h1 className="text-xl font-semibold">IOC Manager</h1>
          <div className="ml-auto text-xs text-slate-500">Demo-only. Do not use to send real data. © Hadar Tayar</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {user ? (<><Navbar user={user} onLogout={handleLogout} /><div className="mt-4"><Outlet /></div></>) : (
          <div className="max-w-lg mx-auto"><div className="card p-6"><Login onLogin={(u)=>{ setUser(u) }} /></div></div>
        )}
      </main>
    </div>
  )
}
