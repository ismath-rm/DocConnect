import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../utils/constants/Constants";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import VerificationDownload from '../../adminside/elements/VerificationDownload';

const DocumentVerificationForm = ({ id }) => {
  const accessToken = Cookies.get("access");
  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const [aadharFile, setAadharFile] = useState(null);
  const [degreeCertificate, setDegreeCertificate] = useState(null);
  const [experienceCertificate, setExperienceCertificate] = useState(null);
  const [aadharFileName, setAadharFileName] = useState("");
  const [degreeFileName, setDegreeFileName] = useState("");
  const [experienceFileName, setExperienceFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const allowedFileTypes = ["image/png", "image/jpeg", "application/pdf"];

  const handleFileChange = (event, setFile, setFileName) => {
    const file = event.target.files[0];

    if (file && allowedFileTypes.includes(file.type)) {
      setFile(file);
      setFileName(file.name);
      setErrorMessage("");
    } else {
      setErrorMessage("Invalid file type. Please upload a PNG, JPG, or PDF file.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!aadharFile || !degreeCertificate || !experienceCertificate) {
      setErrorMessage("Please upload all required documents.");
      return;
    }

    const formData = new FormData();
    formData.append("user", id);
    formData.append("aadhar_file", aadharFile);
    formData.append("degree_certificate", degreeCertificate);
    formData.append("experience_certificate", experienceCertificate);

    try {
      const response = await axios.patch(BASE_URL + `auth/verification/doctor/${id}/`, formData, config, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Verification documents uploaded successfully!");

    } catch (error) {
      console.error("Error:", error.message);
      
    }
  };

  useEffect(() => {
    axios.get(BASE_URL + `auth/verification/doctor/${id}/`, config)
      .then((res) => {
       
        setAadharFileName(res.data.aadhar_file ? res.data.aadhar_file.split('/').pop() : "");
        setDegreeFileName(res.data.degree_certificate ? res.data.degree_certificate.split('/').pop() : "");
        setExperienceFileName(res.data.experience_certificate ? res.data.experience_certificate.split('/').pop() : "");
      })
      .catch(error => {
        console.error("Error fetching document data:", error);
      });
  }, [id]);

  return (
    <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Document Verification</h3>
      <form onSubmit={handleSubmit} className="flex flex-col">
        {errorMessage && (
          <div className="text-red-500 mb-4">{errorMessage}</div>
        )}
        
        <li className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <label
                className="block mb-2 text-sm font-medium text-gray-900"
                htmlFor="aadharFile"
              >
                Upload Aadhar
              </label>
              <input
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                id="aadharFile"
                type="file"
                onChange={(e) => handleFileChange(e, setAadharFile, setAadharFileName)}
              />
              {aadharFileName && (
                <p className="text-sm text-gray-600 mt-1">Selected file: {aadharFileName}</p>
              )}
            </div>
            <div className="inline-flex items-center">
              <h1 className="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center bg-white border border-gray-300 rounded-lg">
                Aadhar Card
              </h1>
            </div>
          </div>
        </li>
        
        <li className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <label
                className="block mb-2 text-sm font-medium text-gray-900"
                htmlFor="degreeCertificate"
              >
                Upload Degree Certificates
              </label>
              <input
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                id="degreeCertificate"
                type="file"
                onChange={(e) => handleFileChange(e, setDegreeCertificate, setDegreeFileName)}
              />
              {degreeFileName && (
                <p className="text-sm text-gray-600 mt-1">Selected file: {degreeFileName}</p>
              )}
            </div>
            <div className="inline-flex items-center">
              <h1 className="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center bg-white border border-gray-300 rounded-lg">
                Qualification
              </h1>
            </div>
          </div>
        </li>
        
        <li className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <label
                className="block mb-2 text-sm font-medium text-gray-900"
                htmlFor="experienceCertificate"
              >
                Upload Experience Certificate
              </label>
              <input
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                id="experienceCertificate"
                type="file"
                onChange={(e) => handleFileChange(e, setExperienceCertificate, setExperienceFileName)}
              />
              {experienceFileName && (
                <p className="text-sm text-gray-600 mt-1">Selected file: {experienceFileName}</p>
              )}
            </div>
            <div className="inline-flex items-center">
              <h1 className="px-3 py-2 mb-3 mr-3 text-sm font-medium text-center bg-white border border-gray-300 rounded-lg">
                Experience
              </h1>
            </div>
          </div>
        </li>
        <div className="flex flex-col items-center mt-4">
          <button
            type="submit"
            className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Save all
          </button>
          <div className="mt-4">
            <VerificationDownload userId={id} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DocumentVerificationForm;
