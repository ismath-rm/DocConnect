import { useState, useEffect } from 'react';
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/constants/Constants";

const RebookingPage = () => {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { transactionId } = useParams();
  const [error, setError] = useState("");
  const [isRebookModalVisible, setIsRebookModalVisible] = useState(false);
  const [nearestSlot, setNearestSlot] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (transactionId) {
      axios
        .get(`${BASE_URL}appointment/api/available-slots/${transactionId}`)
        .then((response) => {
          setSlots(response.data.available_slots);
          setNearestSlot(response.data.nearest_slot);
          setError("");
        })
        .catch((error) => {
          setSlots([]);
          setNearestSlot(null);
          setError(
            error.response?.data?.error || "Failed to fetch available slots"
          );
        });
    }
  }, [transactionId]);

  const handleRebook = () => {
    const slotToBook = selectedSlot || nearestSlot;
    if (!slotToBook) {
      toast.error("No slot selected for rebooking");
      return;
    }

    const slotToBookFormatted = {
      id: slotToBook.id,
      day: formatDateForBackend(slotToBook.day),
      start_time: convertTo24HourFormat(slotToBook.start_time),
      end_time: convertTo24HourFormat(slotToBook.end_time),
    };

    axios
      .post(
        `${BASE_URL}appointment/api/rebook/${transactionId}/`,
        slotToBookFormatted
      )
      .then((response) => {
        toast.success(response.data.message);
        navigate("/sucess-page");
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.error || "Failed to rebook appointment"
        );
        setIsRebookModalVisible(false);
      });
  };

  const handleCancel = () => {
    axios
      .post(`${BASE_URL}appointment/api/rebook/${transactionId}/`, {
        id: null,
      })
      .then((response) => {
        toast.success("Refund successful. Redirecting to doctor list...");
        navigate("/doctor-list"); 
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Failed to process refund");
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForBackend = (formattedDate) => {
    const [day, month, year] = formattedDate.split("-");
    return `${year}-${month}-${day}`;
  };

  const convertTo12HourFormat = (timeString) => {
    let [hours, minutes] = timeString.split(":");
    hours = parseInt(hours, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const convertTo24HourFormat = (timeString) => {
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    } else if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours}:${minutes}`;
  };

  const handleSelectSlot = (slot) => {
    const formattedSlot = {
      ...slot,
      day: formatDate(slot.day),
      start_time: convertTo12HourFormat(slot.start_time),
      end_time: convertTo12HourFormat(slot.end_time),
    };

    setSelectedSlot(formattedSlot);
    setIsRebookModalVisible(true);
  };

  return (
    <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Rebook Appointment</h1>
      <p className="text-black mb-4">
        <strong>Transaction ID:</strong> {transactionId}
      </p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        <h2 className="text-xl  font-semibold text-blue-500 mb-4">
          Available Slots
        </h2>
        <ul className="border border-gray-300">
          {slots.map((slot, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-gray-100 border border-gray-200 rounded mb-2"
              onClick={() => handleSelectSlot(slot)}
            >
              {formatDate(slot.day)} - {convertTo12HourFormat(slot.start_time)}{" "}
              to {convertTo12HourFormat(slot.end_time)}
            </li>
          ))}
        </ul>
      </div>

      
      {isRebookModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-1/2 max-w-md">
            <div className="flex justify-end p-2">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsRebookModalVisible(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-lg text-gray-700 mb-4">
                {selectedSlot
                  ? "Rebook Selected Slot?"
                  : "Rebook Nearest Slot?"}
              </h3>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded mr-2 hover:bg-green-700"
                onClick={handleRebook}
              >
                Book Now
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={handleCancel} 
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RebookingPage;
