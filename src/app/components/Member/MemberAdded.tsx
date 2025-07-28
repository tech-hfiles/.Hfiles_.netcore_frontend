import { decryptData } from '@/app/utils/webCrypto';
import { Calendar } from 'lucide-react';
import React, { useEffect } from 'react'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

type CountryCode = {
    country: string;
    dialingCode: string;
};

type MemberAddedProps = {
    formik: any;
    handleCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    listCountyCode: CountryCode[];
    handlePhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSubmitting: boolean;
};

const MemberAdded: React.FC<MemberAddedProps> = ({ formik, handleCountryCodeChange, listCountyCode, handlePhoneNumberChange, isSubmitting }) => {

    useEffect(() => {
        const setDecryptedEmail = async () => {
            try {
                const encryptedSub = localStorage.getItem('sub');
                if (encryptedSub) {
                    const decryptedEmail = await decryptData(encryptedSub);
                    formik.setFieldValue('email', decryptedEmail);
                }
            } catch (error) {
                console.error("Failed to decrypt sub:", error);
            }
        };

        setDecryptedEmail();
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto bg-white px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12">
                {/* Image Section */}
                <div className="hidden lg:flex w-full lg:w-1/2 xl:w-2/5 2xl:w-1/2 items-center justify-center order-1 lg:order-1 py-4 lg:py-0">
                    <div className="text-center w-full px-4 sm:px-0">
                        {/* Desktop only image */}
                        <img
                            src="/135faa613f0538c4e00d4c35094135efd510597d.png"
                            alt="Add New Member"
                            className="w-full max-w-lg xl:max-w-xl 2xl:max-w-2xl h-auto mx-auto object-contain"
                        />
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full lg:w-1/2 xl:w-3/5 2xl:w-1/2 flex items-center justify-center order-1 lg:order-2">
                    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                        <form onSubmit={formik.handleSubmit} className="space-y-3 sm:space-y-3 lg:space-y-3 xl:space-y-3">
                            {/* First Name */}
                            <div>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formik.values.firstName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="First Name"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formik.touched.firstName && formik.errors.firstName
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                        }`}
                                />
                                {formik.touched.firstName && formik.errors.firstName && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.firstName}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formik.values.lastName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Last Name"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formik.touched.lastName && formik.errors.lastName
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                        }`}
                                />
                                {formik.touched.lastName && formik.errors.lastName && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.lastName}</p>
                                )}
                            </div>

                            {/* Relation */}
                            <div>
                                <select
                                    name="relation"
                                    value={formik.values.relation}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formik.touched.relation && formik.errors.relation
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                        } ${formik.values.relation === '' ? 'text-gray-400' : 'text-gray-900'}`}
                                >
                                    <option value="" disabled className="text-gray-400">Select Relation</option>
                                    <option value="Father" className="text-gray-900">Father</option>
                                    <option value="Mother" className="text-gray-900">Mother</option>
                                    <option value="Sister" className="text-gray-900">Sister</option>
                                    <option value="Brother" className="text-gray-900">Brother</option>
                                    <option value="Son" className="text-gray-900">Son</option>
                                    <option value="Daughter" className="text-gray-900">Daughter</option>
                                    <option value="Wife" className="text-gray-900">Wife</option>
                                    <option value="Husband" className="text-gray-900">Husband</option>
                                    <option value="Grand Mother" className="text-gray-900">Grand Mother</option>
                                    <option value="Grand Father" className="text-gray-900">Grand Father</option>
                                    <option value="Uncle" className="text-gray-900">Uncle</option>
                                    <option value="Aunt" className="text-gray-900">Aunt</option>
                                    <option value="Male Staff" className="text-gray-900">Male Staff</option>
                                    <option value="Female Staff" className="text-gray-900">Female Staff</option>
                                    <option value="Cat" className="text-gray-900">Cat</option>
                                    <option value="Dog" className="text-gray-900">Dog</option>
                                    <option value="Other" className="text-gray-900">Other</option>
                                </select>
                                {formik.touched.relation && formik.errors.relation && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.relation}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            {/* <div>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formik.values.dob}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    max={new Date().toISOString().split('T')[0]}
                                    placeholder="yyyy-mm-dd"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formik.touched.dob && formik.errors.dob
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                        }`}
                                />
                                {formik.touched.dob && formik.errors.dob && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.dob}</p>
                                )}
                            </div> */}

                            <div className="w-full relative">
                                <DatePicker
                                    selected={formik.values.dob ? new Date(formik.values.dob) : null}
                                    onChange={(date) => formik.setFieldValue("dob", date)}
                                    onBlur={formik.handleBlur}
                                    name="dob"
                                    placeholderText="yyyy-mm-dd"
                                    dateFormat="yyyy-MM-dd"
                                    maxDate={new Date()}
                                    showYearDropdown
                                    showMonthDropdown
                                    dropdownMode="select"
                                    yearDropdownItemNumber={100}
                                    scrollableYearDropdown
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formik.touched.dob && formik.errors.dob
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                        }`}
                                    wrapperClassName="w-full"
                                    popperClassName="z-50"
                                    calendarClassName="border-2 border-gray-300 rounded-lg shadow-lg"
                                />
                                <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-[#333333] pointer-events-none" />
                                {formik.touched.dob && formik.errors.dob && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.dob}</p>
                                )}
                            </div>

                            {/* Phone Number with Country Code */}
                            <div>
                                <div className={`flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all ${(formik.touched.phoneNumber && formik.errors.phoneNumber) ||
                                    (formik.touched.countryCode && formik.errors.countryCode)
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                    }`}>
                                    {/* Country Code Dropdown */}
                                    <select
                                        name="countryCode"
                                        value={formik.values.countryCode}
                                        onChange={handleCountryCodeChange}
                                        onBlur={formik.handleBlur}
                                        className="border-0 bg-transparent py-2.5 sm:py-3 lg:py-3.5 pl-3 sm:pl-4 pr-2 focus:ring-0 focus:outline-none w-30 text-blue-600 font-medium text-sm sm:text-base"
                                    >
                                        {Array.isArray(listCountyCode) &&
                                            listCountyCode.map((country, index) => (
                                                <option
                                                    key={index}
                                                    value={JSON.stringify({
                                                        country: country.country,
                                                        dialingCode: country.dialingCode,
                                                    })}
                                                    className="text-gray-900"
                                                >
                                                    {country.country} {country.dialingCode}
                                                </option>
                                            ))}
                                    </select>

                                    <div className="h-4 sm:h-6 w-px bg-gray-300"></div>

                                    {/* Phone Number Input */}
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        placeholder="Phone no."
                                        value={formik.values.phoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        onBlur={formik.handleBlur}
                                        className="flex-1 border-0 py-2.5 sm:py-3 lg:py-3.5 px-2 sm:px-3 bg-transparent focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                                        maxLength={10}
                                    />
                                </div>
                                {((formik.touched.countryCode && formik.errors.countryCode) ||
                                    (formik.touched.phoneNumber && formik.errors.phoneNumber)) && (
                                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                                            {formik.errors.countryCode || formik.errors.phoneNumber}
                                        </p>
                                    )}
                            </div>

                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter Email"
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-3.5 text-sm sm:text-base border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${formik.touched.email && formik.errors.email
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300'
                                        }`}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p className="text-red-500 text-xs sm:text-sm mt-1">{formik.errors.email}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !formik.isValid}
                                className="w-full py-3 sm:py-3.5 lg:py-2 px-2 sm:px-6 primary text-white rounded-lg font-semibold text-sm sm:text-base lg:text-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed "
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                                        <span className="text-sm sm:text-base">Submitting...</span>
                                    </div>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MemberAdded