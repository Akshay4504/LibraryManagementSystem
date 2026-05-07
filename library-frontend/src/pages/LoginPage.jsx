import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.email.trim())
      newErrors.email = 'Email is required.'
    else if (!emailRegex.test(form.email))
      newErrors.email = 'Please enter a valid email address.'

    if (!form.password)
      newErrors.password = 'Password is required.'

    return newErrors
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      const res = await loginUser(form)
      const token = res.data.token

      // Decode token to extract role
      const payload = JSON.parse(atob(token.split('.')[1]))
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('email', form.email)

      navigate('/')
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ general: 'Invalid email or password.' })
      } else if (err.response?.status === 400) {
        setErrors({ general: 'Invalid request. Please check your inputs.' })
      } else if (err.response?.status === 500) {
        setErrors({ general: 'Server error. Please try again later.' })
      } else if (!err.response) {
        setErrors({ general: 'Cannot connect to server. Make sure the API is running.' })
      } else {
        setErrors({ general: 'Login failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow">
          <div className="card-body p-4">
            <h3 className="card-title text-center mb-4">Login</h3>

            {errors.general && <div className="alert alert-danger">{errors.general}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  name="email" value={form.email}
                  onChange={handleChange} />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  name="password" value={form.password}
                  onChange={handleChange} />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Logging in...</>
                ) : 'Login'}
              </button>
            </form>

            <p className="text-center mt-3">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage