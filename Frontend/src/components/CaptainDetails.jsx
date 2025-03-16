import React, { useContext } from 'react'
import { CaptainDataContext } from '../context/CaptainContext.jsx'

function CaptainDetails() {

  const { captain } = useContext(CaptainDataContext)

  return (
    <div>
        <div className='flex items-center justify-between'>
              <div className='flex items-center justify-start gap-3'>
                <img className='h-10 w-10 rounded-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlv0zjWmdsmjxIL4cE-qpaLi-6F89HJ_JiKw&s" alt="" />
                <h4 className='text-lg font-medium capitalize'>{captain.fullname.firstname + " " + captain.fullname.lastname}</h4>
              </div>
              <div className='text-right'>
                <h3 className='text-lg font-semibold'>₹298.57</h3>
                <p className='text-sm text-gray-600 left-0'>Earned</p>
              </div>
            </div>
            <div className='flex p-4 mt-3 bg-gray-100 rounded-xl justify-center gap-5 items-start'>
              <div className='text-center'>
                <i className="font-thin mb-2 text-gray-400 text-3xl ri-time-line"></i>
                <h5 className='text-lg font-medium mb-2 mt-2'>10.2</h5>
                <p className='text-xs text-gray-400 uppercase'>Hours online</p>
              </div>
              <div className='text-center'>
                <i className="font-thin mb-2 text-gray-400 text-3xl ri-speed-up-line"></i>
                <h5 className='text-lg font-medium mb-2 mt-2'>30 KM</h5>
                <p className='text-xs text-gray-400 uppercase'>Total distance</p>
              </div>
              <div className='text-center'>
                <i className="font-thin mb-2 text-gray-400 text-3xl ri-booklet-line"></i>
                <h5 className='text-lg font-medium mb-2 mt-2'>24</h5>
                <p className='text-xs text-gray-400 uppercase'>Total jobs</p>
              </div>
            </div>
    </div>
  )
}

export default CaptainDetails