import { createContext, useContext } from 'react'

// settingsAPI removed from api.js because the backend controller does not exist.
// Defaults are hardcoded here. To restore dynamic settings, add a
// GET /api/settings/public endpoint on the backend and re-add the API call.
const StoreContext = createContext({})

export function StoreProvider({ children }) {
  const settings = {
    storeName: 'MangoMart',
    storePhone: '',
    storeEmail: '',
    upiId: '',
    upiName: 'MangoMart',
    qrImageUrl: '',
    announcement: '',
  }

  return <StoreContext.Provider value={{ settings }}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)