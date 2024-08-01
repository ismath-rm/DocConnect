import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants/Constants';
import { toast } from 'react-toastify';

function ResetPassword() {
    const { id, token } = useParams();
    console.log('id is :', id);
    console.log('token sa:', token);
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');


    const initialValues = {
        password: '',
        confirm_password: '',
    };

    const validationSchema = Yup.object({
        password: Yup.string()
            .min(4, 'Password must be at least 4 characters')
            .required('Required'),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await axios.post(BASE_URL + `auth/reset-password/${id}/${token}/`, {
                password: values.password,
                confirm_password: values.password,
                id: id,
            });
            console.log('reset password:', response);

            if (response.status === 200) {
                setFormError('');
                toast.success('Password reset successful');
                const userType = response.data.user_type; 
                navigate(userType === 'doctor' ? '/auth/doctor/login' : '/auth/login');
            } else {
                setFormError('Something went wrong. Please try again later.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setFormError('An error occurred. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex w-full h-screen">
            <div className="w-full  flex  items-center">
                <div className="bg-white bg-opacity-75 backdrop-blur-md w-full md:w-96 p-8 md:rounded-l-lg shadow-2xl">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {() => (
                            <Form className="flex flex-col w-full text-left">
                                <p className="text-3xl text-blue-600 font-bold text-center">Reset Your Password</p>

                                <label htmlFor="password" className="text-left block text-black text-sm font-bold mb-2">
                                    New password
                                </label>
                                <Field
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your new password"
                                    className="w-full px-4 py-3 mb-3 text-sm font-medium outline-none bg-white placeholder-text-gray-700 text-black rounded-2xl"
                                />
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mb-2" />

                                <label htmlFor="confirm_password" className="text-left block text-black text-sm font-bold mb-2">
                                    Confirm password
                                </label>
                                <Field
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    placeholder="Confirm your new password"
                                    className="w-full px-4 py-3 mb-3 text-sm font-medium outline-none bg-white placeholder-text-gray-700 text-black rounded-2xl"
                                />
                                <ErrorMessage name="confirm_password" component="div" className="text-red-500 text-sm mb-2" />

                                {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>}

                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-500"
                                >
                                    Submit
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
