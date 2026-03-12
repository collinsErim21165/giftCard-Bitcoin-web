import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    setSubmitting(true);
    setError('');

    try {
      const user = auth.currentUser;

      // Save reason to Firestore
      await addDoc(collection(db, 'accountDeletionReasons'), {
        uid: user.uid,
        email: user.email,
        reason,
        timestamp: serverTimestamp(),
      });

      // Delete user account
      await deleteUser(user);

      // Redirect after deletion
      navigate('/signin'); // or use '/' for home page
    } catch (err) {
      console.error(err);
      setError('Failed to delete account. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[rgb(18,18,18)] border border-white/10 p-6 rounded mt-12 mb-10">
      <h2 className="text-2xl font-bold mb-4 text-red-500">Delete Account</h2>
      <p className="mb-3 text-white/70">
        We're sorry to see you go. Please let us know why you're leaving:
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Your reason for leaving..."
        className="w-full bg-black border border-white/20 text-white p-3 rounded resize-none h-32 focus:border-[rgb(255,240,120)] focus:outline-none placeholder:text-white/30"
        required
      />

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <button
        onClick={handleDeleteAccount}
        disabled={submitting || !reason}
        className="w-full mt-4 bg-red-700 text-white py-2 px-4 rounded hover:bg-red-900 disabled:opacity-50"
      >
        {submitting ? 'Deleting Account...' : 'Proceed to Delete Account'}
      </button>
    </div>
  );
};

export default DeleteAccount;