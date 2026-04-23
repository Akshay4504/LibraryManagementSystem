import { Link } from 'react-router-dom'

function ErrorComponent() {
  return (
    <div className="text-center mt-5">
      <h1 className="display-1 text-danger">404</h1>
      <h3>Page Not Found</h3>
      <p className="text-muted">You don't have access to this page or it doesn't exist.</p>
      <Link to="/" className="btn btn-primary mt-3">Go Home</Link>
    </div>
  )
}

export default ErrorComponent