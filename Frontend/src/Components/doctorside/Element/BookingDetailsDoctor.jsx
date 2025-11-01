import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserImage from '../../../assets/images/user.jpg';
import { toast } from "react-toastify";
import { UserAPIwithAcess } from "../../Api/Api";
import Cookies from "js-cookie";
import moment from "moment";
import { BASE_URL } from "../../../utils/constants/Constants";


function BookindDetailsDoctor({ transaction_id }) {
  const accessToken = Cookies.get("access");

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const [doct, setDoct] = useState(transaction_id.patient_details);
  const [transaction, setTransaction] = useState(transaction_id);
  const [status, setStatus] = useState(transaction_id.is_consultency_completed);
  const [isCancelModalVisible, setCancel] = useState(false);
  const [isMeetingAvailable, setIsMeetingAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTransaction(transaction_id);
  }, [transaction_id.transaction_id]);


  useEffect(() => {
    const currentDateTime = new Date();
    const transactionDateTime = new Date(
      `${transaction?.booked_date} ${transaction?.booked_from_time}`
    );
    const meetingAvailable = currentDateTime >= transactionDateTime;

    setIsMeetingAvailable(meetingAvailable);
  }, [transaction]);

  

  const handleCancel = () => {
    UserAPIwithAcess.post(
      `appointment/cancel/booking/doctor/`,
      { transaction_id: transaction.transaction_id },
      config
    )
      .then((res) => {
        console.log("API Response:", res);

        setTransaction((prevTransaction) => ({
          ...prevTransaction,
          is_consultency_completed: "CANCELLED",
        }));

        setStatus("CANCELLED");
        setCancel(false); 

        
        toast.success(
          "Booking cancelled successfully and send email for a rebooking link."
        );
      })
      .catch((error) => {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel booking. Please try again.");
      });
  };

  const handleOpenCancel = () => {
    setCancel(true);
  };

  const handleCloseCancel = () => {
    setCancel(false);
  };

  const handleJoinMeeting = (id) => {
    
    navigate(`/doctor/room/${id.transaction_id}`);
  };

  const formatTime = (time) => {
    return moment(time, "HH:mm:ss").format("hh:mm A");
  };

  const formatDate = (date) => {
    return moment(date).format("DD-MM-YYYY");
  };

  const calculateAge = (dob) => {
    return moment().diff(moment(dob, "YYYY-MM-DD"), "years");
  };

  const isPastBooking = () => {
    if (transaction) {
      const currentDateTime = moment();
      const bookingEndDateTime = moment(
        transaction.booked_to_time,
        "HH:mm:ss"
      ).set({
        year: moment(transaction.booked_date).year(),
        month: moment(transaction.booked_date).month(),
        date: moment(transaction.booked_date).date(),
      });

      return currentDateTime.isAfter(bookingEndDateTime);
    }
    return false;
  };


  
  return (
    <div>
      <div className="flex justify-between xl:block 2xl:flex align-center 2xl:space-x-4">
        <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
          <div>
            <img
              className="object-cover w-full rounded-full h-48 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
              src={
                doct && doct.profile_picture
                  ? BASE_URL.replace(/\/+$/, "") + doct.profile_picture
                  : UserImage
              }
              alt="User"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-none truncate mb-0.5 dark:text-white">
              {doct ? `${doct.first_name} ${doct.last_name}` : ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              age: {doct ? calculateAge(doct.date_of_birth) : ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              Booking Time:{" "}
              {transaction
                ? `${formatTime(transaction.booked_from_time)} - ${formatTime(
                    transaction.booked_to_time
                  )}`
                : ""}
            </p>
            <p className="text-xs font-normal truncate text-black dark:text-black">
              Date: {transaction ? formatDate(transaction.booked_date) : ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              transaction_id: {transaction ? transaction.transaction_id : ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              payment: {transaction ? transaction.status : ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              Consultancy Status:{" "}
              {transaction ? transaction.is_consultency_completed : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between w-auto xl:w-full 2xl:w-auto space-x-4">
  {status === "CANCELLED" ? (
    <button className="bg-red-500 text-white font-bold py-2 px-4 rounded" disabled>
      Cancelled
    </button>
  ) : status === "REFUNDED" ? (
    <button className="bg-green-500 text-white font-bold py-2 px-4 rounded" disabled>
      Refunded
    </button>
  ) : status === "COMPLETED" ? (
    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" disabled>
      Completed
    </button>
  ) : !isPastBooking() ? (
    <>
      <button
        onClick={handleOpenCancel}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        disabled={status === "REFUNDED"}  
      >
        Cancel
      </button>

      <button
        onClick={() => handleJoinMeeting(transaction_id)}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        disabled={status === "REFUNDED"}  
      >
        Join Call
      </button>
    </>
  ) : null}
</div>



      </div>

      {isCancelModalVisible && (
        <div className="fixed left-0 right-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full">
          <div className="w-full max-w-md px-4 md:h-auto">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex justify-end p-2"></div>
              <button
                type="button"
                className=" absolute top-2 right-2 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={handleCloseCancel}
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
              <div className="p-6 pt-0 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-red-600 mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-5 mb-6 text-lg text-gray-500 dark:text-gray-400">
                  Are you sure you want to cancel this booking?
                </h3>
                <button
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2 dark:focus:ring-red-800"
                  onClick={() => handleCancel()}
                >
                  Yes, I'm sure
                </button>
                <button
                  className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                  onClick={() => handleCloseCancel()}
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookindDetailsDoctor;
