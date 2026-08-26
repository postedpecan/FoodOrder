import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Icon } from '../../components/ui/Icon'

const ROLES = ['customer', 'owner', 'admin']

export function AdminUsersPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .order('email')
    if (error) setError(error.message)
    else setProfiles(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function changeRole(profileId, role) {
    setError(null)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId)
    if (error) setError(error.message)
    else await load()
  }

  if (loading) return <p className="page-status">Loading...</p>

  return (
    <div className="operations-page">
      <div className="page-title-row"><div><span className="section-kicker">Access control</span><h1>Users</h1><p>Manage customer, restaurant owner and administrator access.</p></div><span className="secure-note">{profiles.length} accounts</span></div>
      {error && <p className="form-error">{error}</p>}

      {profiles.length === 0 ? <div className="empty-state"><span>👥</span><h3>No users found</h3><p>New accounts will appear here.</p></div> : <ul className="order-list management-list user-list">
        {profiles.map((profile) => (
          <li key={profile.id} className="card">
            <span className="user-list-avatar"><Icon name="users" /></span>
            <div className="management-main">
              <strong>{profile.full_name || '(no name)'}</strong>
              <p>{profile.email}</p>
            </div>
            <span className={`role-pill role-${profile.role}`}>{profile.role}</span>
            <select value={profile.role} onChange={(e) => changeRole(profile.id, e.target.value)}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>}
    </div>
  )
}
