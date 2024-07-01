import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants/Constants';
import { toast } from 'react-toastify';

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromRegistration = location?.state?.email || '';
  const [otp, setOtp] = useState({ input1: '', input2: '', input3: '', input4: '' });

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    if (e.nativeEvent.inputType === 'deleteContentBackward') {
      if (index > 0) {
        inputRefs[index - 1].current.focus();
      }
    }

    setOtp((prevOtp) => ({
      ...prevOtp,
      [name]: value,
    }));

    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleVerification = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(BASE_URL + 'auth/verify-otp/', {
        email: emailFromRegistration,
        otp: Object.values(otp).join(''),
      });

      if (response.status === 200) {
        toast.success('Successfully verified. Please log in using your email and password');
        navigate(location.state.user_type === "doctor" ? "/auth/doctor/login" : "/auth/login");
      } else {
        toast.error('OTP verification failed');
      }
    } catch (error) {
      toast.error('Error during OTP verification');
      console.error('Error during OTP verification', error);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await axios.post(BASE_URL + 'auth/resend-otp/', {
        email: emailFromRegistration,
      });

      if (response.status === 200) {
        toast.success('OTP resent successfully');
      } else {
        toast.error('Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Error during OTP resend');
      console.error('Error during OTP resend', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form className="bg-white p-6 rounded shadow-md w-full max-w-sm" onSubmit={handleVerification}>
        <h2 className="text-2xl font-bold mb-2 text-center">OTP Verification</h2>
        <p className="mb-4 text-center">We have sent a verification code to your email.</p>
        <div className="flex justify-center mb-4 space-x-2 text-black">
          {Array.from({ length: 4 }, (_, index) => (
            <input
              key={index}
              type="text"
              name={`input${index + 1}`}
              maxLength="1"
              value={otp[`input${index + 1}`] || ''}
              onChange={(e) => handleInputChange(e, index)}
              ref={inputRefs[index]}
              className="w-10 h-10 text-center border border-gray-300 rounded"
            />
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Verify Me
        </button>
        <button
          type="button"
          onClick={handleResendOTP}
          className="w-full mt-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition duration-300"
        >
          Resend OTP
        </button>
      </form>
    </div>
  );
}

export default VerifyOtp;
