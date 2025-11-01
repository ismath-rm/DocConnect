import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants/Constants'
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import BookindDetails from '../../Components/userside/Element/BookindDetails';

const ViewBookingDetails = () => {
    const [booking, setBooking] = useState([]);
    const [wallet, setWallet] = useState('');
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    const accessToken = Cookies.get("access");
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };


    const fetchBookingDetails = (url) => {
        axios
            .get(`${url}`, config)
            .then((res) => {
                setBooking(res.data.data);
                setNextPage(res.data.pagination.next);  
                setPrevPage(res.data.pagination.previous);  
            })
            .catch((err) => {
                toast.error('Error fetching booking details');
            });
    };


    const fetchBookingData = async () => {
        try {
            const response = await axios.get(BASE_URL + 'auth/user/details/', config);
            const userData = response.data;

            fetchBookingDetails(`${BASE_URL}appointment/booking/details/patient/${userData.id}`);

        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    useEffect(() => {
        fetchBookingData();
    }, []);

    useEffect(() => {
        console.log("xc6vt7y8bu9nwefnuwevcytwbciwemcwebcwevct7wgcuwnbeyvwev", booking)
    }, [booking])


    return (
        <div className="container mx-auto p-4 w-2/4">
            <h3 className=" p-2 m-2 text-xl font-semibold dark:text-white">
                Your Booking Details
            </h3>
            <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <div className="flow-root">

                    {booking.length > 0 ? (
                        <ul className="mb-6 divide-y divide-gray-200 dark:divide-gray-700">
                            {booking.map((bookingItem, index) => {
                                return (
                                    <li key={index} className="py-4">
                                        <BookindDetails
                                            transaction_id={bookingItem}
                                            setWallet={setWallet}

                                        />
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="pt-10 pl-5 font-bold text-2xl text-red-600">
                            No booking history
                        </p>
                    )}
                </div>
            </div>


            <nav className="flex justify-between px-5">
    <ul className="pagination">
        <li className={`page-item ${!prevPage ? 'disabled' : ''}`}>
            <button
                className={`page-link py-2 px-4 border-2 rounded-md 
                            ${prevPage ? 'border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white' 
                            : 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-100'}`}
                onClick={() => prevPage && fetchBookingDetails(prevPage)}
                disabled={!prevPage}
            >
                Previous
            </button>
        </li>
    </ul>

    <ul className="pagination">
        <li className={`page-item ${!nextPage ? 'disabled' : ''}`}>
            <button
                className={`page-link py-2 px-4 border-2 rounded-md 
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
    )
}

export default ViewBookingDetails;
