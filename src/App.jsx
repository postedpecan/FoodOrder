import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { NavBar } from './components/layout/NavBar'
import { Footer } from './components/layout/Footer'

import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'

import { RestaurantListPage } from './pages/customer/RestaurantListPage'
import { RestaurantMenuPage } from './pages/customer/RestaurantMenuPage'
import { CheckoutPage } from './pages/customer/CheckoutPage'
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage'

import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage'
import { OwnerMenuPage } from './pages/owner/OwnerMenuPage'
import { OwnerOrdersPage } from './pages/owner/OwnerOrdersPage'

import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <NavBar />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<RestaurantListPage />} />
              <Route path="/restaurants/:id" element={<RestaurantMenuPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/menu"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerMenuPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/orders"
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <OwnerOrdersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/restaurants"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRestaurantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
