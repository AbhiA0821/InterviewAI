import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/common/Navbar";
import DashboardPage from "./pages/DashboardPage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import LiveInterviewPage from "./pages/LiveInterviewPage";
import FeedbackPage from "./pages/FeedbackPage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-indigo-500/30">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<ResumeUploadPage />} />
            <Route path="/interview/:id" element={<LiveInterviewPage />} />
            <Route path="/feedback/:id" element={<FeedbackPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
