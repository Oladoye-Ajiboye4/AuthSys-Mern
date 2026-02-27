import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import InputField from '../components/InputField';
import { Icon } from '@iconify/react';

const Signup = () => {
  const navigate = useNavigate();

  // Toastify notification for successful sign up
  const notify = () => {
    toast.success('Sign up Successful!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });
  };

  //Formik handles all form validations and state management
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validateOnMount: true,
    validationSchema: Yup.object({
      username: Yup.string()
        .matches(/^[a-zA-Z_][a-zA-Z0-9_]{2,29}$/, 'Invalid username')
        .required('Required'),
      email: Yup.string()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
        .required('Required'),
      password: Yup.string()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, 'At least 8 chars (uppercase, lowercase, number, special char)')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: values => {
      notify();
      setTimeout(() => {
        navigate('/signin');
      }, 1000);
    },
  });

  return (
    // Easil customize the Sign up page to your taste
    <main className='w-full h-screen flex justify-center items-center bg-linear-to-r from-purple-500 to-pink-500'>
      <div className='w-80 h-screen flex flex-col justify-center gap-7 items-center'>


        <form className='flex flex-col gap-4 w-80' onSubmit={formik.handleSubmit}>
          {/* Specify the input the fields  */}
          <h1 className='text-4xl font-bold text-center'>Sign Up</h1>
          <InputField type="text" name="username" placeholder="Username" formik={formik} />
          <InputField type="text" name="email" placeholder="Email" formik={formik} />
          <InputField type="password" name="password" placeholder="Password" formik={formik} />
          <InputField type="password" name="confirmPassword" placeholder="Confirm Password" formik={formik} />

          <button
            type='submit'
            className='bg-amber-500 p-3 mt-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold'
            disabled={!formik.isValid}
          >
            Sign Up
          </button>
        </form>

        <div className='flex gap-4 font-bold text-lg text-white'>
          <Link className='bg-amber-700 p-4 rounded-2xl hover:bg-amber-800' to='/signin'>Sign In</Link>
          <Link className='bg-red-700 p-4 rounded-2xl hover:bg-red-800' to='/'>Go Home</Link>
        </div>

        <div className='flex flex-col gap-5 w-full'>
          <button className='flex gap-3 justify-center items-center font-bold bg-blue-600 p-3 rounded-lg hover:bg-blue-700 text-white'>
            <Icon icon="material-icon-theme:google" width="25" height="25" />
            <span>Google</span>
          </button>
          <button className='flex gap-3 justify-center items-center font-bold bg-gray-800 p-3 rounded-lg hover:bg-gray-900 text-white'>
            <Icon icon="mdi:github" width="25" height="25" />
            <span>GitHub</span>
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" theme="light" transition={Bounce} />
    </main>
  )
}

export default Signup;