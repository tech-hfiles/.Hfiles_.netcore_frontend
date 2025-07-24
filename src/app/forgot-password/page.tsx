'use client';
export const runtime = 'edge'
import React, { useEffect, useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import MasterHome from '../components/MasterHome';
import { SendOtpForgot, PasswordForgot } from '../services/HfilesServiceApi';

const ForgotPasswordPage = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('recipientEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setIsOtpSent(true);
      setTimer(300);
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Please enter a valid email address"
        )
        .required("Email is required"),
      otp: Yup.string()
        .matches(/^\d{4,6}$/, "OTP must be 4-6 digits")
        .required("OTP is required"),
      newPassword: Yup.string()
        .min(8, "Min 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Use upper, lower, number & special char")
        .required("New password required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm password required')
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const payload = {
          email: values.email || email,
          otp: values.otp,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        };

        const res = await PasswordForgot(payload);
        toast.success(`${res.data.message}`);
        router.push('/login');
        localStorage.removeItem("recipientEmail");
      } catch (error) {
        const err = error as any;
        toast.error(`${err.response?.data?.message}`);
        console.error("Password reset error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Set email in formik when it's loaded from localStorage
  useEffect(() => {
    if (email) {
      formik.setFieldValue('email', email);
    }
  }, [email]);

  // Handle input changes for OTP
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value;

    // Only allow digits
    if (!/^\d*$/.test(val)) return;

    const otpArray = formik.values.otp.split('');
    otpArray[i] = val;

    const newOtp = otpArray.join('').slice(0, 6);
    formik.setFieldValue('otp', newOtp);

    // Auto move to next input
    if (val && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  // Handle backspace for OTP inputs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('Text').trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    formik.setFieldValue('otp', pastedData);
    const focusIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Countdown logic
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 4) return `${username[0]}***@${domain}`;
    return `${username.slice(0, 2)}${'*'.repeat(username.length - 4)}${username.slice(-2)}@${domain}`;
  };


  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      setIsSendingOtp(true);
      const payload = { email: formik.values.email || email };
      const res = await SendOtpForgot(payload);
      toast.success(`${res.data.message}`);
      setTimer(300);
      formik.setFieldValue('otp', '');
    } catch (error) {
      const err = error as any;
      toast.error(`${err.response?.data?.message || 'Failed to resend OTP'}`);
      console.error("Resend OTP error:", error);
    } finally {
      setIsSendingOtp(false);
    }
  };

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
          <div className="p-6 sm:p-8 w-full lg:w-1/2 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-bold text-left text-gray-800 mb-2">Forgot</h1>
            <h1 className="text-3xl sm:text-4xl font-bold text-left text-gray-800 mb-6">Password?</h1>

            <form onSubmit={formik.handleSubmit} className="space-y-6">

              {/* OTP Section - Show only if OTP is sent */}
              {isOtpSent && (
                <div>
                  <label className="text-black block mb-2">Enter OTP:</label>
                  <p className="text-left text-sm text-black mb-4">
                    OTP sent to: <span className="text-blue-900">{maskEmail(formik.values.email || email)}</span>
                  </p>

                  {/* OTP Inputs */}
                  <div className="flex justify-between gap-2 mb-4">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-12 h-12 border text-center rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formik.values.otp[i] || ''}
                        onChange={(e) => handleOtpChange(e, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        onPaste={handlePaste}
                        ref={(el) => {
                          if (el) inputRefs.current[i] = el;
                        }}
                      />
                    ))}
                  </div>

                  {formik.touched.otp && formik.errors.otp && (
                    <p className="text-red-500 text-sm mb-4">{formik.errors.otp}</p>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <div className="font-medium">
                      {timer > 0 ? `Time left: ${formatTime(timer)}` : 'OTP expired'}
                    </div>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={timer > 0 || isSendingOtp}
                      className={`font-bold ${timer > 0 || isSendingOtp ? 'text-gray-400 cursor-not-allowed' : 'text-blue-800 hover:underline'}`}
                    >
                      {isSendingOtp ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}

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
                  className="w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Confirm Password */}
              <div className="relative">
                <label className="text-black mb-2 block">Confirm Password:</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  className="w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-11 text-gray-500"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                </button>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isOtpSent}
                className="w-full py-3 bg-yellow-300 rounded-lg text-black font-semibold border hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Reset Password'}
              </button>
            </form>
          </div>

          <ToastContainer />
        </div>
      </div>
    </MasterHome>
  );
};

export default ForgotPasswordPage;