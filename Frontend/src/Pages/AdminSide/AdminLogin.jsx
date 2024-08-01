import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { set_Authentication } from "../../Redux/authentication/authenticationSlice";
import { BASE_URL } from "../../utils/constants/Constants";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

function AdminLogin() {
  const [Error, setError] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError([]);
    const Data = new FormData();
    Data.append("email", event.target.email.value);
    Data.append("password", event.target.password.value);
    try {
      const res = await axios.post(BASE_URL + "auth/login", Data);
      if (res.status === 200) {
        const decodedToken = jwtDecode(res.data.access);
        if (res.data.isAdmin) {
          Cookies.set("access", res.data.access);
          Cookies.set("refresh", res.data.refresh);
          dispatch(
            set_Authentication({
              name: jwtDecode(res.data.access).first_name,
              isAuthenticated: true,
              isAdmin: res.data.isAdmin,
            })
          );
          toast.success("Login successful!");
          navigate("/admincontrol");
        }else{
          toast.error("Only admins can access this page.");
        }
        
        return res;
        
      }
      console.log('result is: ',Data.res)

    } catch (error) {
      console.log(error);
      toast.error(error.response.data.detail);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-5 sm:px-0">
      <div className="bg-blue-100 p-6 rounded-lg shadow-lg w-full max-w-sm">
        <form className="form" method="POST" onSubmit={handleLoginSubmit}>
          <p className="text-3xl text-blue-600 font-bold text-center">Admin Login</p>
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              name="email"
              className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
              type="email"
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              name="password"
              className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
              type="password"
              required
            />
          </div>
          
          <div className="mt-8">
            <button className="bg-blue-600 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-500">
              Login
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
