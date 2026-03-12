import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebarpage } from './Sidebarpage';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from "firebase/firestore";
import { BsArrowLeft, BsShieldLock, BsCheckCircle } from 'react-icons/bs';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ChangeTransactionPin = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [step, setStep] = useState('verify'); // 'verify', 'new', 'confirm', 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form fields
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  
  const navigate = useNavigate();
  const inputRefs = [];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Handle PIN input changes
  const handlePinChange = (index, value, type) => {
    if (!/^\d*$/.test(value)) return;

    if (type === 'new') {
      const newPinArray = [...newPin];
      newPinArray[index] = value.slice(0, 1);
      setNewPin(newPinArray);
      
      if (value && index < 3) {
        document.getElementById(`new-${index + 1}`)?.focus();
      }
    } else {
      const confirmPinArray = [...confirmPin];
      confirmPinArray[index] = value.slice(0, 1);
      setConfirmPin(confirmPinArray);
      
      if (value && index < 3) {
        document.getElementById(`confirm-${index + 1}`)?.focus();
      }
    }
  };

  const handlePinKeyDown = (index, e, type) => {
    if (e.key === 'Backspace') {
      const currentPin = type === 'new' ? newPin : confirmPin;
      if (!currentPin[index] && index > 0) {
        document.getElementById(`${type}-${index - 1}`)?.focus();
      }
    }
  };

  // Step 1: Verify with account password
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Re-authenticate user with password
      const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Password verified, move to next step
      setStep('new');
      setPassword('');
      setError('');
    } catch (error) {
      console.error('Verification error:', error);
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(error.message || 'Failed to verify password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate new PIN
  const validateNewPin = () => {
    const fullPin = newPin.join('');

    if (fullPin.length !== 4) {
      setError('Please enter all 4 digits');
      return false;
    }

    // Check for repeating numbers (e.g., 1111)
    if (/^(\d)\1{3}$/.test(fullPin)) {
      setError('Avoid repeating numbers like 1111');
      return false;
    }

    // Check for sequential numbers (e.g., 1234, 4321)
    const ascending = '0123456789';
    const descending = '9876543210';
    if (ascending.includes(fullPin) || descending.includes(fullPin)) {
      setError('Avoid sequential numbers like 1234');
      return false;
    }

    setError('');
    return true;
  };

  // Step 2: Submit new PIN
  const handleNewPinSubmit = () => {
    if (!validateNewPin()) return;
    setStep('confirm');
    setError('');
  };

  // Step 3: Confirm and save new PIN
  const handleConfirmPinSubmit = async () => {
    const newPinValue = newPin.join('');
    const confirmPinValue = confirmPin.join('');

    if (newPinValue.length !== 4 || confirmPinValue.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    if (newPinValue !== confirmPinValue) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Update PIN in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        transactionPin: newPinValue,
        hasTransactionPin: true
      });

      setStep('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('PIN update error:', error);
      setError(error.message || 'Failed to update PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row items-start justify-start bg-[rgb(255,240,120)] min-h-screen">
      <div className={isCollapsed ? 'md:mr-16' : 'md:mr-40'}>
        <Sidebarpage isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex-1 p-4 md:p-8 pt-24 md:pt-8">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-black hover:text-black/70 font-medium"
        >
          <BsArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BsShieldLock className="w-16 h-16 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {step === 'verify' && 'Verify Your Identity'}
              {step === 'new' && 'Create New PIN'}
              {step === 'confirm' && 'Confirm New PIN'}
              {step === 'success' && 'PIN Changed Successfully'}
            </h1>
            <p className="text-black/70">
              {step === 'verify' && 'Enter your account password to continue'}
              {step === 'new' && 'Enter your new 4-digit transaction PIN'}
              {step === 'confirm' && 'Re-enter your new PIN to confirm'}
              {step === 'success' && 'Your transaction PIN has been changed successfully'}
            </p>
          </div>

          {/* Step 1: Password Verification */}
          {step === 'verify' && (
            <div className="bg-[rgb(18,18,18)] rounded-2xl border border-white/10 p-8">
              <form onSubmit={handleVerifyPassword}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white/70 mb-2">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 pr-12 rounded-xl bg-black border-2 border-white/20 text-white focus:border-[rgb(255,240,120)] focus:outline-none focus:ring-2 focus:ring-[rgb(255,240,120)]/30 transition-all placeholder:text-white/30"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full py-4 bg-[rgb(255,240,120)] text-black font-bold rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: New PIN */}
          {step === 'new' && (
            <div className="bg-[rgb(18,18,18)] rounded-2xl border border-white/10 p-8">
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  Enter New 4-Digit PIN
                </label>
                <div className="flex gap-3 justify-center">
                  {newPin.map((digit, index) => (
                    <input
                      key={`new-${index}`}
                      id={`new-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, 'new')}
                      onKeyDown={(e) => handlePinKeyDown(index, e, 'new')}
                      className="w-14 h-14 text-center text-2xl font-bold bg-black border-2 border-white/20 text-white rounded-xl focus:border-[rgb(255,240,120)] focus:outline-none focus:ring-2 focus:ring-[rgb(255,240,120)]/30 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-4 mb-6">
                <p className="font-semibold text-white/80 mb-2">PIN Requirements:</p>
                <ul className="text-sm text-white/50 space-y-1 list-disc pl-4">
                  <li>4 digits — numbers only (0–9)</li>
                  <li>Avoid repeating numbers (e.g., 1111)</li>
                  <li>Avoid sequential numbers (e.g., 1234, 4321)</li>
                  <li>Don't use easily guessed combinations</li>
                </ul>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleNewPinSubmit}
                disabled={newPin.join('').length !== 4}
                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* Step 3: Confirm PIN */}
          {step === 'confirm' && (
            <div className="bg-[rgb(18,18,18)] rounded-2xl border border-white/10 p-8">
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  Re-enter New 4-Digit PIN
                </label>
                <div className="flex gap-3 justify-center">
                  {confirmPin.map((digit, index) => (
                    <input
                      key={`confirm-${index}`}
                      id={`confirm-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, 'confirm')}
                      onKeyDown={(e) => handlePinKeyDown(index, e, 'confirm')}
                      className="w-14 h-14 text-center text-2xl font-bold bg-black border-2 border-white/20 text-white rounded-xl focus:border-[rgb(255,240,120)] focus:outline-none focus:ring-2 focus:ring-[rgb(255,240,120)]/30 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleConfirmPinSubmit}
                disabled={loading || confirmPin.join('').length !== 4}
                className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'UPDATING...' : 'UPDATE PIN'}
              </button>

              <button
                onClick={() => {
                  setStep('new');
                  setConfirmPin(['', '', '', '']);
                  setError('');
                }}
                className="w-full mt-3 py-3 text-white/50 hover:text-white underline text-sm"
              >
                ← Go back to create new PIN
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <BsCheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">PIN Updated!</h2>
              <p className="text-white/60 mb-6">
                Your transaction PIN has been changed successfully. Redirecting to dashboard...
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[rgb(255,240,120)] hover:opacity-80 underline"
              >
                Go to Dashboard Now
              </button>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-black/50">
            <p>Keep your PIN private and never share it with anyone</p>
            <p className="mt-1">For security, always log out after each session</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeTransactionPin;