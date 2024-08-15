import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/constants/Constants";
import axios from "axios";
import Cookies from "js-cookie";
import Logo from "../../Components/adminside/navbar/Logo";
// import DocCrump from "../../Compounts/admin/elements/BreadCrumps/DocCrump";

function Account() {
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [transactionData, setTrasaction] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Function to toggle modal visibility
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const TransactionFields = [
        "transaction_id",
        "payment_id",
        "amount",
        "doctor_id",
        "patient_id",
        "doctor_commission", // Add this line
        "admin_commission", // Add this line
    ];

    const FieldInputTypes = {
        transaction_id: "number",
        payment_id: "text",
        amount: "number",
        doctor_id: "text",
        patient_id: "text",
        day: "date",
        start_time: "time",
        end_time: "time",
        status: "text",
        // created_at: "text",
    };

    // to fetch the data as per the search query
    const fetchTransactions = (url) => {
        const accessToken = Cookies.get("access");

        axios
            .get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })
            .then((req) => {
                console.log("divided in :", req.data.results);
                const transactions = req.data.results;
                // Calculate commissions for each transaction
                const transactionsWithCommissions = transactions.map(transaction => {
                    const doctorCommission = transaction.amount * 0.8; // 80% of amount
                    const adminCommission = transaction.amount * 0.2; // 20% of amount
                    return {
                        ...transaction,
                        doctor_commission: doctorCommission,
                        admin_commission: adminCommission,
                    };
                });

                // Save commissions to the transactionCommission table
                // transactionsWithCommissions.forEach(transaction => {
                //     const commissionData = {
                //         transaction: transaction.transaction_id,
                //         doctor_commission: transaction.doctor_commission,
                //         admin_commission: transaction.admin_commission,
                //     };
                //     // Assuming you have an endpoint to save commissions
                //     axios.post(`${BASE_URL}appointment/transactionCommission/`, commissionData, {
                //         headers: {
                //             Authorization: `Bearer ${accessToken}`,
                //             Accept: "application/json",
                //             "Content-Type": "application/json",
                //         },
                //     })
                //         .then((response) => { })
                //         .catch((error) => {
                //             console.error("Error saving commission:", error);
                //         });
                // });

                setTrasaction(transactionsWithCommissions);
                setNextPage(req.data.next);
                setPrevPage(req.data.previous);
                setTotalPages(Math.ceil(req.data.count / 10)); // Assuming 10 items per page
            })
            .catch((err) => {
                console.error("Error fetching transactions:", err);
            });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        fetchTransactions(BASE_URL + `appointment/detail/transaction/list/?search=${query}&page=${currentPage}`);
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            fetchTransactions(`${BASE_URL}appointment/detail/transaction/list/?search=${searchQuery}&page=${page}`);
        }
    };

    useEffect(() => {
        fetchTransactions(BASE_URL + `appointment/detail/transaction/list/?search=${searchQuery}&page=${currentPage}`);
    }, [searchQuery, currentPage]);

    const formatDateTime = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        return dateTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Use 24-hour format
        });
    };

    return (
        < div className="flex flex-col  w-full mt-16">
            {/* ************************************************search bar*********************************************** */}

            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                        Account Details
                    </h1>
                    <div className="sm:flex">
                        <div className="items-center hidden mb-3 sm:flex sm:divide-x sm:divide-black-100 sm:mb-0 dark:divide-black-700">
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

            <div className="flex flex-col bg-white shadow-lg rounded-lg my-6 overflow-x-auto">
                <div className="min-w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    {/* Checkbox */}
                                </th>
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
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactionData.map((item, index) => (
                                <tr
                                    key={item.transaction_id}
                                    className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        {/* Checkbox */}
                                    </td>
                                    {TransactionFields.map((field) => (
                                        <td
                                            key={field}
                                            className={`px-6 py-4 ${field === "status"
                                                ? "text-base font-medium whitespace-nowrap text-gray-900"
                                                : "text-sm text-gray-800"
                                                }`}
                                        >
                                            {field === "doctor_commission" || field === "admin_commission" ? item[field].toFixed(2) : item[field]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    <div className="flex justify-between mt-4 px-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Previous
                        </button>
                        <div className="flex items-center">
                            <span className="mr-2">Page {currentPage} of {totalPages}</span>
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Button to open the modal */}
            <button onClick={toggleModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Open Receipt
            </button>

            {/* Modal for the receipt */}
            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                {/* Receipt component */}
                                <div className="flex justify-center">
                                    <div className="max-w-lg bg-white p-8 rounded-lg shadow-lg">
                                        <div className="flex justify-between mb-4">
                                            <div>
                                                <h1 className="text-2xl font-semibold">Transaction Receipt</h1>
                                                <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Receipt #: {Math.random().toString(36).substring(2, 15)}</p>
                                            </div>
                                        </div>
                                        <div className="border-b border-gray-300 mb-4"></div>
                                        <table className="w-full mb-4">
                                            <tbody>
                                                <tr>
                                                    <td className="py-2 pr-4">Transaction ID</td>
                                                    <td className="py-2">Amount</td>
                                                    <td className="py-2">Doctor ID</td>
                                                    <td className="py-2">Patient ID</td>
                                                </tr>
                                                {transactionData.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="py-2 pr-4">{item.transaction_id}</td>
                                                        <td className="py-2">₹{item.amount}</td>
                                                        <td className="py-2">{item.doctor_id}</td>
                                                        <td className="py-2">{item.patient_id}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <p className="text-lg font-semibold">Total: {transactionData.reduce((total, item) => total + item.amount, 0)}</p>
                                        <p className="text-lg font-semibold">Doctor Commission: ₹{transactionData.reduce((total, item) => total + item.doctor_commission, 0)}</p>
                                        <div className="flex justify-between">
                                            <p className="text-lg font-semibold">Admin Commission: ₹{transactionData.reduce((total, item) => total + item.amount - item.doctor_commission, 0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={toggleModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Account;
