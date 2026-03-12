import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { browserLocalPersistence, browserSessionPersistence, GoogleAuthProvider, setPersistence, signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import google from '../assets/google.png';
import { setDoc, getDoc, doc } from 'firebase/firestore';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import NairaNexus from "../assets/NairaNexus.png";

const SignIn = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState();
   const [rememberMe, setRememberMe] = useState(false);
   const [passwordVissible, setPasswordVissible] = useState(false);
   const [isSigningIn, setIsSigningIn] = useState(false);
   const navigate = useNavigate();

   const togglePasswordVissible = () => setPasswordVissible(!passwordVissible);

   const handleSignin = async (e) => {
      e.preventDefault();
      try {
         // Set persistence based on the Remember Me option
         await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

         const userCredential = await signInWithEmailAndPassword(auth, email, password);
         if (userCredential.user.emailVerified) {
            // Save login state in localStorage
            localStorage.setItem('loggedIn', JSON.stringify(rememberMe));
            
            // After login, navigate to the appropriate dashboard page
            navigate('/dashboard');
         } else {
            setError('User not verified');
         }
      } catch (error) {
         setError(error.message);
      }
   };

   const handleGoogleSignIn = async () => {
      if (isSigningIn) return;
      setIsSigningIn(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
         const result = await signInWithPopup(auth, provider);
         const user = result.user;

         const userDocRef = doc(db, 'users', user.uid);
         const userDoc = await getDoc(userDocRef);

         if (!userDoc.exists()) {
            await setDoc(userDocRef, {
               fullName: user.displayName || '',
               email: user.email || '',
               balance: 0.0,
               role: 'user',
            });
            navigate('/dashboard');
         } else {
            const userRole = userDoc.data().role;
            navigate(userRole === 'admin' ? '/Admin-Dashboard' : '/dashboard');
         }
      } catch (error) {
         if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
            setError(error.message);
         }
      } finally {
         setIsSigningIn(false);
      }
   };

   // Auto-redirect returning users who previously checked "Remember Me"
   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
         const loggedIn = JSON.parse(localStorage.getItem('loggedIn'));
         if (!user || !loggedIn) return;

         const userDocRef = doc(db, 'users', user.uid);
         const userDoc = await getDoc(userDocRef);

         if (userDoc.exists()) {
            const userRole = userDoc.data().role;
            navigate(userRole === 'admin' ? '/Admin-Dashboard' : '/dashboard');
         }
      });

      return () => unsubscribe();
   }, [navigate]);

   // Handle logout if no "Remember Me" was selected after inactivity (e.g., 4 hours)
   useEffect(() => {
      const loggedIn = JSON.parse(localStorage.getItem('loggedIn'));
      if (!loggedIn) return;

      const logoutTimeout = setTimeout(() => {
         auth.signOut();
         localStorage.removeItem('loggedIn'); // Remove login state after inactivity
         navigate('/signin'); // Redirect to the sign-in page
      }, 1000 * 60 * 60 * 4); // 4 hours of inactivity

      return () => clearTimeout(logoutTimeout);
   }, [navigate]);

   return (
      <div className='flex flex-col items-center justify-center h-screen bg-[rgb(255,240,120)]'>
         <img src={NairaNexus} className='h-44 w-58 -mt-10 fixed left-0 top-0' alt="" /> 
         <p className='text-2xl font-bold '>Welcome Back</p>
         <p className='text-lg text-slate-400'>Sign into your Naira-Nexus Account</p>
         <form onSubmit={handleSignin} className='flex flex-col items-center justify-center gap-3 pt-3'>
            <div className='flex flex-col'>
               <span className='text-xl font-bold'>Email</span>
               <input type="email" className='h-10 w-80 rounded-md border border-slate-100 pl-3' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' required />
            </div>
            <div className='flex flex-col'>
               <span className='text-xl font-bold'>Password</span>
               <div className='relative flex'>
                  <input type={passwordVissible ? 'text' : 'password'} className='h-10 w-80 rounded-md border border-slate-100 pl-3' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' required />
                  <button className='absolute left-72 pt-4' onClick={togglePasswordVissible}>
                     {passwordVissible ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
               </div>
            </div>
            <div className='flex flex-row items-center justify-center gap-16'>
               <label className='flex flex-row items-center justify-center cursor-pointer gap-2'>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Remember Me
               </label>
               <Link to='/forget-password' className='text-orange-500'>Forget Password?</Link>
            </div>
            <button type='submit' className='w-80 h-10 font-bold rounded-xl cursor-pointer bg-black text-white'>Sign in</button>
         </form>
         <div className='flex flex-row items-center justify-center gap-3 pt-5'>
            <div className='h-[2px] w-32 bg-slate-400 rounded-full'></div>
            <p className='font-bold'>Or</p>
            <div className='h-[2px] w-32 bg-slate-400 rounded-full'></div>
         </div>
         <button onClick={handleGoogleSignIn} className='flex flex-row items-center justify-start pl-2 border-[4px] border-black rounded-xl font-bold w-80 h-10 gap-8 mt-4'>
            <img src={google} className='h-5 w-5' alt="" />
            Sign in with Google
         </button>
         <p className='pt-10 font-bold'>Don't have an account yet? <Link to='/signup' className='text-orange-500 font-bold'>SignUp</Link></p>
         {error && <p>{error}</p>}
      </div>
   );
};

export default SignIn;