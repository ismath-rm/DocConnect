import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import UserImage from '../../../assets/images/user.jpg';
import { toast } from "react-toastify";
import { UserAPIwithAcess } from "../../Api/Api";
import Cookies from "js-cookie";

function BookindDetailsDoctor({ transaction_id }) {
  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const [doct, setDoct] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [isCancelModalVisible, setCancel] = useState(false);
  const [isMeetingAvailable, setIsMeetingAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    UserAPIwithAcess
      .get(`appointment/detail/transaction/${transaction_id}`, config)
      .then((res) => {
        const transactionData = res.data;
        setTransaction(transactionData);

        UserAPIwithAcess
          .get(`appointment/detail/patient/${transactionData.patient_id}`, config)
          .then((res) => {
            setDoct(res.data);
            console.log('details of user fereom doctor',res.data);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [transaction_id]);

  useEffect(() => {
    const currentDateTime = new Date();
    const transactionDateTime = new Date(
      `${transaction?.booked_date} ${transaction?.booked_from_time}`
    );
    const meetingAvailable = currentDateTime >= transactionDateTime;

    setIsMeetingAvailable(meetingAvailable);
  }, [transaction]);

  const handleCancel = () => {
    UserAPIwithAcess
      .post(
        `appointment/cancel/booking/doctor/`,
        { transaction_id: transaction.transaction_id },
        config
      )
      .then((res) => {
        console.log(res);
        setCancel(false);
        toast.success(
          "Booking cancelled successfully. Amount refunded to your Patient wallet"
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

  
  return (
    <div>
      <div className="flex justify-between xl:block 2xl:flex align-center 2xl:space-x-4">
        <div className="flex space-x-4 xl:mb-4 2xl:mb-0">
          <div>
            <img
              className="w-6 h-6 rounded-full"
              src={doct && doct.profile_picture ? doct.profile_picture : UserImage}
              alt="User"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white">
              {doct ? `${doct.first_name} ${doct.last_name}` : ""}
            </p>
            <p className="mb-1 text-sm font-normal truncate text-black dark:text-black">
              Booking Time: {transaction ? `${transaction.booked_from_time} - ${transaction.booked_to_time}` : ""}
            </p>
            <p className="text-xs font-medium text-black dark:text-black">
              Date: {transaction ? transaction.booked_date : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between w-auto xl:w-full 2xl:w-auto space-x-4">
          <button
            // onClick={() => handleOpenCancel()}
            className="bg-red-500 hover:bg-red-600 text-white font-bold hover:text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            
            className="bg-green-500 hover:bg-green-600 text-white font-bold hover:text-white py-2 px-4 rounded"
          >
            Join Call
          </button>
        </div>
      </div>

      {isCancelModalVisible && (
        <div className="fixed left-0 right-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full">
          <div className="w-full max-w-md px-4 md:h-auto">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
              <div className="flex justify-end p-2"></div>
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
