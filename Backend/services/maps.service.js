import axios from "axios";
import { Captain } from "../models/captain.model.js";

// export const getAddressCoordinate = async (address) => {
//     const apiKey = process.env.GOOGLE_MAPS_API;
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

//     try {
//         constresponse = await axios.get(url);
//         if (response.data.status === 'OK') {
//             const location = response.data.results[0].geometry.location;
//             return {
//                 ltd: location.lat,
//                 lng: location.lng
//             };
//         } else {
//             throw new Error('Unable to fetch coordinates');
//         }
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }

// }

export const getAddressCoordinate = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json`;

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "YourAppName/1.0" }, // required by Nominatim
    });

    if (response.data.length > 0) {
      const location = response.data[0];
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// export const getDistance_Time = async (origin, destination) => {
//   if (!origin || !destination) {
//     throw new Error("Origin and destination are required");
//   }

//   const apiKey = process.env.GOOGLE_MAPS_API;

//   const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
//     origin
//   )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     if (response.data.status === "OK") {
//       if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
//         throw new Error("No routes found");
//       }

//       return response.data.rows[0].elements[0];
//     } else {
//       throw new Error("Unable to fetch distance and time");
//     }
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// };

export const getDistance_Time = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  // Log if API key is missing
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    console.error("ORS API key is missing");
    throw new Error("ORS API key is not set");
  }

  const coordinates = [
    [origin.lng, origin.lat],
    [destination.lng, destination.lat],
  ];

  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

  try {
    const response = await axios.post(
      url,
      { coordinates },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = response.data.routes[0].summary;
    return {
      distance: { value: summary.distance }, // in meters
      duration: { value: summary.duration }, // in seconds
    };
  } catch (err) {
    // ✅ Step 4: Log the detailed error
    if (err.response) {
      console.error("ORS API Error:", err.response.data);
    } else {
      console.error("General Error:", err.message);
    }
    throw new Error("Unable to fetch distance and time");
  }
};

// export const getSuggestions = async (input) => {
//   if (!input) {
//     throw new Error("query is required");
//   }

//   const apiKey = process.env.GOOGLE_MAPS_API;

//   const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//     input
//   )}&key=${apiKey}`;

//   try {
//     const response = await axios.get(url);
//     if (response.data.status === "OK") {
//       return response.data.predictions
//         .map((prediction) => prediction.description)
//         .filter((value) => value);
//     } else {
//       throw new Error("Unable to fetch suggestions");
//     }
//   } catch (err) {
//     console.error(err);
//     throw err;
//   }
// };

export const getSuggestions = async (input) => {
  if (!input) {
    throw new Error("Query is required");
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    input
  )}&addressdetails=1&limit=5`;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "YourAppName/1.0 (your@email.com)", // required by Nominatim usage policy
      },
    });

    if (response.data.length === 0) {
      throw new Error("No suggestions found");
    }

    return response.data.map((place) => place.display_name);
  } catch (err) {
    console.error("Nominatim API error:", err.message);
    throw new Error("Unable to fetch suggestions");
  }
};

// export const getCaptainInTheRadius = async (ltd, lng, radius) => {
//   //radius in km

//   const captains = await Captain.find({
//     location: {
//       $geoWithin: {
//         $centerSphere: [[ltd, lng], radius / 6378],
//       },
//     },
//   });
//   return captains;
// };

export const getCaptainInTheRadius = async (lat, lng, radius) => {
  const captains = await Captain.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius / 6378], // radius in radians
      },
    },
  });
  return captains;
};
