import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    CardHeader,
    Typography,
    CardBody,
} from "@material-tailwind/react";
import { BASE_URL } from '../../utils/constants/Constants';
import { jwtDecode } from "jwt-decode";

const Accountdetailes = () => {
    const [Commissions, setCommissions] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [loading, setLoading] = useState(false);
    const doctorId = localStorage.getItem("custom_id");
    const accessToken = Cookies.get("access");
    const [totalReceivedAmount, setTotalReceivedAmount] = useState(0);

    const fetchTransactions = async (url) => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            const transactionsWithCommissions = response.data.results.map(transaction => {
                const doctorCommission = transaction.amount * 0.8; 
                const adminCommission = transaction.amount * 0.2; 
                return {
                    ...transaction,
                    doctor_commission: doctorCommission,
                    admin_commission: adminCommission,
                };
            });

            setCommissions(transactionsWithCommissions);
            setNextPage(response.data.next);
            setPrevPage(response.data.previous);
            setTotalReceivedAmount(response.data.total_amount_received);

        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const url = `${BASE_URL}appointment/api/transactions-doctor-account/${jwtDecode(accessToken).user_id}/`;
        fetchTransactions(url);
    }, [doctorId, accessToken]);

    return (
        <Card className="h-full w-full">
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center md:justify-center">
                    <div>
                        <Typography variant="h5" className="text-4xl font-bold tracking-tight text-gray-900">
                            Doctor Transactions
                        </Typography>
                        <Typography color="gray" className="mt-4 font-normal">
                            These are details about the doctor's transactions
                        </Typography>
                    </div>
                    <div className="mt-4">

                    </div>
                </div>
            </CardHeader>
            <CardBody className="overflow-scroll px-0">
                <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Transaction ID
                                </Typography>
                            </th>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Patient ID
                                </Typography>
                            </th>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Patient Paid Amount
                                </Typography>
                            </th>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Commission for Admin
                                </Typography>
                            </th>
                            <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                    Amount Received
                                </Typography>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Commissions.map((transaction, index) => {
                            const isLast = index === Commissions.length - 1;
                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                            return (
                                <tr key={transaction.transaction_id}>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-bold">
                                            {transaction.transaction_id}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {transaction.patient_id}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            ₹ {transaction.amount}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            ₹ {transaction.admin_commission}
                                        </Typography>
                                    </td>
                                    <td className={classes}>
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            ₹ {transaction.doctor_commission}
                                        </Typography>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="4" className="text-right font-bold">Total Amount Received:</td>
                            <td className="font-bold">₹ {totalReceivedAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

               
                <nav className="flex justify-between px-4 py-2">
                    <ul className="pagination flex space-x-2">
                        <li className={`page-item ${!prevPage ? 'disabled' : ''}`}>
                            <button
                                className={`page-link px-4 py-2 border-2 rounded 
                            ${prevPage ? 'border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white'
                                        : 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-100'}`}
                                onClick={() => prevPage && fetchTransactions(prevPage)}
                                disabled={!prevPage || loading}
                            >
                                Previous
                            </button>
                        </li>
                    </ul>

                    <ul className="pagination flex space-x-2">
                        <li className={`page-item ${!nextPage ? 'disabled' : ''}`}>
                            <button
                                className={`page-link px-4 py-2 border-2 rounded 
                            ${nextPage ? 'border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white'
                                        : 'border-gray-300 text-gray-300 cursor-not-allowed bg-gray-100'}`}
                                onClick={() => nextPage && fetchTransactions(nextPage)}
                                disabled={!nextPage || loading}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>

            </CardBody>
        </Card>
    );
};

export default Accountdetailes;
