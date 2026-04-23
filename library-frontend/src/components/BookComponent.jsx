import { useEffect, useState } from 'react'
import { getBooks } from '../services/api'

function BookComponent() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getBooks()
      .then(res => setBooks(res.data))
      .catch(() => setError('Failed to load books.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <h2 className="mb-3">📖 Books</h2>
      <input className="form-control mb-4" placeholder="Search by title, author or category..."
        value={search} onChange={e => setSearch(e.target.value)} />
      {filtered.length === 0 ? (
        <div className="alert alert-info">No books found.</div>
      ) : (
        <div className="row g-3">
          {filtered.map(book => (
            <div key={book.bookId} className="col-md-4">
              <div className="card shadow h-100">
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="text-muted small">✍️ {book.author}</p>
                  <span className="badge bg-secondary mb-2">{book.category}</span>
                  <p className="small">Price: <strong>${book.price}</strong></p>
                  <p className="small">Library: <strong>{book.library?.name ?? 'N/A'}</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookComponent