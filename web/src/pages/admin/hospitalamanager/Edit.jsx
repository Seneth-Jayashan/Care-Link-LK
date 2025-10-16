import React, { useEffect, useState } from 'react'

export default function EditHospitalManager() {
  const [managers, setManagers] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      setMessage('')
      const token = localStorage.getItem('token') || ''
      const res = await fetch('/api/v1/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessage(err?.message || 'Failed to load users')
        return
      }
      const data = await res.json()
      const list = (data || []).filter((u) => u.role === 'hospitaladmin')
      setManagers(list)
    }
    load()
  }, [])

  useEffect(() => {
    const m = managers.find((x) => x._id === selectedId)
    if (m) {
      setForm({ name: m.name || '', email: m.email || '', phone: m.phone || '' })
    }
  }, [selectedId, managers])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedId) return
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch(`/api/v1/users/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, role: 'hospitaladmin' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to update hospital manager')
      }
      setMessage('Hospital manager updated successfully.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Edit Hospital Manager</h2>
      {message ? (
        <div className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-3">{message}</div>
      ) : null}
      <div className="mb-4">
        <label className="block text-sm mb-1">Select Manager</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- choose --</option>
          {managers.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
      </div>
      {selectedId ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : null}
    </div>
  )
}

