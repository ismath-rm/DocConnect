import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/constants/Constants";
import Cookies from 'js-cookie';
import { set_Authentication } from "../../Redux/authentication/authenticationSlice";
import {jwtDecode} from "jwt-decode";
import { toast } from "react-toastify";

const DoctorLogin = () => {
  const { state } = useLocation();
  const [error, setError] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogSubmit = async (e) => {
    e.preventDefault();

    setError([]);

    const data = new FormData();
    data.append('email', e.target.email.value);
    data.append('password', e.target.password.value);

    try {
      const res = await axios.post(BASE_URL + 'auth/login', data);
      if (res.status === 200) {
        if (!res.data.is_doctor) {
          toast.error("Only Doctors can login from here.")
          navigate('/auth/doctor/login');
        }else{

        Cookies.set('access', res.data.access);
        Cookies.set('refresh', res.data.refresh);

        dispatch(
          set_Authentication({
            name: jwtDecode(res.data.access).first_name,
            isAuthenticated: true,
            is_doctor: res.data.is_doctor,
          })
        );
          toast.success("Login successful!");
          navigate('/doctor/doctorHome');
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-5 sm:px-0">
      <form className="form" method="POST" onSubmit={handleLogSubmit}> {/* Add onSubmit */}
        <p className="text-3xl text-blue-600 font-bold text-center">Doctor Login</p>
        <div className="mt-4">
          <label className="text-left block text-gray-700 text-sm font-bold mb-2">
            Email Address
          </label>
          <input
            className="text-gray-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
            type="email"
            id="email"
            name="email" // Add name attribute
            required
          />
        </div>
        <div className="mt-4 flex flex-col justify-between">
          <div className="flex justify-between">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
          </div>
          <input
            className="text-black-700 border border-gray-300 rounded py-2 px-4 block w-full focus:outline-2 focus:outline-blue-700"
            type="password"
            id="password"
            name="password" // Add name attribute
            required
          />
          <div className="text-xs text-black-700 hover:text-black-900 text-end w-full mt-2">
            Forget Password?
          </div>
        </div>
        <div className="mt-8">
          <button className="bg-blue-600 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-500">
            Login
          </button>
        </div>
        <div className="text-xs text-black capitalize text-center w-full">
          Don't have any account yet?
          <Link className="span" to="/auth/doctor/signup">Sign Up</Link>
        </div>
      </form>
      <div className="w-full h-40 flex items-center justify-center cursor-pointer">
        <div className="relative inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold shadow text-blue-600 transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:text-gray-200 dark:shadow-none group">
          <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-blue-600 group-hover:h-full" />
          <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              className="w-5 h-5 text-blue-500"
            >
              <path
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              className="w-5 h-5 text-white"
            >
              <path
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <Link to="/auth/login">
            <span className="relative w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white dark:group-hover:text-gray-200">
              Login as A Patient
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
