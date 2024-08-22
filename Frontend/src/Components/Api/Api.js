import axios from "axios";
import { BASE_URL } from '../../utils/constants/Constants'
import Cookies from 'js-cookie'


let accessToken;

if (!accessToken) {
  accessToken = Cookies.get("access");
}

export const UserImageAccess = axios.create({
    baseURL: `${process.env.VITE_BASE_URL}`,
    headers: {
      Accept: 'application/json',
      "Content-Type": "multipart/form-data",
    },
  });

  export const UserAPIwithAcess = axios.create({
    baseURL: `https://backend.footvibe.store/`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  export const AdminAPIwithAcess = axios.create({
    baseURL: `https://backend.footvibe.store/`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  export const AdminDashBoardAPI = axios.create({
    baseURL: `https://backend.footvibe.store/appointment/api/admin-transactions/`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });