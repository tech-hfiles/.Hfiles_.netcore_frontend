'use client';
export const runtime = 'edge'
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import MasterHome from '../components/MasterHome';
import { PasswordChange } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';

const page = () => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Function to get userId from localStorage
    const getUserId = async (): Promise<number> => {
        try {
            const encryptedUserId = localStorage.getItem("userId");
            if (!encryptedUserId) return 0;
            const userIdStr = await decryptData(encryptedUserId);
            return parseInt(userIdStr, 10);
        } catch (error) {
            console.error("Error getting userId:", error);
            return 0;
        }
    };

    const formik = useFormik({
        initialValues: {
            oldPassword: '',
            newPassword: '',
        },
        validationSchema: Yup.object({
            oldPassword: Yup.string()
                .required("Current password is required"),

            newPassword: Yup.string()
                .min(8, "Min 8 characters")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                    "Use upper, lower, number & special char"
                )
                .notOneOf([Yup.ref('oldPassword')], "New password must be different from current password")
                .required("New password is required"),
        }),

        onSubmit: async (values) => {
            try {
                setIsLoading(true);
                const userId = await getUserId();
                const payload = {
                    userId: userId,
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword
                };
                const res = await PasswordChange(payload);
                toast.success(`${res.data.message}`);
                formik.resetForm();
                router.push('/dashboard');
            } catch (error) {
                const err = error as any;
                console.error("Password change error:", error);
                toast.error(`${err.response?.data?.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    });

    return (
        <MasterHome>
            <div className="min-h-xl flex items-center justify-center px-4">
                <div className="flex flex-col lg:flex-row items-center justify-start w-full max-w-6xl mt-9">

                    {/* Image Section */}
                    <div className="flex justify-center w-full lg:w-1/2 mb-8 lg:mb-0">
                        <img
                            src="/Group 680.png"
                            alt="Branch Illustration"
                            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-cover rounded-lg"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="p-6 sm:p-8 w-full lg:w-1/2 max-w-xl">
                        <h1 className="text-4xl sm:text-4xl font-bold text-left text-gray-800 mb-2">Change</h1>
                        <h1 className="text-4xl sm:text-4xl font-bold text-left text-gray-800 mb-6">Password</h1>


                        <form onSubmit={formik.handleSubmit} className="space-y-6">

                            {/* Current Password */}
                            <div className="relative">
                                <label className="text-black block mb-2">Current Password:</label>
                                <input
                                    type={showOldPassword ? 'text' : 'password'}
                                    name="oldPassword"
                                    placeholder="Enter Current Password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.oldPassword}
                                    className={`w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formik.touched.oldPassword && formik.errors.oldPassword
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-4 top-11 text-gray-500"
                                >
                                    <FontAwesomeIcon icon={showOldPassword ? faEye : faEyeSlash} />
                                </button>
                                {formik.touched.oldPassword && formik.errors.oldPassword && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.oldPassword}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="relative">
                                <label className="text-black block mb-2">New Password:</label>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    placeholder="Create New Password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.newPassword}
                                    className={`w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formik.touched.newPassword && formik.errors.newPassword
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-11 text-gray-500"
                                >
                                    <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
                                </button>
                                {formik.touched.newPassword && formik.errors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1">{formik.errors.newPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !formik.isValid}
                                className="w-full py-3 bg-yellow-300 rounded-lg text-black font-semibold border hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    </div>

                    <ToastContainer />
                </div>
            </div>
        </MasterHome>
    );
};

export default page;