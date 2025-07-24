import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/vision", // Replace with your API base URL
});

export default api;
