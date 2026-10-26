import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

let csrfRequest
let csrfToken

export function ensureCsrfCookie() {
  if (!csrfRequest) {
    csrfRequest = axios.get(`${backendBaseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    })
      .then(() => api.get('/csrf-token'))
      .then(({ data }) => {
        csrfToken = data.token
      })
      .finally(() => {
        csrfRequest = undefined
      })
  }

  return csrfRequest
}

api.interceptors.request.use((config) => {
  if (csrfToken && !config.headers['X-CSRF-TOKEN']) {
    config.headers['X-CSRF-TOKEN'] = csrfToken
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthEndpoint = ['/login', '/register', '/user'].some((path) => requestUrl.includes(path))
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
