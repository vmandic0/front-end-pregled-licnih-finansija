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

function getXsrfToken() {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('XSRF-TOKEN='))

  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : null
}

export function ensureCsrfCookie() {
  if (!csrfRequest) {
    csrfRequest = axios.get(`${backendBaseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    }).finally(() => {
      csrfRequest = undefined
    })
  }

  return csrfRequest
}

api.interceptors.request.use((config) => {
  const xsrfToken = getXsrfToken()

  if (xsrfToken && !config.headers['X-XSRF-TOKEN']) {
    config.headers['X-XSRF-TOKEN'] = xsrfToken
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
