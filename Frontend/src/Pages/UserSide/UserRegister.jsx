import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants/Constants';

const UserRegister = () => {
  const [Data, setData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    re_password: "",
    user_type: "patient"
  });

  const { first_name, last_name, email, phone_number, password, re_password, user_type } = Data;

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({
      ...Data, [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // name validation
    if (!first_name || !last_name) {
      toast.error("Please enter a name");
    } else if (first_name.indexOf(" ") !== -1 || last_name.indexOf(" ") !== -1) {
      toast.error("Enter a valid name");
    }

    // email validation
    else if (!email) {
      toast.error('Please enter an email address');
    } else if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      toast.error('Invalid email address');
    }

    //phone number validation
    else if (!/^\d{10}$/.test(phone_number)) {
      toast.error('Invalid phone number. It should be exactly 10 digits.');
    }

    //password validation
    else if (password.trim() === "") {
      toast.error('Please enter password');
    } else if (password !== re_password) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        first_name, last_name, email, phone_number, password, re_password, user_type
        
      };
      console.log(userData)

      try {
        const response = await axios.post(BASE_URL + 'auth/signup/', userData);
        toast.success('Registration successful');
        setTimeout(() => {
          toast.success('OTP has been sent to your email, please check');
          navigate("/auth/verifyotp", {
            state: { email: userData.email, user_type: userData.user_type },
          });
        }, 4000); 
      } catch (error) {
        console.log(error);
        if (error.response && error.response.data) {
          toast.error(error.response.data.message || 'Registration failed');
        } else {
          toast.error('An unknown error occurred');
        }
        toast.error('Email already exists');
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 justify-center min-h-screen  py-6 sm:px-6 lg:px-8">
      <form className="form" onSubmit={handleSubmit}>
        <p className="text-3xl text-blue-600 font-bold text-center">Patient Register</p>
        <div className="rounded-md shadow-sm space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="first_name" className="sr-only">First Name</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={first_name}
                onChange={handleChange}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="First Name"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="last_name" className="sr-only">Last Name</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={last_name}
                onChange={handleChange}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="phone_number" className="sr-only">Phone Number</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={phone_number}
              onChange={handleChange}
              pattern="\d{10}"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Phone Number"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handleChange}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
          <div>
            <label htmlFor="re_password" className="sr-only">Confirm Password</label>
            <input
              id="re_password"
              name="re_password"
              type="password"
              value={re_password}
              onChange={handleChange}
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
        <div className="mt-2 text-center text-sm text-black">
          <div>Already have an account?</div>
          <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-200">Login</Link>
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
          <Link to="/auth/doctor/signup">
            <span className="relative w-full text-left transition-colors duration-200 ease-in-out group-hover:text-white dark:group-hover:text-gray-200">
              Register as A Doctor
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
