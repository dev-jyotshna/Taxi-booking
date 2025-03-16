import React, { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

function CaptainRiding(props) {
    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRidePanelRef = useRef(null)
    const location = useLocation()
    const rideData = location.state?.ride
  
    useGSAP(function() {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: 'translateY(0)'
        })
      }
      else {
        gsap.to(finishRidePanelRef.current, {
          transform: 'translateY(100%)'
        })
      }
    }, [finishRidePanel])

  return (
    <div className='h-screen'>
        <div className='fixed p-3 top-0 flex items-center justify-between w-full'>
          <img className='w-16' src="../src/assets/uber-driver.svg" alt="" />
          <Link to='/captains/logout' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
              <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
        <div className='h-4/5'>
            <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />

        </div>
        <div className='h-1/5 p-6 flex items-center justify-between bg-yellow-400 relative'
        onClick={()=>{
            setFinishRidePanel(true)
        }}>
            <h5 className='p-1 text-center absolute w-[95%] top-0' onClick={() => {
                props.setFinishRidePanel(false)
            }}>
            <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
            </h5>
            <h4 className='text-xl font-semibold'>1.6 KM away</h4>
            <button className=' bg-green-600 text-white font-semibold p-3 px-8 rounded-lg'>Complete Ride</button>
        </div>
        <div ref={finishRidePanelRef} className='fixed h-screen w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 rounded-xl translate-y-full'>
          <FinishRide 
            ride={rideData}
            setFinishRidePanel={setFinishRidePanel}/>
        </div>
        
    </div>
  )
}

export default CaptainRiding