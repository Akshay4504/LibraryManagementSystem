import { useEffect, useState } from 'react'
import { getMyBorrows, returnBook } from '../services/api'

const PAGE_SIZE = 4

function BorrowComponent() {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState('all') // all | active | returned

  const loadBorrows = async () => {
    try {
      const res = await getMyBorrows()
      setBorrows(res.data)
    } catch (err) {
      if (!err.response)
        setError('Cannot connect to server. Make sure the API is running.')
      else if (err.response.status === 401)
        setError('Session expired. Please login again.')
      else if (err.response.status === 403)
        setError('Access denied. Only Users can view borrow records.')
      else
        setError('Failed to load your borrow records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBorrows() }, [])

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Return this book?')) return
    try {
      const res = await returnBook(borrowId)
      setMessage(res.data.message)
      setError('')
      setTimeout(() => setMessage(''), 4000)
      loadBorrows()
    } catch (err) {
      if (!err.response)
        setError('Cannot connect to server.')
      else if (err.response.status === 400)
        setError(err.response.data?.message || 'Cannot return this book.')
      else if (err.response.status === 401)
        setError('Session expired. Please login again.')
      else
        setError('Failed to return book. Please try again.')
      setTimeout(() => setError(''), 4000)
    }
  }

  const getDueStatus = (borrow) => {
    if (borrow.isReturned) return null
    const now = new Date()
    const returnDate = new Date(borrow.returnDate)
    const daysLeft = Math.ceil((returnDate - now) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return { label: `Overdue by ${Math.abs(daysLeft)} day(s)`, color: 'danger' }
    if (daysLeft <= 3) return { label: `Due in ${daysLeft} day(s)`, color: 'warning' }
    return { label: `Due in ${daysLeft} day(s)`, color: 'success' }
  }

  // Filter
  const filtered = borrows.filter(b => {
    if (filter === 'active') return !b.isReturned
    if (filter === 'returned') return b.isReturned
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleFilter = (val) => {
    setFilter(val)
    setCurrentPage(1)
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
      <p className="mt-2 text-muted">Loading your borrows...</p>
    </div>
  )

  return (
    <div>
      <h2 className="mb-3">📚 My Borrowed Books</h2>

      {message && <div className="alert alert-success">✅ {message}</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}

      {/* Filter buttons */}
      <div className="btn-group mb-3">
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-dark' : 'btn-outline-dark'}`}
          onClick={() => handleFilter('all')}>
          All ({borrows.length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleFilter('active')}>
          Active ({borrows.filter(b => !b.isReturned).length})
        </button>
        <button
          className={`btn btn-sm ${filter === 'returned' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilter('returned')}>
          Returned ({borrows.filter(b => b.isReturned).length})
        </button>
      </div>

      <p className="text-muted small mb-3">
        Showing {paginated.length} of {filtered.length} records
      </p>

      {filtered.length === 0 ? (
        <div className="alert alert-info">
          {filter === 'active' ? 'No active borrows.' :
           filter === 'returned' ? 'No returned books yet.' :
           'You haven\'t borrowed any books yet.'}
        </div>
      ) : (
        <>
          <div className="row g-3">
            {paginated.map(b => {
              const status = getDueStatus(b)
              return (
                <div key={b.borrowId} className="col-md-6">
                  <div className={`card shadow h-100 border-${b.isReturned ? 'secondary' : status?.color}`}>
                    <div className={`card-header bg-${b.isReturned ? 'secondary' : status?.color} text-white d-flex justify-content-between`}>
                      <span>📖 {b.book?.title}</span>
                      <span className="badge bg-light text-dark">
                        {b.isReturned ? 'Returned' : 'Active'}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="mb-1"><strong>Author:</strong> {b.book?.author}</p>
                      <p className="mb-1"><strong>Library:</strong> {b.book?.library?.name ?? 'N/A'}</p>
                      <p className="mb-1"><strong>Issue Date:</strong> {new Date(b.issueDate).toLocaleDateString()}</p>
                      <p className="mb-1"><strong>Due Date:</strong> {new Date(b.returnDate).toLocaleDateString()}</p>
                      {b.isReturned && (
                        <>
                          <p className="mb-1">
                            <strong>Returned On:</strong> {new Date(b.actualReturnDate).toLocaleDateString()}
                          </p>
                          <p className="mb-1">
                            <strong>Dues Paid:</strong>{' '}
                            {b.dueAmount > 0
                              ? <span className="text-danger fw-bold">${b.dueAmount.toFixed(2)}</span>
                              : <span className="text-success">No dues ✅</span>}
                          </p>
                        </>
                      )}
                      {!b.isReturned && (
                        <div className="mt-2">
                          <span className={`badge bg-${status?.color} me-2`}>{status?.label}</span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleReturn(b.borrowId)}>
                            Return Book
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

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

export default BorrowComponent