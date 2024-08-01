import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { UserAPIwithAcess } from "../../../Api/Api";

function EditPatient({ doctorId, setIsDataFetched, setEditModalVisible }) {
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
    "street",
    "city",
    "state",
    "zip_code",
    "country",
    "is_id_verified",
    "is_email_verified",
    "is_active",
    "blood_group",
  ];

  const fieldInputTypes = {
    username: "text",
    first_name: "text",
    last_name: "text",
    gender: "text",
    phone_number: "text",
    date_of_birth: "date",
    street: "text",
    city: "text",
    state: "text",
    zip_code: "text",
    country: "text",
    is_id_verified: "checkbox",
    date_joined: "text",
    is_email_verified: "checkbox",
    is_active: "checkbox",
    blood_group: "text",
  };

  const [user, setUser] = useState({});
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a FormData object
    const formData = new FormData();

    // Append editable user data to the form data
    const editableFields = ["is_id_verified", "is_email_verified", "is_active"];
    editableFields.forEach((key) => {
      formData.append(key, user[key]);
    });

    // Debugging: Check the formData contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }
    
    // Make the API request
    UserAPIwithAcess
      .patch(`auth/admin/patient/${doctorId}`, formData, config)
      .then((res) => {
        console.log("Data updated successfully:", res.data);
        toast.success("Data updated successfully");
        setEditModalVisible(false);
      })
      .catch((err) => {
        console.error("Error updating data:", err);
        toast.error("Error updating data");
      });
  };

  useEffect(() => {
    UserAPIwithAcess
      .get(`auth/admin/patient/${doctorId}`, config)
      .then((res) => {
        setUser({ ...res.data });
        setDocDetail(res.data);
        console.log(res.data, "reached to the editing component");
        setIsDataFetched(true);
      })
      .catch((err) => {
        console.log("halooooooooo");
        console.log(err);
        toast.error("Error fetching data", err);
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
              {/* Display Blood Group */}
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="blood_group"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Blood Group
                </label>
                <input
                  type="text"
                  name="blood_group"
                  value={user.blood_group || ""}
                  readOnly
                  id="blood_group"
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                />
              </div>

              {UserFields.filter(field => field !== "blood_group").map((field, index) => {
                const isEditableField =
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
                    {fieldInputTypes[field] === "checkbox" ? (
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
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                        required=""
                        readOnly={!isEditableField}
                      />
                    )}
                  </div>
                );
              })}

              <div className="col-span-6 sm:col-full">
                <button
                  className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900"
                  type="submit"
                >
                  Save all
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditPatient;
