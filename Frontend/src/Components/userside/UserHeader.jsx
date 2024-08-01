import React, { useEffect } from 'react';
import Logo from '../../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { set_Authentication } from '../../Redux/authentication/authenticationSlice';
import { toast } from "react-toastify";

const UserHeader = () => {
    const accessTocken = Cookies.get('access');
    const config = {
        headers: {
            Authorization: `Bearer ${accessTocken}`
        }
    };

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const authenticationUser = useSelector((state) => state.authentication_user);
    const { isAuthenticated,name } = authenticationUser || {};

    const handleLogOut = () => {
        Cookies.remove('access');
        Cookies.remove('refresh');

        dispatch(
            set_Authentication({
                name: null,
                isAuthenticated: false,
                isAdmin: false,
                is_doctor: false,
                user_id: null
            })
        );
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="flex justify-between items-center py-4 bg-white/80 backdrop-blur-md shadow-md w-full px-10">
            {/* Logo Container */}
            <div className="flex items-center">
                {/* Logo */}
                <NavLink to="/" className="cursor-pointer">
                    <img className="h-10 w-auto" src={Logo} alt="Store Logo" />
                </NavLink>
            </div>

            {/* Search bar */}
            <div className="flex items-center w-1/3 relative">
                <input
                    type="text"
                    placeholder="search..."
                    className="w-full px-4 py-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.8-6.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"></path>
                    </svg>
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-8 font-bold">
                <NavLink to="/" className="text-gray-800 hover:text-blue-500 transition-colors duration-300">Home</NavLink>
                <NavLink to="/doctor-list" className="text-gray-800 hover:text-blue-500 transition-colors duration-300">Find Doctor</NavLink>
                <NavLink to="/about-us" className="text-gray-800 hover:text-blue-500 transition-colors duration-300">About Us</NavLink>
                <NavLink to="/contact-us" className="text-gray-800 hover:text-blue-500 transition-colors duration-300">Contact Us</NavLink>
            </div>

            {/* Authentication Links */}
            <div className="flex space-x-5">
                {isAuthenticated ? (
                    <>
                        <NavLink to="/user-chat" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Messages</NavLink>
                        <NavLink to="/profile" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">My Profile</NavLink>
                        <button onClick={handleLogOut} className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Logout</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/auth/login" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Login</NavLink>
                        <NavLink to="/auth/signup" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Register</NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default UserHeader;
