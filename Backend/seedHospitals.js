require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const Hospital = require("./src/models/hospital");

const hospitals = [
  {
    name: "Holy Family Hospital",
    address: "Satellite Town, Rawalpindi",
    phone: "051-9290301",
    latitude: 33.6269,
    longitude: 73.0716,
    isAvailable: true,
  },
  {
    name: "Benazir Bhutto Hospital",
    address: "Murree Road, Rawalpindi",
    phone: "051-9290401",
    latitude: 33.6007,
    longitude: 73.0679,
    isAvailable: true,
  },
  {
    name: "District Headquarters Hospital",
    address: "Asghar Mall Road, Rawalpindi",
    phone: "051-9290501",
    latitude: 33.5985,
    longitude: 73.0479,
    isAvailable: true,
  },
  {
    name: "Pakistan Institute of Medical Sciences (PIMS)",
    address: "Islamabad",
    phone: "051-9261170",
    latitude: 33.6938,
    longitude: 73.0652,
    isAvailable: true,
  },
  {
    name: "Shifa International Hospital",
    address: "H-8/4, Islamabad",
    phone: "051-4603666",
    latitude: 33.6844,
    longitude: 73.0479,
    isAvailable: true,
  },
  {
    name: "CMH Rawalpindi",
    address: "Mall Road, Rawalpindi",
    phone: "051-9273421",
    latitude: 33.5822,
    longitude: 73.0551,
    isAvailable: true,
  },
  {
    name: "Poly Clinic Hospital",
    address: "G-6, Islamabad",
    phone: "051-9208132",
    latitude: 33.7076,
    longitude: 73.0903,
    isAvailable: false,
  },
  {
    name: "Kulsum International Hospital",
    address: "Blue Area, Islamabad",
    phone: "051-8446666",
    latitude: 33.7070,
    longitude: 73.0498,
    isAvailable: true,
  }
];

const seed = async () => {
  try {
    await connectDB();

    await Hospital.deleteMany();
    await Hospital.insertMany(hospitals);

    console.log("✅ Hospitals seeded successfully");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();