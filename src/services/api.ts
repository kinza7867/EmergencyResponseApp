import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.4:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");

   console.log("BASE URL:", config.baseURL);
console.log("ENDPOINT:", config.url);
    console.log("TOKEN:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;