import React from 'react'

function LocationSearchPanel(props) {    
    
    // sample array of location
    const locations = [
        'Chhattarpur Mandir, Chhattarpur, New Delhi',
        'DAV, R.K. Puram, New Delhi',
        '7A, Singhania Hotel, Hauz Khas, New Delhi ',
        'Gungnam, Majnu ka tilla, New Delhi'
    ]
  return (
    <div>
        {/* this is just a sample data */}
        {
            locations.map(function(elem, idx) {
                return <div key={idx} onClick={() => {
                    props.setVehiclePanelOpen(true)
                    props.setPanelOpen(false)
                }} className='flex gap-4 border-2 p-3 rounded-xl items-center my-2 justify-start border-gray-100 active:border-black '>
                            <h2 className='bg-[#eee] h-10 w-12 flex items-center justify-center rounded-full'><i className="ri-map-pin-2-fill"></i></h2>
                            <h4 className='font-medium'>{elem}</h4>
                        </div>
            })
        }
        
    </div>
  )
}

export default LocationSearchPanel