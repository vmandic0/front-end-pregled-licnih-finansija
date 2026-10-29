import axios from 'axios'

const apiBaseUrl = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
const backendBaseUrl = import.meta.env.PROD
  ? ''
  : apiBaseUrl.replace(/\/api\/?$/, '')

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
      .then(() => axios.get(`${apiBaseUrl}/csrf-token`, {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
        },
      }))
      .then(({ data }) => {
        csrfToken = data.token
      })
      .finally(() => {
        csrfRequest = undefined
      })
  }

  return csrfRequest
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  const isMutatingRequest = ['post', 'put', 'patch', 'delete'].includes(method)
  const isCsrfRequest = config.url?.endsWith('/csrf-token')

  if (isMutatingRequest && !isCsrfRequest) {
    await ensureCsrfCookie()
  }

  config.headers = config.headers || {}
  if (csrfToken && !config.headers['X-CSRF-TOKEN']) {
    config.headers['X-CSRF-TOKEN'] = csrfToken
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (error.response?.status === 419 && config && !config._csrfRetry) {
      config._csrfRetry = true
      csrfToken = undefined
      await ensureCsrfCookie()
      config.headers = config.headers || {}
      config.headers['X-CSRF-TOKEN'] = csrfToken
      return api(config)
    }

    const requestUrl = error.config?.url || ''
    const isAuthEndpoint = ['/login', '/register', '/user'].some(path => requestUrl.includes(path))
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent('fintrack:unauthorized'))
    }

    return Promise.reject(error)
  },
)

export default api
