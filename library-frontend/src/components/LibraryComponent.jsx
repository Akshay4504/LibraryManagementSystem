import { useEffect, useState } from 'react'
import { getLibraries } from '../services/api'

const PAGE_SIZE = 6

function LibraryComponent() {
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getLibraries()
      .then(res => setLibraries(res.data))
      .catch(err => {
        if (!err.response)
          setError('Cannot connect to server. Make sure the API is running.')
        else if (err.response.status === 401)
          setError('Session expired. Please login again.')
        else
          setError('Failed to load libraries. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter by search
  const filtered = libraries.filter(lib =>
    lib.name.toLowerCase().includes(search.toLowerCase()) ||
    lib.address.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1) // reset to page 1 on search
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
      <p className="mt-2 text-muted">Loading libraries...</p>
    </div>
  )

  if (error) return (
    <div className="alert alert-danger mt-4">
      <strong>❌ Error:</strong> {error}
    </div>
  )

  return (
    <div>
      <h2 className="mb-3">🏛️ Libraries</h2>

      {/* Search */}
      <input
        className="form-control mb-4"
        placeholder="Search by name or address..."
        value={search}
        onChange={handleSearch}
      />

      {/* Count */}
      <p className="text-muted small mb-3">
        Showing {paginated.length} of {filtered.length} libraries
      </p>

      {filtered.length === 0 ? (
        <div className="alert alert-info">No libraries found.</div>
      ) : (
        <>
          <div className="row g-3">
            {paginated.map(lib => (
              <div key={lib.libraryId} className="col-md-4">
                <div className="card shadow h-100">
                  <div className="card-body">
                    <h5 className="card-title">{lib.name}</h5>
                    <p className="text-muted small">📍 {lib.address}</p>
                    <p className="small">
                      Max Capacity: <strong>{lib.maximumCapacity}</strong>
                    </p>
                    <p className="small">
                      Total Books: <strong>{lib.books?.length ?? 0}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link"
                    onClick={() => setCurrentPage(p => p - 1)}>
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button className="page-link"
                      onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link"
                    onClick={() => setCurrentPage(p => p + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default LibraryComponent