import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import UserImage from '../../../assets/images/user.jpg';
import { toast } from "react-toastify";
import { UserAPIwithAcess } from "../../Api/Api";
import Cookies from "js-cookie";
import moment from "moment";
import { BASE_URL } from "../../../utils/constants/Constants";

function BookingDetails({ transaction_id, setWallet }) {
  // console.log('abhijith is here:', transaction_id);
  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const [doctor, setDoctor] = useState(transaction_id.doctor_details);
  const [transaction, setTransaction] = useState(transaction_id);
  const [status, setStatus] = useState(transaction_id.is_consultency_completed);
  const [isCancelModalVisible, setCancel] = useState(false);
  const navigate = useNavigate();


  // console.log("transaction details inside comnponents", transaction);

  useEffect(() => {
    // console.log("transaction details inside comnponents",transaction);
    setTransaction(transaction_id)
  }, [transaction_id.transaction_id])

  // useEffect(() => {
  // UserAPIwithAcess
  //   .get(`appointment/detail/transaction/${transaction_id}`, config)
  //   .then((res) => {
  //     const transactionData = res.data;
  //     setTransaction(transactionData);
  //     setStatus(transactionData.status);

  //     UserAPIwithAcess
  //       .get(`appointment/detail/doctors/${transactionData.doctor_id}`, config)
  //       .then((res) => {
  //         console.log('hey this tis twowooo');
  //         console.log(res);
  //         setDoctor(res.data);
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });
  // }, [status]);

  const handleCancel = () => {
    UserAPIwithAcess
      .post(
        `appointment/cancel/booking/`,
        {
          transaction_id: transaction.transaction_id,
        },
        config
      )
      .then((res) => {
        console.log('API Response:', res);
        setTransaction((prevTransaction) => ({
          ...prevTransaction,
          is_consultency_completed: "REFUNDED",
        }));

        setStatus("REFUNDED");
        setWallet(res.data.wallet_balance);
        setCancel(false);
        toast.success(
          "Booking cancelled successfully. Amount refunded to your wallet"
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleOpenCancel = () => {
    setCancel(true);
  };

  const handleCloseCancel = () => {
    setCancel(false);
  };

  const handleJoinMeeting = (id) => {
    console.log('transaction id for video call is:', id);
    const relativeURL = `/room/${id.transaction_id}`;
    navigate(relativeURL);
  };



  const formatTime = (time) => {
    return moment(time, 'HH:mm:ss').format('hh:mm A');
  };

  const formatDate = (date) => {
    return moment(date).format('DD-MM-YYYY');
  };

  const isPastBooking = () => {
    if (transaction) {
      const currentDateTime = moment();
      const bookingEndDateTime = moment(transaction.booked_to_time, 'HH:mm:ss').set({
        year: moment(transaction.booked_date).year(),
        month: moment(transaction.booked_date).month(),
        date: moment(transaction.booked_date).date()
      });

      return currentDateTime.isAfter(bookingEndDateTime);
    }
    return false;
  };

  // New function to check if the current time is within the booked time range
  const isWithinBookingTime = () => {
    if (transaction) {
      const currentTime = moment();
      const bookingStartTime = moment(transaction.booked_from_time, 'HH:mm:ss').set({
        year: moment(transaction.booked_date).year(),
        month: moment(transaction.booked_date).month(),
        date: moment(transaction.booked_date).date()
      });

      const bookingEndTime = moment(transaction.booked_to_time, 'HH:mm:ss').set({
        year: moment(transaction.booked_date).year(),
        month: moment(transaction.booked_date).month(),
        date: moment(transaction.booked_date).date()
      });

      return currentTime.isBetween(bookingStartTime, bookingEndTime);
    }
    return false;
  };



  const isConsultancyPending = transaction && transaction.is_consultancy_completed === 'pending';
  const isConsultancyCompleted = transaction && transaction.is_consultancy_completed === 'COMPLETED';
  const isRefunded = transaction_id.is_consultency_completed === "REFUNDED";

  return (
    <div>
      <div className="flex justify-between xl:block 2xl:flex align-center 2xl:space-x-4">
        <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
          <div>
            <img
              className="object-cover w-full rounded-full h-48 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
              src={BASE_URL.replace(/\/+$/, '') + doctor?.user?.profile_picture || UserImage}
              alt="Doctor image"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-none truncate mb-0.5 dark:text-white">
              Dr {doctor?.user ? `${doctor.user.first_name} ${doctor.user.last_name}` : ""}
            </p>

            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              Booking Fees: {transaction ? transaction.amount : ""}
            </p>

            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              Specialization: {doctor?.specializations || ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              Hospital: {doctor?.hospital || ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              Experience: {doctor?.years_of_experience || ""} years
            </p>

            <div className="p-4">
              <h1 className="font-bold">Transaction Details</h1>
              <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
                transaction_id: {transaction ? transaction.transaction_id : ""}
              </p>
              <p className="text-xs font-normal truncate text-black dark:text-black">
                Date: {transaction ? formatDate(transaction.booked_date) : ""}
              </p>
              <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
                Booking Time: {transaction ? `${formatTime(transaction.booked_from_time)} - ${formatTime(transaction.booked_to_time)}` : ""}
              </p>
              <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
                Consultancy Status: {transaction ? transaction.is_consultency_completed : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-auto xl:w-full 2xl:w-auto space-x-4">
          {status === "REFUNDED" ? (
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold hover:text-white py-2 px-4 rounded">
              Refunded
            </button>
          ) : status !== "COMPLETED" && !isPastBooking() ? (
            <>
                <button
                  onClick={() => handleOpenCancel()}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold hover:text-white py-2 px-4 rounded"
                  disabled={status === "REFUNDED"} // Disable Cancel button if refunded
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleJoinMeeting(transaction_id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold hover:text-white py-2 px-4 rounded"
                  // disabled={status === "REFUNDED" || !isWithinBookingTime()} // Disable Join Call button if refunded
                  disabled={status === "REFUNDED"} // Disable Join Call button if refunded

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

export default BookingDetails;
