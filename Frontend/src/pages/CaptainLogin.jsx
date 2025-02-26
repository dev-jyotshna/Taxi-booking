import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function CaptainLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captainData, setCaptainData] = useState({})


  const submitHandler = (e) => {
    e.preventDefault();
    setCaptainData({
      email: email,
      password: password
    })
    setEmail('')
    setPassword('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-20 mb-2' src="..\uber-driver.svg" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="email" 
            placeholder='email@example.com'
          />
          
          <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
          <input 
            required 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-7 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Login</button>

          <p className='text-center'>Join a fleet? <Link to='/captain-signup' className='text-blue-600'> Register as a captain</Link></p>
        </form>
      </div>

      <div>
        <Link to='/login'
          className='bg-[#cd4204] flex items-center justify-center rounded mb-5 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
        >Sign in as User</Link>
      </div>
    </div>
  )
}

export default CaptainLogin