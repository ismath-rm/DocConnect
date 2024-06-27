import React from 'react'
import Profile from '../../assets/images/user.png'
const UserProfile = () => {
  return (
    <>
      <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
        {/* profile image portion */}
        <div className="col-span-full xl:col-auto">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
              <img
                className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                src={Profile}
                alt="Profile picture"
              />
              <div>
                <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                  Profile picture
                </h3>
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  JPG, GIF or PNG. Max size of 800K
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    // ref={fileInputRef}
                    className="hidden"
                    // onChange={handleFileInputChange}
                  />

                  <button
                    type="button"
                    // onClick={handleImageUpload}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    <svg
                      className="w-4 h-4 mr-2 -ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      <path d="M9 13h2v5a1 1 0 11-2 0v-5z" /> */}
                    </svg>
                    Upload picture
                  </button>
                  <button
                    type="button"
                    // onClick={profileDelete}
                    className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-600 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>



        
        </div>

        {/* **************************************************General information********************************************************/}

        <div className="col-span-2">
          <form >

          </form>
        </div>
      </div>
    </>
  );
}

export default UserProfile
