import React from "react";

function VehiclePanel(props) {
  if (!props.fare || !props.fare.eta) {
    return <div>Loading fare details...</div>;
  }
  return (
    <div>
      <h5
        className="p-1 text-center absolute w-[93%] top-0"
        onClick={() => {
          props.setVehiclePanelOpen(false);
        }}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-5 ">Choose a Vehicle</h3>

      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.setVehiclePanelOpen(false);
          props.selectVehicle("car");
        }}
        className="flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between "
      >
        <img
          className="h-13"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png"
          alt=""
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-lg">
            UberGo{" "}
            <span>
              <i className="ri-user-3-fill"></i>
              <sub>4</sub>
            </span>
          </h4>
          <h5 className="font-medium text-sm">
            {props.fare.eta.car} mins away
          </h5>
          <p className=" text-xs text-gray-600">Affordable, compact rides</p>
        </div>
        <h2 className="text-lg font-semibold">₹{props.fare.car}</h2>
      </div>
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.setVehiclePanelOpen(false);
          props.selectVehicle("moto");
        }}
        className="flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between "
      >
        <img
          className="h-13"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png"
          alt=""
        />
        <div className=" w-1/2">
          <h4 className="font-medium text-lg">
            Moto{" "}
            <span>
              <i className="ri-user-3-fill"></i>
              <sub>1</sub>
            </span>
          </h4>
          <h5 className="font-medium text-sm">
            {props.fare.eta.moto} mins away
          </h5>
          <p className=" text-xs text-gray-600">Affordable motorcycle rides</p>
        </div>
        <h2 className="text-lg font-semibold">₹{props.fare.moto}</h2>
      </div>
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.setVehiclePanelOpen(false);
          props.selectVehicle("auto");
        }}
        className="flex active:border-2 border-black rounded-xl mb-2 w-full p-3 items-center justify-between "
      >
        <img
          className="h-15"
          src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
          alt=""
        />
        <div className="ml-2 w-1/2">
          <h4 className="font-medium text-lg">
            UberAuto{" "}
            <span>
              <i className="ri-user-3-fill"></i>
              <sub>3</sub>
            </span>
          </h4>
          <h5 className="font-medium text-sm">
            {props.fare.eta.auto} mins away
          </h5>
          <p className=" text-xs text-gray-600">Affordable auto rides</p>
        </div>
        <h2 className="text-lg font-semibold">₹{props.fare.auto}</h2>
      </div>
    </div>
  );
}

export default VehiclePanel;
