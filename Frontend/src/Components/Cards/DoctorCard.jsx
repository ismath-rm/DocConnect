import React from "react";
import { Link } from "react-router-dom";

const DoctorCard = ({ img, name, speciality, id }) => {
    return (
        <Link
            to=""
            className="flex flex-col items-center p-1 mb-2 bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
            <img
                className="object-cover w-full rounded-full h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                src={img}
                alt=""
            />

            <div className="flex flex-col justify-between p-4 leading-normal">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Dr. {name.charAt(0).toUpperCase() + name.slice(1)}
                </h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {speciality}
                </p>

                <div className="flex flex-col md:flex-row mb-2">
                    <Link to={`/doctor-profile/${id}`}>
                        <button className="btn border shadow-sm p-1 bg-blue-600 rounded text-white ml-0 mt-1 md:ml-1 md:mt-0">
                            View Profile
                        </button>
                    </Link>
                    <Link to={`/doctor-profile/${id}`}>
                        <button className="btn border shadow-sm p-1 bg-green-600 rounded ml-0 mt-2 text-white md:ml-2 md:mt-0">
                            Book Appointment
                        </button>
                    </Link>
                </div>
            </div>
        </Link>
    );
};

export default DoctorCard;
