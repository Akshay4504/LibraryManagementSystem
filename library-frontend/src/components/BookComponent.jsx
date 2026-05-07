import { useEffect, useState } from 'react'
import { getBooks, borrowBook } from '../services/api'

const PAGE_SIZE = 6

function BookComponent() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const role = localStorage.getItem('role')

  useEffect(() => {
    getBooks()
      .then(res => setBooks(res.data))
      .catch(err => {
        if (!err.response)
          setError('Cannot connect to server. Make sure the API is running.')
        else if (err.response.status === 401)
          setError('Session expired. Please login again.')
        else
          setError('Failed to load books. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleBorrow = async (bookId) => {
    try {
      const res = await borrowBook(bookId)
      setMessage(res.data.message)
      setError('')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      if (!err.response)
        setError('Cannot connect to server.')
      else if (err.response.status === 400)
        setError(err.response.data?.message || 'Cannot borrow this book.')
      else if (err.response.status === 403)
        setError('Only Users can borrow books.')
      else
        setError('Failed to borrow book. Please try again.')
      setTimeout(() => setError(''), 4000)
    }
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
      <p className="mt-2 text-muted">Loading books...</p>
    </div>
  )

  if (error && books.length === 0) return (
    <div className="alert alert-danger mt-4">
      <strong>❌ Error:</strong> {error}
    </div>
  )

  return (
    <div>
      <h2 className="mb-3">📖 Books</h2>

      {message && <div className="alert alert-success">✅ {message}</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}

      <input
        className="form-control mb-2"
        placeholder="Search by title, author or category..."
        value={search}
        onChange={handleSearch}
      />

      <p className="text-muted small mb-3">
        Showing {paginated.length} of {filtered.length} books
      </p>

      {filtered.length === 0 ? (
        <div className="alert alert-info">No books found.</div>
      ) : (
        <>
          <div className="row g-3">
            {paginated.map(book => (
              <div key={book.bookId} className="col-md-4">
                <div className="card shadow h-100">
                  <div className="card-body">
                    <h5 className="card-title">{book.title}</h5>
                    <p className="text-muted small">✍️ {book.author}</p>
                    <span className="badge bg-secondary mb-2">{book.category}</span>
                    <p className="small">Price: <strong>${book.price}</strong></p>
                    <p className="small">Library: <strong>{book.library?.name ?? 'N/A'}</strong></p>
                    {role === 'User' && (
                      <button
                        className="btn btn-sm btn-primary mt-2 w-100"
                        onClick={() => handleBorrow(book.bookId)}>
                        📚 Borrow this Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

export default BookComponent