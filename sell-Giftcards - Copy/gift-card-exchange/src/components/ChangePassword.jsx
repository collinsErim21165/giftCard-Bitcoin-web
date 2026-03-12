import React, { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const ChangePassword = () => {
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const providerId = user.providerData[0]?.providerId;
      setIsGoogleUser(providerId === 'google.com');
    }
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);
      setMessage('Password updated successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Error updating password: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[rgb(18,18,18)] border border-white/10 p-6 rounded-md mt-10 mb-10">
      <h2 className="text-2xl font-bold mb-4 text-[rgb(255,240,120)]">Change Password</h2>

      {isGoogleUser ? (
        <div className="text-white/70">
          You signed in with Google. Password changes are managed through your Google account:
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgb(255,240,120)] underline ml-1"
          >
            Manage Google Account
          </a>
        </div>
      ) : (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 bg-black border border-white/20 text-white rounded focus:border-[rgb(255,240,120)] focus:outline-none placeholder:text-white/30"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 bg-black border border-white/20 text-white rounded focus:border-[rgb(255,240,120)] focus:outline-none placeholder:text-white/30"
            required
          />
          <button
            type="submit"
            className="w-full bg-[rgb(255,240,120)] text-black font-bold py-2 rounded hover:opacity-90"
          >
            Update Password
          </button>
        </form>
      )}

      {message && (
        <div className="mt-4 text-sm text-green-400 font-semibold">
          {message}
        </div>
      )}
    </div>
  );
};

export default ChangePassword;