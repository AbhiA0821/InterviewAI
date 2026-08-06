import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full p-8 text-center space-y-6 border-indigo-500/20 shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black bg-gradient-to-r from-indigo-400 via-teal-300 to-indigo-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/dashboard">
            <Button variant="emerald" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
          <button onClick={() => window.history.back()}>
            <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </button>
        </div>
      </Card>
    </div>
  );
}

