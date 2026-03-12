import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { Sidebarpage } from "./Sidebarpage";
import { FiLogOut, FiX, FiAlertCircle } from "react-icons/fi";
import { BiLogOutCircle } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";

const Logout = () => {
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    setLoading(true);
    setShowAnimation(true);
    
    const auth = getAuth();
    try {
      await signOut(auth);
      localStorage.removeItem('loggedIn');
      sessionStorage.clear();
      
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (error) {
      console.error("Error logging out: ", error);
      setLoading(false);
      setShowAnimation(false);
    }
  };

  const handleCancelLogout = () => {
    navigate("/dashboard");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-row items-start justify-start bg-gradient-to-br from-[rgb(255,240,120)] via-yellow-300 to-yellow-400 min-h-screen relative overflow-hidden">
      {/* Animated background elements - adjusted for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 md:-top-40 -right-20 md:-right-40 w-40 md:w-80 h-40 md:h-80 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-20 md:-bottom-40 -left-20 md:-left-40 w-48 md:w-96 h-48 md:h-96 bg-white rounded-full opacity-10 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 md:w-96 h-48 md:h-96 bg-yellow-500 rounded-full opacity-5 blur-2xl md:blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <div className={`${isCollapsed ? "md:mr-24 mr-16" : "md:mr-52 mr-36"} relative z-10 transition-all duration-300`}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start md:items-center justify-center p-3 md:p-8 relative z-4 mt-28 md:-ml-0 -ml-8 md:mr-0 mr-5 md:mt-0">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="bg-white/90 md:bg-white/80 backdrop-blur-md md:backdrop-blur-lg rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden border border-white/20 transform transition-all duration-500 hover:scale-[1.01] md:hover:scale-[1.02]">
            {/* Header with gradient */}
            <div className="bg-black px-4 md:px-8 py-4 md:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="p-1.5 md:p-2 bg-yellow-400 rounded-lg md:rounded-xl animate-bounce">
                    <BiLogOutCircle className="w-4 h-4 md:w-6 md:h-6 text-gray-900" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Logout</h2>
                </div>
                <div className={`transform transition-transform duration-500 ${showAnimation ? 'rotate-180' : ''}`}>
                  <FiLogOut className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8">
              {/* User Avatar */}
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="relative group">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg md:shadow-xl transform transition-transform group-hover:scale-110 duration-300">
                    <FaUserCircle className="w-10 h-10 md:w-16 md:h-16 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 md:w-8 md:h-8 bg-green-400 rounded-full border-2 md:border-4 border-white animate-pulse"></div>
                </div>
              </div>

              {/* Warning or Loading Message */}
              {!showAnimation ? (
                <div className="mb-4 md:mb-8">
                  <div className="flex items-start md:items-center gap-2 md:gap-3 p-3 md:p-4 bg-yellow-50 rounded-xl border border-yellow-200 transform transition-all hover:scale-[1.01] md:hover:scale-[1.02] duration-300">
                    <FiAlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 flex-shrink-0 mt-0.5 md:mt-0 animate-pulse" />
                    <div>
                      <p className="text-sm md:text-base text-gray-700 font-medium">
                        Are you sure you want to log out?
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1 md:hidden">
                        You'll need to sign in again
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 md:mb-8">
                  <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-8 h-8 md:w-12 md:h-12 border-3 md:border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-2 md:mb-3"></div>
                    <p className="text-sm md:text-base text-green-700 font-medium">Logging out securely...</p>
                    <p className="text-xs text-green-600 mt-1">Please wait</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 md:space-y-3">
                <button
                  onClick={handleConfirmLogout}
                  disabled={loading}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.98]"
                >
                  <div className="relative flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 text-white font-semibold text-sm md:text-base">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <FiLogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Yes, Logout</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                  </div>
                </button>

                <button
                  onClick={handleCancelLogout}
                  disabled={loading}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.01] active:scale-[0.98]"
                >
                  <div className="relative flex items-center justify-center gap-2 bg-white/80 rounded-xl px-4 md:px-6 py-3 md:py-4 text-gray-700 font-semibold group-hover:bg-white/90 transition-colors text-sm md:text-base">
                    <FiX className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Cancel</span>
                  </div>
                </button>
              </div>

              {/* Security Note */}
              <p className="mt-4 md:mt-6 text-center text-xs text-gray-500">
                🔒 For your security, always log out when using shared devices
              </p>
            </div>
          </div>

          {/* Footer Tips - hidden on mobile, shown on tablet/desktop */}
          <div className="hidden md:grid grid-cols-2 gap-3 mt-6">
            {[
              { icon: "🛡️", text: "Secure logout" },
              { icon: "⚡", text: "Clear session" },
              { icon: "🔐", text: "Protect data" },
              { icon: "🚪", text: "Safe exit" },
            ].map((tip, index) => (
              <div
                key={index}
                className="bg-white/30 backdrop-blur-sm rounded-lg p-2 text-center transform transition-all duration-500 hover:scale-110 hover:bg-white/40"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <span className="text-lg mr-1">{tip.icon}</span>
                <span className="text-xs text-gray-700">{tip.text}</span>
              </div>
            ))}
          </div>

          {/* Mobile Simple Footer */}
          <div className="md:hidden mt-4 text-center">
            <p className="text-xs text-gray-600">
              🔐 Your session will be cleared
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .bg-white\/90 {
          background-color: rgba(255, 255, 255, 0.9);
        }
        
        .bg-white\/80 {
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        .bg-white\/30 {
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .bg-white\/20 {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(8px);
        }
        
        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default Logout;