import React, { useEffect, useState } from 'react'

export default function DeleteHospitalManager() {
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadManagers = async () => {
    setMessage('')
    const token = localStorage.getItem('token') || ''
    const res = await fetch('/api/v1/users', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setMessage(err?.message || 'Failed to load users')
      return
    }
    const data = await res.json()
    setManagers((data || []).filter((u) => u.role === 'hospitaladmin'))
  }

  useEffect(() => {
    loadManagers()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hospital manager?')) return
    setLoading(true)
    setMessage('')
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to delete hospital manager')
      }
      setMessage('Hospital manager deleted successfully.')
      await loadManagers()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Delete Hospital Manager</h2>
      {message ? (
        <div className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-3">{message}</div>
      ) : null}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left p-3 text-sm font-medium text-gray-700">Phone</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {managers.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="p-3 text-sm">{m.name}</td>
                <td className="p-3 text-sm">{m.email}</td>
                <td className="p-3 text-sm">{m.phone || '-'}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(m._id)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded bg-red-600 text-white text-sm disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {managers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-sm text-gray-500 text-center">No hospital managers found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

