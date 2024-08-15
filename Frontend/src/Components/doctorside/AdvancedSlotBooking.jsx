import React, { useState } from "react";
import dayjs from "dayjs";
import Timer from "../Timer/Timer";
import { toast } from "react-toastify";
import moment from "moment";
import Cookies from "js-cookie";
import { UserAPIwithAcess } from "../Api/Api";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const AdvancedSlotBooking = ({ docid, setRefresh, setBulk, setNormal, setAdvanceBooking }) => {
    const accessToken = Cookies.get("access");
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };

    const [selectedFromDate, setSelectedFromDate] = useState(dayjs());
    const [selectedToDate, setSelectedToDate] = useState(dayjs());
    const [fromTime, setFromTime] = useState(null);
    const [toTime, setToTime] = useState(null);
    const [fromBreakTime, setFromBreakTime] = useState(null);
    const [toBreakTime, setToBreakTime] = useState(null);

    const [selectedDays, setSelectedDays] = useState([]);

    const daysOfWeek = [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" },
    ];

    const [selectedDuration, setSelectedDuration] = useState("30");
    const timeDurations = ["30", "35", "40", "45", "50", "55", "60"];

    const handleDurationChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedDuration(selectedValue);
    };

    const [selectedBufferTime, setSelectedBufferTime] = useState("5");
    const bufferTimes = ["5", "10", "15"];

    const handleBufferTimeChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedBufferTime(selectedValue);
    };

    const handleFromTimeChange = (newTime) => {
        setFromTime(newTime);
    };

    const handleToTimeChange = (newTime) => {
        setToTime(newTime);
    };

    const handleFromBreakTimeChange = (newTime) => {
        setFromBreakTime(newTime);
    };

    const handleToBreakTimeChange = (newTime) => {
        setToBreakTime(newTime);
    };

    const handleDateChange = (newDate, dateType) => {
        if (dateType === "from") {
            setSelectedFromDate(newDate);
        } else if (dateType === "to") {
            setSelectedToDate(newDate);
        }
    };

    const handleDayChange = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((selectedDay) => selectedDay !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };


    const handleSaveSlots = async () => {
        const fromTimeMoment = moment(fromTime?.$d);
        const toTimeMoment = moment(toTime?.$d);
        const fromBreakTimeMoment = moment(fromBreakTime?.$d);
        const toBreakTimeMoment = moment(toBreakTime?.$d);

        if (fromTimeMoment.isSameOrAfter(toTimeMoment)) {
            toast.error("Select valid working hours. Start time should be before end time.");
            return;
        }

        if (fromBreakTimeMoment.isSameOrAfter(toBreakTimeMoment)) {
            toast.error("Select valid break time. Break start time should be before break end time.");
            return;
        }
        // Adjust break time by subtracting the duration from the start of the break
        const durationInMinutes = parseInt(selectedDuration, 10);
        const adjustedFromBreakTimeMoment = fromBreakTimeMoment.clone().subtract(durationInMinutes, 'minutes');

        try {
            await UserAPIwithAcess.post(
                `appointment/doctors/${docid}/update_slots/advanced/`,
                {
                    fromDate: selectedFromDate.format("YYYY-MM-DD"),
                    toDate: selectedToDate.format("YYYY-MM-DD"),
                    fromTimeInMinutes: fromTimeMoment.format("HH:mm:ss"),
                    toTimeInMinutes: toTimeMoment.format("HH:mm:ss"),
                    bufferTimeInMinutes: parseInt(selectedBufferTime, 10),
                    fromBreakTimeInMinutes: adjustedFromBreakTimeMoment.format("HH:mm:ss"),
                    toBreakTimeInMinutes: toBreakTimeMoment.format("HH:mm:ss"),
                    workingdaysOfWeek: selectedDays,
                    slot_duration: selectedDuration,
                },
                config
            );

            toast.success("Slots saved successfully");
            setRefresh((prev) => !prev);
        } catch (error) {
            console.error("Error saving slots", error);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="pt-8 flex flex-col items-center">
                <label
                    htmlFor="settings-timezone"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                    Select your date range
                </label>
                <div className="flex pb-3">
                    <div className="mx-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            From Date
                        </label>
                        <DatePicker
                            value={selectedFromDate}
                            onChange={(newDate) => handleDateChange(newDate, "from")}
                            minDate={dayjs()}
                            format="DD/MM/YYYY"
                            renderInput={(params) => <input {...params} className="form-input" />}
                        />
                    </div>
                    <div className="mx-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            To Date
                        </label>
                        <DatePicker
                            value={selectedToDate}
                            onChange={(newDate) => handleDateChange(newDate, "to")}
                            minDate={selectedFromDate || dayjs()}
                            format="DD/MM/YYYY"
                            renderInput={(params) => <input {...params} className="form-input" />}
                        />
                    </div>
                </div>

                <div className="mb-6 flex flex-col items-center">
                    <label
                        htmlFor="settings-timezone"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Select Working Hours
                    </label>
                    <div className="flex pb-4 justify-center">
                        <Timer label="From Time" onTimeChange={handleFromTimeChange} />
                        <Timer label="To Time" onTimeChange={handleToTimeChange} />
                    </div>
                </div>

                <div className="mb-6 flex flex-col items-center">
                    <label
                        htmlFor="settings-timezone"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Select Break Time
                    </label>
                    <div className="flex pb-4 justify-center">
                        <Timer label="From Time" onTimeChange={handleFromBreakTimeChange} />
                        <Timer label="To Time" onTimeChange={handleToBreakTimeChange} />
                    </div>
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

                <div className="flex justify-between pb-10">
                    <div className="pt-8">
                        <label
                            className="text-sm font-medium text-gray-900 dark:text-white"
                            htmlFor="timeDuration"
                        >
                            Consultation Time Duration:
                        </label>
                        <select
                            id="timeDuration"
                            value={selectedDuration}
                            onChange={handleDurationChange}
                        >
                            {timeDurations.map((duration) => (
                                <option key={duration} value={duration}>
                                    {duration} minutes
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-8">
                        <label
                            className="text-sm font-medium text-gray-900 dark:text-white"
                            htmlFor="bufferTime"
                        >
                            Select Buffer Time:
                        </label>
                        <select
                            id="bufferTime"
                            value={selectedBufferTime}
                            onChange={handleBufferTimeChange}
                        >
                            {bufferTimes.map((bufferTime) => (
                                <option key={bufferTime} value={bufferTime}>
                                    {bufferTime} minutes
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSaveSlots}
                    className="px-10 text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                    Save Slots
                </button>

                <div className="block flex justify-between w-full pt-8">
                    <button
                        onClick={() => {
                            setBulk(false);
                            setNormal(true);
                            setAdvanceBooking(false);
                        }}
                        className=" ml-10 text-blue-600 bg-gray-200 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                        Create Single
                    </button>

                    <button
                        onClick={() => {
                            setBulk(true);
                            setNormal(false);
                            setAdvanceBooking(false);
                        }}
                        className="ml-10 text-blue-600 bg-gray-200 hover:bg-blue-600 hover:text-white focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    >
                        Bulk slot creation
                    </button>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default AdvancedSlotBooking;
