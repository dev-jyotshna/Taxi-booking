import { validationResult } from "express-validator"
import { confirm_Ride, create_Ride, end_Ride, get_Fare, start_Ride } from "../services/ride.service.js";
import { getAddressCoordinate, getCaptainInTheRadius } from "../services/maps.service.js";
import { sendMessageToSocketId } from "../socket.js";
import { Ride } from "../models/ride.model.js";

export const createRide = async (req, res ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        const ride = await create_Ride({ user: req.user._id, pickup, destination, vehicleType});
        res.status(201).json(ride);

        const pickupCoordinates = await getAddressCoordinate(pickup)

        console.log(pickupCoordinates)

        const captainsInRadius = await getCaptainInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 2) //available captains in 2 km radius
        
        ride.otp = ""

        const rideWithUser = await Ride.findOne({ _id: ride._id }).populate('user');
        
        captainsInRadius.map(captain => {
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            })
        })
    }
    catch( err ) {
        return res.status(500).json({ message: err.message });
    }
}

export const getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { pickup, destination} = req.query;

    try {
        const fare = await get_Fare(pickup, destination);
        return res.status(200).json(fare);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { rideId } = req.body;

    try {
        const ride = await confirm_Ride({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })
        return res.status(200).json(ride);
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: err.message });
    }
}

export const startRide = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await start_Ride({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message});
    }
}

export const endRide = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await end_Ride({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message});
    }
}