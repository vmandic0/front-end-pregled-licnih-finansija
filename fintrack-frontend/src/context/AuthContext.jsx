import { createContext, useContext, useEffect, useState } from 'react'
import api, { ensureCsrfCookie } from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/user')
      .then((res) => setUser(res.data))
      .catch((error) => {
        if (error.response?.status !== 401) {
          console.error('Nije moguće učitati sesiju korisnika.', error)
        }
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    await ensureCsrfCookie()
    const res = await api.post('/login', { email, password })
    const { user } = res.data
    setUser(user)
    return user
  }

  const register = async (name, email, password, password_confirmation) => {
    await ensureCsrfCookie()
    const res = await api.post('/register', { name, email, password, password_confirmation })
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
  const isPremium = () => user?.klijent?.premium_klijent === true

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isPremium, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)