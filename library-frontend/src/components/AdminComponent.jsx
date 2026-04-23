import { useEffect, useState } from 'react'
import {
  getLibraries, createLibrary, updateLibrary, deleteLibrary,
  getBooks, createBook, deleteBook
} from '../services/api'

function AdminComponent() {
  const [libraries, setLibraries] = useState([])
  const [books, setBooks] = useState([])
  const [libForm, setLibForm] = useState({ name: '', address: '', maximumCapacity: '' })
  const [bookForm, setBookForm] = useState({ title: '', author: '', category: '', price: '', libraryId: '' })
  const [editLib, setEditLib] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    const [libRes, bookRes] = await Promise.all([getLibraries(), getBooks()])
    setLibraries(libRes.data)
    setBooks(bookRes.data)
  }

  useEffect(() => { loadData() }, [])

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000) }
  const showErr = (msg) => { setError(msg); setTimeout(() => setError(''), 3000) }

  // Library handlers
  const handleLibSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editLib) {
        await updateLibrary(editLib.libraryId, { ...libForm, maximumCapacity: parseInt(libForm.maximumCapacity) })
        showMsg('Library updated!')
        setEditLib(null)
      } else {
        await createLibrary({ ...libForm, maximumCapacity: parseInt(libForm.maximumCapacity) })
        showMsg('Library created!')
      }
      setLibForm({ name: '', address: '', maximumCapacity: '' })
      loadData()
    } catch { showErr('Failed to save library.') }
  }

  const handleEditLib = (lib) => {
    setEditLib(lib)
    setLibForm({ name: lib.name, address: lib.address, maximumCapacity: lib.maximumCapacity })
  }

  const handleDeleteLib = async (id) => {
    if (!window.confirm('Delete this library and all its books?')) return
    try {
      await deleteLibrary(id)
      showMsg('Library deleted!')
      loadData()
    } catch { showErr('Failed to delete library.') }
  }

  // Book handlers
  const handleBookSubmit = async (e) => {
    e.preventDefault()
    try {
      await createBook({ ...bookForm, price: parseFloat(bookForm.price), libraryId: parseInt(bookForm.libraryId) })
      showMsg('Book created!')
      setBookForm({ title: '', author: '', category: '', price: '', libraryId: '' })
      loadData()
    } catch { showErr('Failed to create book.') }
  }

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return
    try {
      await deleteBook(id)
      showMsg('Book deleted!')
      loadData()
    } catch { showErr('Failed to delete book.') }
  }

  return (
    <div>
      <h2 className="mb-4">⚙️ Admin Panel</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Library Form */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          {editLib ? '✏️ Edit Library' : '➕ Add Library'}
        </div>
        <div className="card-body">
          <form onSubmit={handleLibSubmit} className="row g-2">
            <div className="col-md-4">
              <input className="form-control" placeholder="Name"
                value={libForm.name} onChange={e => setLibForm({ ...libForm, name: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <input className="form-control" placeholder="Address"
                value={libForm.address} onChange={e => setLibForm({ ...libForm, address: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" placeholder="Max Capacity"
                value={libForm.maximumCapacity} onChange={e => setLibForm({ ...libForm, maximumCapacity: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                {editLib ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Libraries Table */}
      <div className="card shadow mb-4">
        <div className="card-header bg-dark text-white">🏛️ Libraries</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>ID</th><th>Name</th><th>Address</th><th>Capacity</th><th>Books</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {libraries.map(lib => (
                <tr key={lib.libraryId}>
                  <td>{lib.libraryId}</td>
                  <td>{lib.name}</td>
                  <td>{lib.address}</td>
                  <td>{lib.maximumCapacity}</td>
                  <td>{lib.books?.length ?? 0}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditLib(lib)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLib(lib.libraryId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Form */}
      <div className="card shadow mb-4">
        <div className="card-header bg-success text-white">➕ Add Book</div>
        <div className="card-body">
          <form onSubmit={handleBookSubmit} className="row g-2">
            <div className="col-md-3">
              <input className="form-control" placeholder="Title"
                value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input className="form-control" placeholder="Author"
                value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <input className="form-control" placeholder="Category"
                value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} required />
            </div>
            <div className="col-md-1">
              <input type="number" step="0.01" className="form-control" placeholder="Price"
                value={bookForm.price} onChange={e => setBookForm({ ...bookForm, price: e.target.value })} required />
            </div>
            <div className="col-md-2">
              <select className="form-select"
                value={bookForm.libraryId} onChange={e => setBookForm({ ...bookForm, libraryId: e.target.value })} required>
                <option value="">Select Library</option>
                {libraries.map(lib => (
                  <option key={lib.libraryId} value={lib.libraryId}>{lib.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100">Add Book</button>
            </div>
          </form>
        </div>
      </div>

      {/* Books Table */}
      <div className="card shadow mb-4">
        <div className="card-header bg-dark text-white">📖 Books</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>Price</th><th>Library</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.bookId}>
                  <td>{book.bookId}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>${book.price}</td>
                  <td>{book.library?.name ?? 'N/A'}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBook(book.bookId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminComponent