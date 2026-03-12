import { useState, useEffect } from "react";
import { getAuth, reload, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const maxRetries = 10; // Increased retries for better UX

  useEffect(() => {
    const auth = getAuth();

    const checkEmailVerified = async (retry = 0) => {
      const user = auth.currentUser;

      if (user) {
        setUserEmail(user.email);
        await reload(user); // Reload user data from Firebase

        if (user.emailVerified) {
          setLoading(false);
          // Short delay before redirect for better UX
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        } else if (retry < maxRetries) {
          // Update retry count
          setRetryCount(retry + 1);
          // Retry if the email isn't verified
          setTimeout(() => checkEmailVerified(retry + 1), 3000);
        } else {
          // Stop loading after max retries
          setLoading(false);
        }
      }
    };

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkEmailVerified();
      } else {
        // If no user is logged in, redirect to login
        navigate("/login");
      }
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, [navigate]);

  const handleResendVerification = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await sendEmailVerification(user);
        setEmailSent(true);
        setError("");

        // Hide success message after 5 seconds
        setTimeout(() => {
          setEmailSent(false);
        }, 5000);
      }
    } catch (error) {
      setError("Failed to send verification email. Please try again.");
      console.error("Resend error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgb(255,240,120)] p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {loading ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
            <p className="text-gray-600 mb-4">
              We're checking if your email has been verified...
            </p>
            <p className="text-sm text-gray-500">
              Attempt {retryCount + 1} of {maxRetries + 1}
            </p>
          </div>
        ) : (
          <div className="text-center">
            {/* Email not verified message */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
              <p className="text-gray-600 mb-2">
                We've sent a verification email to:
              </p>
              <p className="font-bold text-lg mb-4">{userEmail}</p>
              <p className="text-sm text-gray-500 mb-6">
                Please check your inbox and click the verification link to continue.
              </p>
            </div>

            {/* Success message */}
            {emailSent && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
                ✓ Verification email sent successfully!
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                Resend Verification Email
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                I've Verified My Email
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-gray-600 py-3 px-4 rounded-lg font-bold hover:text-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Help text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;