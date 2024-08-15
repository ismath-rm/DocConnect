import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserImage from '../../assets/images/user.jpg';
import { BASE_URL } from '../../utils/constants/Constants'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';
import DocumentVerificationForm from '../../Components/doctorside/Element/DocumentVerificationForm';
import { UserAPIwithAcess, UserImageAccess } from '../../Components/Api/Api';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom'
import DoctorSlotBooking from '../../Components/doctorside/DoctorSlotBooking'
import BookindDetailsDoctor from '../../Components/doctorside/Element/BookingDetailsDoctor'

const DoctorProfile = () => {
  const accessToken = Cookies.get("access");
  const [docDetail, setDocDetail] = useState([]);
  const [id, setId] = useState(null);
  const [isVerified, setisVerified] = useState(false)
  const [docid, setdocid] = useState("");

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const [profile, setProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    profile: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });

  useEffect(() => {
    fetchDoctorProfile()
    fetchData();
  }, []);


  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(BASE_URL + 'auth/user/details/', config);
      const userData = response.data;
      console.log(userData);
      setId(userData.id);
      setProfile({
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone_number: userData.phone_number,
        date_of_birth: userData.date_of_birth,
        gender: userData.gender,
        street: userData.street,
        city: userData.city,
        state: userData.state,
        zip_code: userData.zip_code,
        country: userData.country,
        profile: userData.profile_picture,

      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profile_picture', file);


    axios.put(BASE_URL + 'auth/user/profile/update/', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      }
    }).then(response => {
      setProfile((res) => ({ ...res, profile: response.data.profile_picture }))
      console.log("picture", response.data.profile_picture);
      toast.success('Profile picture updated successfully');
    }).catch(error => {
      toast.error('Error updating profile picture');
      console.error('Error updating profile picture:', error);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });

    validateField(name, value);
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "username":
        if (!value.trim()) {
          error = "Username is required.";
        }
        break;

      case "firstName":
      case "lastName":
        if (!value.trim()) {
          error = "Name is required.";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Name should only contain letters and spaces.";
        }
        break;

      case "phone_number":
        if (!/^[0-9]{10}$/.test(value)) {
          error = "Invalid phone number. It should contain 10 digits.";
        }
        break;

      case "date_of_birth":
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        if (!value || new Date(value) > tenYearsAgo) {
          error = "Date of birth should be at least 10 years ago.";
        }
        break;

      case "zip_code":
        if (!/^[0-9]{6}$/.test(value)) {
          error = "Invalid zip code. It should contain 6 digits.";
        }
        break;

      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  };

  const handleUpdate = () => {
    // Check for any errors before updating
    let isValid = true;
    Object.keys(profile).forEach((field) => {
      validateField(field, profile[field]);
      if (errors[field]) {
        isValid = false;
      }
    });

    if (isValid) {
      axios.put(BASE_URL + 'auth/user/profile/update/', profile, config)
        .then(response => {
          toast.success('General Details updated successfully');
        })
        .catch(error => {
          toast.error('Error updating profile');
          console.error('Error updating profile:', error);
        });
    } else {
      toast.error('Please fill out the form correctly.');
    }
  };

  // ________________________________________________________________________________//




  const ProfileFields = [
    "specializations",
    "about_me",
    "consultation_fees",
    "education",
    "years_of_experience",
    "hospital",


  ];

  const ProfilefieldInputTypes = {
    specializations: "select",
    consultation_fees: "number",
    years_of_experience: "number",
    about_me: "textarea",
    hospital: "text",
  };

  // Function to submit the personal profile information
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object
    const formData = new FormData(e.target);

    try {
      // Make the API request
      const response = await UserImageAccess.patch(
        BASE_URL + `auth/doc/pro/${id}/`,
        formData,
        config
      );
      console.log("Data updated successfully:", response.data);
      toast.success("Data updated successfully");
      // Optionally, you can reset the form or handle other actions
    } catch (error) {
      console.error("Error updating data:", error);
      // Handle the error as needed
      if (error.response) {
        toast.error(error.response.data.user.date_of_birth[0]);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };



  const fetchData = async () => {
    try {
      const token = Cookies.get("access");
      let decoded = jwtDecode(token);
      console.log(decoded, "hfhhhhhhhhhhhhhhhhhhhhhhhh");
      let id = decoded.user_id;
      console.log(id);
      setId(id);

      const doct = await UserAPIwithAcess.get("auth/doc/pro/" + decoded.user_id + '/', config);
      console.log('ismu1');
      console.log(doct.data.profile_picture);
      if (doct.status === 200) {
        console.log(doct);
        setDocDetail(doct.data);
        setdocid(doct.data.id)
        setisVerified(doct.data.user.is_id_verified);
        console.log('this is not what i want');

      }
      // Handle the response data as needed
      console.log(doct.data);
    } catch (error) {
      console.log(error);
    }
  };



  return (
    <div className="container mx-auto p-4 w-3/4">
      <h2 className="text-center text-2xl font-bold mb-4">Profile</h2>
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img
            className="rounded-full w-24 h-24 object-cover"
            // src={profile.profile ? BASE_URL + profile.profile : UserImage}
            src={profile.profile ? `${BASE_URL.replace(/\/+$/, '')}${profile.profile}` : UserImage}
            alt="Profile"
          />
          <label
            htmlFor="profile_picture_input"
            className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 text-white cursor-pointer z-10"
          >
            <FaEdit />
          </label>
          <input 
            id="profile_picture_input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h3 className="text-center text-xl font-semibold mb-4">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              name="username"
              value={profile.username}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.username ? 'border-red-500' : ''}`}
            />
            {errors.username && <p className="text-red-500 text-xs italic">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
            <input
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.firstName ? 'border-red-500' : ''}`}
            />
            {errors.firstName && <p className="text-red-500 text-xs italic">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
            <input
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.lastName ? 'border-red-500' : ''}`}
            />
            {errors.lastName && <p className="text-red-500 text-xs italic">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
            <input
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.phone_number ? 'border-red-500' : ''}`}
            />
            {errors.phone_number && <p className="text-red-500 text-xs italic">{errors.phone_number}</p>}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
            <input
              name="date_of_birth"
              value={profile.date_of_birth}
              onChange={handleChange}
              type="date"
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.date_of_birth ? 'border-red-500' : ''}`}
            />
            {errors.date_of_birth && <p className="text-red-500 text-xs italic">{errors.date_of_birth}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
            <select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.gender ? 'border-red-500' : ''}`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs italic">{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Street</label>
            <input
              name="street"
              value={profile.street}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.street ? 'border-red-500' : ''}`}
            />
            {errors.street && <p className="text-red-500 text-xs italic">{errors.street}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
            <input
              name="city"
              value={profile.city}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.city ? 'border-red-500' : ''}`}
            />
            {errors.city && <p className="text-red-500 text-xs italic">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">State</label>
            <input
              name="state"
              value={profile.state}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.state ? 'border-red-500' : ''}`}
            />
            {errors.state && <p className="text-red-500 text-xs italic">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Zip Code</label>
            <input
              name="zip_code"
              value={profile.zip_code}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.zip_code ? 'border-red-500' : ''}`}
            />
            {errors.zip_code && <p className="text-red-500 text-xs italic">{errors.zip_code}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
            <input
              name="country"
              value={profile.country}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.country ? 'border-red-500' : ''}`}
            />
            {errors.country && <p className="text-red-500 text-xs italic">{errors.country}</p>}
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update Details
          </button>
        </div>
      </div>

      {/* **************************************************Profile settting for user****************************************** */}

      <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">

        <h3 className="mb-4 text-xl font-semibold dark:text-white">Professional information</h3>
        <form onSubmit={handleProfileSubmit} className="grid grid-cols-6 gap-6">
          {ProfileFields.map((fieldName) => (
            <div key={fieldName} className="col-span-6 sm:col-span-3">
              <label
                htmlFor={fieldName}
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {fieldName.replace(/_/g, " ")}
              </label>
              {ProfilefieldInputTypes[fieldName] === "textarea" ? (
                <textarea
                  name={fieldName}
                  id={fieldName}
                  defaultValue={docDetail[fieldName]}
                  rows={4}
                  maxLength={255}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder={`Enter ${fieldName.replace(/_/g, " ")}`}
                  required
                />
              ) : ProfilefieldInputTypes[fieldName] === "select" ? (
                <select
                  name={fieldName}
                  id={fieldName}
                  value={docDetail[fieldName]}
                  onChange={(e) => setDocDetail({ ...docDetail, [fieldName]: e.target.value })}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  <option value="">Select Specialization</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                  <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                  <option value="Endocrinologist">Endocrinologist</option>
                  <option value="Pulmonologist">Pulmonologist</option>
                  <option value="Nephrologist">Nephrologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="General">General</option>
                  <option value="Rheumatologist">Rheumatologist</option>
                  <option value="Hematologist">Hematologist</option>
                  <option value="Urologist">Urologist</option>
                  <option value="Otolaryngologist">Otolaryngologist</option>
                  <option value="Radiologist">Radiologist</option>
                </select>
              ) : (
                <input
                  type={ProfilefieldInputTypes[fieldName]}
                  name={fieldName}
                  id={fieldName}
                  defaultValue={docDetail[fieldName]}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder={`Enter ${fieldName.replace(/_/g, " ")}`}
                      required
                />
              )}
            </div>
          ))}
          <div className="col-span-6 sm:col-full">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              type="submit"
            >
              Save all
            </button>
          </div>
        </form>
      </div>
      {/* <DocumentVerificationForm id={id} /> */}
      {/* {id && !isVerified && <DocumentVerificationForm id={id} />} */}
      {/* *************************************************This portion for Time slot********************************************************/}
      {isVerified &&
        <div className="py-10 text-center">
        <Link
          to="/doctor/slot"
          className="px-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
        >
          Create Slot
        </Link>
      </div>}

      {/* ***********************************************verification documents***************************************************************** */}
      {id && !isVerified && <DocumentVerificationForm id={id} />}

      

      
    </div>



  );
}

export default DoctorProfile
