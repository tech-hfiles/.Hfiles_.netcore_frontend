'use client'
export const runtime = 'edge'
import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import MasterHome from '../components/MasterHome'
import { listCounty, MemberAdd } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import { toast, ToastContainer } from 'react-toastify';
import ExistingAddMember from '../components/AddExistingMember/ExistingAddMember';
import MemberAdded from '../components/Member/MemberAdded';

type CountryCode = {
    country: string;
    dialingCode: string;
};

// Validation Schema
const validationSchema = Yup.object({
    firstName: Yup.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must not exceed 50 characters')
        .required('First name is required'),
    lastName: Yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must not exceed 50 characters')
        .required('Last name is required'),
    relation: Yup.string()
        .required('Relation is required'),
    dob: Yup.date()
        .max(new Date(), 'Date of birth cannot be in the future')
        .required('Date of birth is required'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    countryCode: Yup.string()
        .required('Country code is required'),
    phoneNumber: Yup.string()
        .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .required('Phone number is required')
});

const Page = () => {
    const [activeTab, setActiveTab] = useState('add')
    const [listCountyCode, setListCountryCode] = useState<CountryCode[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const getUserId = async (): Promise<number> => {
        try {
            const encryptedUserId = localStorage.getItem("userId");
            if (!encryptedUserId) {
                return 0;
            }
            const userIdStr = await decryptData(encryptedUserId);
            return parseInt(userIdStr, 10);
        } catch (error) {
            console.error("Error getting userId:", error);
            return 0;
        }
    };

    const ListCountry = async () => {
        try {
            const response = await listCounty();
            setListCountryCode(response?.data?.data || []);
        } catch (error) {
            console.error("Error fetching country codes:", error);
        }
    };

    useEffect(() => {
        ListCountry();
    }, []);

    const formatDate = (dob: string | Date): string => {
        const dateObj = new Date(dob);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            relation: '',
            dob: '',
            email: '',
            countryCode: '',
            phoneNumber: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);
            try {
                const countryData = JSON.parse(formik.values.countryCode);
                const combinedCountryCode = `${countryData.country} ${countryData.dialingCode}`;
                const formattedDOB = formatDate(values.dob);
                const userId = await getUserId();
                const apiPayload = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    relation: values.relation,
                    dob: formattedDOB,
                    email: values.email,
                    countryCode: combinedCountryCode,
                    phoneNumber: values.phoneNumber,
                };
                const response = await MemberAdd(userId, apiPayload);
                toast.success(`${response.data.message}`)
                router.push('/dashboard');
                resetForm();
                setActiveTab('existing');
            } catch (error: any) {
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        formik.setFieldValue('countryCode', e.target.value);
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        formik.setFieldValue('phoneNumber', value);
    };

    const handleBack = () => {
        router.push('/myHfiles');
    };

    return (
        <MasterHome>
            <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-4 sm:mb-6">
                    {/* Mobile Layout - Stacked */}
                    <div className="block sm:hidden">
                        <button
                            onClick={handleBack}
                            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Add Members</h1>
                        </div>
                    </div>

                    {/* Desktop Layout - Side by side */}
                    <div className="hidden sm:block">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft size={20} className="mr-2" />
                                <span className="text-sm font-medium">Back</span>
                            </button>
                            
                            <div className="text-center flex-1">
                                <h1 className="text-2xl lg:text-3xl font-bold text-blue-800">Add Members</h1>
                            </div>
                            
                            {/* Spacer to center the title */}
                            <div className="w-16"></div>
                        </div>
                    </div>
                </div>

                <div className="border border-black mb-4 sm:mb-6"></div>

                {/* Tab Buttons */}
                <div className="mb-4 sm:mb-6">
                    {/* Mobile Layout - Full width stacked buttons */}
                    <div className="flex flex-col gap-3 sm:hidden">
                        <button
                            className={`w-full px-4 py-3 rounded-full font-medium transition-all duration-200 border-2 ${
                                activeTab === 'add' 
                                    ? 'bg-yellow-200 border-black text-gray-800 shadow-md' 
                                    : 'bg-white border-black text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                            onClick={() => setActiveTab('add')}
                        >
                            Add New Member
                        </button>
                        <button
                            className={`w-full px-4 py-3 rounded-full font-medium transition-all duration-200 border-2 ${
                                activeTab === 'existing' 
                                    ? 'bg-yellow-200 border-black text-gray-800 shadow-md' 
                                    : 'bg-white border-black text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                            onClick={() => setActiveTab('existing')}
                        >   
                            Add Existing Member
                        </button>
                    </div>

                    {/* Tablet Layout - Centered side by side */}
                    <div className="hidden sm:flex sm:justify-center md:justify-center lg:justify-end lg:mr-30 xl:mr-30 gap-4">
                        <button
                            className={`px-6 lg:px-8 py-3 rounded-full font-medium transition-all duration-200 border-2 whitespace-nowrap ${
                                activeTab === 'add' 
                                    ? 'bg-yellow-200 border-black text-gray-800 shadow-md' 
                                    : 'bg-white border-black text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                            onClick={() => setActiveTab('add')}
                        >
                            Add New Member
                        </button>
                        <button
                            className={`px-6 lg:px-8 py-3 rounded-full font-medium transition-all duration-200 border-2 whitespace-nowrap ${
                                activeTab === 'existing' 
                                    ? 'bg-yellow-200 border-black text-gray-800 shadow-md' 
                                    : 'bg-white border-black text-gray-700 hover:border-gray-400 hover:shadow-sm'
                            }`}
                            onClick={() => setActiveTab('existing')}
                        >   
                            Add Existing Member
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="w-full">
                    {activeTab === 'add' && (
                        <MemberAdded 
                            formik={formik} 
                            handleCountryCodeChange={handleCountryCodeChange} 
                            listCountyCode={listCountyCode} 
                            handlePhoneNumberChange={handlePhoneNumberChange}
                            isSubmitting={isSubmitting} 
                        />
                    )}

                    {activeTab === 'existing' && (
                        <ExistingAddMember />
                    )}
                </div>

                <ToastContainer 
                    position="top-right"
                    className="mt-16 sm:mt-0"
                />
            </div>
        </MasterHome>
    )
}

export default Page