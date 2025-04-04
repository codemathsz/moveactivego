import axios from "axios";

const baseURL = "http://177.11.121.8:8130/api";

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
