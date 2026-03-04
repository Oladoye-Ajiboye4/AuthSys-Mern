import React, { useState, useEffect } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import axios from 'axios';


const Dashboard = () => {
  const dashboardUrl = 'http://localhost:7890/getDashboard'
  const [user, setUser] = useState({})

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      errorNotify('No token found. Please sign in again.');
      return;
    }

    axios.get(dashboardUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((result) => {
        if (result.status === 200) {
          console.log(result.data);
          setUser(result.data.user);
          notify();
          
        } else if (result.status === 401 || result.status === 500 || result.status === 404) {
          errorNotify(result.data.message)
        } else {
          errorNotify('Unexpected server response. Try again later')  
        }
      })
      .catch((error) => {
        console.log(error)
        errorNotify(error?.response?.data?.message || 'Failed to fetch dashboard data')
      })
    
  }, [])

  // Toastify notification for successful sign in
  const notify = () => {
    toast.success(`Welcome Champ!`, {
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

  // Toastify notification for error 
  const errorNotify = (errorMessage) => {
    toast.error(`${errorMessage}`, {
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

  return (
    <>
      <div>Dashboard</div>
      <p>Welcome {user.username}!</p>
      <ToastContainer />
    </>
  )
}

export default Dashboard