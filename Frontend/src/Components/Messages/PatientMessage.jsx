
import { useState, useEffect, useRef } from "react";
import "./ChatComponent.css";
import { BASE_URL } from "../../utils/constants/Constants";
import { WEBSOCKET } from "../../utils/constants/Constants";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import UserImage from '../../assets/images/user.jpg'
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { UserAPIwithAcess } from "../Api/Api";

const PatientChatComponent = () => {
    const accessToken = Cookies.get("access");
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [client, setClient] = useState(null);
    const [patient_id, setPatientID] = useState(null);
    const [doct, setdoct] = useState("");
    const chatMessagesRef = useRef(null);

    const fetchBookings = async (id) => {
        console.log('yiiii ajas');
        try {
            const response = await UserAPIwithAcess.get(
                `appointment/api/patient-transactions/?patient_id=${id}`, config
            );
            console.log('helloo guys her it is ismu');
            setBookings(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching bookings", error);
        }
    };

    const fetchDoctorID = (id) => {
        console.log('id', id)
        UserAPIwithAcess
            .get(`auth/custom-id/patient/${id}`, config)
            .then((res) => {
                setdoct(res.data);
                console.log('custom_id in patient chat:', res.data);
                fetchBookings(res.data.id);
                console.log('fetchBookings:',);
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

    const connectToWebSocket = (appointmentId) => {
      console.log(appointmentId);
      setChatMessages([]);
      console.log("hey this is the appointment id page");
      if (!appointmentId) return;
      console.log("Hi this is the websocket component");
      const newClient = new WebSocket(`${WEBSOCKET}ws/chat/${appointmentId}/`);
      setClient(newClient);

      newClient.onopen = () => {
        console.log("WebSocket Client Connected");
      };

      newClient.onmessage = (message) => {
        console.log(message);
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
      setSelectedAppointment(booking);
      console.log();
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

    useEffect(() => {
        const scrollToBottom = () => {
            if (chatMessagesRef.current) {
                chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
            }
        };

        scrollToBottom();
    }, [chatMessages]);

    return (
        <div>
            <main
                className="content w-full "
                style={{ marginTop: "25px", marginBottom: "0" }}
            >
                <div className="container p-0"></div>
                <div className="card">
                    <div className="row g-0">
                        
                        <div className="chat-container">
                            <div className="appointments-list ">
                                <h2>Chats</h2>

                                <ul>
                                    {bookings.map((booking) => (
                                        <li
                                            key={booking.transaction_id}
                                            onClick={() => handleAppointmentClick(booking)}
                                        >
                                            <div className="doctor-list-item d-flex align-items-start"
                                                style={{ borderBottom: "1px solid #ccc", paddingBottom: "8px" }}
                                            >
                                                <img
                                                    src={
                                                        booking.doctor_profile_picture
                                                            ? booking.doctor_profile_picture
                                                            : UserImage
                                                    }
                                                    alt="Doctor"
                                                    className="rounded-circle mr-1"
                                                    width={40}
                                                    height={40}
                                                />
                                                <div className="flex-grow-1 ml-3">
                                                    <div className="small">
                                                        <small
                                                            style={{ fontSize: "16px", fontWeight: "bold" }}
                                                        >
                                                            Dr.{booking.doctor_name}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="chat-window h-96">
                                {selectedAppointment && (
                                    <div className="flex flex-col flex-grow w-screen h-full max-w-xl bg-red shadow-xl rounded-lg overflow-hidden">
                                        <div className="selected-doctor-info d-flex align-items-center bg-blue-500">
                                            <img
                                                src={
                                                    selectedAppointment.doctor_profile_picture
                                                        ? selectedAppointment.doctor_profile_picture
                                                        : UserImage
                                                }
                                                alt={selectedAppointment.doctor_name}
                                                className="rounded-circle-chat mr-1"
                                            
                                            />
                                            <div className="flex-grow-1 mr-3">
                                                <div className="small ">
                                                    <small
                                                        style={{ fontSize: "16px", fontWeight: "bold" }}
                                                    >
                                                        <strong>{selectedAppointment.doctor_name}</strong>
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col flex-grow h-0 p-4 overflow-auto " ref={chatMessagesRef}>
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
                                                                    
                                                                    alt="UserImage "
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex w-full mt-2 space-x-3 max-w-xs">
                                                            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                                                <img
                                                                    className="object-cover w-full h-full"
                                                                    src={
                                                                        selectedAppointment.doctor_profile_picture
                                                                            ? selectedAppointment.doctor_profile_picture
                                                                            : UserImage
                                                                    }
                                                                    alt="User Avatar"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="bg-white text-black p-3 rounded-r-lg rounded-bl-lg">
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
            </main >
        </div >
    );
};

export default PatientChatComponent;
