import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { AdminAPIwithAcess } from '../../Components/Api/Api';

function Booking() {
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [transactionData, setTrasaction] = useState([])

    const TransactionFields = [
        "transaction_id",
        "payment_id",
        "amount",
        "doctor_id",
        "patient_id",
        "booked_date",
        "booked_from_time",
        "booked_to_time",
        "is_consultency_completed",
        "created_at",
    ];

    const FieldInputTypes = {
        transaction_id: "number",
        payment_id: "text",
        amount: "number",
        doctor_id: "text",
        patient_id: "text",
        booked_date: "date",
        booked_from_time: "time",
        booked_to_time: "time",
        is_consultency_completed: "text",
        created_at: "text",
    };


    const fetchTransactions = (url) => {
        const accessToken = Cookies.get("access");
        const config = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };
        console.log(accessToken, "this portion for the access token");
        AdminAPIwithAcess
            .get(url, config)
            .then((req) => {
                setTrasaction(req.data.results);
                setNextPage(req.data.next);
                setPrevPage(req.data.previous);
                console.log(req.data.results);
                
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        fetchTransactions(`appointment/detail/transaction/list/?search=${query}`);
    };

    useEffect(() => {
        fetchTransactions(`appointment/detail/transaction/list/?search=${searchQuery}`);
    }, [searchQuery]);

    return (
        <div className="flex flex-col  w-full mt-16">
            
            {/* ************************************************search bar*********************************************** */}

            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">

                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                        All Booking
                    </h1>
                    <div className="sm:flex">
                        <div className="items-center hidden mb-3 sm:flex sm:divide-x sm:divide-gray-100 sm:mb-0 dark:divide-gray-700">
                            <form className="lg:pr-3" action="#" method="GET">
                                <label htmlFor="users-search" className="sr-only">
                                    Search
                                </label>
                                <div className="relative mt-1 lg:w-64 xl:w-96">
                                    <input
                                        type="text"
                                        onChange={(e) => handleSearch(e.target.value)}
                                        id="users-search"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                        placeholder="Search for users"
                                    />
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>

            {/* ****************************************************************table ***************************************************** */}

            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden shadow">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                    <tr>

                                        {TransactionFields.map((field) => (
                                            <th
                                                key={field}
                                                scope="col"
                                                className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                            >
                                                {field.replace(/_/g, " ")}
                                            </th>
                                        ))}

                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {transactionData.map((item, index) => (
                                        <tr
                                            key={item.transaction_id}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            
                                            {TransactionFields.map((field) => (
                                                <td
                                                    key={field}
                                                    className={`p-4 ${field === "status"
                                                        ? "text-base font-normal whitespace-nowrap dark:text-white"
                                                        : ""
                                                        }`}
                                                >
                                                    {item[field]}
                                                </td>
                                            ))}

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                          
                            <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                                <ul className="pagination">
                                    <li className="page-item">
                                        <button
                                            className="page-link bg-blue-600 font-bold text-white hover:bg-blue-700 px-4 py-2 rounded"
                                            onClick={() => prevPage && fetchTransactions(prevPage)}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                </ul>

                                <ul className="pagination">
                                    <li className="page-item">
                                        <button
                                            className="page-link bg-blue-600 font-bold text-white hover:bg-blue-700 px-4 py-2 rounded"
                                            onClick={() => nextPage && fetchTransactions(nextPage)}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Booking;
