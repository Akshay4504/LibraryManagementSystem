import { useEffect, useState } from 'react'
import { getLibraries } from '../services/api'

function LibraryComponent() {
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getLibraries()
      .then(res => setLibraries(res.data))
      .catch(() => setError('Failed to load libraries.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <h2 className="mb-4">🏛️ Libraries</h2>
      {libraries.length === 0 ? (
        <div className="alert alert-info">No libraries found.</div>
      ) : (
        <div className="row g-3">
          {libraries.map(lib => (
            <div key={lib.libraryId} className="col-md-4">
              <div className="card shadow h-100">
                <div className="card-body">
                  <h5 className="card-title">{lib.name}</h5>
                  <p className="text-muted small">📍 {lib.address}</p>
                  <p className="small">Max Capacity: <strong>{lib.maximumCapacity}</strong></p>
                  <p className="small">Books: <strong>{lib.books?.length ?? 0}</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LibraryComponent