import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'foodorder_lang'

const STRINGS = {
  en: {
    browse: 'Browse',
    myOrders: 'My Orders',
    login: 'Log in',
    signup: 'Sign up',
    signOut: 'Sign out',
    heading: 'What are you craving today?',
    subheading: 'Order from restaurants and stalls around campus.',
    searchPlaceholder: 'Search restaurants or dishes...',
    knownFor: 'Known for:',
    viewMenu: 'View menu',
    noRestaurants: 'No restaurants match your search.',
  },
  th: {
    browse: 'ค้นหา',
    myOrders: 'คำสั่งซื้อของฉัน',
    login: 'เข้าสู่ระบบ',
    signup: 'สมัครสมาชิก',
    signOut: 'ออกจากระบบ',
    heading: 'วันนี้อยากกินอะไร?',
    subheading: 'สั่งอาหารจากร้านค้าต่างๆ ในมหาวิทยาลัย',
    searchPlaceholder: 'ค้นหาร้านอาหารหรือเมนู...',
    knownFor: 'เมนูเด็ด:',
    viewMenu: 'ดูเมนู',
    noRestaurants: 'ไม่พบร้านอาหารที่ตรงกับการค้นหา',
  },
}

const CATEGORY_LABELS = {
  en: {
    All: 'All',
    Italian: 'Italian',
    Japanese: 'Japanese',
    American: 'American',
    Mexican: 'Mexican',
    Indian: 'Indian',
    Asian: 'Asian',
    Barbecue: 'Barbecue',
    Healthy: 'Healthy',
    Bakery: 'Bakery',
    Dessert: 'Dessert',
  },
  th: {
    All: 'ทั้งหมด',
    Italian: 'อิตาเลียน',
    Japanese: 'ญี่ปุ่น',
    American: 'อเมริกัน',
    Mexican: 'เม็กซิกัน',
    Indian: 'อินเดีย',
    Asian: 'เอเชีย',
    Barbecue: 'บาร์บีคิว',
    Healthy: 'เพื่อสุขภาพ',
    Bakery: 'เบเกอรี่',
    Dessert: 'ของหวาน',
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const t = STRINGS[lang]

  function categoryLabel(category) {
    if (!category) return category
    return CATEGORY_LABELS[lang][category] ?? category
  }

  const value = { lang, setLang, t, categoryLabel, categories: Object.keys(CATEGORY_LABELS.en).filter((c) => c !== 'All') }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
