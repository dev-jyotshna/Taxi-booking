import React from 'react'

function WaitingForDriver(props) {
  return (
    <div>
      <h5 className='p-1 text-center absolute w-[93%] top-0' onClick={() => {
          props.waitingForDriver(false)
          }}>
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className='text-2xl font-semibold mb-5 '>Meet at the pickup point</h3>
        <div className='flex items-center justify-between'>
          <img className='h-10' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" alt="" />
          <div className='text-right'>
            <h2 className='text-sm font-medium uppercase text-gray-700 '>{props.ride?.captain.fullname.firstname}</h2>
            <h4 className='text-xl font-semibold uppercase -mt-1 -mb-1'>{props.ride?.captain.vehicle.plate}</h4>
            <p className='text-sm text-gray-600'>Maruti Suzuki Alto K10</p>
            <h1 className='text-lg font-semibold'> {props.ride?.otp}</h1>
          </div>
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
                <p className='text-sm -mt-1 text-gray-600'>Cash cash</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default WaitingForDriver