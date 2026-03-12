import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from "firebase/firestore";

const TransactionPin = ({ isOpen, onClose, onSuccess, amount, bankName, mode = 'create' }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [step, setStep] = useState('create'); // 'create' or 'confirm' (only for create mode)
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const inputRefs = [];

    const handlePinChange = (index, value, type) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        if (mode === 'verify') {
            // In verify mode, we only have one pin array
            const newPin = [...pin];
            newPin[index] = value.slice(0, 1);
            setPin(newPin);

            // Auto-focus next input
            if (value && index < 3) {
                inputRefs[`verify-${index + 1}`]?.focus();
            }
        } else {
            // In create mode, we have two pin arrays
            const newPin = type === 'create' ? [...pin] : [...confirmPin];
            newPin[index] = value.slice(0, 1);

            if (type === 'create') {
                setPin(newPin);
            } else {
                setConfirmPin(newPin);
            }

            // Auto-focus next input
            if (value && index < 3) {
                inputRefs[`${type}-${index + 1}`]?.focus();
            }
        }
    };

    const handleKeyDown = (index, e, type) => {
        if (mode === 'verify') {
            if (e.key === 'Backspace' && !pin[index] && index > 0) {
                inputRefs[`verify-${index - 1}`]?.focus();
            }
        } else {
            if (e.key === 'Backspace' && !(type === 'create' ? pin[index] : confirmPin[index]) && index > 0) {
                inputRefs[`${type}-${index - 1}`]?.focus();
            }
        }
    };

    const handlePaste = (e, type) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 4);

        // Check if pasted data contains only numbers
        if (!/^\d+$/.test(pastedData)) {
            setError('Please paste numbers only');
            return;
        }

        const pinArray = pastedData.split('');

        if (mode === 'verify') {
            const newPin = [...pin];
            pinArray.forEach((digit, index) => {
                if (index < 4) newPin[index] = digit;
            });
            setPin(newPin);
        } else {
            if (type === 'create') {
                const newPin = [...pin];
                pinArray.forEach((digit, index) => {
                    if (index < 4) newPin[index] = digit;
                });
                setPin(newPin);
            } else {
                const newConfirmPin = [...confirmPin];
                pinArray.forEach((digit, index) => {
                    if (index < 4) newConfirmPin[index] = digit;
                });
                setConfirmPin(newConfirmPin);
            }
        }
    };

    const validatePin = () => {
        const fullPin = pin.join('');

        // Check if all digits are filled
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

    // Handle PIN verification (for withdraw)
    const handleVerify = async () => {
        const enteredPin = pin.join('');

        if (enteredPin.length !== 4) {
            setError('Please enter all 4 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // Get user's stored PIN
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const storedPin = userDoc.data().transactionPin;
                
                // Compare entered PIN with stored PIN
                if (storedPin === enteredPin) {
                    // PIN is correct
                    if (onSuccess) {
                        await onSuccess(); // Wait for withdrawal to complete
                    }
                    onClose();
                } else {
                    // PIN is incorrect
                    setError('Incorrect PIN. Please try again.');
                    setPin(['', '', '', '']);
                    inputRefs['verify-0']?.focus();
                }
            } else {
                setError('User data not found');
            }
        } catch (error) {
            console.error('PIN verification error:', error);
            setError(error.message || 'Failed to verify PIN. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle PIN creation (first step)
    const handleCreateSubmit = () => {
        if (!validatePin()) return;
        setStep('confirm');
        setError('');
    };

    // Handle PIN confirmation (second step of creation)
    const handleConfirmSubmit = async () => {
        const createPinValue = pin.join('');
        const confirmPinValue = confirmPin.join('');

        if (createPinValue !== confirmPinValue) {
            setError('PINs do not match');
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // Store as plain number (since user is authenticated)
            await updateDoc(doc(db, "users", user.uid), {
                transactionPin: createPinValue,
                hasTransactionPin: true
            });

            // Success
            onClose();
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Failed to set PIN. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDoItLater = () => {
        onClose();
        if (mode === 'create') {
            navigate('/dashboard');
        }
    };
    
    const handleForgotPin = () => {
        onClose();
        // You can show a message or navigate to support
        navigate('/Settings');
        // alert('Please contact support to reset your PIN');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 md:pt-0 pt-24 md:pb-0 pb-5 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Popup */}
                <div
                    className="bg-[rgb(18,18,18)] rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <h1 className="text-3xl font-bold text-[rgb(255,240,120)] mb-2">
                        {mode === 'verify' 
                            ? 'Enter Transaction PIN' 
                            : (step === 'create' ? 'Create a PIN' : 'Confirm your PIN')
                        }
                    </h1>

                    {/* Description */}
                    <p className="text-white/60 mb-6 leading-relaxed">
                        {mode === 'verify' 
                            ? (amount && bankName 
                                ? <>Please enter your PIN to confirm withdrawal of <span className="font-bold">₦{amount?.toLocaleString()}</span> to <span className="font-bold">{bankName}</span></>
                                : 'Please enter your 4-digit PIN to continue with this withdrawal.'
                              )
                            : (step === 'create'
                                ? 'Your PIN will help you withdraw.'
                                : 'Please re-enter your PIN to confirm it matches.'
                              )
                        }
                    </p>

                    {/* PIN Input Label */}
                    <p className="text-lg font-semibold text-white mb-3">
                        {mode === 'verify' 
                            ? 'Enter your 4-digit PIN'
                            : `Enter the ${step === 'create' ? '4' : ''}-digit code`
                        }
                    </p>

                    {/* PIN Input Fields */}
                    <div className="flex gap-3 justify-between mb-6">
                        {(mode === 'verify' 
                            ? pin 
                            : (step === 'create' ? pin : confirmPin)
                        ).map((digit, index) => (
                            <input
                                key={mode === 'verify' ? `verify-${index}` : `${step}-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                ref={(el) => {
                                    if (mode === 'verify') {
                                        inputRefs[`verify-${index}`] = el;
                                    } else {
                                        inputRefs[`${step}-${index}`] = el;
                                    }
                                }}
                                onChange={(e) => handlePinChange(
                                    index, 
                                    e.target.value, 
                                    mode === 'verify' ? 'verify' : step
                                )}
                                onKeyDown={(e) => handleKeyDown(
                                    index, 
                                    e, 
                                    mode === 'verify' ? 'verify' : step
                                )}
                                onPaste={(e) => handlePaste(
                                    e, 
                                    mode === 'verify' ? 'verify' : step
                                )}
                                className="w-14 h-14 text-center text-2xl font-bold bg-black text-white border-2 border-white/20 rounded-xl focus:border-[rgb(255,240,120)] focus:outline-none focus:ring-2 focus:ring-[rgb(255,240,120)]/30 transition-all"
                                autoFocus={index === 0 && (mode === 'verify' || step === 'create')}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-red-400 text-sm mb-4 bg-red-900/20 p-2 rounded-lg border border-red-500/20">
                            ⚠️ {error}
                        </p>
                    )}

                    {/* Forgot PIN link - only in verify mode */}
                    {mode === 'verify' && (
                        <div className="text-right mb-4">
                            <button
                                onClick={handleForgotPin}
                                className="text-sm text-[rgb(255,240,120)] hover:opacity-80 underline"
                            >
                                Forgot PIN?
                            </button>
                        </div>
                    )}

                    {/* Recommendations - Only show in create step */}
                    {mode !== 'verify' && step === 'create' && (
                        <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/10">
                            <p className="font-semibold text-white/80 mb-2">Recommendation:</p>
                            <ul className="text-sm text-white/60 space-y-2 list-disc pl-3">
                                <li>Use 4 digits — numbers only (0–9).</li>
                                <li>Avoid repeating or sequential numbers (e.g., 1111, 1234).</li>
                                <li>Keep your PIN private — never share it with anyone.</li>
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDoItLater}
                            className="flex-1 py-3 px-4 border-2 border-white/20 text-white/60 font-semibold rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                            disabled={loading}
                        >
                            {mode === 'verify' ? 'CANCEL' : 'DO IT LATER'}
                        </button>
                        <button
                            onClick={mode === 'verify' 
                                ? handleVerify 
                                : (step === 'create' ? handleCreateSubmit : handleConfirmSubmit)
                            }
                            disabled={
                                loading || 
                                (mode === 'verify' 
                                    ? pin.join('').length !== 4
                                    : (step === 'create' ? pin.join('').length !== 4 : confirmPin.join('').length !== 4)
                                )
                            }
                            className="flex-1 py-3 px-4 bg-[rgb(255,240,120)] text-black font-semibold rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[rgb(255,240,120)]/50"
                        >
                            {loading 
                                ? (mode === 'verify' ? 'VERIFYING...' : 'SUBMITTING...') 
                                : (mode === 'verify' 
                                    ? 'VERIFY' 
                                    : (step === 'create' ? 'CONTINUE' : 'SUBMIT')
                                  )
                            }
                        </button>
                    </div>

                    {/* Back button for confirm step - only in create mode */}
                    {mode !== 'verify' && step === 'confirm' && (
                        <button
                            onClick={() => {
                                setStep('create');
                                setError('');
                            }}
                            className="mt-4 text-sm text-white/40 hover:text-white underline"
                        >
                            ← Go back to create new PIN
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default TransactionPin;