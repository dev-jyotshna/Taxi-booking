import React, { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext'
import LiveTracking from '../components/LiveTracking'

function Riding() {
  const location = useLocation()
  const { ride } = location.state ||{} // Retrieve ride data
  const { socket } = useContext(SocketContext)
  const navigate = useNavigate()

  socket.on("ride-ended", () => {
    navigate('/home')
  })

  return (
    <div className='h-screen'>
        <Link to='/home' className='fixed h-10 w-10 right-2 top-2 bg-white flex items-center justify-center rounded-full'>
            <i className="text-lg font-medium ri-home-5-line"></i>
        </Link>
        <div className='h-1/2'>
            <LiveTracking />
        </div>
        <div className='h-1/2 p-4'>
            <div className='flex items-center justify-between'>
                <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
                <div className='text-right'>
                    <h2 className='text-sm font-medium uppercase text-gray-700 '>{ride?.captain.fullname.firstname}</h2>
                    <h4 className='text-xl font-semibold uppercase -mt-1 -mb-1'>{ride?.captain.vehicle.plate}</h4>
                    <p className='text-sm text-gray-600'>Maruti Suzuki Alto K10</p>
                </div>
            </div>

        <div className='flex gap-2 justify-between items-center flex-col'>
          <div className='w-full mt-5'>
            
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>98-G</h3>
                <p className='text-sm -mt-1 text-gray-600'>{ride?.destination}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3'>
              <i className="test-lg ri-wallet-3-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>₹{ride?.fare}</h3>
                <p className='text-sm -mt-1 text-gray-600'>Cash cash</p>
              </div>
            </div>
          </div>
        </div>
            <button className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Make a Payment</button>
        </div>
    </div>
  )
}

export default Riding