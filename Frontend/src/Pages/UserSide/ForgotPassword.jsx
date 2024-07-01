import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../utils/constants/Constants';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: e.target.email.value,
    };

    try {
      const response = await axios.post(BASE_URL + 'auth/forgot-password/', data);

      if (response.status === 200) {
        setFormError('');
        toast.success('Password reset link sent to email');
      } else {
        setFormError('Failed to send reset link');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      setFormError('An error occurred while sending the reset link');
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-full flex items-center">
        <div className="bg-blue-100 w-full md:w-96 p-8 md:rounded-l-lg shadow-2xl">
          <form className="flex flex-col w-full text-left" onSubmit={handleSubmit}>
            <p className="text-3xl text-blue-600 font-bold text-center">Forgot Password</p>
            <div className="mt-4"></div>
            <label className="text-left block text-black text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 mb-3 text-sm font-medium outline-none bg-white placeholder:text-grey-700 text-black rounded-2xl"
            />
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <div className="mt-8">
              <button className="bg-blue-600 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-500">
                Send Otp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
