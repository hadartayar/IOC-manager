import React from 'react'
import api from '../api'
export default function Login({ onLogin }) {
  const [username, setUsername] = React.useState('admin@local')
  const [password, setPassword] = React.useState('S3cureAdmin!')
  const [error, setError] = React.useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold">Sign in</h2>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Username</label>
        <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="grid gap-1">
        <label className="text-sm text-slate-700">Password</label>
        <input className="input" type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type='submit' className="btn w-full">Login</button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  )
}
