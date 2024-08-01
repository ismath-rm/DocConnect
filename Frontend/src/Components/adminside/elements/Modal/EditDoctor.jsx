import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { UserAPIwithAcess, UserImageAccess } from "../../../Api/Api";

function EditDoctor({ doctorId, setIsDataFetched, setEditModalVisible }) {
  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const UserFields = [
    "username",
    "first_name",
    "last_name",
    "gender",
    "phone_number",
    "date_of_birth",
    "approval_status",
    "street",
    "city",
    "state",
    "zip_code",
    "country",
    "is_id_verified",
    "is_email_verified",
    "is_active",
  ];

  const fieldInputTypes = {
    username: "text",
    first_name: "text",
    last_name: "text",
    gender: "text", // Change to text to make it read-only
    phone_number: "text",
    date_of_birth: "date",
    approval_status: "text",
    street: "text",
    city: "text",
    state: "text",
    zip_code: "text",
    country: "text",
    is_id_verified: "checkbox",
    is_email_verified: "checkbox",
    is_active: "checkbox",
  };

  const [user, setUser] = useState({});
  const [specializations, setSpecializations] = useState("");
  const [docDetail, setDocDetail] = useState({});

  const handleInputChange = (field, value) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: checked,
    }));
  };

  const handleSelectChange = (e, field) => {
    const value = e.target.value;

    if (field === "specializations") {
      setSpecializations(value);
    } else if (field.includes(".")) {
      const [nestedField, subField] = field.split(".");
      setUser((prevUser) => ({
        ...prevUser,
        [nestedField]: {
          ...prevUser[nestedField],
          [subField]: value,
        },
      }));
    } else {
      handleInputChange(field, value);
    }
  };

  const handleSubmit = (e) => {
    console.log('hey this ireach here yoo');
    console.log(e)
    e.preventDefault();

    // Create a FormData object
    const formData = new FormData();

    // Append editable user data to the form data
    const editableFields = ["approval_status", "is_id_verified", "is_email_verified", "is_active"];
    editableFields.forEach((key) => {
      formData.append(key, user[key]);
    });
    console.log(formData);

    // Debugging: Check the formData contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Make the API request
    UserImageAccess
      .patch(`auth/admin/doc/update/${doctorId}/`, formData, config)
      .then((res) => {
        console.log("Data updated successfully:", res.data);
        toast.success("Data updated successfully");
        setEditModalVisible(false);
        setIsDataFetched(false); 
      })
      .catch((err) => {
        console.error("Error updating data:", err);
        toast.error("Error updating data");
      });
  };

  useEffect(() => {
    UserAPIwithAcess
      .get(`auth/admin/doc/${doctorId}`, config)
      .then((res) => {
        setUser({ ...res.data.user });
        setSpecializations(res.data.specializations || "");
        setDocDetail(res.data);
        console.log(res.data, "reached to the editing component");
        setIsDataFetched(true);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching data");
      });
  }, [doctorId, setIsDataFetched]);

  return (
    <>
      <div className="col-span-2">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h3 className="mb-4 text-xl font-semibold dark:text-white">
            General information
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-6 gap-6">
              {/* Display Specializations */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="specializations"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Specializations
                </label>
                <div
                  id="specializations"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  {specializations || "Not Specified"}
                </div>
              </div>

              {UserFields.map((field, index) => {
                const isEditableField =
                  field === "approval_status" ||
                  field === "is_id_verified" ||
                  field === "is_email_verified" ||
                  field === "is_active";
                return (
                  <div key={index} className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor={field}
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace("_", " ")}
                    </label>
                    {fieldInputTypes[field] === "select" ? (
                      <select
                        name={field}
                        value={user[field] || ""}
                        onChange={(e) => handleSelectChange(e, field)}
                        id={field}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        required=""
                        readOnly={!isEditableField}
                      >
                        {field === "gender" ? (
                          <>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </>
                        ) : (
                          <option value={user[field] || ""}>
                            {user[field] || ""}
                          </option>
                        )}
                      </select>
                    ) : fieldInputTypes[field] === "checkbox" ? (
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          name={field}
                          checked={user[field] || false}
                          id={field}
                          className="form-checkbox h-5 w-5 text-primary-500"
                          onChange={(e) =>
                            handleCheckboxChange(field, e.target.checked)
                          }
                          disabled={!isEditableField}
                        />
                        <label
                          htmlFor={field}
                          className="ml-2 text-gray-700 dark:text-white"
                        >
                          {field.charAt(0).toUpperCase() +
                            field.slice(1).replace("_", " ")}
                        </label>
                      </div>
                    ) : (
                      <input
                        type={fieldInputTypes[field]}
                        name={field}
                        value={user[field] || ""}
                        id={field}
                        className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder={user[field] || ""}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        readOnly={!isEditableField}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-primary-600 border border-transparent rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-700 focus:outline-none focus:ring-primary-700"
              >
                Save 
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditDoctor;
