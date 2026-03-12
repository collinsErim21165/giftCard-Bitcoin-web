import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig'; // adjust this path to your firebase config file
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Loader from '../components/Loader'

const ProfileInfo = () => {
  const [uid, setUid] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || '');
          setEmail(data.email || '');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!uid) return;

    try {
      await updateDoc(doc(db, 'users', uid), {
        fullName,
        email,
      });
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
      setMessageType('error');
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  if (loading) return <Loader/>;

  return (
    <div className='flex flex-col md:gap-6 gap-4 md:pl-5 md:pt-4 h-60'>
      

      <h1 className='font-bold text-xl text-[rgb(255,240,120)]'>Edit Profile</h1>

      <div className='flex flex-row items-center gap-3'>
        <span className='font-bold text-white/70'>Full Name:</span>
        <input
          type="text"
          value={fullName}
          className='h-[5vh] md:w-[15vw] sm:w-[35vw] pl-2 bg-black border border-white/20 text-white rounded-md focus:border-[rgb(255,240,120)] focus:outline-none'
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className='flex flex-row items-center md:gap-3 gap-0'>
        <span className='font-bold text-white/70'>Email Address:</span>
        <input
          type="text"
          value={email}
          className='md:h-[5vh] h-[6vh] md:w-[20vw] w-[51vw] pl-1 bg-black border border-white/20 text-white rounded-md focus:border-[rgb(255,240,120)] focus:outline-none'
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        className="mt-6 w-72 bg-[rgb(255,240,120)] text-black hover:opacity-90 font-bold py-2 px-4 rounded-md"
        onClick={handleSave}
      >
        Save Changes
      </button>

      {message && (
        <div className={`p-3 rounded-md w-fit border ${messageType === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;