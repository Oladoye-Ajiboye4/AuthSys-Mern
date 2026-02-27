import React from 'react'
import { Link } from 'react-router'

const Homepage = () => {
  return (
    <>
        <main className='flex flex-col justify-center gap-7 items-center w-full h-screen'>

            <h1 className='text-4xl font-bold '>Welcome to the AuthSys</h1>
            <div className='flex gap-4 font-bold text-lg text-white'>
                <Link className='bg-amber-700/70 p-5 rounded-2xl hover:bg-amber-700' to='/signin'><button>Sign In</button></Link>
                <Link className='bg-amber-700/70 p-5 rounded-2xl hover:bg-amber-700' to='/signup'><button>Sign Up</button></Link>

            </div>
        </main>
    
    </>
  )
}

export default Homepage