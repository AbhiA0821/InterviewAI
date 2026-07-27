import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/common/Navbar";
import DashboardPage from "./pages/DashboardPage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import LiveInterviewPage from "./pages/LiveInterviewPage";
import FeedbackPage from "./pages/FeedbackPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import { authService } from "./services/authService";
import { Loader2 } from "lucide-react";

// RequireAuth component: Enforces Google Authentication BEFORE accessing the app
function RequireAuth({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("interviewai_token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    authService
      .getCurrentUser()
      .then((user) => {
        setIsAuthenticated(user.authenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Checking Google Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-indigo-500/30">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
