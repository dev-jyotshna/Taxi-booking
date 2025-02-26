import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
        <div className='bg-cover bg-[url(https://images.unsplash.com/photo-1538563188159-070c4db2bc65?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-screen  pt-15 flex justify-between flex-col w-full '>
            <img className='w-14 ml-9' src="../../1659761100uber-logo-png.png" />
            <div className='bg-white pb-7 py-4 px-4'>
                <h2 className='text-3xl font-bold '>Get started with Uber</h2>
                <Link to='/login' className='flex items-center justify-center w-full  bg-black text-white py-3 rounded mt-4'>Continue</Link>
            </div>
        </div>
    </div>
  )
}

export default Home