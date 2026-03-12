import React, {useState} from 'react'
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail,  } from 'firebase/auth';
import NairaNexus from "../assets/NairaNexus.png";

const Forgetpassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
    
        try {
          await sendPasswordResetEmail(auth, email);
          setMessage('A Password reset email has been sent to your email address.');
    
        } catch (err) {
          setError('Failed to send reset email. Please check the email address and try again.')
        }
      };
  return (
    <div className='flex flex-col items-center justify-center gap-10 h-screen bg-[rgb(255,240,120)]'>
      <img src={NairaNexus} className='h-44 w-58 -mt-10 fixed left-0 top-0' alt="" /> 
    <div className='flex flex-col items-center justify-center'>
    <h1 className='font-bold text-2xl'>Forget Password</h1>
    <p className='text-center text-lg text-slate-400'>Enter your email and we'll send you a link <br /> to reset your password</p>
    </div>
    <form className='flex flex-col items-center justify-center gap-6 ' onSubmit={handleResetPassword}>
      <div className='flex flex-col gap-1'>
        <p className='font-bold text-xl'>Email</p>
        <input type="email" className='w-72 h-9  pl-3 rounded-md' value={email} onChange={(e) => setEmail(e.target.value)}  placeholder='Enter your email' required/>
        {error && <p style={{color : 'red'}}>{error}</p>}
      </div>
        <button type='submit' className='h-10 w-72  bg-black items-center font-bold text-white rounded-md'>Reset Password</button>
    </form>
    {message && <p className='top-8 absolute bg-green-600  px-4 py-4 transition'  style={{color : 'white '}}>{message}</p>}
    <Link to='/' className='text-orange-500'>Back to Login</Link>
  </div>
  )
}

export default Forgetpassword