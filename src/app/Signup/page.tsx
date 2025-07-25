/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Calendar, Mail, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AddSignUp, listCounty, SignUpOTPVerify } from '../services/HfilesServiceApi';
import DynamicPage from '../components/Header&Footer/DynamicPage';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { decryptData, encryptData } from '../utils/webCrypto';
import Captcha from '../components/Captcha';
import './style.css'; // adjust path if needed

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const [listCountyCode, setListCountryCode] = useState<any[]>([]);

  const ListCoutny = async () => {
    try {
      const response = await listCounty();
      setListCountryCode(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching country codes:", error);
    }
  };

  useEffect(() => {
    ListCoutny();
  }, []);

  // Yup validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(3, 'First name must be at least 3 characters')
      .required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    dob: Yup.string()
      .required('Date of birth is required')
      .matches(/^\d{2}-\d{2}-\d{4}$/, 'Please enter DOB in dd-mm-yyyy format')
      .test('age-limit', 'You must be at least 18 years old', function (value) {
        if (!value) return false;

        const [day, month, year] = value.split('-').map(Number);
        const dobDate = new Date(year, month - 1, day);

        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        const d = today.getDate() - dobDate.getDate();

        if (m < 0 || (m === 0 && d < 0)) {
          return age - 1 >= 18;
        }

        return age >= 18;
      }),
    countryCode: Yup.string().required('Country code is required'),
    phone: Yup.string()
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .required('Phone number is required'),
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address"
      )
      .required("Email is required"),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Must contain at least one number')
      .matches(/[@$!%*?&]/, 'Must contain at least one special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), ''], 'Passwords must match')
      .required('Please confirm your password'),
    termsAccepted: Yup.boolean()
      .oneOf([true], 'Please accept terms and conditions')
      .required('Please accept terms and conditions'),
  });

  useEffect(() => {
    const getDecryptedTokenData = async () => {
      const encryptedToken = localStorage.getItem("authToken");
      if (encryptedToken) {
        try {
          const token = await decryptData(encryptedToken);
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const data = JSON.parse(jsonPayload);
          localStorage.setItem("sub", await encryptData(data.sub));
          localStorage.setItem("userId", await encryptData(data.UserId));
        } catch (error) {
          console.error("Failed to decode or decrypt token:", error);
        }
      } else {
        console.log("No authToken found in localStorage.");
      }
    };

    getDecryptedTokenData();
  }, []);

  const convertToDateInputFormat = (ddmmyyyy: string) => {
    if (!ddmmyyyy || !ddmmyyyy.includes('-')) return '';
    const [day, month, year] = ddmmyyyy.split('-');
    return `${year}-${month}-${day}`;
  };

  const convertToDisplayFormat = (yyyymmdd: string) => {
    if (!yyyymmdd) return '';
    const [year, month, day] = yyyymmdd.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (dateValue: string) => {
    const formattedDate = convertToDisplayFormat(dateValue);
    formik.setFieldValue('dob', formattedDate);
    setShowDatePicker(false);
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      dob: '',
      countryCode: JSON.stringify({ country: 'IND', dialingCode: '+91' }),
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      // Check if captcha is verified before submitting
      if (!isCaptchaVerified) {
        toast.error('Please complete the captcha verification');
        return;
      }

      setIsSubmitting(true);
      try {
        const countryData = JSON.parse(values.countryCode);
        const combinedCountryCode = `${countryData.dialingCode}`;

        const otpPayload = {
          firstName: values.firstName,
          email: values.email,
          phoneNumber: values.phone,
          countryCode: combinedCountryCode,
        };
        const response = await SignUpOTPVerify(otpPayload);
        toast.success(`${response.data.message}`);
        setShowOtpSection(true);
        setTimer(60);
      } catch (error) {
        console.error('OTP sending failed:', error);
        const err = error as any;
        toast.error(`${err.response.data.message}`);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setOtpError('');
    setIsOtpSubmitting(true);

    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      setIsOtpSubmitting(false);
      return;
    }

    try {
      const countryData = JSON.parse(formik.values.countryCode);
      const combinedCountryCode = `${countryData.country} ${countryData.dialingCode}`;

      const formatDateForApi = (dateStr: string) => {
        const [day, month, year] = dateStr.split('-');
        return `${day}-${month}-${year}`;
      };
      const signupPayload = {
        firstName: formik.values.firstName,
        lastName: formik.values.lastName,
        dob: formatDateForApi(formik.values.dob),
        contact: formik.values.phone,
        email: formik.values.email,
        password: formik.values.password,
        confirmPassword: formik.values.confirmPassword,
        countryCode: combinedCountryCode,
        otp: otp,
        captcha: isCaptchaVerified, // Use captcha verification status
        termsAndConditions: formik.values.termsAccepted,
      };
      const response = await AddSignUp(signupPayload);
      localStorage.setItem("isEmailVerified", await (response.data.data.isEmailVerified));
      localStorage.setItem("isPhoneVerified", await (response.data.data.isPhoneVerified));
      localStorage.setItem("userName", await (response.data.data.username));

      toast.success(`${response.data.message}`);

      const token = response.data.data.token;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const data = JSON.parse(jsonPayload);

      localStorage.setItem("authToken", await encryptData(token));
      localStorage.setItem("sub", await encryptData(data.sub));
      localStorage.setItem("userId", await encryptData(data.UserId));
      router.push("/addbasicdetails");
    } catch (error) {
      console.error('Registration failed:', error);
      const err = error as any;
      toast.error(`${err.response.data.message}`);
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const resendOtp = async () => {
    try {
      const countryData = JSON.parse(formik.values.countryCode);
      const combinedCountryCode = `${countryData.dialingCode}`;

      setTimer(60);
      setOtpError('');
      setOtp('');
      const otpPayload = {
        firstName: formik.values.firstName,
        email: formik.values.email,
        phoneNumber: formik.values.phone,
        countryCode: combinedCountryCode,
      };
      const response = await SignUpOTPVerify(otpPayload);
      toast.success(`${response.data.message}`);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DynamicPage>
      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)]  lg:h-[calc(100vh-129px)] 2xl:h-[calc(100vh-140px)]">

        {/* Left Side - Illustration - Hidden on sm and md screens, visible on lg and above */}
        <div className="hidden md:flex flex-1 relative bg-gradient-to-b from-white via-white to-cyan-200 items-center justify-center p-6 overflow-hidden">
          {/* Curved Shape */}
          <div className="bg-white right-[-70%] absolute top-1/2 -translate-y-1/2 h-[120%] w-full rounded-l-[100%] md:rounded-l-[75%] lg:rounded-l-[100%] z-0"></div>

          {/* <div className="absolute right-0 top-0 h-full w-1/2 bg-white rounded-l-[100%]"></div> */}

          {/* Image Container with responsive sizing and left shift */}
          <div className="relative z-10 text-center w-full max-w-[400px] lg:left-[-70px]">
            <img
              src="/ac3693f001558bc88aa841575eb986cffb650260.png"
              alt="Sign up illustration"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>


        <div className="flex-1 flex items-start lg:items-center justify-center p-6 relative">
          <div className="w-full max-w-3xl lg:ml-[-15%] mx-4">
            <form onSubmit={formik.handleSubmit} className="space-y-4 lg:space-y-6">
              {/* Mobile Back Button */}

              <div className="hidden md:block text-center mb-6 lg:mb-8">
                <h1 className="text-black text-xl lg:text-2xl 2xl:text-3xl sm:text-lg font-montserrat-600">
                  <span className="text-[#0331b5]  font-poppins-600">Sign Up</span> to Simplify Your Health Records  Today
                </h1>
                <div className="mt-2 2xl:mt-3 mx-auto w-24 lg:w-40 border-b-2 border-[#0331b5]"></div>
              </div>

              {/* For phone */}
              <div className=" md:hidden mt-[10px] text-center mb-6 lg:mb-8">
                <h1 className="text-[#0331b5] text-[20px] custom_title sm:text-lg font-poppins-600">
                  Welcome to Health Files!
                </h1>
                <p className="text-[#000000] custom_subtext  text-sm lg:text-base font-montserrat-400 mt-1">
                  Let’s simplify your healthcare.
                </p>
                <div className="mt-2 mx-auto w-24 border-b-2 border-[#0331b5]"></div>
              </div>
              {/* ///////////////////////////////////// */}


              {/* Form Fields */}
              <div className="space-y-3 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    {/* First Name */}
                    <input
                      type="text"
                      name="firstName"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="First Name"
                      className="w-full pl-4  py-3 rounded-lg placeholder:text-[14px] sm:placeholder:text-[15px] text-[#333333] font-montserrat-400 bg-white border focus:outline-none focus:ring-0 "
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-red-500 text-xs ">{formik.errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Last Name"
                      className="w-full pl-4 py-3 rounded-lg placeholder:text-[14px] sm:placeholder:text-[15px] text-[#333333] font-montserrat-400 bg-white border focus:outline-none focus:ring-0 "
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-red-500 text-xs ">{formik.errors.lastName}</p>
                    )}
                  </div>

                  {/* Date of Birth with Calendar */}
                  <div className="relative">
                    <input
                      id="dobPicker"
                      type="date"
                      name="dob"
                      value={convertToDateInputFormat(formik.values.dob)}
                      onChange={(e) => handleDateChange(e.target.value)}
                      onBlur={formik.handleBlur}
                      placeholder="DOB"
                      className="w-full px-4   py-3 rounded-lg bg-white text-gray-500   font-montserrat-300 border border-black focus:outline-none focus:ring-0 "
                      max={new Date().toISOString().split("T")[0]}
                    />

                    {formik.touched.dob && formik.errors.dob && (
                      <p className="text-red-500 text-xs ">{formik.errors.dob}</p>
                    )}
                  </div>

                  {/* Phone Number - Merged Input */}
                  <div className="relative">
                    <div
                      className={`flex items-center bg-white rounded-lg border px-4 
        ${formik.touched.phone && formik.errors.phone ? 'border-red-400' : 'border-black'}
        `}
                    >
                      {/* Country Code Selector */}
                      <select
                        name="countryCode"
                        aria-label="Country Code"
                        value={formik.values.countryCode}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="appearance-none bg-transparent text-[#0331b5] font-semibold text-sm w-16 focus:outline-none"
                      >
                        {Array.isArray(listCountyCode) &&
                          listCountyCode.map((country, index) => (
                            <option key={index} value={JSON.stringify({ country: country.country, dialingCode: country.dialingCode })}>
                              {country.country} ({country.dialingCode})
                            </option>
                          ))}
                      </select>


                      {/* Phone Number Input */}
                      <input
                        type="tel"
                        name="phone"
                        aria-label="Phone Number"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Phone No."
                        className="w-full bg-transparent pl-2 py-3 placeholder:text-[14px] sm:placeholder:text-[15px] t text-[#333333] font-montserrat-400 focus:outline-none"
                      />
                    </div>

                    {/* Error Message */}
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-red-500 text-xs pt-1 px-1">{formik.errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Email ID"
                      className="w-full pl-4 py-3 rounded-lg placeholder:text-[14px] sm:placeholder:text-[15px] text-[#333333] font-montserrat-400  bg-white border focus:outline-none focus:ring-0 "
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-xs ">{formik.errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Password"
                      className="w-full pl-4 py-3 rounded-lg placeholder:text-[14px] sm:placeholder:text-[15px] text-[#333333] font-montserrat-400 bg-white border focus:outline-none focus:ring-0 "
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#333333] hover:text-gray-600"
                    >
                      {showPassword ? <Eye className="h-5 w-5 text-[#333333]" /> : <EyeOff className="h-5 w-5 text-[#333333]" />}
                    </button>
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-red-500 text-xs ">{formik.errors.password}</p>
                    )}
                  </div>
                </div>

                {/* Confirm Password - Full width */}
                <div className="">
                  <div className="relative ">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Confirm Password"
                      className="w-full pl-4 py-3 rounded-lg placeholder:text-[14px] sm:placeholder:text-[15px] text-[#333333] font-montserrat-400 bg-white border focus:outline-none focus:ring-0 "
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <Eye className="h-5 w-5 text-[#333333]" /> : <EyeOff className="h-5 w-5 text-[#333333]" />}
                    </button>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <p className="text-red-500 text-xs  ">{formik.errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* New Captcha Component */}
                <div className=" relative flex justify-center mt-4">
                  <Captcha onVerify={() => setIsCaptchaVerified(true)} />
                </div>

                {/* Terms and Conditions */}
                <div className="flex mt-4 justify-center space-x-2">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formik.values.termsAccepted}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-4 h-4  bg-white border-gray-300 rounded "
                  />
                  <label className="text-xs xl:text-[14px] font-montserrat-400 text-center">
                    I Accept the <a href="#" className="text-[#0331b5] font-semibold hover:underline">Terms & Conditions</a> And  <a href="#" className="text-[#0331b5] font-semibold hover:underline">Terms & Conditions</a>
                  </label>
                </div>
                {formik.touched.termsAccepted && formik.errors.termsAccepted && (
                  <p className="text-red-500 text-xs  text-center">{formik.errors.termsAccepted}</p>
                )}

                {/* OTP Section */}
                {showOtpSection && (
                  <div className="space-y-4 mt-4">
                    <div className="w-full flex justify-center">
                      <div className="relative w-[300px]">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value);
                            setOtpError('');
                          }}
                          placeholder="Enter OTP"
                          className="w-full px-4 py-3 rounded-lg bg-white border border-black focus:ring-2 text-center text-lg font-mono tracking-widest"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-4">
                      {/* Timer on the left or right */}
                      <div className="text-blue-800 text-sm font-mono">
                        {formatTime(timer)}
                      </div>

                      {/* Conditional resend button */}
                      {timer === 0 && (
                        <button
                          type="button"
                          onClick={resendOtp}
                          className="text-blue-800 underline text-sm"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    {/* Error message below both */}
                    {otpError && (
                      <p className="text-red-300 text-sm text-center mt-1">{otpError}</p>
                    )}

                  </div>
                )}

                {/* Submit/Register Button */}
                <div className="w-full flex justify-center mt-6">
                  {showOtpSection ? (
                    <button
                      type="button"
                      onClick={handleOtpSubmit}
                      disabled={isOtpSubmitting || otp.length !== 6}
                      className={`bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-12 rounded-full transition-all duration-300 transform hover:scale-105 text-lg ${isOtpSubmitting || otp.length !== 6 ? 'opacity-50' : ''
                        }`}
                      style={{ minWidth: '200px' }}
                    >
                      {isOtpSubmitting ? 'Registering...' : 'Register'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !isCaptchaVerified}
                      className={`w-full primary text-white font-bold py-4   sm:py-4 rounded-lg 
                           font-poppins-600  text-sm sm:text-[17px] px-6  transition-all duration-300 transform hover:scale-105 ${isSubmitting || !isCaptchaVerified ? 'opacity-50' : ''
                        }`}
                    >
                      {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </button>
                  )}
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-black text-sm">
                    Already registered? {' '}
                    <a href="/login" className="text-blue-800 hover:underline font-bold">
                      Click here
                    </a>{' '}
                    to Login
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
        <ToastContainer />
      </div>
    </DynamicPage >
  );
};

export default SignUp;