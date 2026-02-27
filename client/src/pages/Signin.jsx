import React from 'react'
import { Link } from 'react-router'


const Signin = () => {
  return (
    <main className='flex flex-col justify-center gap-7 items-center w-full h-screen'>

            <h1 className='text-4xl font-bold '>Sign In</h1>
            <div className='flex gap-4 font-bold text-lg text-white'>
                <Link className='bg-amber-700/70 p-5 rounded-2xl hover:bg-amber-700' to='/signup'><button>Sign up</button></Link>
                <Link className='bg-red-700/70 p-5 rounded-2xl hover:bg-red-700' to='/'><button>Go Home</button></Link>

            </div>
        </main>
  )
}

export default Signin