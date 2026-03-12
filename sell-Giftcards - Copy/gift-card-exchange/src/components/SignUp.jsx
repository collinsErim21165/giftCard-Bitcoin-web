import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Assuming you have already configured Firebase
import { createUserWithEmailAndPassword, GoogleAuthProvider, getRedirectResult, sendEmailVerification, signInWithRedirect, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import google from '../assets/google.png';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import NairaNexus from "../assets/NairaNexus.png"

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVissible, setPasswordVissible] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVissible = () => {
      setPasswordVissible(!passwordVissible);
    }

    const handleSignUp = async (e) => {
        e.preventDefault();

        try {
            // Create a new user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update the user's profile with their full name
            await updateProfile(user, { displayName: fullName });

            // Send an email verification
            await sendEmailVerification(user);

            // Create a new user document in Firestore with an initial Naira balance of 0.00
            await setDoc(doc(db, "users", user.uid), {
                fullName: fullName,
                email: email,
                balance: 0.00,
                role: 'user',
            });

            // Redirect to the verification page
            navigate('/verify-email');

        } catch (error) {
            setError(error.message);
        }
    };

    const handleGoogleSignUp = async () => {
      const provider = new GoogleAuthProvider();
      try {
          await signInWithRedirect(auth, provider);
      } catch (error) {
          setError(error.message);
      }
    };

    // Handle the result when Google redirects back to the app
    useEffect(() => {
        getRedirectResult(auth).then(async (result) => {
            if (!result) return;
            const user = result.user;

            await setDoc(doc(db, "users", user.uid), {
                fullName: user.displayName,
                email: user.email,
                balance: 0.00,
                role: 'user',
            });

            navigate('/dashboard');
        }).catch((error) => {
            setError(error.message);
        });
    }, []);

    return (
        <div className='flex flex-col items-center gap-1 justify-center h-screen bg-[rgb(255,240,120)]'>
            <img src={NairaNexus} className='h-44 w-58 -mt-10 fixed left-0 top-0' alt="" /> 
            <h2 className='text-2xl font-bold'>Create Your Account</h2>
            <p className='text-lg text-slate-400'>Sign up your Naira-Nexus Account</p>
            <form onSubmit={handleSignUp} className='flex flex-col items-center justify-center gap-2 pt-3'>
              <div className='flex flex-col '>
                <span className='text-lg font-bold'>Full Name</span>
                <input  type="text" className='h-10 w-80  rounded-md border border-slate-100 pl-3'  placeholder="Enter your name"  value={fullName} onChange={(e) => setFullName(e.target.value)} required            />                
              </div>
              <div className='flex flex-col '>
                <span className='text-lg font-bold'>Email</span>
                <input  type="email" className='h-10 w-80 rounded-md border border-slate-100 pl-3'  placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className='flex flex-col i'>
                <span className='text-lg font-bold'>Password</span>
                <div className='relative flex'>
                  <input  type={passwordVissible ? 'text':'password' } className='h-10 w-80 rounded-md border border-slate-100 pl-3 relative' placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button onClick={togglePasswordVissible} className='absolute  left-72 pt-3'>{passwordVissible ?  <FaRegEye /> : <FaRegEyeSlash />  }</button>
                </div>
              </div>
            {error && <p>{error}</p>}
                <button type="submit"  className='w-80 h-10 rounded-xl font-bold cursor-pointer bg-black text-white mt-3'>Sign Up</button>
            </form>
            <div className='flex flex-row items-center justify-center gap-3 pt-3'>
              <div className='h-[2px] w-32  bg-slate-400 rounded-full'></div>
              <p className='font-bold '>Or</p>
              <div className='h-[2px] w-32  bg-slate-400 rounded-full'></div>
            </div>
            <button onClick={handleGoogleSignUp}  className='flex flex-row font-bold items-center justify-start pl-2 border-[4px] border-black rounded-xl w-80 h-10 gap-8 mt-4'>
              <img src={google} className='h-5 w-5 ' alt="" />
              SignUp with Google
            </button>
            <p className='pt-10 font-bold'>Already have an account?  <Link className='text-orange-500 font-bold' to='/Signin'>Log in</Link></p>
        </div>
    );
};

export default SignUp;