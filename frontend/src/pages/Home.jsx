import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn Waste Into
              <span className="text-green-600"> Resources</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect, Trade, and Build a Circular Economy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'seller' ? '/seller-dashboard' : '/buyer-dashboard'}
                    className="bg-green-600 text-white hover:bg-green-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/marketplace"
                    className="bg-white text-green-600 hover:bg-green-50 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Explore Marketplace
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-green-600 text-white hover:bg-green-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/marketplace"
                    className="bg-white text-green-600 hover:bg-green-50 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Explore Marketplace
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-green-600 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-blue-600 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-400 rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-blue-400 rounded-full"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of businesses and individuals turning waste into valuable resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-200">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sell Waste Materials
              </h3>
              <p className="text-gray-600 mb-4">
                List your waste materials on our platform and connect with buyers who can transform them into valuable resources.
              </p>
              <Link
                to="/signup"
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
              >
                Start Selling
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Buy Reusable Resources
              </h3>
              <p className="text-gray-600 mb-4">
                Browse through a wide variety of waste materials that can be reused, recycled, or upcycled for your business needs.
              </p>
              <Link
                to="/marketplace"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
              >
                Browse Marketplace
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-200">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Reduce Environmental Impact
              </h3>
              <p className="text-gray-600 mb-4">
                Join the circular economy movement and help reduce waste while creating economic value from discarded materials.
              </p>
              <Link
                to="/about"
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
              >
                Learn More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Tons of Waste Recycled</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">$2M+</div>
              <div className="text-gray-600">Economic Value Created</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">25,000+</div>
              <div className="text-gray-600">Successful Transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isAuthenticated ? `Welcome back, ${user?.name || 'User'}!` : 'Ready to Join the Circular Economy?'}
          </h2>
          <p className="text-xl text-green-100 mb-8">
            {isAuthenticated 
              ? 'Continue your journey in turning waste into valuable resources. Manage your listings and connect with buyers.'
              : 'Start turning waste into valuable resources today. Join thousands of businesses and individuals making a difference.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'seller' ? '/seller-dashboard' : '/buyer-dashboard'}
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/marketplace"
                  className="bg-transparent text-white hover:bg-green-700 border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Explore Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Sign Up Now
                </Link>
                <Link
                  to="/marketplace"
                  className="bg-transparent text-white hover:bg-green-700 border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Explore Marketplace
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
