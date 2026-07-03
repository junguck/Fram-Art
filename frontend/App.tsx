import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import FeedPage from './features/gallery/FeedPage';
import PostDetails from './features/gallery/PostDetailsNew';
import UploadPage from './features/upload/UploadPage';
import AuthLayout from './features/auth/AuthLayout';
import LoginImg from './assets/login.jpg'
import MainSearch from './features/search/mainSearch';
import RegisterForm from './features/auth/RegisterForm';
import FavoritesPage from './features/favorites/Favorites';
import ProfilePage from './features/profiles/ProfilePage';
import EditProfilePage from './features/profiles/EditProfilePage';
import LoginForm from './features/auth/LoginForm';
import AuthorDashboard from './features/profiles/AuthorDashboard';
import ArtistDashboard from './features/profiles/ArtistDashboard';
import PublicProfilePage from './features/profiles/PublicProfilePage';
import AdminDashboard from './features/admin/AdminDashboard';
import NotificationPage from './features/notification/NotificationPage';
import LandingPage from './features/home/LandingPage';
import react from 'react';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/home" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Routes sans layout */}
        <Route path="login" element={<AuthLayout children={<LoginForm/>} imageSrc={LoginImg} />} />
        <Route path="register" element={<AuthLayout children={<RegisterForm/>} imageSrc={LoginImg} />} />
        <Route path="search" element={<MainSearch />} />

        {/* Layout principal avec Sidebar/Navbar */}
        <Route element={<MainLayout />}>
          <Route path="home" element={<FeedPage />} />
          <Route path="post/:id" element={<PostDetails />} />
          <Route path="fav" element={<FavoritesPage />} />
          <Route path="profiles" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="profile/:username" element={<PublicProfilePage />} />
          <Route path="editProfile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          
          {/* Dashboard utilisateur */}
          <Route path='dashboard' element={<ProtectedRoute><AuthorDashboard /></ProtectedRoute>} />
          
          {/* Dashboard artiste */}
          <Route path='artist-dashboard' element={<ProtectedRoute requiredRole="artiste"><ArtistDashboard /></ProtectedRoute>} />
          
          {/* Dashboard admin */}
          <Route path='admin' element={<ProtectedRoute requiredRole="administrateur"><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          <Route path="upload" element={<ProtectedRoute requiredRole="artiste"><UploadPage /></ProtectedRoute>} />
          
          {/* Page 404 - Redirige vers l’accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
