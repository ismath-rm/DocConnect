import { useState, useEffect } from 'react';
import axios from 'axios';
import UserImage from '../../assets/images/user.jpg';
import { BASE_URL } from '../../utils/constants/Constants'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';
import { UserAPIwithAcess } from '../../Components/Api/Api';

const UserProfile = () => {
  const accessToken = Cookies.get("access");
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
    blood_group: '',
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
    blood_group: '',
    date_of_birth: '',
    gender: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(BASE_URL + 'auth/user/details/', config);
      const userData = response.data;
  
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
        blood_group: userData.blood_group,
      });

      fetctWallet(userData.id);

    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };


  const [wallet, setWallet] = useState('');


  const fetctWallet = (custom_id) => {
    
    UserAPIwithAcess.get(`auth/wallet/amount/${custom_id}`, config)
      .then((res) => {
        setWallet(res.data.balance);
        console.log(res.data.balance);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          console.log('Wallet not found, setting balance to 0');
          setWallet(0);
        } else {
          console.error('Error fetching wallet data:', error);
        }
      });
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profile_picture', file);
    console.log(formData

    );

    axios.put(BASE_URL + 'auth/user/profile/update/', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      }
    }).then(response => {
      setProfile((res) => ({ ...res, profile: response.data.profile_picture }));
      toast.success('Profile picture updated successfully');
    }).catch(error => {
      toast.error('Error updating profile picture');
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
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Name should only contain letters and spaces.";
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
          toast.success('Data updated successfully');
        })
        .catch(error => {
          toast.error('Error updating profile');
        });
    } else {
      toast.error('Please fill out the form correctly.');
    }
  };



  return (
    <div className="container mx-auto p-4 w-3/4">
      <h2 className="text-center text-2xl font-bold mb-4">Profile</h2>
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img
            className="rounded-full w-24 h-24 object-cover"
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Blood Group</label>
            <select
              name="blood_group"
              value={profile.blood_group}
              onChange={handleChange}
              className={`block w-full bg-white border border-gray-300 rounded py-2 px-3 ${errors.blood_group ? 'border-red-500' : ''}`}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            {errors.blood_group && <p className="text-red-500 text-xs italic">{errors.blood_group}</p>}
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

      {/* *************************************************This portion for Wallet********************************************************/}

      <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-semibold dark:text-white">
          Your Wallet Amount
        </h3>

        <div className="flex justify-center items-center">
          <div className="text-xl font-bold">
            ₹{wallet}
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserProfile;
