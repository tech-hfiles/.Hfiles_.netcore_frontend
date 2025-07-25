/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import DynamicPage from '../components/Header&Footer/DynamicPage';
import { toast, ToastContainer } from 'react-toastify';
import { InviteMember, InviteOTPs, InvitePassword } from '../services/HfilesServiceApi';
import { encryptData } from '../utils/webCrypto';
import { useRouter } from 'next/navigation';

const HealthFilesAuth = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState('');
  const [oldEmail, setOldEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailFromUrl = queryParams.get('email');
    if (emailFromUrl) {
      setOldEmail(emailFromUrl);
      setEmail(emailFromUrl);
    }
  }, []);

  const handleEmailSubmit = async () => {
    if (email && termsAccepted) {
      const payload = {
        oldEmail: oldEmail,
        newEmail: email,
        termsAndConditions: termsAccepted,
      };
      try {
        const response = await InviteMember(payload);
        toast.success(`${response.data.message}`);
        setStep(2);
      } catch (error: unknown) {
        console.error('Error submitting email:', error);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.every(digit => digit !== '')) {
      const otpValue = otp.join('');
      const payload = {
        email: email,
        otp: otpValue,
      };

      try {
        const response = await InviteOTPs(payload);
        toast.success(`${response.data.message}`);
        setStep(3);
      } catch (error: unknown) {
        console.error('Error verifying OTP:', error);
      }
    } else {
      toast.warn('Please enter all 6 digits of the OTP.');
    }
  };

  const handlePasswordSubmit = async () => {
    const payload = {
      email: email,
      password: password,
    };

    try {
      const response = await InvitePassword(payload);
      const token = response?.data?.data?.token;

      // Decode JWT token to extract `sub` and `UserId`
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
      localStorage.setItem("userName", await (response.data.data.username));
      localStorage.setItem("isEmailVerified", await (response.data.data.isEmailVerified));
      localStorage.setItem("isPhoneVerified", await (response.data.data.isPhoneVerified));

      toast.success(`${response.data.message}`);
      router.push('/addbasicdetails');
    } catch (error: unknown) {
      console.error('Error setting password:', error);
    }
  };

  const resendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    alert('OTP resent!');
  };

  return (
    <DynamicPage>
      <div className="">
        <div className="flex flex-col  md:flex-row w-full h-[calc(100vh-90px)] lg:h-[calc(100vh-129px)] 2xl:h-[calc(100vh-140px)]">

          {/* Left Side - Illustration and Title */}
          <div className="hidden max-w-[45%] md:flex flex-1 relative bg-gradient-to-b from-white via-white to-cyan-200 items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden">

            {/* Background Shape */}
            <div className="bg-white right-[-70%] absolute top-1/2 -translate-y-1/2 h-[120%] w-full rounded-l-[100%] md:rounded-l-[75%] lg:rounded-l-[100%] z-0"></div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-[300px] md:max-w-[300px] lg:max-w-[400px]">
              <h2 className="text-lg md:text-[26px] lg:text-[28px] font-poppins-700 tracking-[0.5px]  xl:text-[34px] font-bold text-[#0331b5] leading-snug mb-2 md:mb-4">
                Get Smart With <br />
                <span>Your Health</span>
              </h2>

              <img
                src="/32b081e3d2fdc6f81300133dcf1d61a309d325c3 (1).png"
                alt="Get Smart With Your Health"
                className="w-[133%] max-w-fit object-contain drop-shadow-2xl transition-all duration-500 ease-in-out hover:scale-105"
              />
            </div>
          </div>


          {/* Right Side - Form */}
          <div className="w-full bg-white  md:w-1/2 flex-col justify-center items-center py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8">
            {/* <div className="w-full  bg-white  md:w-1/2  flex-col items-center justify-center"> */}
            <div className="w-full mt-[4rem] flex items-center justify-center">
              <div className=" min-w-sm md:min-w-md  max-w-lg w-full bg-white md:w-1/2 justify-center items-center py-6 sm:py-8 md:pb-10 px-4 sm:px-6 md:px-8 ">
                <div className="flex items-center justify-center w-full">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center mb-6">
                      <div className=" flex items-center justify-center">
                        <img
                          src="/Sign Up Page/Hfiles Logo.png"
                          alt="Hfiles Logo"
                          className="w-20 sm:w-24 md:w-28 mx-auto mb-3 sm:mb-4"
                        />
                      </div>
                    </div>

                    <h2 className="text-[#0331b5] text-xl  sm:text-3xl font-poppins-600 mb-2">
                      Welcome to Health Files!
                    </h2>
                    <p className="text-[#333333] font-montserrat-400 mb-3">
                      Let&apos;s simplify your healthcare.
                    </p>
                    <div className="border-b-2 border-[#0331b5] w-16 sm:w-20 mx-auto"></div>

                  </div>
                </div>
              </div>
            </div>

            <div className="w-full  flex flex-col items-center justify-center">

              {/* Step 1: Email */}
              {step === 1 && (
                <div className=" w-full max-w-lg space-y-6">
                  <div className='bg-white rounded-lg border'>
                    <input
                      type="email"
                      placeholder="Enter Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 border-0 py-[15px] sm:py-4 px-4 bg-transparent font-montserrat-400  text-[#333333] tracking-[0.5px] 
                             text-sm sm:text-[16px] focus:outline-none focus:ring-0 
                             placeholder:text-[14px] sm:placeholder:text-[15px]"
                    />
                  </div>

                  <div className="flex justify-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4  bg-white border-gray-300 rounded "
                    />
                    {/* <label htmlFor="terms" className="ttext-xs xl:text-[14px] font-montserrat-400 text-center">
                      I Accept The <span className="text-[#0331b5] font-semibold hover:underline">Privacy & Policy</span> And <span className="text-[#0331b5] font-semibold hover:underline">Terms & Conditions</span>
                    </label> */}
                    <label className="text-xs xl:text-[14px] font-montserrat-400 text-center">
                    I Accept the <a href="#" className="text-[#0331b5] font-semibold hover:underline">Terms & Conditions</a> And  <a href="#" className="text-[#0331b5] font-semibold hover:underline">Terms & Conditions</a>
                  </label>
                  </div>


                  <button
                    onClick={handleEmailSubmit}
                    className="w-full border-[1px] border-[#333333] text-[#333333] py-[15px] sm:py-4 rounded-lg 
                         font-poppins-500 bg-[#F9E380] hover:text-black text-sm sm:text-[17px]
                         transition-colors"
                  >
                    Verify
                  </button>
                </div>
              )}

              {/* Step 2: OTP */}
              {step === 2 && (
                <div className="w-full max-w-lg space-y-6">
                  <div>
                    <p className="text-gray-600 mb-4">
                      Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
                    </p>
                    <div className="flex space-x-2 justify-center">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-[3rem] h-[3rem]  sm:w-16 sm:h-16 lg:w-16 lg:h-16 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={resendOtp}
                      className="text-[#0331b5] hover:text-[#0331b5] pont-poppins-600  hover:underline text-sm font-medium"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    onClick={handleOtpSubmit}
                    className="w-full primary hover:[#0331b5] text-white font-semibold py-[15px] sm:py-4 text-sm sm:text-[17px] rounded-lg transition-colors duration-200"
                  >
                    Login
                  </button>
                </div>
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <div className="w-full max-w-lg space-y-6">
                  <div className=''>
                    <p className="text-gray-600 mb-4 ">
                      Create a secure password for your account:
                    </p>
                    <div className="bg-white rounded-lg border relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Your Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='flex-1 border-0 py-[15px] sm:py-4 px-4 bg-transparent font-montserrat-400  text-[#333333] tracking-[0.5px] 
                             text-sm sm:text-[16px] focus:outline-none focus:ring-0 
                             placeholder:text-[14px] sm:placeholder:text-[15px]'
                      // className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordSubmit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-[15px] sm:py-4 font-semibold  rounded-lg transition-colors duration-200"
                  >
                    Complete Setup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </DynamicPage>
  );
};

export default HealthFilesAuth;