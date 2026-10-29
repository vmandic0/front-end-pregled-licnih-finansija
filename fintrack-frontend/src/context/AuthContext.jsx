import { createContext, useContext, useEffect, useRef, useState } from 'react'
import api, { ensureCsrfCookie } from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const authChangedDuringInitialCheck = useRef(false)
  const initialCheckController = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    initialCheckController.current = controller

    api.get('/user', { signal: controller.signal })
      .then((res) => setUser(res.data))
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED' && error.response?.status !== 401) {
          console.error('Nije moguće učitati sesiju korisnika.', error)
        }
        if (error.code !== 'ERR_CANCELED' && !authChangedDuringInitialCheck.current) {
          setUser(null)
        }
      })
      .finally(() => setLoading(false))

    return () => {
      controller.abort()
    }
  }, [])

  const login = async (email, password) => {
    initialCheckController.current?.abort()
    await ensureCsrfCookie()
    const res = await api.post('/login', { email, password })
    const { user } = res.data
    authChangedDuringInitialCheck.current = true
    setUser(user)
    return user
  }

  const register = async (name, email, password, password_confirmation) => {
    initialCheckController.current?.abort()
    await ensureCsrfCookie()
    const res = await api.post('/register', { name, email, password, password_confirmation })
    authChangedDuringInitialCheck.current = true
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    try {
      await ensureCsrfCookie()
      await api.post('/logout')
    } catch (error) {
      console.error('Odjava sa servera nije uspela.', error)
    } finally {
      setUser(null)
    }
  }

  const isAdmin = () => user?.type === 'administrator'
  const isPremium = () => isAdmin() || user?.klijent?.premium_klijent === true

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isPremium, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)