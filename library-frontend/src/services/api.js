import axios from 'axios'

const GATEWAY = 'https://library-gateway-gshyand3bycmgagk.centralindia-01.azurewebsites.net'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const registerUser = (data, role) =>
  axios.post(`${GATEWAY}/gateway/auth/api/auth/register?role=${role}`, data)

export const loginUser = (data) =>
  axios.post(`${GATEWAY}/gateway/auth/api/auth/login`, data)

// Libraries
export const getLibraries = () =>
  axios.get(`${GATEWAY}/gateway/library/api/library`)

export const getLibraryById = (id) =>
  axios.get(`${GATEWAY}/gateway/library/api/library/${id}`)

export const createLibrary = (data) =>
  axios.post(`${GATEWAY}/gateway/library/api/library`, data)

export const updateLibrary = (id, data) =>
  axios.put(`${GATEWAY}/gateway/library/api/library/${id}`, data)

export const deleteLibrary = (id) =>
  axios.delete(`${GATEWAY}/gateway/library/api/library/${id}`)

// Books
export const getBooks = () =>
  axios.get(`${GATEWAY}/gateway/library/api/book`)

export const createBook = (data) =>
  axios.post(`${GATEWAY}/gateway/library/api/book`, data)

export const updateBook = (id, data) =>
  axios.put(`${GATEWAY}/gateway/library/api/book/${id}`, data)

export const deleteBook = (id) =>
  axios.delete(`${GATEWAY}/gateway/library/api/book/${id}`)