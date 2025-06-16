import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
  withCredentials: true,
});

export const userServices = {
  getUser: () => {
    return api.get("/user");
  },
};
