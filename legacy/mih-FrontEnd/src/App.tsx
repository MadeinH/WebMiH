import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components generales
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Pages públicas
import HomePage from './pages/HomePage/HomePage';
import ServicesPage from './pages/Services/Services';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import ContactPage from './pages/ContactPage/ContactPage';
import NotFound from './pages/NotFoundPage/NotFound';

// Admin
import AdminLayout from './pages/Admin/layout/AdminLayout';
import LoginPage from './pages/Admin/Auth/LoginPage';
import ProductsAdminPage from './pages/Admin/products/ProductsAdminPage';
import CategoriesAdminPage from './pages/Admin/categories/CategoriesAdminPage';
import UsersAdminPage from './pages/Admin/users/UsersAdminPage';
import AdminDashboard from './pages/Admin/dashboard/DashboardPage';
import OrdersAdminPage from './pages/Admin/orders/OrdersAdminPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas con Navbar y Footer generales */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/servicios" element={<ServicesPage />} />
                    <Route path="/productos" element={<ProductsPage />} />
                    <Route path="/contacto" element={<ContactPage />} />
                    <Route path="/admin/login" element={<LoginPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
          OrdersAdminPage
          {/* Rutas del admin con AdminLayout (incluye su propio navbar/sidebar) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="categories" element={<CategoriesAdminPage />} />
            <Route path="users" element={<UsersAdminPage />} />
             <Route path="orders" element={<OrdersAdminPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;