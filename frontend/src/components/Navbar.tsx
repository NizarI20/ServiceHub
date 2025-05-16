
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, LogIn, Package, LayoutDashboard, Calendar, CalendarCheck } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-brand-600 text-xl font-bold">ServiceHub</span>
            </Link>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <Link to="/services" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">
              <Package className="w-4 h-4 mr-1" />
              Services
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <Link to="/user-reservations" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">
                  <Calendar className="w-4 h-4 mr-1" />
                  Mes réservations
                </Link>
                <Link to="/reservations" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">
                  <CalendarCheck className="w-4 h-4 mr-1" />
                  Gérer les réservations
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                >
                  Logout
                </Button>
                <span className="px-3 py-2 rounded-md text-sm font-medium text-brand-600">
                  {user?.name}
                </span>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50">
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="default" className="bg-brand-600 hover:bg-brand-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pt-2 pb-3 space-y-1 shadow-lg">
          <Link 
            to="/" 
            className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Link>
          <Link 
            to="/services" 
            className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <Package className="w-5 h-5 mr-2" />
            Services
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
              <Link 
                to="/user-reservations" 
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Mes réservations
              </Link>
              <Link 
                to="/reservations" 
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                Gérer les réservations
              </Link>
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
              >
                Logout
              </button>
              <div className="px-4 py-2 text-base font-medium text-brand-600 border-t border-gray-200 mt-2 pt-2">
                Signed in as: {user?.name}
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </Link>
              <Link 
                to="/register" 
                className="block px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button variant="default" className="w-full bg-brand-600 hover:bg-brand-700">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
