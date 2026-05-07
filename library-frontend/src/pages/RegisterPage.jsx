import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'

function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [role, setRole] = useState('User')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}

    if (!form.fullName.trim())
      newErrors.fullName = 'Full name is required.'
    else if (form.fullName.trim().length < 3)
      newErrors.fullName = 'Full name must be at least 3 characters.'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim())
      newErrors.email = 'Email is required.'
    else if (!emailRegex.test(form.email))
      newErrors.email = 'Please enter a valid email address.'

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!form.password)
      newErrors.password = 'Password is required.'
    else if (!passwordRegex.test(form.password))
      newErrors.password = 'Password must be at least 6 characters, include uppercase, lowercase and a number.'

    return newErrors
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear error for this field as user types
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
      await registerUser(form, role)
      setSuccess('Registered successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors({ general: err.response.data?.message || 'User already exists.' })
      } else if (err.response?.status === 500) {
        setErrors({ general: 'Server error. Please try again later.' })
      } else if (!err.response) {
        setErrors({ general: 'Cannot connect to server. Make sure the API is running.' })
      } else {
        setErrors({ general: 'Registration failed. Please try again.' })
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
            <h3 className="card-title text-center mb-4">Register</h3>

            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  name="fullName" value={form.fullName}
                  onChange={handleChange} />
                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  name="email" value={form.email}
                  onChange={handleChange} />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  name="password" value={form.password}
                  onChange={handleChange} />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                <div className="form-text">Min 6 chars, uppercase, lowercase and a number.</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" value={role}
                  onChange={(e) => setRole(e.target.value)}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn btn-success w-100" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Registering...</>
                ) : 'Register'}
              </button>
            </form>

            <p className="text-center mt-3">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage