
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Unauthorized() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-blue-600">403</h1>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-600">
          You don't have permission to access this page.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Current role: {user?.role || 'Unknown'}
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => logout()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}