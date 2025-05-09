import axios from "axios";

const baseURL = "https://moveapp-app-58229.ondigitalocean.app/api";

//create axios instance
export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosInstanceAuthoraized = (token:string) => {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
