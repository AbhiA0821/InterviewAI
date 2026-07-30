import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Navbar } from "./components/common/Navbar";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import LiveInterviewPage from "./pages/LiveInterviewPage";
import FeedbackPage from "./pages/FeedbackPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MirrorRoomPage from "./pages/MirrorRoomPage";

// RequireAuth component: Enforces Google Authentication & persistent session guard
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-sm font-bold text-slate-300">Checking your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isInterviewFlow =
    location.pathname.startsWith("/interview/") ||
    location.pathname.startsWith("/mirror_room");
  const hideNavbar = isInterviewFlow || location.pathname === "/login";

  return (
    <div
      className={`min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-indigo-500/30 ${
        isInterviewFlow ? "h-screen max-h-screen overflow-hidden bg-slate-950 p-0 m-0" : ""
      }`}
    >
      {!hideNavbar && <Navbar />}
      <main
        className={
          isInterviewFlow
            ? "h-full w-full p-0 m-0 overflow-hidden flex-1 flex flex-col min-h-0"
            : "flex-1 container mx-auto px-4 py-8 max-w-7xl"
        }
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <LandingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/upload"
            element={
              <RequireAuth>
                <ResumeUploadPage />
              </RequireAuth>
            }
          />
          <Route
            path="/mirror_room/:id"
            element={
              <RequireAuth>
                <MirrorRoomPage />
              </RequireAuth>
            }
          />
          <Route
            path="/mirror_room"
            element={
              <RequireAuth>
                <MirrorRoomPage />
              </RequireAuth>
            }
          />
          <Route
            path="/interview/:id"
            element={
              <RequireAuth>
                <LiveInterviewPage />
              </RequireAuth>
            }
          />
          <Route
            path="/feedback/:id"
            element={
              <RequireAuth>
                <FeedbackPage />
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <HistoryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboardPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
