import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import DoctorSlotBooking from '../../Components/doctorside/DoctorSlotBooking';
import { UserAPIwithAcess } from '../../Components/Api/Api';
import BookindDetailsDoctor from '../../Components/doctorside/Element/BookingDetailsDoctor';
import {
    BASE_URL
} from '../../utils/constants/Constants';

const DoctorSlot = () => {
    const accessToken = Cookies.get("access");

    const [id, setId] = useState(null);
    const [docid, setdocid] = useState('');
    const [isVerified, setisVerified] = useState(false);
    const [booking, setBooking] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };

    const fetchBookingDetails = async (url) => {
        console.log('fetchBookingDetails id:', url);
        await UserAPIwithAcess.get(
            `${url}`,
            config
        )
            .then((res) => {
                console.log("pagination datas:", res.data);
                setBooking(res.data.data);
                console.log("the details of the doctor is here", res.data.data);
                setNextPage(res.data.pagination.next);  // Updated to use pagination metadata
                setPrevPage(res.data.pagination.previous);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const bookingData = async () => {
        try {
            const token = Cookies.get("access");
            let decoded = jwtDecode(token);
            console.log(decoded, "got it now");
            let id = decoded.user_id;
            console.log(id);
            setId(id);

            const doct = await UserAPIwithAcess.get("auth/doc/pro/" + decoded.user_id + '/', config);
            console.log('ahad');
            console.log(doct.data);
            if (doct.status === 200) {
                console.log(doct);
                setdocid(doct.data.id);
                console.log('this is not what i want');
                setisVerified(doct.data.user.is_id_verified);
                fetchBookingDetails(doct.data.id);
                fetchBookingDetails(`${BASE_URL}appointment/booking/details/doctor/${doct.data.id}`)
                console.log("its display fetchBookingDetails:", fetchBookingDetails);
            }
            // Handle the response data as needed
            console.log(doct.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        bookingData();
    }, []);
    
    useEffect(() => {
        console.log("its all right now:", booking)
    }, [booking])

    return (
        <div className="container mx-auto p-4 w-full max-w-6xl">
            {isVerified ? (
                <>
                    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-xl font-semibold dark:text-white">
                            Time Slot Allotment
                        </h3>
                        <div className="mb-4">
                            <DoctorSlotBooking docid={docid} />
                        </div>
                    </div>

                    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="p-2 m-2 text-xl font-semibold dark:text-white">
                            Your Booking Details
                        </h3>
                        <div className="flow-root">
                            {booking.length > 0 ? (
                                <ul className="mb-6 divide-y divide-gray-200 dark:divide-gray-700">
                                    {booking.map((bookingItem, index) => {
                                        return (
                                            <li key={index} className="py-4">
                                                <BookindDetailsDoctor
                                                    transaction_id={bookingItem}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="pt-10 pl-5 font-bold text-2xl text-red-600">
                                    No booking history
                                </p>
                            )}
                        </div>

                        {/* Pagination section */}
                        <nav className="flex justify-between items-center mt-4">
                            <ul className="flex space-x-2">
                                <li className={`page-item ${!prevPage ? 'disabled' : ''}`}>
                                    <button
                                        className={`page-link px-4 py-2 border-2 rounded 
                                                    ${prevPage ? 'border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white' 
                                                    : 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-100'}`}
                                        onClick={() => prevPage && fetchBookingDetails(prevPage)}
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
                                        onClick={() => nextPage && fetchBookingDetails(nextPage)}
                                        disabled={!nextPage}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </>
            ) : (
                <p className="text-red-600 text-center font-bold text-xl">
                    Not Verified, You Can't Create Slot
                </p>
            )}
        </div>
    );
}

export default DoctorSlot;
