import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import Returns from '@/pages/Returns';
import MesFinancements from '@/pages/MesFinancements';
import Favorites from '@/pages/Favorites';
import Search from '@/pages/Search';
import Contact from '@/pages/Contact';
import Lebalma from '@/pages/Lebalma';
import PaymentSimulator from '@/pages/PaymentSimulator';
import PaymentReturn from '@/pages/PaymentReturn';
import NotFound from '@/pages/NotFound';

// Back-office
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminFinance from '@/pages/Admin/Finance';
import AdminProducts from '@/pages/Admin/Products';
import AdminOrders from '@/pages/Admin/Orders';
import AdminLebalma from '@/pages/Admin/Lebalma';
import AdminClients from '@/pages/Admin/Clients';
import AdminInvoices from '@/pages/Admin/Invoices';
import AdminInvoice from '@/pages/Admin/Invoice';
import AdminReturns from '@/pages/Admin/Returns';
import AdminCampaigns from '@/pages/Admin/Campaigns';
import AdminSettings from '@/pages/Admin/Settings';
import AdminAdmins from '@/pages/Admin/Admins';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Boutique */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="search" element={<Search />} />
        <Route path="lebalma" element={<Lebalma />} />
        <Route path="contact" element={<Contact />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protégé (connecté) */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="returns" element={<Returns />} />
          <Route path="mes-financements" element={<MesFinancements />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="paiement/simulateur/:id" element={<PaymentSimulator />} />
          <Route path="paiement/retour" element={<PaymentReturn />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Back-office (layout dédié, réservé admin) */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="lebalma" element={<AdminLebalma />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="invoices/:id" element={<AdminInvoice />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
