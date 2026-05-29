import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import PresentationModePage from "../pages/PresentationModePage";
import NotFoundPage from "../pages/NotFoundPage";

const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const CreatePresentationPage = lazy(() => import("../pages/CreatePresentationPage"));
const PresentationsPage = lazy(() => import("../pages/PresentationsPage"));
const FavoritesPage = lazy(() => import("../pages/FavoritesPage"));
const TemplatesPage = lazy(() => import("../pages/TemplatesPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const EditorPage = lazy(() => import("../pages/EditorPage"));

const withSuspense = (element) => (
  <Suspense
    fallback={
      <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/75 p-6">
        <LoadingSpinner label="Loading workspace..." />
      </div>
    }
  >
    {element}
  </Suspense>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={withSuspense(<DashboardPage />)} />
        <Route path="/presentations" element={withSuspense(<PresentationsPage />)} />
        <Route path="/templates" element={withSuspense(<TemplatesPage />)} />
        <Route path="/favorites" element={withSuspense(<FavoritesPage />)} />
        <Route path="/settings" element={withSuspense(<SettingsPage />)} />
        <Route path="/profile" element={withSuspense(<ProfilePage />)} />
        <Route path="/create" element={withSuspense(<CreatePresentationPage />)} />
        <Route path="/editor/:id" element={withSuspense(<EditorPage />)} />
      </Route>

      <Route
        path="/present/:id"
        element={
          <ProtectedRoute>
            <PresentationModePage />
          </ProtectedRoute>
        }
      />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
