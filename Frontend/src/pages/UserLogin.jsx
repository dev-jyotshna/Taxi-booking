import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/userContext'
import axios from 'axios'

function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState({})

  const navigate = useNavigate()

  const { user, setUser } = useContext(UserDataContext)


  const submitHandler = async (e) => {
    e.preventDefault();
    
    const userData = {
      email: email,
      password: password
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData)

    if(response.status === 200) {
      const data = response.data
      setUser(data.user)
      localStorage.setItem('token', data.token)
      navigate('/home')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-16 mb-10' src="../src/assets/1659761100uber-logo-png.png" />
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

          <p className='text-center'>New here? <Link to='/signup' className='text-blue-600'> Create new Account</Link></p>
        </form>
      </div>

      <div>
        <Link to='/captain-login'
          className='bg-[#10b461] flex items-center justify-center rounded mb-5 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
        >Sign in as Captain</Link>
      </div>
    </div>
  )
}

export default UserLogin