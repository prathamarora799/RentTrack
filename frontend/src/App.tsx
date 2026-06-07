import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import TenantDashboard from './pages/TenantDashboard'
import LandlordDashboard from './pages/LandlordDashboard'
import AddPayment from './pages/AddPayment'
import EditPayment from './pages/EditPayment'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tenant" element={<TenantDashboard />} />
      <Route path="/landlord" element={<LandlordDashboard />} />
      <Route path="/add-payment" element={<AddPayment />} />
      <Route path="/edit-payment/:id" element={<EditPayment />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  )
}

export default App