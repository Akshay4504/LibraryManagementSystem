import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavbarComponent from './components/NavbarComponent'
import HomeComponent from './components/HomeComponent'
import LibraryComponent from './components/LibraryComponent'
import BookComponent from './components/BookComponent'
import AdminComponent from './components/AdminComponent'
import BorrowComponent from './components/BorrowComponent'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ErrorComponent from './components/ErrorComponent'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('role')
  return role === 'Admin' ? children : <Navigate to="/error" />
}

const UserRoute = ({ children }) => {
  const role = localStorage.getItem('role')
  return role === 'User' ? children : <Navigate to="/error" />
}

function App() {
  return (
    <BrowserRouter>
      <NavbarComponent />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/libraries" element={
            <PrivateRoute><LibraryComponent /></PrivateRoute>
          } />
          <Route path="/books" element={
            <PrivateRoute><BookComponent /></PrivateRoute>
          } />
          <Route path="/my-borrows" element={
            <UserRoute><BorrowComponent /></UserRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminComponent /></AdminRoute>
          } />
          <Route path="/error" element={<ErrorComponent />} />
          <Route path="*" element={<ErrorComponent />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App