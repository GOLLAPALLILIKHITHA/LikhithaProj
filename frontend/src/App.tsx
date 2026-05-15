import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import EnhancedListingsPage from './pages/EnhancedListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import PostAdPage from './pages/PostAdPage';
import WishlistPage from './pages/WishlistPage';
import ChatPage from './pages/ChatPage';
import MyListingsPage from './pages/MyListingsPage';
import ArticlePage from './pages/ArticlePage';
import PropertySearchPage from './pages/PropertySearchPage';
import BuyPropertyPage from './pages/BuyPropertyPage';
import RentPropertyPage from './pages/RentPropertyPage';
import DashboardPage from './pages/DashboardPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllRequests from './pages/admin/AdminAllRequests';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminMessages from './pages/admin/AdminMessages';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminPayments from './pages/admin/AdminPayments';
import AdminAddListingMenu from './pages/admin/AdminAddListingMenu';
import AdminAddProperty from './pages/admin/AdminAddProperty';
import AdminAddFurniture from './pages/admin/AdminAddFurniture';
import AdminAddServices from './pages/admin/AdminAddServices';
import AdminAddMaterials from './pages/admin/AdminAddMaterials';
import AdminVendors from './pages/admin/AdminVendors';
import AdminAddVendor from './pages/admin/AdminAddVendor';
import AdminOwnerManagement from './pages/admin/AdminOwnerManagement';
import AdminPropertyPurchases from './pages/admin/AdminPropertyPurchases';
import PropertyPurchaseDocuments from './pages/PropertyPurchaseDocuments';
import KYCPage from './pages/KYCPage';
import CleanBuyPropertyPage from './pages/CleanBuyPropertyPage';
import CleanRentPropertyPage from './pages/CleanRentPropertyPage';
import FurniturePage from './pages/FurniturePage';
import ServicesPage from './pages/ServicesPage';
import MaterialsPage from './pages/MaterialsPage';
import UserAccountPage from './pages/UserAccountPage';
import MyServiceRequestsPage from './pages/MyServiceRequestsPage';
import VendorLayout from './pages/vendor/VendorLayout';
import VendorAssignments from './pages/vendor/VendorAssignments';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorForgotPassword from './pages/vendor/VendorForgotPassword';
import VendorSetPassword from './pages/vendor/VendorSetPassword';
import OwnerLayout from './pages/OwnerLayout';
import OwnerLogin from './pages/OwnerLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerProperties from './pages/OwnerProperties';
import OwnerPropertyDetails from './pages/OwnerPropertyDetails';

import { useAuthStore } from './store/authStore';
import { useWishlistStore } from './store/wishlistStore';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const { loadUser, user } = useAuthStore();
  const { load } = useWishlistStore();

  useEffect(() => { loadUser(); }, []);
  useEffect(() => { if (user) load(); }, [user]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
          <Route path="/vendor/set-password" element={<VendorSetPassword />} />
          <Route path="/vendor/set-password" element={<VendorSetPassword />} />

          {/* Main Site - Core Features */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/buy-property" element={<Layout><CleanBuyPropertyPage /></Layout>} />
          <Route path="/property-rentals" element={<Layout><CleanRentPropertyPage /></Layout>} />
          <Route path="/furniture" element={<Layout><FurniturePage /></Layout>} />
          <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
          <Route path="/materials" element={<Layout><MaterialsPage /></Layout>} />
          <Route path="/listings" element={<Layout><EnhancedListingsPage /></Layout>} />
          <Route path="/listing/:id" element={<Layout><ListingDetailPage /></Layout>} />
          <Route path="/account" element={<Layout><UserAccountPage /></Layout>} />
          <Route path="/my-service-requests" element={<Layout><MyServiceRequestsPage /></Layout>} />
          <Route path="/purchase/:id/documents" element={<Layout><PropertyPurchaseDocuments /></Layout>} />
          <Route path="/kyc" element={<Layout><KYCPage /></Layout>} />
          <Route path="/post-ad" element={<Layout><PostAdPage /></Layout>} />
          <Route path="/wishlist" element={<Layout><WishlistPage /></Layout>} />
          <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
          <Route path="/my-listings" element={<Layout><MyListingsPage /></Layout>} />
          <Route path="/articles/:slug" element={<Layout><ArticlePage /></Layout>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="all-requests" element={<AdminAllRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="listings/add" element={<AdminAddListingMenu />} />
            <Route path="listings/add/property" element={<AdminAddProperty />} />
            <Route path="listings/add/furniture" element={<AdminAddFurniture />} />
            <Route path="listings/add/services" element={<AdminAddServices />} />
            <Route path="listings/add/materials" element={<AdminAddMaterials />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="vendors/add" element={<AdminAddVendor />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="owners" element={<AdminOwnerManagement />} />
            <Route path="owners" element={<AdminOwnerManagement />} />
            <Route path="owner-management" element={<AdminOwnerManagement />} />
            <Route path="property-purchases" element={<AdminPropertyPurchases />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorAssignments />} />
          </Route>

          {/* Owner Portal */}
          <Route path="/owner" element={<OwnerLayout />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="properties" element={<OwnerProperties />} />
            <Route path="property/:id" element={<OwnerPropertyDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

