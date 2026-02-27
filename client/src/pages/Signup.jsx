import React from 'react'

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
    <div>Signup</div>
  )
}

export default Signup;