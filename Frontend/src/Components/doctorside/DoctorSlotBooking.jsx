import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Timer from "../Timer/Timer";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/constants/Constants";
import { DateCalendar } from "@mui/x-date-pickers";
import { TrashIcon } from "@heroicons/react/24/solid";
import moment from "moment";
import DoctorWeeklySlotBooking from '../../Components/doctorside/DoctorWeeklySlotBooking';
import AdvancedSlotBooking from '../../Components/doctorside/AdvancedSlotBooking';
import { UserAPIwithAcess } from '../Api/Api';
import Cookies from "js-cookie";

const DoctorSlotBooking = ({ docid }) => {
  console.log("docid in slot listing:", docid);
  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeSlots, setTimeSlots] = useState([]);
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const currentTime = dayjs(new Date());
  const [isBulkBooking, setBulk] = useState(false);
  const [isNormalBooking, setNormal] = useState(true);
  const [isAdvancedBooking, setAdvanceBooking] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  useEffect(() => {
    // Fetch existing time slots for the selected date and update state
    fetchAvailableSlots();
  }, [selectedDate, docid, isRefresh]);

  const fetchAvailableSlots = (pageUrl) => {
    const url = pageUrl || `appointment/doctors/${docid}/slots?date=${selectedDate.format("YYYY-MM-DD")}`;

    UserAPIwithAcess.get(url, config)
      .then((response) => {
        setTimeSlots(response.data.data || []);
        setNextPage(response.data.pagination.next);
        setPrevPage(response.data.pagination.previous);
      })
      .catch((error) => {
        console.error("Error fetching existing time slots:", error);
      });
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

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleFromTimeChange = (newTime) => {
    setFromTime(newTime);
  };

  const handleToTimeChange = (newTime) => {
    setToTime(newTime);
  };

  const handleSaveSlots = () => {
    if (fromTime && toTime) {
      const fromTimeFormatted = moment(fromTime.$d);
      const toTimeFormatted = moment(toTime.$d);
      const allowedStartTime = moment("05:00:00", "HH:mm:ss");
      const allowedEndTime = moment("22:00:00", "HH:mm:ss");

      // New Validation: Ensure that start time is before end time
      if (fromTimeFormatted.isSameOrAfter(toTimeFormatted)) {
        toast.warning("Please select a valid time range.");
        return;
      }

      if (
        fromTimeFormatted.isBefore(allowedStartTime) ||
        toTimeFormatted.isAfter(allowedEndTime)
      ) {
        toast.warning("Slot allocation time should be between 5 am and 10 pm.");
        return;
      }

      const durationInMinutes = toTimeFormatted.diff(
        fromTimeFormatted,
        "minutes"
      );
      const minSlotDuration = 30;
      const maxSlotDuration = 60;

      if (
        durationInMinutes < minSlotDuration ||
        durationInMinutes > maxSlotDuration
      ) {
        toast.warning(
          `Slot duration should be between ${minSlotDuration} and ${maxSlotDuration} minutes.`
        );
        return;
      }

      const currentDate = moment();
      const selectedDateTime = moment(
        `${selectedDate.format("YYYY-MM-DD")} ${fromTimeFormatted.format(
          "HH:mm:ss"
        )}`
      );

      if (
        selectedDateTime.isSame(currentDate, "day") &&
        selectedDateTime.isBefore(currentDate.add(30, "minutes"))
      ) {
        toast.warning(
          "Selected time should be at least 30 minutes from the current time."
        );
        return;
      }

      const newSlot = {
        from_time: fromTimeFormatted.format("HH:mm:ss"),
        to_time: toTimeFormatted.format("HH:mm:ss"),
      };
      const updatedSlots = [newSlot];

      UserAPIwithAcess.post(
        `appointment/doctors/${docid}/update_slots/`,
        {
          date: selectedDate.format("YYYY-MM-DD"),
          slots: updatedSlots,
        },
        config
      )
        .then((response) => {
          fetchAvailableSlots();
          toast.success("Slot created successfully");
        })
        .catch((error) => {
          console.error("Error updating time slots:", error);
          toast.error(
            "Duplicate slots are not allowed. Please choose a different time range."
          );
        });
    } else {
      toast.warning("Please select from and to time");
    }
  };


  const handleDeleteSlot = (index) => {
    const slotToDelete = timeSlots[index];

    UserAPIwithAcess.delete(
      `appointment/doctors/${docid}/delete_slot/`,
      {
        data: {
          date: selectedDate.format("YYYY-MM-DD"),
          slot: slotToDelete,
        },
      },
      config
    )
      .then((response) => {
        fetchAvailableSlots(); // Refresh the slots after deletion
        toast.success("Slot deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting time slot:", error);
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
          minDate={dayjs()}
          className="mb-4"
        />
      </LocalizationProvider>
      <div className="mb-6">
        {isNormalBooking && (
          <>
            <label
              htmlFor="settings-timezone"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Create Time Slot
            </label>
            <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-center items-center">
              <Timer label="From Time" onTimeChange={handleFromTimeChange} />
              <Timer label="To Time" onTimeChange={handleToTimeChange} />
            </div>
            <div className="mb-6">
        <p>Consultaion Time Duration: 30, 35, 40, 45, 50, 55, 60 minute</p>
      </div>
            <button
              onClick={handleSaveSlots}
              className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Save Slots
            </button>
            <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-between items-center">
              <button
                onClick={() => {
                  setBulk(true);
                  setNormal(false);
                }}
                className="text-blue-600 bg-gray-200 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Create Slot for Bulk Dates
              </button>

              <button
                onClick={() => {
                  setBulk(false);
                  setNormal(false);
                  setAdvanceBooking(true);
                }}
                className="text-blue-600 bg-gray-200 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Advanced Slot Creation
              </button>
            </div>
          </>
        )}

        {isBulkBooking && (
          <DoctorWeeklySlotBooking
            docid={docid}
            setRefresh={setRefresh}
            setBulk={setBulk}
            setNormal={setNormal}
            setAdvanceBooking={setAdvanceBooking}

          />
        )}

        {isAdvancedBooking && (
          <AdvancedSlotBooking
            docid={docid}
            setRefresh={setRefresh}
            setBulk={setBulk}
            setNormal={setNormal}
            setAdvanceBooking={setAdvanceBooking}
          />
        )}
      </div>
      <h2 className="font-bold p-2 mb-2 border-2 border-black text-lg">
        Created Time Slots for - {selectedDate.format("DD-MM-YYYY")}
      </h2>
      {timeSlots.length > 0 ? (
        <div className="pb-6">
          <ul>
            {timeSlots.map((timeSlot, index) => (
              <li
                key={index}
                onClick={() => handleTimeSlotSelect(timeSlot)}
                className={`cursor-pointer font-medium border-2 border-gray-300 p-2 mb-2 relative flex justify-between items-center ${selectedTimeSlot === timeSlot ? "bg-gray-200 font-bold" : ""
                  }`}
              >
                {`${convertTo12HourFormat(timeSlot.from)} - ${convertTo12HourFormat(timeSlot.to)}`}
                {!timeSlot.is_booked && (
                  <TrashIcon
                    className="h-5 w-5 text-red-500 cursor-pointer"
                    onClick={() => handleDeleteSlot(index)}
                  />
                )}
              </li>
            ))}
          </ul>

          <nav className="flex justify-between px-4">
            <ul className="pagination flex space-x-2">
              <li className={`page-item ${!prevPage ? 'disabled' : ''}`}>
                <button
                  className={`page-link px-4 py-2 border-2 rounded 
                              ${prevPage ? 'border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white'
                      : 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-100'}`}
                  onClick={() => prevPage && fetchAvailableSlots(prevPage)}
                  disabled={!prevPage}
                >
                  Previous
                </button>
              </li>
              <li className={`page-item ${!nextPage ? 'disabled' : ''}`}>
                <button
                  className={`page-link px-4 py-2 border-2 rounded 
                              ${nextPage ? 'border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white'
                      : 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-100'}`}
                  onClick={() => nextPage && fetchAvailableSlots(nextPage)}
                  disabled={!nextPage}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      ) : (
          <p className="font-medium text-red-400 pt-2 text-center">
          No slots created for the selected date.
        </p>
      )}
    </div>
  );
};

export default DoctorSlotBooking;
