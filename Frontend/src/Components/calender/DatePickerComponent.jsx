import React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

function DatePickerComponent({ label, onDateChange, dateType }) {
  const handleDateChange = (newDate) => {
    if (newDate && dayjs(newDate).isBefore(dayjs(), 'day')) {
      // If the selected date is before today, do not update
      console.log("Selected date is in the past. Please choose a future date.");
      return;
    }

    onDateChange(newDate, dateType);
    console.log("Selected date:", newDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DatePicker']}>
        <DatePicker
          label={label}
          onChange={handleDateChange}
          minDate={dayjs()}  // Disable past dates
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}

export default DatePickerComponent;
