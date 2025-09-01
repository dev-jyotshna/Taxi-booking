# 🚖 Uber Clone(Taxi booking) – MERN + OpenStreetMap / Google Maps API

A full-stack Uber-clone application built with the **MERN stack** and powered by **OpenStreetMap (OSM)/ Google Maps API** for real-time ride booking.

The app allows users to:

- Search and set pickup & destination locations
- View live maps with interactive markers
- Choose vehicle type (Car, Auto, Moto)
- See dynamic fare calculation & ETA
- Enjoy a responsive and smooth UI experience

---

## 📸 Demo & Preview

### 🎥 Video Demo

- Watch them both \
  👉 [Watch the demo for USER](/Frontend/assetreadme/User%20Taxi%20Booking%20App.mp4)  
  👉 [Watch the demo for DRIVER](/Frontend/assetreadme/Driver%20Taxi%20Booking%20App.mp4)

### Screenshots

<p align="center">

  <img src="/Frontend/assetreadme/4.png" alt="Welcome" width="250"/>
  <img src="/Frontend/assetreadme/5.png" alt="User Login" width="250"/>
  <img src="/Frontend/assetreadme/7.png" alt="User Create Account" width="250"/>
  <img src="/Frontend/assetreadme/8.png" alt="User Home" width="250"/>
  <img src="/Frontend/assetreadme/9.png" alt="Pick up & Destination" width="250"/>
  <img src="/Frontend/assetreadme/12.png" alt="Choose Vehicle" width="250"/>
  <img src="/Frontend/assetreadme/15.png" alt="Searching your ride" width="250"/>
  <img src="/Frontend/assetreadme/16.png" alt="Captain Create Account" width="250"/>
  <img src="/Frontend/assetreadme/20.png" alt="Captain Login" width="250"/>
  <img src="/Frontend/assetreadme/19.png" alt="Captain Home" width="250"/>
</p>

---

## ⚙️ Features

- 🔍 **Location search panel** for pickup and destination
- 🗺️ **Seamless OpenStreetMap integration** with Leaflet.js
- 📍 **Interactive pickup & destination markers**
- 🚗 **Multiple vehicle options** with custom fare rules
- ⏱️ **ETA calculation** based on distance
- 📊 **Dynamic fare calculation per vehicle type**
- 🎨 **Clean, modern UI with React + Tailwind CSS**

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Leaflet.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Maps & Geocoding:** OpenStreetMap (Leaflet.js, Nominatim API)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (>=16)
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/dev-jyotshna/Taxi-booking.git

# Navigate into the project
cd Taxi-booking

# Install dependencies for both client & server
cd Frontend && npm install
cd ../Backend && npm install

# Start backend
cd Backend && npx nodemon

# Start frontend
cd Frontend && npm run dev
```

---

## 🧭 Usage

- Enter pickup and destination addresses
- Select a vehicle type (Car, Auto, Moto)
- View fare estimate and ETA
- Watch the route & markers update on the map

---

## 📂 Project Structure

```plaintext
uber-clone/
│
├── client/        # React frontend (UI, maps, panels)
├── server/        # Node.js + Express backend (APIs, fare logic)
├── assets/        # Screenshots & demo videos
└── README.md
```

---

## 📌 Roadmap

- Implement user authentication (signup/login)
- Build driver-side interface
- Enable real-time ride requests with WebSockets
- Add payment gateway integration
- Deploy to cloud (Vercel + Render/Heroku)

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to improve.

---

## 📜 License

This project is licensed under the MIT License.
