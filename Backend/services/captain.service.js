import { Captain } from "../models/captain.model.js";

export const createCaptain = async ({ 
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity) {
        throw new Error('All fields are required');
    }

    const captain = Captain.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    })

    return captain
}