import { createContext, useContext, useState, useEffect } from 'react'
import { settingsAPI } from '../api'

const StoreContext = createContext({})

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState({
    storeName: 'MangoMart', storePhone: '', storeEmail: '',
    upiId: '', upiName: 'MangoMart', qrImageUrl: '', announcement: ''
  })

  useEffect(() => {
    settingsAPI.getPublic().then(r => setSettings(r.data)).catch(() => { })
  }, [])

  return <StoreContext.Provider value={{ settings }}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)