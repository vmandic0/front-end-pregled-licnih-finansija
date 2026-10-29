import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CurrencyContext = createContext(null)

const DEFAULT_CURRENCY = 'RSD'
const currencyDigits = currency => currency === 'RSD' ? 0 : 2

export function formatMoneyValue(amount, currency = DEFAULT_CURRENCY, { sign = false } = {}) {
  const numericAmount = Number(amount) || 0
  const formatter = new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: currencyDigits(currency),
    maximumFractionDigits: currencyDigits(currency),
    signDisplay: sign ? 'always' : 'auto',
  })

  return `${formatter.format(numericAmount)} ${currency}`
}

export function CurrencyProvider({ children }) {
  const { user } = useAuth()
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [rate, setRate] = useState(1)
  const [loading, setLoading] = useState(true)

  const loadCurrency = useCallback(async () => {
    const { data } = await api.get('/profil')
    const preferredCurrency = data.preferred_currency || DEFAULT_CURRENCY
    setCurrency(preferredCurrency)

    if (preferredCurrency === DEFAULT_CURRENCY) {
      setRate(1)
      return
    }

    const { data: conversion } = await api.post('/konvertuj', {
      iznos: 1,
      iz_valute: DEFAULT_CURRENCY,
      u_valutu: preferredCurrency,
    })
    setRate(Number(conversion.konvertovani_iznos) || 1)
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    loadCurrency()
      .catch(error => console.error('Nije moguće učitati preferiranu valutu.', error))
      .finally(() => setLoading(false))
  }, [loadCurrency, user])

  const changeCurrency = useCallback(async nextCurrency => {
    await api.post('/promeni-valutu', { valuta: nextCurrency })
    setCurrency(nextCurrency)

    if (nextCurrency === DEFAULT_CURRENCY) {
      setRate(1)
      return
    }

    const { data } = await api.post('/konvertuj', {
      iznos: 1,
      iz_valute: DEFAULT_CURRENCY,
      u_valutu: nextCurrency,
    })
    setRate(Number(data.konvertovani_iznos) || 1)
  }, [])

  const formatMoney = useCallback((amount, options = {}) => {
    const { sign = false, currency: outputCurrency = currency, convert = true } = options
    const value = convert && outputCurrency === currency
      ? Number(amount) * rate
      : Number(amount)

    return formatMoneyValue(value, outputCurrency, { sign })
  }, [currency, rate])

  const value = useMemo(() => ({
    currency,
    rate,
    loading,
    formatMoney,
    formatMoneyValue,
    changeCurrency,
    refreshCurrency: loadCurrency,
  }), [currency, rate, loading, formatMoney, changeCurrency, loadCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency mora biti korišćen unutar CurrencyProvider.')
  return context
}
