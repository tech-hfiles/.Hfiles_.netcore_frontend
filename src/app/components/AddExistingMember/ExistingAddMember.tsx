'use client';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { decryptData } from '@/app/utils/webCrypto';
import { MemberExistingAdd } from '@/app/services/HfilesServiceApi';

const ExistingAddMember = () => {
    const [userId, setUserId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getUserId = async (): Promise<number> => {
        try {
            const encryptedUserId = localStorage.getItem('userId');
            if (!encryptedUserId) return 0;
            const userIdStr = await decryptData(encryptedUserId);
            return parseInt(userIdStr, 10);
        } catch (error) {
            console.error('Error getting userId:', error);
            return 0;
        }
    };

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    const formik = useFormik({
        initialValues: {
            hfid: '',
        },
        validationSchema: Yup.object({
            hfid: Yup.string().required('HFID is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            if (!userId) {
                toast.error('User ID not found');
                return;
            }

            setIsSubmitting(true);
            try {
                const response = await MemberExistingAdd(userId, values);
                toast.success(`${response.data.message}`);
                resetForm();
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                {/* Left - Image */}
                <div className="hidden lg:flex w-full lg:w-1/2 justify-center">
                        <img
                            src="/135faa613f0538c4e00d4c35094135efd510597d.png"
                            alt="Add New Member"
                            className="w-full max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain"
                        />
                    </div>


                {/* Right - Form */}
                <div className="w-full lg:w-1/2">
                    <div className="w-full max-w-md mx-auto">
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div>
                                <input
                                    id="hfid"
                                    name="hfid"
                                    type="text"
                                    placeholder="Enter HFID"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                        formik.touched.hfid && formik.errors.hfid 
                                            ? 'border-red-500 bg-red-50' 
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.hfid}
                                />
                                {formik.touched.hfid && formik.errors.hfid && (
                                    <p className="text-sm text-red-600 mt-2 flex items-center">
                                        <span className="mr-1">⚠️</span>
                                        {formik.errors.hfid}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !formik.isValid || !formik.dirty}
                                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                                    isSubmitting || !formik.isValid || !formik.dirty
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transform hover:scale-[1.02]'
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Adding Member...
                                    </div>
                                ) : (
                                    'Add Member'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExistingAddMember;
