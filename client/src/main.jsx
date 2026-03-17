import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Homepage from "./pages/homepage/src/Homepage.jsx";
import Signup from "./pages/auth/signup/Signup.jsx";
import Signin from "./pages/auth/signin/Signin.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import ForgotPassword from "./pages/auth/forgotPassword/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/resetPassword/ResetPassword.jsx";
import CreateEventDP from "./pages/create_EventDP/CreateEventDP.jsx";
import PublicEventDP from "./pages/publicEventDP/PublicEventDP.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/create-eventdp",
    element: <CreateEventDP />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/eventdp/:slug",
    element: <PublicEventDP />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
