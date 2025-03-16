import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function ConfirmRidePopUp(props) {

    const [otp, setOtp] = useState('')
    const navigate = useNavigate()

    const submitHandler = async (e) => {
        e.preventDefault()

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/start-ride`, {
          params: {
            rideId: props.ride._id,
            otp: otp
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.status === 200) {
          props.setConfirmRidePopUpPanel(false)
          props.setRidePopUpPanel(false)
          navigate('/captain-riding', { state: { ride: props.ride }})
        }
    }
  return (
    <div>
        <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
            props.setRidePopUpPanel(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Confirm this ride to Start</h3>
        <div className='flex items-center justify-between mt-3 p-3 bg-blue-200 rounded-lg'>
            <div className='flex items-center gap-3'>
            <img className='h-12 w-12 rounded-full object-cover' src="https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            <h2 className='text-lg font-medium capitalize'>{props.ride?.user.fullname.firstname}</h2>
            </div>
            <h5 className='text-lg font-semibold'>2.2 KM</h5>
        </div>
        
        <div className='flex gap-2 justify-between items-center flex-col'>
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>562/11-A</h3>
                <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹{props.ride?.fare}</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
              </div>
            </div>
          </div>
          {/* Confirm OTP */}

          <div className='mt-6 w-full'>
            <form onSubmit={submitHandler}>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" className='bg-[#eee] px-6 py-4 text-lg rounded-lg w-full mt-3 font-mono' placeholder='Enter OTP'/>
                <button className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>Confirm</button>
                <button onClick={() => {
                    props.setConfirmRidePopUpPanel(false)
                    props.setRidePopUpPanel(false)
                }} className='w-full mt-1 bg-red-700 text-lg text-white font-semibold p-3 rounded-lg'>Cancel</button>
            </form>
          </div>
        </div>
    </div>
  )
}

export default ConfirmRidePopUp