import { useEffect, useState } from 'react'
import {
  getLibraries, createLibrary, updateLibrary, deleteLibrary,
  getBooks, createBook, deleteBook
} from '../services/api'

const LIB_PAGE_SIZE = 5
const BOOK_PAGE_SIZE = 5

function AdminComponent() {
  const [libraries, setLibraries] = useState([])
  const [books, setBooks] = useState([])
  const [libForm, setLibForm] = useState({ name: '', address: '', maximumCapacity: '' })
  const [bookForm, setBookForm] = useState({ title: '', author: '', category: '', price: '', libraryId: '' })
  const [editLib, setEditLib] = useState(null)
  const [libErrors, setLibErrors] = useState({})
  const [bookErrors, setBookErrors] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [libPage, setLibPage] = useState(1)
  const [bookPage, setBookPage] = useState(1)

  const loadData = async () => {
    try {
      const [libRes, bookRes] = await Promise.all([getLibraries(), getBooks()])
      setLibraries(libRes.data)
      setBooks(bookRes.data)
    } catch {
      showErr('Failed to load data. Make sure the API is running.')
    }
  }

  useEffect(() => { loadData() }, [])

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000) }
  const showErr = (msg) => { setError(msg); setTimeout(() => setError(''), 4000) }

  // ── Library Validation ──────────────────────────────────
  const validateLib = () => {
    const errs = {}
    if (!libForm.name.trim())
      errs.name = 'Library name is required.'
    else if (libForm.name.trim().length < 3)
      errs.name = 'Library name must be at least 3 characters.'

    if (!libForm.address.trim())
      errs.address = 'Address is required.'
    else if (libForm.address.trim().length < 5)
      errs.address = 'Address must be at least 5 characters.'

    if (!libForm.maximumCapacity)
      errs.maximumCapacity = 'Capacity is required.'
    else if (parseInt(libForm.maximumCapacity) <= 0)
      errs.maximumCapacity = 'Capacity must be greater than 0.'
    else if (parseInt(libForm.maximumCapacity) > 100000)
      errs.maximumCapacity = 'Capacity cannot exceed 100,000.'

    return errs
  }

  // ── Book Validation ─────────────────────────────────────
  const validateBook = () => {
    const errs = {}
    if (!bookForm.title.trim())
      errs.title = 'Title is required.'
    else if (bookForm.title.trim().length < 2)
      errs.title = 'Title must be at least 2 characters.'

    if (!bookForm.author.trim())
      errs.author = 'Author is required.'
    else if (bookForm.author.trim().length < 3)
      errs.author = 'Author name must be at least 3 characters.'

    if (!bookForm.category.trim())
      errs.category = 'Category is required.'

    if (!bookForm.price)
      errs.price = 'Price is required.'
    else if (parseFloat(bookForm.price) <= 0)
      errs.price = 'Price must be greater than 0.'
    else if (parseFloat(bookForm.price) > 99999)
      errs.price = 'Price seems too high.'

    if (!bookForm.libraryId)
      errs.libraryId = 'Please select a library.'

    return errs
  }

  // ── Library Handlers ────────────────────────────────────
  const handleLibSubmit = async (e) => {
    e.preventDefault()
    const errs = validateLib()
    if (Object.keys(errs).length > 0) {
      setLibErrors(errs)
      return
    }
    setLibErrors({})
    try {
      if (editLib) {
        await updateLibrary(editLib.libraryId, {
          ...libForm,
          maximumCapacity: parseInt(libForm.maximumCapacity)
        })
        showMsg('Library updated successfully!')
        setEditLib(null)
      } else {
        await createLibrary({
          ...libForm,
          maximumCapacity: parseInt(libForm.maximumCapacity)
        })
        showMsg('Library created successfully!')
      }
      setLibForm({ name: '', address: '', maximumCapacity: '' })
      setLibPage(1)
      loadData()
    } catch (err) {
      if (!err.response)
        showErr('Cannot connect to server. Make sure the API is running.')
      else if (err.response.status === 403)
        showErr('Access denied. Admin role required.')
      else if (err.response.status === 400)
        showErr('Invalid data. Please check your inputs.')
      else
        showErr('Failed to save library. Please try again.')
    }
  }

  const handleEditLib = (lib) => {
    setEditLib(lib)
    setLibForm({
      name: lib.name,
      address: lib.address,
      maximumCapacity: lib.maximumCapacity
    })
    setLibErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditLib(null)
    setLibForm({ name: '', address: '', maximumCapacity: '' })
    setLibErrors({})
  }

  const handleDeleteLib = async (id) => {
    if (!window.confirm('Delete this library and all its books?')) return
    try {
      await deleteLibrary(id)
      showMsg('Library deleted successfully!')
      setLibPage(1)
      loadData()
    } catch (err) {
      if (!err.response)
        showErr('Cannot connect to server.')
      else if (err.response.status === 403)
        showErr('Access denied. Admin role required.')
      else
        showErr('Failed to delete library.')
    }
  }

  // ── Book Handlers ───────────────────────────────────────
  const handleBookSubmit = async (e) => {
    e.preventDefault()
    const errs = validateBook()
    if (Object.keys(errs).length > 0) {
      setBookErrors(errs)
      return
    }
    setBookErrors({})
    try {
      await createBook({
        ...bookForm,
        price: parseFloat(bookForm.price),
        libraryId: parseInt(bookForm.libraryId)
      })
      showMsg('Book created successfully!')
      setBookForm({ title: '', author: '', category: '', price: '', libraryId: '' })
      setBookPage(1)
      loadData()
    } catch (err) {
      if (!err.response)
        showErr('Cannot connect to server. Make sure the API is running.')
      else if (err.response.status === 403)
        showErr('Access denied. Admin role required.')
      else if (err.response.status === 400)
        showErr('Invalid data. Please check your inputs.')
      else
        showErr('Failed to create book. Please try again.')
    }
  }

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await deleteBook(id)
      showMsg('Book deleted successfully!')
      setBookPage(1)
      loadData()
    } catch (err) {
      if (!err.response)
        showErr('Cannot connect to server.')
      else if (err.response.status === 403)
        showErr('Access denied. Admin role required.')
      else
        showErr('Failed to delete book.')
    }
  }

  // ── Pagination Helper ───────────────────────────────────
  const Pagination = ({ currentPage, setPage, totalItems, pageSize }) => {
    const totalPages = Math.ceil(totalItems / pageSize)
    if (totalPages <= 1) return null
    return (
      <nav className="p-2">
        <ul className="pagination pagination-sm justify-content-center mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(p => p - 1)}>Previous</button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPage(page)}>{page}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(p => p + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    )
  }

  return (
    <div>
      <h2 className="mb-4">⚙️ Admin Panel</h2>

      {message && <div className="alert alert-success">✅ {message}</div>}
      {error && <div className="alert alert-danger">❌ {error}</div>}

      {/* ── Library Form ── */}
      <div className="card shadow mb-4">
        <div className={`card-header text-white ${editLib ? 'bg-warning' : 'bg-primary'}`}>
          {editLib ? '✏️ Edit Library' : '➕ Add New Library'}
        </div>
        <div className="card-body">
          <form onSubmit={handleLibSubmit} noValidate>
            <div className="row g-2">
              <div className="col-md-4">
                <label className="form-label">Library Name</label>
                <input
                  className={`form-control ${libErrors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Central Library"
                  value={libForm.name}
                  onChange={e => {
                    setLibForm({ ...libForm, name: e.target.value })
                    setLibErrors({ ...libErrors, name: '' })
                  }}
                />
                {libErrors.name && <div className="invalid-feedback">{libErrors.name}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label">Address</label>
                <input
                  className={`form-control ${libErrors.address ? 'is-invalid' : ''}`}
                  placeholder="e.g. 123 Main Street"
                  value={libForm.address}
                  onChange={e => {
                    setLibForm({ ...libForm, address: e.target.value })
                    setLibErrors({ ...libErrors, address: '' })
                  }}
                />
                {libErrors.address && <div className="invalid-feedback">{libErrors.address}</div>}
              </div>

              <div className="col-md-2">
                <label className="form-label">Max Capacity</label>
                <input
                  type="number"
                  className={`form-control ${libErrors.maximumCapacity ? 'is-invalid' : ''}`}
                  placeholder="e.g. 500"
                  value={libForm.maximumCapacity}
                  onChange={e => {
                    setLibForm({ ...libForm, maximumCapacity: e.target.value })
                    setLibErrors({ ...libErrors, maximumCapacity: '' })
                  }}
                />
                {libErrors.maximumCapacity && <div className="invalid-feedback">{libErrors.maximumCapacity}</div>}
              </div>

              <div className="col-md-2 d-flex align-items-end gap-1">
                <button type="submit"
                  className={`btn w-100 ${editLib ? 'btn-warning' : 'btn-primary'}`}>
                  {editLib ? 'Update' : 'Add'}
                </button>
                {editLib && (
                  <button type="button" className="btn btn-secondary w-100"
                    onClick={handleCancelEdit}>Cancel</button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Libraries Table ── */}
      <div className="card shadow mb-4">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <span>🏛️ All Libraries</span>
          <span className="badge bg-secondary">{libraries.length} total</span>
        </div>
        <div className="card-body p-0">
          {libraries.length === 0 ? (
            <div className="alert alert-info m-3">No libraries found. Add one above.</div>
          ) : (
            <>
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th><th>Name</th><th>Address</th>
                    <th>Capacity</th><th>Books</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {libraries
                    .slice((libPage - 1) * LIB_PAGE_SIZE, libPage * LIB_PAGE_SIZE)
                    .map(lib => (
                      <tr key={lib.libraryId}>
                        <td>{lib.libraryId}</td>
                        <td>{lib.name}</td>
                        <td>{lib.address}</td>
                        <td>{lib.maximumCapacity}</td>
                        <td>{lib.books?.length ?? 0}</td>
                        <td>
                          <button className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEditLib(lib)}>Edit</button>
                          <button className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteLib(lib.libraryId)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                currentPage={libPage}
                setPage={setLibPage}
                totalItems={libraries.length}
                pageSize={LIB_PAGE_SIZE}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Book Form ── */}
      <div className="card shadow mb-4">
        <div className="card-header bg-success text-white">➕ Add New Book</div>
        <div className="card-body">
          <form onSubmit={handleBookSubmit} noValidate>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">Title</label>
                <input
                  className={`form-control ${bookErrors.title ? 'is-invalid' : ''}`}
                  placeholder="e.g. Clean Code"
                  value={bookForm.title}
                  onChange={e => {
                    setBookForm({ ...bookForm, title: e.target.value })
                    setBookErrors({ ...bookErrors, title: '' })
                  }}
                />
                {bookErrors.title && <div className="invalid-feedback">{bookErrors.title}</div>}
              </div>

              <div className="col-md-2">
                <label className="form-label">Author</label>
                <input
                  className={`form-control ${bookErrors.author ? 'is-invalid' : ''}`}
                  placeholder="e.g. Robert Martin"
                  value={bookForm.author}
                  onChange={e => {
                    setBookForm({ ...bookForm, author: e.target.value })
                    setBookErrors({ ...bookErrors, author: '' })
                  }}
                />
                {bookErrors.author && <div className="invalid-feedback">{bookErrors.author}</div>}
              </div>

              <div className="col-md-2">
                <label className="form-label">Category</label>
                <input
                  className={`form-control ${bookErrors.category ? 'is-invalid' : ''}`}
                  placeholder="e.g. Programming"
                  value={bookForm.category}
                  onChange={e => {
                    setBookForm({ ...bookForm, category: e.target.value })
                    setBookErrors({ ...bookErrors, category: '' })
                  }}
                />
                {bookErrors.category && <div className="invalid-feedback">{bookErrors.category}</div>}
              </div>

              <div className="col-md-1">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${bookErrors.price ? 'is-invalid' : ''}`}
                  placeholder="29.99"
                  value={bookForm.price}
                  onChange={e => {
                    setBookForm({ ...bookForm, price: e.target.value })
                    setBookErrors({ ...bookErrors, price: '' })
                  }}
                />
                {bookErrors.price && <div className="invalid-feedback">{bookErrors.price}</div>}
              </div>

              <div className="col-md-2">
                <label className="form-label">Library</label>
                <select
                  className={`form-select ${bookErrors.libraryId ? 'is-invalid' : ''}`}
                  value={bookForm.libraryId}
                  onChange={e => {
                    setBookForm({ ...bookForm, libraryId: e.target.value })
                    setBookErrors({ ...bookErrors, libraryId: '' })
                  }}
                >
                  <option value="">Select Library</option>
                  {libraries.map(lib => (
                    <option key={lib.libraryId} value={lib.libraryId}>{lib.name}</option>
                  ))}
                </select>
                {bookErrors.libraryId && <div className="invalid-feedback">{bookErrors.libraryId}</div>}
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-success w-100">Add Book</button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Books Table ── */}
      <div className="card shadow mb-4">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <span>📖 All Books</span>
          <span className="badge bg-secondary">{books.length} total</span>
        </div>
        <div className="card-body p-0">
          {books.length === 0 ? (
            <div className="alert alert-info m-3">No books found. Add one above.</div>
          ) : (
            <>
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th><th>Title</th><th>Author</th>
                    <th>Category</th><th>Price</th><th>Library</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books
                    .slice((bookPage - 1) * BOOK_PAGE_SIZE, bookPage * BOOK_PAGE_SIZE)
                    .map(book => (
                      <tr key={book.bookId}>
                        <td>{book.bookId}</td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.category}</td>
                        <td>${book.price}</td>
                        <td>{book.library?.name ?? 'N/A'}</td>
                        <td>
                          <button className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteBook(book.bookId)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Pagination
                currentPage={bookPage}
                setPage={setBookPage}
                totalItems={books.length}
                pageSize={BOOK_PAGE_SIZE}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminComponent