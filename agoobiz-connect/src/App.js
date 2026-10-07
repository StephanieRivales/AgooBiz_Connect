import { useState, useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext.jsx';
import {CartProvider} from './context/CartContext.jsx';
import {AuthPromptProvider} from './context/AuthPromptContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import BuyerDashboard from './pages/BuyerDashboard.jsx';
import Shop from './pages/Shop.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Logout from './pages/Logout.jsx';
import Chat from './pages/Chat.jsx';
import Analytics from './pages/Analytics.jsx';
import MyProducts from './pages/MyProducts.jsx';    
import ScrollToHash from './components/ScrollToHash.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminReports from './pages/AdminReports.jsx';
import Settings from './pages/Settings.jsx';
import FAQ from './pages/FAQ.jsx';
import People from './pages/People.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

import './App.css';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash after 3 seconds (adjust as needed)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
  return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AuthPromptProvider>
            <ScrollToHash />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/my-orders" element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/people" element={
              <ProtectedRoute>
                <People />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/my-products" element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <MyProducts />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="/order-history" element={
              <ProtectedRoute allowedRoles={["buyer", "seller"]}>
                <OrderHistory />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller-dashboard" element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/buyer-dashboard" element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerDashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
          <ScrollToHash />
          </AuthPromptProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
