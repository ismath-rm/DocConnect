import React from 'react';

const ForgotPassword = () => {
  return (
    <div className="flex w-full h-screen bg-blue-50">
      <div className="w-full  flex justify-center items-center">
        <div className="bg-blue-100 w-full md:w-96 p-8 md:rounded-l-lg shadow-2xl">
          <form className="flex flex-col w-full  text-left" method="POST">
            <p className="text-3xl text-blue-600 font-bold text-center">Forgot Password</p>
            <div className="mt-4"></div>
              <label className="text-left block text-gray-700 text-sm font-bold mb-2">             
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="email"
                className="w-full px-4 py-3 mb-3 text-sm font-medium outline-none bg-white placeholder:text-black rounded-2xl"
              />
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
