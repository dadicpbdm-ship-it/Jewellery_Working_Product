import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import Wishlist from './pages/Wishlist';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import Contact from './pages/Contact';
import DeliveryAgentRegister from './pages/DeliveryAgentRegister';
import ManageDeliveryAgents from './pages/ManageDeliveryAgents';
import LoyaltyDashboard from './pages/LoyaltyDashboard';
import CertificateVerify from './pages/CertificateVerify';
import CustomDesigner from './pages/CustomDesigner';
import ManagePincodes from './pages/ManagePincodes';
import ManageWarehouses from './pages/ManageWarehouses';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <div className="app-container">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/delivery/dashboard"
                      element={
                        <ProtectedRoute deliveryOnly={true}>
                          <DeliveryDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/delivery-agents"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <ManageDeliveryAgents />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/delivery-agents/register"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <DeliveryAgentRegister />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={<Checkout />}
                    />
                    <Route
                      path="/order-success"
                      element={<OrderSuccess />}
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order/:id"
                      element={<OrderDetails />}
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/rewards"
                      element={
                        <ProtectedRoute>
                          <LoyaltyDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/verify-certificate/:certificateNumber?" element={<CertificateVerify />} />
                    <Route path="/designer" element={<CustomDesigner />} />
                    <Route
                      path="/admin/pincodes"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <ManagePincodes />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/warehouses"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <ManageWarehouses />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
                <BackToTop />
              </div>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </AuthProvider >
  );
}

export default App;
