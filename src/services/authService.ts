import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth/login`;

export const loginService = async (credentials: {
  username: string;
  password: string;
}) => {
  const response = await axios.post(API_URL, credentials);
  return response.data;
};
