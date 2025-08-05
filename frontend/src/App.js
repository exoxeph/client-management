import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { NavBar } from './components/NavBar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectCreatePage } from "./pages/ProjectCreatePage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectReviewPage } from "./pages/ProjectReviewPage";
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="w-full min-h-screen bg-white font-sans">
      <NavBar />
      <Routes>
        <Route path="/" element={<main>
              <HeroSection />
              <ServicesSection />
              <AboutSection />
              <ContactSection />
            </main>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<ProjectCreatePage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/review" element={<ProjectReviewPage />} />
          {/* Add an additional route to match /project/:id pattern for compatibility */}
          <Route path="/project/:id" element={<ProjectDetailPage />} />
        </Route>
      </Routes>
      <Footer />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}