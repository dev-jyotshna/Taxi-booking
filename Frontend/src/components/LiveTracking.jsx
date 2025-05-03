import React, { useState, useEffect } from "react";
// import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

function LiveTracking() {
  const [currentPosition, setCurrentPosition] = useState(center);

  // To keep the map center updated dynamically
  const UpdatePosition = () => {
    useMapEvent("move", () => {});
    return null;
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
    });

    const watchId = navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({
        lat: latitude,
        lng: longitude,
      });
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        console.log("Position updated:", latitude, longitude);
        setCurrentPosition({
          lat: latitude,
          lng: longitude,
        });
      });
    };

    updatePosition(); //Initial position update

    const intervalId = setInterval(updatePosition, 1000); // update every 1 secs
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  //   return (
  //     <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
  //         <GoogleMap
  //             mapContainerStyle={containerStyle}
  //             center={currentPosition}
  //             zoom={15}
  //         >
  //             <Marker position={currentPosition} />
  //         </GoogleMap>
  //     </LoadScript>
  //   )

  return (
    <MapContainer
      style={containerStyle}
      center={currentPosition}
      zoom={15}
      scrollWheelZoom={false}
    >
      {/* OSM Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={currentPosition}>
        <Popup>Your current position</Popup>
      </Marker>
      <UpdatePosition />
    </MapContainer>
  );
}

export default LiveTracking;
