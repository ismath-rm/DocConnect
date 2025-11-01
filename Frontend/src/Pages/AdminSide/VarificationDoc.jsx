import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/constants/Constants";
import profile from "../../assets/images/user.jpg";
import EditDoctor from "../../Components/adminside/elements/Modal/EditDoctor";
import { toast } from "react-toastify";
import Cookies from 'js-cookie';
import { UserAPIwithAcess } from '../../Components/Api/Api'
import VerificationDownload from '../../Components/adminside/elements/VerificationDownload';



function VarificationDoc() {
    const accessToken = Cookies.get("access");
    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    const onChange = (e) => console.log(`radio checked:${e.target.value}`);
    const [doctorData, setDoctorData] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [checked, setChecked] = useState(true);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [doctEditData, setEditingDoctorId] = useState(null);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCheckboxChange = (docId, currentStatus) => {
        const formData = new FormData();
        formData.append("user.is_active", !currentStatus);

        UserAPIwithAcess
            .patch(`auth/admin/doc/${docId}`, formData, config)
            .then((res) => {
                toast.success("Data updated successfully");
                setChecked(!currentStatus);
            })
            .catch((err) => {
                console.error("Error updating data:", err);
            });
    };

    const doctorEdit = (custom_id) => {
        setEditModalVisible(true);
        setEditingDoctorId(custom_id);
    };

    const doctorDelete = (custom_id) => {
        setDeleteModalVisible(true);
        setEditingDoctorId(custom_id);
    };

    const fetchUsers = (url) => {
        const accessToken = Cookies.get("access");
        UserAPIwithAcess
            .get(url, config)
            .then((req) => {
                setDoctorData(req.data.results);
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
        fetchUsers(BASE_URL + `auth/admin/doctor/verication/list/?search=${query}`);
    };



    useEffect(() => {
        fetchUsers(BASE_URL + `auth/admin/doctor/verication/list/?search=${searchQuery}`);
    }, [isEditModalVisible, checked, isDeleteModalVisible, searchQuery]);

    return (
        <div className="flex flex-col  w-full mt-16">

            {/* ************************************************search bar*********************************************** */}

            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    All Doctors
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
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                                    <tr>
                                        
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Doctor ID
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Speciality
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Phone number
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Status
                                            <br />
                                            (Active / Deactive)
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Aprroval status
                                            <br />
                                            (Approved / Pending / Rejected)
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-sm font-semibold uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {doctorData.map((item, index) => {
                                        return (
                                            <tr
                                                key={item.doctor_user.custom_id}
                                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <td className="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                                                    <img
                                                        className="w-10 h-10 rounded-full"
                                                        src={
                                                            item.profile_picture
                                                                ? item.profile_picture
                                                                : profile
                                                        }
                                                        alt="{{first_name  }} avatar"
                                                    />
                                                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                                                            {item.first_name + " " + item.last_name}
                                                        </div>
                                                        <div className="text-sm font-normal text-black dark:text-gray-400">
                                                            {item.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {item.doctor_user.custom_id}
                                                </td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {item.doctor_user.specializations}
                                                </td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {item.phone_number}
                                                </td>
                                                <td className="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-white">
                                                    <div className="flex items-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.is_active}
                                                                className="sr-only peer"
                                                                onChange={() =>
                                                                    handleCheckboxChange(
                                                                        item.doctor_user.custom_id,
                                                                        item.is_active
                                                                    )
                                                                }
                                                            />
                                                            <div
                                                                className={`peer ring-0 bg-rose-400 rounded-full outline-none duration-300 after:duration-500 w-8 h-8 shadow-md ${item.is_active
                                                                        ? "peer-checked:bg-emerald-500"
                                                                        : ""
                                                                    } peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:outline-none after:h-6 after:w-6 after:bg-gray-50 after:top-1 after:left-1 after:flex after:justify-center after:items-center ${item.is_active
                                                                        ? 'peer-checked:after:content-["✔️"]'
                                                                        : ""
                                                                    } peer-hover:after:scale-75`}
                                                            ></div>
                                                        </label>
                                                    </div>
                                                </td>

                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {item.approval_status}
                                                </td>

                                                <td className="p-4 flex space-x-2 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            doctorEdit(item.doctor_user.  id)
                                                        }
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 mr-2"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Edit user
                                                    </button>


                                                    <VerificationDownload userId={item.id}/>

                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                                <ul className="pagination">
                                    <li className="page-item">
                                        <button
                                            className="page-link font-bold bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded"
                                            onClick={() => prevPage && fetchUsers(prevPage)}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                </ul>

                                <ul className="pagination">
                                    <li className="page-item">
                                        <button
                                            className="page-link font-bold bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded"
                                            onClick={() => nextPage && fetchUsers(nextPage)}
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

            {/* ********************************************************** User EditModal******************************************************* */}

            {isEditModalVisible && (
                <div
                    className={`fixed left-0 right-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full ${isEditModalVisible ? "block" : "hidden"
                        }`}
                    id="edit-user-modal"
                    style={{ marginTop: "64px" }} 
                >
                    <div className="flex items-center justify-center h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 w-full md:w-auto max-h-screen overflow-y-auto max-w-screen-2xl">
                            
                            <div className="flex items-start justify-between p-5 border-b rounded-t dark:border-gray-700">
                                <h3 className="text-xl font-semibold dark:text-white">
                                    Edit user
                                </h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                                    onClick={() => {
                                        setEditModalVisible(false);
                                    }}
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <EditDoctor
                                    doctorId={doctEditData}
                                    setIsDataFetched={setIsDataFetched}
                                    setEditModalVisible={setEditModalVisible}
                                />
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}

            {/* ******************************************************User Delete Modal************************************************************* */}

            {isDeleteModalVisible && (
                <div className="fixed left-0 right-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full">
                    <div className="w-full max-w-md px-4 md:h-auto">
                        <DeleteDoct
                            doctorId={doctEditData}
                            setDeleteModalVisible={setDeleteModalVisible}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default VarificationDoc;