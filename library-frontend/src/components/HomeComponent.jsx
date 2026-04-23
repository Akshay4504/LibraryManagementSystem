import { Link } from 'react-router-dom'

function HomeComponent() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  return (
    <div className="text-center mt-5">
      <h1 className="display-4 fw-bold">📚 Library Management System</h1>
      <p className="lead text-muted mt-3">
        Organize books into libraries, search by category, and manage your collection.
      </p>
      <hr className="my-4" />
      {token ? (
        <div className="row justify-content-center mt-4 g-3">
          <div className="col-md-3">
            <div className="card shadow text-center p-3">
              <h5>🏛️ Libraries</h5>
              <p className="text-muted small">Browse all libraries</p>
              <Link to="/libraries" className="btn btn-primary">View Libraries</Link>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow text-center p-3">
              <h5>📖 Books</h5>
              <p className="text-muted small">Browse all books</p>
              <Link to="/books" className="btn btn-success">View Books</Link>
            </div>
          </div>
          {role === 'Admin' && (
            <div className="col-md-3">
              <div className="card shadow text-center p-3">
                <h5>⚙️ Admin Panel</h5>
                <p className="text-muted small">Manage libraries and books</p>
                <Link to="/admin" className="btn btn-warning">Go to Admin</Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <Link to="/login" className="btn btn-primary btn-lg me-3">Login</Link>
          <Link to="/register" className="btn btn-outline-secondary btn-lg">Register</Link>
        </div>
      )}
    </div>
  )
}

export default HomeComponent