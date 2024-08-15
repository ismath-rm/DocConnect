import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Timer from "../Timer/Timer";
import Cookies from "js-cookie";
import { UserAPIwithAcess } from "../Api/Api";

const DoctorWeeklySlotBooking = ({ docid, setRefresh, setBulk, setNormal, setAdvanceBooking }) => {
  const [selectedFromDate, setSelectedFromDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [selectedToDate, setSelectedToDate] = useState(dayjs().format("DD-MM-YYYY"));
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const daysOfWeek = [
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
    { label: "Sunday", value: "Sunday" },
  ];

  const today = dayjs().format("DD-MM-YYYY");

  useEffect(() => {
    // Fetch existing time slots for the selected date range and update state
  }, []);

  const handleFromTimeChange = (newTime) => {
    setFromTime(newTime);
  };

  const handleToTimeChange = (newTime) => {
    setToTime(newTime);
  };

  const handleDateChange = (e, dateType) => {
    const { value } = e.target;
    if (dateType === "from") {
      setSelectedFromDate(value);
      if (dayjs(value, "DD-MM-YYYY").isAfter(dayjs(selectedToDate, "DD-MM-YYYY"))) {
        setSelectedToDate(value); // Ensure toDate is not before fromDate
      }
    } else if (dateType === "to") {
      setSelectedToDate(value);
    }
  };

  const handleDayChange = (dayValue) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(dayValue)
        ? prevSelectedDays.filter((day) => day !== dayValue)
        : [...prevSelectedDays, dayValue]
    );
  };

  const handleSaveSlots = () => {
    const currentDate = dayjs();

    if (fromTime && toTime && selectedDays.length > 0) {
      const fromTimeFormatted = dayjs(fromTime);
      const toTimeFormatted = dayjs(toTime);
      const selectedFromDayjs = dayjs(selectedFromDate, "DD-MM-YYYY");
      const selectedToDayjs = dayjs(selectedToDate, "DD-MM-YYYY");

      const maxDateRange = 14;
      const dateRangeInDays = selectedToDayjs.diff(selectedFromDayjs, "day");

      if (dateRangeInDays > maxDateRange) {
        toast.warning(`Date range cannot exceed ${maxDateRange} days.`);
        return;
      }

      if (selectedFromDayjs.isBefore(currentDate, "day")) {
        toast.warning("Please select a date on or after the current date.");
        return;
      }

      const allowedStartTime = dayjs("05:00:00", "HH:mm:ss");
      const allowedEndTime = dayjs("22:00:00", "HH:mm:ss");

      if (
        fromTimeFormatted.isBefore(allowedStartTime) ||
        toTimeFormatted.isAfter(allowedEndTime)
      ) {
        toast.warning("Slot allocation time should be between 5 am and 10 pm.");
        return;
      }

      const durationInMinutes = toTimeFormatted.diff(fromTimeFormatted, "minute");
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

      const newSlot = {
        from_time: fromTimeFormatted.format("HH:mm:ss"),
        to_time: toTimeFormatted.format("HH:mm:ss"),
        days: selectedDays, // Send the selected days to the backend
      };

      UserAPIwithAcess
        .post(
          `appointment/doctors/${docid}/update_slots/bulk/`,
          {
            from_date: selectedFromDayjs.format("YYYY-MM-DD"),
            to_date: selectedToDayjs.format("YYYY-MM-DD"),
            slots: [newSlot],
          },
          config
        )
        .then(() => {
          setRefresh(true);
          toast.success("Slots created successfully");
        })
        .catch((error) => {
          console.error("Error updating time slots:", error);
          toast.error("Failed to create slots. Please try again.");
        });
    } else {
      toast.warning("Please select from and to time, and at least one working day.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <label
          htmlFor="settings-timezone"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Select your date range
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            value={dayjs(selectedFromDate, "DD-MM-YYYY").format("YYYY-MM-DD")}
            onChange={(e) => handleDateChange(e, "from")}
            min={dayjs(today, "DD-MM-YYYY").format("YYYY-MM-DD")}
            className="flex-1 border border-gray-300 rounded p-2"
          />
          <input
            type="date"
            value={dayjs(selectedToDate, "DD-MM-YYYY").format("YYYY-MM-DD")}
            onChange={(e) => handleDateChange(e, "to")}
            min={dayjs(selectedFromDate, "DD-MM-YYYY").format("YYYY-MM-DD")} // Ensure toDate is not before fromDate
            className="flex-1 border border-gray-300 rounded p-2"
          />
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="settings-timezone"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Create time slot
        </label>
        <div className="flex flex-col gap-4 sm:flex-row justify-center items-center">
          <Timer label="From Time" onTimeChange={handleFromTimeChange} />
          <Timer label="To Time" onTimeChange={handleToTimeChange} />
        </div>
      </div>

      <div className="mb-6">
        <p>Consultaion Time Duration: 30, 35, 40, 45, 50, 55, 60 minute</p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="workingDays"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Select Working Days
        </label>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {daysOfWeek.map((day) => (
            <label key={day.value} className="flex items-center space-x-2 font-semibold">
              <input
                type="checkbox"
                value={day.value}
                checked={selectedDays.includes(day.value)}
                onChange={() => handleDayChange(day.value)}
                className="form-checkbox"
              />
              <span>{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSaveSlots}
        className="mt-4 text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
      >
        Save Slots
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
        <button
          onClick={() => {
            setBulk(false);
            setNormal(true);
          }}
          className="text-blue-600 bg-gray-200 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Single
        </button>

        <button
          onClick={() => {
            console.log("Advanced slot creation button clicked");
            setBulk(false);
            setNormal(false);
            setAdvanceBooking(true);
            console.log("AdvanceBooking state set to true");
          }}
          className="text-blue-600 bg-gray-200 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Advanced slot creation
        </button>
      </div>
    </div>
  );
};

export default DoctorWeeklySlotBooking;
