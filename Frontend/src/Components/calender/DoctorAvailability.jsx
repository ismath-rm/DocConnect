import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { BASE_URL } from "../../utils/constants/Constants";
import useRazorpay from "react-razorpay";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserAPIwithAcess } from "../Api/Api";
import Cookies from "js-cookie";


const isFutureTimeSlot = (date, timeSlot) => {
  const now = dayjs();
  const currentDateTime = now.format("YYYY-MM-DD HH:mm");

  const selectedDateTime = dayjs(`${date} ${timeSlot.from}`);

  if (date === now.format("YYYY-MM-DD")) {
    return selectedDateTime.isAfter(currentDateTime);
  }

  return true; 
};



const sortTimeSlotsAscending = (slots) => {
  return slots.sort((a, b) => dayjs(a.from, "HH:mm").isAfter(dayjs(b.from, "HH:mm")) ? 1 : -1);
};

const DoctorAvailability = ({ doctorId, fees, patient_id }) => {
  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const [Razorpay] = useRazorpay();
  const [patientID, setPatientID] = useState(null)
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCancelModalVisible, setCancel] = useState(false);


  useEffect(() => {
    fetchAvailableTimeSlots(selectedDate.format("YYYY-MM-DD"));
    UserAPIwithAcess.get(`auth/custom-id/patient/${patient_id}`, config).then((res) => {
      setPatientID(res.data.id)

    }).catch((err) => {
      console.log(err)
    })

  }, [selectedDate]);

  const fetchAvailableTimeSlots = async (date) => {
    try {
      setLoading(true);

      const response = await UserAPIwithAcess.get(
        `appointment/patient/check/doctor/${doctorId}/slots?date=${date}`
        , config
      );

      const futureSlots = response.data.available_slots?.filter((slot) => isFutureTimeSlot(date, slot)) || [];
      const sortedSlots = sortTimeSlotsAscending(futureSlots);

      setAvailableTimeSlots(sortedSlots);
    } catch (error) {
      console.error("Error fetching available time slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const convertTo12HourFormat = (timeString) => {
    if (!timeString) {
      return "";
    }

    const [hours, minutes] = timeString.split(":");
    let period = "am";

    let hoursIn24HourFormat = parseInt(hours, 10);

    if (hoursIn24HourFormat >= 12) {
      period = "pm";
      if (hoursIn24HourFormat > 12) {
        hoursIn24HourFormat -= 12;
      }
    } else if (hoursIn24HourFormat === 0) {
      hoursIn24HourFormat = 12;
    }

    return `${hoursIn24HourFormat}:${minutes} ${period}`;
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedTimeSlot(null);
  };

  const complete_order = (paymentID, orderID, signature) => {
    
    UserAPIwithAcess
      .post(`/appointment/complete-order/`, {
        payment_id: paymentID,
        order_id: orderID,
        signature: signature,
        amount: fees,
        doctor_id: doctorId,
        patient_id: patientID,
        booked_date: selectedDate.format("YYYY-MM-DD"),
        booked_from_time: selectedTimeSlot.from,
        booked_to_time: selectedTimeSlot.to,
      }, config)
      .then((response) => {
        console.log('response:',response.data);
        if (response.status === 201) {
          navigate("/sucess-page")
        }
      })
      .catch((error) => {
        ;
        console.log(error.response ? error.response.data : error.message);
      });
  };

  const handlePayment = () => {
    
    UserAPIwithAcess
      .post(`appointment/check-availability/`, {
        doctor_id: doctorId,
        selected_from_time: selectedTimeSlot.from,
        selected_to_time: selectedTimeSlot.to,
        selected_day: selectedDate.format("YYYY-MM-DD"),
      }, config)
      .then((availabilityCheckResponse) => {
        if (!availabilityCheckResponse.data.available) {
          toast.warning("This slot is already booked. Please choose another slot.");
          return;
        }

        
        return UserAPIwithAcess.post(`${BASE_URL}appointment/create-order/`, {
          
          
          amount: parseInt(fees, 10), 
          currency: "INR",
          
          
        }, config);
      })
      .then((orderResponse) => {
        const order = orderResponse.data.data.id;

     
        const options = {
          key: "rzp_test_8XSNvVIgMjtH1b",
          name: "DocConnect",
          description: "Test Transaction",
          image: "https://example.com/your_logo",
          order_id: order,
          handler: function (response) {
            

            
            complete_order(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
          },
          prefill: {
            name: "Piyush Garg",
            email: "youremail@example.com",
            contact: "9999999999",
          },
          notes: {
            address: "Razorpay Corporate Office",
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp1 = new Razorpay(options); 
        rzp1.on("payment.failed", function (response) {
          alert(response.error.code);
          alert(response.error.description);
          alert(response.error.source);
          alert(response.error.step);
          alert(response.error.reason);
          alert(response.error.metadata.order_id);
          alert(response.error.metadata.payment_id);
        });
        rzp1.open();
      })
      .catch((error) => {
        console.error("Error during payment processing:", error);
        
      });
  };


  const handleWalletPayment = () => {
    
    
    UserAPIwithAcess
      .post(`appointment/check-availability/`, {
        doctor_id: doctorId,
        selected_from_time: selectedTimeSlot.from,
        selected_to_time: selectedTimeSlot.to,
        selected_day: selectedDate.format("YYYY-MM-DD"),
      }, config)
      .then((availabilityCheckResponse) => {
        console.log('availabilityCheckResponse:', availabilityCheckResponse);
        if (!availabilityCheckResponse.data.available) {
          toast.warning("This slot is already booked. Please choose another slot.");
          return;
        }


        UserAPIwithAcess
          .post(`appointment/wallet/payment/`, {
            payment_id: `wall-pay-${selectedDate.format("YYYY-MM-DD")}-${selectedTimeSlot.from}`,
            amount: fees,
            doctor_id: doctorId,
            patient_id: patientID,
            booked_date: selectedDate.format("YYYY-MM-DD"),
            booked_from_time: selectedTimeSlot.from,
            booked_to_time: selectedTimeSlot.to,
          }, config)
          .then((response) => {
            console.log('response data in wallet:',response.data);
            if (response.status === 201) {
              navigate("/sucess-page"); 
              toast.success("Payment successful!");
            }
          })
          .catch((error) => {
            toast.error(error.response.data.error);
          });
      })
      .catch((error) => {
        console.error("Error during payment processing:", error);
        
      });
  };


  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleCloseCancel = () => {
    setCancel(false);
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
          minDate={dayjs()}
        />
      </LocalizationProvider>

      <h2 className="font-bold p-2 mb-2 border-2 border-black">
        Available Time Slots for - {selectedDate.format("YYYY-MM-DD")}
      </h2>

      {loading && <p>Loading...</p>}

      {availableTimeSlots && availableTimeSlots.length === 0 ? (
        <p className="font-medium text-red-400 pt-2">
          No slots available for the selected date.
        </p>
      ) : (
        <ul>
          {availableTimeSlots.map((timeSlot, index) => (
            <li
              key={index}
              onClick={() => handleTimeSlotSelect(timeSlot)}
              style={{
                cursor: "pointer",
                fontWeight: selectedTimeSlot === timeSlot ? "bold" : "normal",
                border: "1px solid #ddd",
                padding: "8px",
                marginBottom: "4px",
              }}
            >
              {`${convertTo12HourFormat(
                timeSlot.from
              )} - ${convertTo12HourFormat(timeSlot.to)}`}
            </li>
          ))}
        </ul>
      )}

      {selectedTimeSlot && (
        <>
          <button
            onClick={() => { setCancel(true) }}
            className="bg-blue-500 hover:bg-blue-600 text-white border border-slate-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group"
          >
            Book Appointment for {convertTo12HourFormat(selectedTimeSlot.from)}{" "}
            - {convertTo12HourFormat(selectedTimeSlot.to)}
          </button>

          {isCancelModalVisible && (
            <div className="fixed left-0 right-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full">
              <div className="w-full max-w-md px-4 md:h-auto">
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
                          Please select your payment method
                        </h3>

                        <button
                          className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2 "
                          onClick={() => handleWalletPayment()}
                        >
                          Using Wallet
                        </button>
                        <button
                          className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2 "
                          onClick={() => handlePayment()}
                        >
                          Razorpay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};

export default DoctorAvailability;