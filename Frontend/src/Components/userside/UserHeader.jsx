// import React, { useState } from 'react';
// import Logo from '../../assets/logo.png';
// import { NavLink, useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { useDispatch, useSelector } from 'react-redux';
// import { set_Authentication } from '../../Redux/authentication/authenticationSlice';
// import { toast } from "react-toastify";

// const UserHeader = () => {
//     const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

//     const accessTocken = Cookies.get('access');
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const authenticationUser = useSelector((state) => state.authentication_user);
//     const { isAuthenticated, name } = authenticationUser || {};

//     const handleLogOut = () => {
//         Cookies.remove('access');
//         Cookies.remove('refresh');

//         dispatch(
//             set_Authentication({
//                 name: null,
//                 isAuthenticated: false,
//                 isAdmin: false,
//                 is_doctor: false,
//                 user_id: null
//             })
//         );
//         toast.success('Logged out successfully');
//         navigate('/');
//     };

//     return (
//         <nav className="flex justify-between items-center py-4 bg-white/80 backdrop-blur-md shadow-md w-full px-10">
//             {/* Logo Container */}
//             <div className="flex items-center">
//                 <NavLink to="/" className="cursor-pointer">
//                     <img className="h-10 w-auto" src={Logo} alt="Store Logo" />
//                 </NavLink>
//             </div>

//             {/* Links Section - Hidden on Small Screens */}
//             <div className="items-center hidden space-x-8 lg:flex">
//                 <NavLink to="/" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Home</NavLink>
//                 <NavLink to="/doctor-list" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Find Doctor</NavLink>
//                 <NavLink to="/about-us" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">About Us</NavLink>
//                 {/* <NavLink to="/contact-us" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Contact Us</NavLink> */}
//                 {isAuthenticated ? (
//                     <>
//                         <NavLink to="/booking-details" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Bookings</NavLink>
//                         <NavLink to="/profile" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">My Profile</NavLink>
//                         <NavLink to="/user-chat" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Messages</NavLink>
//                         <button onClick={handleLogOut} className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Logout</button>
//                     </>
//                 ) : (
//                     <>
//                         <NavLink to="/auth/login" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Login</NavLink>
//                         <NavLink to="/auth/signup" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Register</NavLink>
//                     </>
//                 )}
//             </div>

//             {/* Hamburger Icon for Small Screens */}
//             <div className="lg:hidden mt-1">
//                 <button
//                     className="text-gray-600 hover:text-blue-500 focus:outline-none focus:text-blue-500 transition-colors duration-300"
//                     onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
//                 >
//                     ☰
//                 </button>
//             </div>

//             {/* Mobile Menu Dropdown */}
//             {isMobileMenuOpen && (
//                 <div className="lg:hidden w-full mt-4">
//                     <div className="flex flex-col space-y-5">
//                         <NavLink to="/" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
//                         <NavLink to="/doctor-list" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Find Doctor</NavLink>
//                         <NavLink to="/about-us" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
//                         {/* <NavLink to="/contact-us" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Contact Us</NavLink> */}
//                         {isAuthenticated ? (
//                             <>
//                                 <NavLink to="/booking-details" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Bookings</NavLink>
//                                 <NavLink to="/profile" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>My Profile</NavLink>
//                                 <NavLink to="/user-chat" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Messages</NavLink>
//                                 <button onClick={handleLogOut} className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold">Logout</button>
//                             </>
//                         ) : (
//                             <>
//                                 <NavLink to="/auth/login" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Login</NavLink>
//                                 <NavLink to="/auth/signup" className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold" onClick={() => setMobileMenuOpen(false)}>Register</NavLink>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </nav>
//     );
// };

// export default UserHeader;

import React, { useState, useEffect } from "react";
import Logo from "../../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { set_Authentication } from "../../Redux/authentication/authenticationSlice";
import { toast } from "react-toastify";
import NotificationIcon from "../Notification/NotificationIcon";
import NotificationModal from "../Notification/NotificationModal";
import axios from "axios";
import { BASE_URL, WEBSOCKET } from "../../utils/constants/Constants";
import { Link } from "react-router-dom";

const UserHeader = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [customID, setCustomID] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authenticationUser = useSelector((state) => state.authentication_user);
  const { isAuthenticated, user_id } = authenticationUser || {};

  const fetchNotifications = async (customId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}notification/notifications/patient/${customId}/`
      );
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log('hey thisiswhat is was talking about');
    
    if (user_id) {
      axios.get(`${BASE_URL}auth/custom-id/patient/${user_id}`).then((res) => {
        console.log(res);
        
        const customId = res.data.id;
        fetchNotifications(customId);
        setCustomID(customId);

        if (!socket) {
          const wsURL = `${WEBSOCKET}ws/notification/patient/${customId}/`;
        
          const newSocket = new WebSocket(wsURL);
          setSocket(newSocket);

          newSocket.onopen = () => {
            console.log("WebSocket connection established");
          };

          newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotifications(data);
          };

          newSocket.onclose = (event) => {
            console.log("WebSocket connection closed", event);
          };

          return () => {
            if (newSocket) {
              newSocket.close();
            }
          };
        }
      });
    }

    // Cleanup function to close the WebSocket on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user_id, socket]);

  const handleLogOut = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");

    dispatch(
      set_Authentication({
        name: null,
        isAuthenticated: false,
        isAdmin: false,
        is_doctor: false,
        user_id: null,
      })
    );
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center py-4 bg-white/80 backdrop-blur-md shadow-md w-full px-10">
      {/* Logo Container */}
      <div className="flex items-center">
        <NavLink to="/" className="cursor-pointer">
          <img className="h-10 w-auto" src={Logo} alt="Store Logo" />
        </NavLink>
      </div>

      {/* Links Section - Hidden on Small Screens */}
      <div className="items-center hidden space-x-8 lg:flex">
        <NavLink
          to="/"
          className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
        >
          Home
        </NavLink>
        <NavLink
          to="/doctor-list"
          className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
        >
          Find Doctor
        </NavLink>
        <NavLink
          to="/about-us"
          className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
        >
          About Us
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink
              to="/booking-details"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Bookings
            </NavLink>
            <NavLink
              to="/profile"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              My Profile
            </NavLink>
            <NavLink
              to="/user-chat"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Messages
            </NavLink>
            <Link
              className="nav-links pt-2"
              onClick={() =>
                setIsNotificationModalOpen(!isNotificationModalOpen)
              }
            >
              <NotificationIcon />
            </Link>
            <button
              onClick={handleLogOut}
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/auth/login"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Login
            </NavLink>
            <NavLink
              to="/auth/signup"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Register
            </NavLink>
          </>
        )}
      </div>

      {/* Hamburger Icon for Small Screens */}
      <div className="lg:hidden mt-1">
        <button
          className="text-gray-600 hover:text-blue-500 focus:outline-none focus:text-blue-500 transition-colors duration-300"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full mt-4">
          <div className="flex flex-col space-y-5">
            <NavLink
              to="/"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/doctor-list"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Doctor
            </NavLink>
            <NavLink
              to="/about-us"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/booking-details"
                  className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bookings
                </NavLink>
                <NavLink
                  to="/profile"
                  className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/user-chat"
                  className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </NavLink>
                <button
                  onClick={handleLogOut}
                  className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/auth/login"
                  className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/signup"
                  className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        data={notifications}
        customID = {user_id}

      />
    </nav>
  );
};

export default UserHeader;
