import React, { useState, useEffect } from "react";
import Logo from "../../assets/logo.png";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { set_Authentication } from "../../Redux/authentication/authenticationSlice";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import NotificationIcon from "../Notification/NotificationIcon";
import NotificationModal from "../Notification/NotificationModal";
import axios from "axios";
import { BASE_URL } from "../../utils/constants/Constants";

const DoctorHeader = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notification, setNotification] = useState([]);
  const [data, setData] = useState(null);
  const [customID, setCustomID] = useState(null);
  const [socket, setSocket] = useState(null); // State to keep track of WebSocket

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authenticationUser = useSelector((state) => state.authentication_user);
  const { isAuthenticated, user_id } = authenticationUser || {};

  const fetchData = async (customId) => {
    console.log("custom id in notification:", customId);
    try {
      const response = await axios.get(
        `${BASE_URL}notification/notifications/doctor/${customId}/`
      );
      setNotification(response.data.notifications);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user_id) {
      axios.get(`${BASE_URL}auth/custom-id/doctor/${user_id}`).then((res) => {
        const customId = res.data.doctor_user.custom_id;
        fetchData(customId);
        setCustomID(customId);

        if (!socket) {
          // Only create a new WebSocket if one doesn't already exist
          const wsURL = `ws://127.0.0.1:8000/ws/notification/doctor/${customId}/`;
          const newSocket = new WebSocket(wsURL);
          setSocket(newSocket);

          console.log(wsURL);

          newSocket.onopen = () => {
            console.log("WebSocket connection established");
          };

          newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setData(data);
          };

          newSocket.onclose = (event) => {
            console.log("WebSocket connection closed", event);
          };

          return () => {
            if (newSocket) {
              newSocket.close(); // Clean up the WebSocket when the component unmounts
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
  }, [user_id, socket]); // Add customID as a dependency if it's supposed to change
  // Note: socket is intentionally not added to dependencies to avoid triggering re-renders

  const handleLogOut = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");

    dispatch(
      set_Authentication({
        name: null,
        isAuthenticated: false,
      })
    );
    toast.success("Logged out successfully");
    navigate("/auth/doctor/login");
  };

  return (
    <nav className="flex items-center justify-between py-4 bg-white/80 backdrop-blur-md shadow-md w-full px-10">
      {/* Logo Container */}
      <div className="flex items-center">
        <a className="cursor-pointer">
          <img className="h-10 w-auto" src={Logo} alt="Store Logo" />
        </a>
      </div>

      {/* Links Section - Hidden on Small Screens */}
      <div className={`items-center hidden space-x-8 lg:flex`}>
        <NavLink
          to="/doctor/doctorHome"
          className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
        >
          Home
        </NavLink>
        <NavLink
          to="aboutUs"
          className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
        >
          About Us
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink
              to="/doctor/profile/"
              className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              My Profile
            </NavLink>
            <NavLink
              to="slot"
              className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Slot
            </NavLink>
            <NavLink
              to="/doctor/chat"
              className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Messages
            </NavLink>
            <NavLink
              to="accountDetails"
              className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Account details
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
              className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Logout
            </button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <NavLink
              to="/auth/doctor/login"
              className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
            >
              Login
            </NavLink>
            <NavLink
              to="/auth/doctor/signup"
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
          className="text-gray-600 hover:text-blue-500 focus:outline-none focus:text-blue-500 transition-colors duration-300 font-bold"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full mt-4">
          <div className="flex flex-col space-y-4">
            <NavLink
              to="/doctor/doctorHome"
              className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="aboutUs"
              className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/doctor/profile/"
                  className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="slot"
                  className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Slot
                </NavLink>
                <NavLink
                  to="/doctor/chat"
                  className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </NavLink>
                <NavLink
                  to="accountDetails"
                  className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account details
                </NavLink>
                <Link
                  className="nav-links pt-2"
                  onClick={() =>
                    setIsNotificationModalOpen(!isNotificationModalOpen)
                  }
                >
                  <NotificationIcon />
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogOut}
                className="text-black hover:text-blue-500 transition-colors duration-300 font-bold"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/auth/doctor/login"
                  className="text-gray-800 hover:text-blue-500 transition-colors duration-300 font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/auth/doctor/signup"
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
        customID={customID}
        data={data}
      />
    </nav>
  );
};

export default DoctorHeader;
