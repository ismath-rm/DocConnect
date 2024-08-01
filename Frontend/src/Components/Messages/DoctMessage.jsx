import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import "./ChatComponent.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../../utils/constants/Constants";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import UserImage from '../../assets/images/user.jpg'
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { UserAPIwithAcess } from "../Api/Api";
const DoctorChatComponent = () => {

  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const chatContainerRef = useRef();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [bookings, setBookings] = useState([]);
  console.log("BOOKINGS:", bookings);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [client, setClient] = useState(null);
  console.log("CLIENT:", client);
  // const salonUser = useSelector(state => state.salon)
  // console.log('salonUser:', salonUser)
  // const salonId = salonUser.salonUser.id
  // console.log('salonID:', salonId)

  const [patient_id, setPatientID] = useState(null);
  const [doct, setdoct] = useState("");

  const fetchBookings = async (id) => {
    try {
      const response = await UserAPIwithAcess.get(
        `appointment/api/doctor-transactions/?doctor_id=${id}`, config
      );
      console.log('yeh this rach fetch booking pgage');
      setBookings(response.data);
      console.log(response);
    } catch (error) {
      console.error("Error fetching bookings", error);
    }
  };

  const fetchDoctorID = (id) => {
    UserAPIwithAcess
      .get(BASE_URL + `auth/custom-id/doctor/${id}`, config)
      .then((res) => {
        setdoct(res.data);
        console.log(res.data.doctor_user.custom_id);
        fetchBookings(res.data.doctor_user.id);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchUserID = () => {
    const token = Cookies.get("access");
    const decoded = jwtDecode(token);
    setPatientID(decoded.user_id);
    fetchDoctorID(decoded.user_id);
  };

  useEffect(() => {
    fetchUserID();
  }, []);

  const chatMessagesRef = useRef(null);
  useEffect(() => {
    const handleResize = () => {
      if (chatMessagesRef.current) {
        const chatWindow = chatMessagesRef.current.parentElement;
        const headerHeight = chatWindow.querySelector('.selected-doctor-info')?.offsetHeight || 0;
        const inputHeight = chatWindow.querySelector('.bg-gray-300')?.offsetHeight || 0;
        const containerHeight = chatWindow.offsetHeight;
        const messagesHeight = containerHeight - headerHeight - inputHeight;
        chatMessagesRef.current.style.height = `${messagesHeight}px`;
      }
    };

    handleResize(); // Set initial height
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Function to scroll to the bottom of the chat container
    const scrollToBottom = () => {
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    };

    // Scroll to bottom whenever new messages are added
    scrollToBottom();
  }, [chatMessages]);

  // useLayoutEffect(() => {
  //   // Function to scroll to the bottom of the chat container
  //   const scrollToBottom = () => {
  //     if (chatContainerRef.current) {
  //       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  //     }
  //   };

  //   // Scroll to bottom after the DOM has been updated
  //   scrollToBottom();
  // }, [chatMessages]);
  const connectToWebSocket = (appointmentId) => {
    if (!appointmentId) return;

    const newClient = new W3CWebSocket(
      `ws://127.0.0.1:8000/ws/chat/${appointmentId}/`
    );
    setClient(newClient);

    newClient.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    newClient.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setChatMessages((prevMessages) => [...prevMessages, data]);
    };
    const fetchExistingMessages = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}chat/chat-messages/transaction/${appointmentId}/`
        );

        if (!response.ok) {
          console.error(
            "Error fetching existing messages. Status:",
            response.status
          );
          return;
        }

        const data = await response.json();

        const messagesTextArray = data.map((item) => ({
          message: item.message,
          sendername: item.sendername,
        }));

        setChatMessages(messagesTextArray);
        console.log("Chat messages:", messagesTextArray);
      } catch (error) {
        console.error("Error fetching existing messages:", error);
      }
    };

    fetchExistingMessages();

    return () => {
      newClient.close();
    };
  };

  const handleAppointmentClick = (booking) => {
    console.log('booking:',booking);
    setSelectedAppointment(booking);
    console.log('setSelectedAppointment:',setSelectedAppointment);
    setChatMessages([]);
    connectToWebSocket(booking.transaction_id);
  };

  const sendMessage = () => {
    if (!client || client.readyState !== client.OPEN) {
      console.error("WebSocket is not open");
      return;
    }

    const sendername = doct.first_name;
    console.log("SENDER NAME:", sendername);

    const messageData = { message, sendername };
    const messageString = JSON.stringify(messageData);

    console.log("Sending Message:", messageString);

    client.send(messageString);
    setMessage("");
  };

  return (
    <div>
      <main
        className="content w-full "
        style={{ marginTop: "25px", marginBottom: "0" }}
      >
        <div className="container p-0"></div>
        <div className="card">
          <div className="row g-0">
            {/* <div className="col-12 col-lg-5 col-xl-3 border-right">
                      <div className="px-4 ">
                          <div className="d-flfex align-itemfs-center">
                            <div className="flex-grow-1 d-flex align-items-center mt-2">
                              <input
                                type="text"
                                className="form-control my-3"
                                placeholder="Search..."
                                onChange=''
                                name='username'
        
                              />
                              <button className='ml-2' onClick=''style={{border:"none", borderRadius:"50%"}}><i className='fas fa-search'></i></button>
                            </div>
                          </div>
                      </div>
                    </div> */}

            <div className="chat-container">
              <div className="appointments-list">
                <h2>Chats</h2>
                <ul>
                  {bookings.map((booking) => (
                    <li
                      key={booking.transaction_id}
                      onClick={() => handleAppointmentClick(booking)}
                    >
                      <div className="doctor-list-item d-flex align-items-start">
                        <img
                          src={`${booking.patient_profile_picture
                            ? booking.patient_profile_picture
                            : UserImage
                            }`}
                          alt="User"
                          className="rounded-circle mr-1"
                        />
                        <div className="flex-grow-1 ml-3">
                          <div className="small">
                            <small
                              style={{ fontSize: "16px", fontWeight: "bold" }}
                            >
                              {booking.patient_name}
                            </small>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="chat-window h-96" >
                {selectedAppointment && (
                  <div className="flex flex-col flex-grow w-screen h-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="selected-doctor-info d-flex align-items-center">
                      <img
                        src={selectedAppointment.patient_profile_picture}
                        alt={selectedAppointment.patient_name}
                        className="rounded-circle mr-1"
                        width={40}
                        height={40}
                      />
                      <div className="flex-grow-1 mr-3">
                        <div className="small ">
                          <small
                              style={{ fontSize: "16px", fontWeight: "bold" }}
                          >
                            <strong>{selectedAppointment.patient_name}</strong>
                            </small>  
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col flex-grow h-0 p-4 overflow-auto" ref={chatMessagesRef}>
                      {chatMessages.map((msg, index) => (
                        <div key={index} className="message-container">
                          {msg.sendername === doct.first_name ? (
                            <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
                              <div>
                                <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
                                  <p className="text-sm">{msg.message}</p>
                                </div>
                                <span className="text-xs text-gray-500 leading-none">
                                  {msg.timestamp}
                                </span>
                              </div>
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                <img
                                  className="object-cover w-full h-full"
                                  src={UserImage}
                                  alt="User Avatar"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex w-full mt-2 space-x-3 max-w-xs">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                <img
                                  className="object-cover w-full h-full"
                                  src={
                                    selectedAppointment.patient_profile_picture
                                      ? selectedAppointment.patient_profile_picture
                                      : UserImage
                                  }
                                  alt="User Avatar"
                                />
                              </div>
                              <div>
                                <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                                  <p className="text-sm">{msg.message}</p>
                                </div>
                                <span className="text-xs text-gray-500 leading-none">
                                  {msg.timestamp}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-300 p-4">
                      <div className="flex items-center">
                        <input
                          className="flex-grow h-10 rounded px-3 text-sm"
                          type="text"
                          placeholder="Type your message…"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="ml-2" onClick={sendMessage}>
                          <PaperAirplaneIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorChatComponent;