import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

function CaptainSignUp() {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [ vehicleColor, setVehicleColor ] = useState('')
  const [ vehiclePlate, setVehiclePlate ] = useState('')
  const [ vehicleCapacity, setVehicleCapacity ] = useState('')
  const [ vehicleType, setVehicleType ] = useState('')

  const { captain, setCaptain } = useContext(CaptainDataContext)

  const submitHandler = async (e) => {
    e.preventDefault();
    const newCaptain = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType: vehicleType
      }
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, newCaptain)

    if (response.status === 201) {
      const data = response.data
      setCaptain(data.captain)
      localStorage.setItem('token', data.token)
      navigate('/captain-home')
    }
    
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setVehicleColor('')
    setVehiclePlate('')
    setVehicleCapacity('')
    setVehicleType('')
  }

  return (
    <div className='p-5 h-screen flex flex-col justify-between'>
      <div>
      <img className='w-20 mb-2' src="../src/assets/uber-driver.svg" />
      <form onSubmit={(e) => {
          submitHandler(e)
        }}>
          <h3 className='text-lg font-medium mb-2'>What's your name?</h3>
          <div className='flex gap-4 mb-5'>
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='First name'
              value={firstName}
              onChange={(e) =>{
                setFirstName(e.target.value)
              }}
            />
            <input 
              required 
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Last name'
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
          <h3 className='text-lg font-medium mb-2'>What's your email?</h3>
          <input 
            required 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className='bg-[#eeeeee] rounded mb-5 px-4 py-2  w-full text-lg placeholder:text-base'
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
            className='bg-[#eeeeee] rounded mb-5 px-4 py-2  w-full text-lg placeholder:text-base'
            type="password" 
            placeholder='password'
          />

          <h3 className='text-lg font-medium mb-2'>Vehicle Information</h3>
          <div className='flex gap-4 mb-5'>
            <input 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Vehicle Color'
              value={vehicleColor}
              onChange={(e) => {
                setVehicleColor(e.target.value)
              }}
            />
            <input 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Vehicle Plate'
              value={vehiclePlate}
              onChange={(e) => {
                setVehiclePlate(e.target.value)
              }}
            />
          </div>
          <div className='flex gap-4 mb-5'>
            <input 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              placeholder='Vehicle Capacity'
              value={vehicleCapacity}
              onChange={(e) => {
                setVehicleCapacity(e.target.value)
              }}
            />
            <select 
              required
              className='bg-[#eeeeee] rounded w-1/2 px-4 py-2 text-lg placeholder:text-base'
              type="text" 
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value)
              }}
            >
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
          <button
            className='bg-[#111] rounded mb-3 px-4 py-2  w-full text-lg text-white font-semibold placeholder:text-base'
          >Create Captain Account</button>

          <p className='text-center'>Already have an account? <Link to='/captain-login' className='text-blue-600'> Login here</Link></p>
        </form>
      </div>

      <div>
        <p className='text-[10px] mt-6 leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span></p>
      </div>
    </div>
  )
}

export default CaptainSignUp