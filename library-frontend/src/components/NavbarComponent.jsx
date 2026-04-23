import { Link, useNavigate } from 'react-router-dom'

function NavbarComponent() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const email = localStorage.getItem('email')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand fw-bold" to="/">📚 LibraryApp</Link>
      <button className="navbar-toggler" type="button"
        data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>
          {token && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/libraries">Libraries</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/books">Books</Link>
              </li>
              {role === 'Admin' && (
                <li className="nav-item">
                  <Link className="nav-link text-warning" to="/admin">Admin Panel</Link>
                </li>
              )}
            </>
          )}
        </ul>
        <ul className="navbar-nav ms-auto">
          {token ? (
            <>
              <li className="nav-item">
                <span className="nav-link text-light">👤 {email}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm mt-1"
                  onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default NavbarComponent