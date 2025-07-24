/* eslint-disable @next/next/no-img-element */
'use client';
export const runtime = 'edge'
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MasterHome from '../components/MasterHome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { CreateData, QuerySubmit, Verify } from '../services/HfilesServiceApi';
import { decryptData, encryptData } from '../utils/webCrypto';
import { toast, ToastContainer } from 'react-toastify';
import { FaLess, FaLessThan } from 'react-icons/fa';
import './style.css'; 


// Type definitions
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
    image_padding?: boolean;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

interface CreateOrderPayload {
  userId: number;
  amount: number;
  planName: string;
}

interface VerifyPaymentPayload {
  userId: number;
  orderId: string;
  paymentId: string;
  signature: string;
  planName: string;
}

interface UserData {
  userId: string;
  expiry: number;
}

declare global {
  interface Window {
    Razorpay: {
      new(options: RazorpayOptions): {
        open(): void;
        close(): void;
      };
    };
  }
}

const SubscriptionCards: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<{ standard: boolean; premium: boolean }>({
    standard: false,
    premium: false
  });
  const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    email: '',
    query: '',
  });

  // Wait for Razorpay SDK to load
  const waitForRazorpay = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const checkRazorpay = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkRazorpay);
          setRazorpayLoaded(true);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkRazorpay);
        reject(new Error('Razorpay SDK failed to load'));
      }, 10000);
    });
  };

  // Store user ID with expiry
  const storeUserIdWithExpiry = async (userId: string, expiryHours: number = 24): Promise<void> => {
    try {
      const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000);
      const dataToStore: UserData = {
        userId,
        expiry: expiryTime
      };
      const encryptedData = await encryptData(JSON.stringify(dataToStore));
      localStorage.setItem("userId", encryptedData);
    } catch (error) {
      console.error("Error storing userId:", error);
    }
  };

  // Get user ID with expiry check
  const getUserId = async (): Promise<number> => {
    try {
      const encryptedUserId = localStorage.getItem("userId");
      if (!encryptedUserId) return 0;

      const decryptedData = await decryptData(encryptedUserId);

      // Handle both old format (just userId string) and new format (object with expiry)
      let userData: UserData;
      try {
        userData = JSON.parse(decryptedData);
        // If it's not an object with expiry, treat as old format
        if (typeof userData !== 'object' || !userData.expiry) {
          throw new Error('Old format detected');
        }
      } catch {
        // Old format - just userId as string
        userData = {
          userId: decryptedData,
          expiry: Date.now() + (24 * 60 * 60 * 1000) // Add 24 hours from now
        };
        // Update to new format
        await storeUserIdWithExpiry(decryptedData, 24);
      }

      const userId = parseInt(userData.userId, 10);
      return isNaN(userId) ? 0 : userId;
    } catch (error) {
      console.error("Error getting userId:", error);
      return 0;
    }
  };

  const handleQuerySubmit = async (): Promise<void> => {
    const email = formData.email.trim();
    const query = formData.query.trim();

    if (!email || !query) {
      toast.error('Please fill out all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const payload = {
      email,
      queryText: query,
    };

    try {
      const response = await QuerySubmit(payload);
      toast.success(response.data.message);
      setFormData({ email: '', query: '' });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error response:", error.response?.data);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      toast.error('Payment system failed to load. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Standard Plan Payment Handler
  const handleStandardPayment = async (): Promise<void> => {
    try {
      await waitForRazorpay();

      const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error("Please log in to continue with payment.");
        return;
      }

      setLoading(prev => ({ ...prev, standard: true }));

      // Create order payload - FIXED: Amount in paise (₹99 = 9900 paise)
      const createOrderPayload: CreateOrderPayload = {
        userId: currentUserId,
        amount: 9900, // ₹99 in paise
        planName: 'Standard'
      };

      // Call your CreateData API
      const orderResponse = await CreateData(createOrderPayload);


      if (!orderResponse?.data?.data?.orderId) {
        throw new Error('Invalid order response from server');
      }

      const orderData = orderResponse.data;

      // Razorpay options
      const options: RazorpayOptions = {
        key: "rzp_live_kpCWRpxOkiH9M7", // Make sure this is your correct key
        amount: createOrderPayload.amount, // Amount in paise
        currency: "INR",
        name: "Hfiles",
        description: "Standard Plan Subscription",
        order_id: orderData.orderId,
        image: "https://hfiles.in/wp-content/uploads/2022/11/hfileslogo.jpeg",
        prefill: {
          name: "HEALTH FILES MEDICO PRIVATE LIMITED",
          email: "contact@hfiles.in",
          contact: "+919978043453",
        },
        notes: {
          address: "Health Files Subscription",
          merchant_order_id: orderData.orderId,
        },
        theme: {
          color: "#0331B5",
          image_padding: false
        },
        handler: async function (response: RazorpayResponse) {
          await handlePaymentSuccess(response, 'Standard', orderData.orderId);
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal dismissed');
            setLoading(prev => ({ ...prev, standard: false }));
          },
          escape: true,
          backdropclose: false
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Standard payment initiation failed:', error);
      setLoading(prev => ({ ...prev, standard: false }));
    }
  };

  // Premium Plan Payment Handler
  const handlePremiumPayment = async (): Promise<void> => {
    try {
      await waitForRazorpay();

      const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error("Please log in to continue with payment.");
        return;
      }

      setLoading(prev => ({ ...prev, premium: true }));

      // Create order payload - FIXED: Amount in paise (₹399 = 39900 paise)
      const createOrderPayload: CreateOrderPayload = {
        userId: currentUserId,
        amount: 39900, // ₹399 in paise
        planName: 'Premium'
      };

      // Call your CreateData API
      const orderResponse = await CreateData(createOrderPayload);
      if (!orderResponse?.data?.data?.orderId) {
        throw new Error('Invalid order response from server');
      }

      const orderData = orderResponse.data;

      // Razorpay options
      const options: RazorpayOptions = {
        key: "rzp_live_kpCWRpxOkiH9M7", // Make sure this is your correct key
        amount: createOrderPayload.amount, // Amount in paise
        currency: "INR",
        name: "Hfiles",
        description: "Premium Plan Subscription",
        order_id: orderData.orderId,
        image: "https://hfiles.in/wp-content/uploads/2022/11/hfileslogo.jpeg",
        prefill: {
          name: "HEALTH FILES MEDICO PRIVATE LIMITED",
          email: "contact@hfiles.in",
          contact: "+919978043453",
        },
        notes: {
          address: "Health Files Subscription",
          merchant_order_id: orderData.orderId,
        },
        theme: {
          color: "#0331B5",
          image_padding: false
        },
        handler: async function (response: RazorpayResponse) {
          await handlePaymentSuccess(response, 'Premium', orderData.orderId);
        },
        modal: {
          ondismiss: function () {
            console.log('Premium payment modal dismissed');
            setLoading(prev => ({ ...prev, premium: false }));
          },
          escape: true,
          backdropclose: false
        }
      };


      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Premium payment initiation failed:', error);
      setLoading(prev => ({ ...prev, premium: false }));
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (
    response: RazorpayResponse,
    plan: string,
    orderId: string
  ): Promise<void> => {
    try {

      setLoading(prev => ({
        ...prev,
        [plan.toLowerCase()]: true
      }));

      const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      // Create verify payment payload
      const verifyPayload: VerifyPaymentPayload = {
        userId: currentUserId,
        orderId: orderId,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        planName: plan
      };


      const verifyResponse = await Verify(verifyPayload);

      toast.success(`${verifyResponse.data.message}`);

      // Small delay to show success message before redirect
      setTimeout(() => {
        window.location.href = '/SubscriptionPlan';
      }, 2000);

    } catch (error: any) {
      console.error('Payment verification failed:', error);
    } finally {
      setLoading(prev => ({
        ...prev,
        [plan.toLowerCase()]: false
      }));
    }
  };

  return (
    <MasterHome>

      <div className="hidden sm:block fixed inset-0 -z-10">
        <img src="/Group_629.png" alt="Background" className="w-full h-full object-cover" />
      </div>
      <div className="h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] relative z-0 md:h-[calc(100vh-100px)] lg:h-[calc(100vh-139px)] 2xl:h-[calc(100vh-140px)] py-8">
        {/* Back to Home Button */}
        <div className="flex justify-start px-4 md:px-6 ">
          <Link href="/dashboard" className="flex items-center text-balck font-bold transition-colors">
            <FaLessThan className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

       
        <div className="text-center mt-3 mb-6">
          <h1 className="custom_title text-2xl md:text-3xl text-[#0331B5] mb-2 font-poppins-600">
            Subscription Plans
          </h1>
          <div className="w-35 h-[3px] bg-[#0331B5] mx-auto mb-4" />
          <p className="custom_subtext text-[#353935] text-base font-normal max-w-3xl mx-auto px-4 font-montserrat">
            Choose a plan that fits your needs and stay in control of your health – every step of the way.
          </p>
        </div>
        {/* <div className='border border-[#333333] mb-3 mx-auto'></div> */}
        <div className='hidden md:block w-full h-0.5 mb-3 max-w-[90rem] bg-[#333333] opacity-60 mx-auto'></div>


        {/* Cards Container */}
        <div className="max-w-7xl custom_max_width mx-auto mt-[2rem] px-4 pb-[4rem]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-6">

            {/* Basic Plan */}
            <div className=" bg-white w-full  max-w-[21rem] mx-auto  rounded-2xl p-6 px-9 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{ backgroundColor: '#A9DDD6' }}>
              <div className="text-center max-h-[5rem] mb-7">
                <h3 className="font-poppins-600 text-3xl  text-[#0331b5]">Basic</h3>
                <div className=" font-montserrat-600 text-5xl mt-4 font-bold text-[#333333]">Free</div>
              </div>

              <hr className="border-gray-800 mt-10 mb-6" />

              <div className="space-y-5 mb-8">

                <div className="flex items-center text-black text-[16px] font-montserrat-500 ">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span className=''>Add Up to 5 Members</span>
                </div>

                <div className="flex items-center text-black text-[16px] font-montserrat-500 ">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span className=''>100 MB Storage</span>
                </div>

                <div className="flex items-center text-black text-[16px] font-montserrat-500 ">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span className=''>Upload PDF Files</span>
                </div>

                <div className="flex items-center text-black text-[16px] font-montserrat-500 ">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span className=''>Access to Articles</span>
                </div>


                <div className="flex items-center text-[#333] text-[16px] font-montserrat-600 ">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span className='line-through'>Wellness Kit</span>
                </div>

                <div className="flex items-center text-[#333] text-[16px] font-montserrat-600 ">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span className='line-through'>Membership Card</span>
                </div>

              </div>
            </div>

            {/* Standard Plan */}
            <div className="flex flex-col justify-between bg-white w-full max-w-[21rem] mx-auto  rounded-2xl p-6 px-9 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{ backgroundColor: '#FFF44F' }}>
                <div className='flex-grow'>
              <div className="text-center max-h-[5rem] mb-7">
                <h3 className="font-poppins-600 text-3xl  text-[#0331b5]">Standard</h3>
                <div className="font-montserrat-600 text-2xl mt-2  text-[#333333]">Rs. 99/year</div>
                <div className="text-sm font-montserrat-600 mt-0.5 text-black font-medium line-through"><span className=''>
                  Rs. 149/year
                </span></div>
              </div>

              <hr className="border-gray-800 mt-10 mb-6" />


              <div className="space-y-5 mb-8">
                <div className="flex items-start text-black text-[16px] font-montserrat-500">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span>Add Upto 7 Members</span>
                </div>
                <div className="flex items-start text-black text-[16px] font-montserrat-500">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span>300 MB Storage</span>
                </div>
                <div className="flex items-start text-black text-[16px] font-montserrat-500">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span>Upload PDF Files</span>
                </div>
                <div className="flex items-start text-black text-[16px] font-montserrat-500">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span>Wellness kit</span>
                </div>

                <div className="flex items-start text-black text-[16px] font-montserrat-500 ">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 mt-1 shrink-0"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                  </svg>
                  <span className="">Access to Exclusive Article</span>
                </div>

                
                <div className="flex items-start text-black text-[16px] font-montserrat-500">
                  <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                  <span>Membership Card</span>
                </div>
              </div>
              </div>
              <button
                onClick={handleStandardPayment}
                disabled={loading.standard || !razorpayLoaded}
                className="w-full mt-auto primary font-poppins-500 hover:bg-[#0331b5] cursor-pointer disabled:bg-gray-400 text-white text-md sm:text-lg py-4 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {loading.standard ? 'Processing...' : !razorpayLoaded ? 'Loading...' : 'Go Standard'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="flex flex-col justify-between bg-white w-full max-w-[21rem] mx-auto  rounded-2xl p-6 px-9 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{ backgroundColor: '#f8ccc4' }}>
              <div className='flex-grow'>
                <div className="text-center max-h-[5rem] mb-5">
                  <h3 className="font-poppins-600 text-3xl  text-[#0331b5]">Premium</h3>
                  <div className="font-montserrat-600 text-2xl mt-2  text-[#333333]">Rs. 399/year</div>
                  <div className="text-sm font-montserrat-600 mt-0.5 text-black font-medium line-through"><span className=''>
                    Rs. 799/year
                  </span></div>
                </div>

                <hr className="border-gray-800 mt-10 mb-6" />

                <div className="space-y-5 mb-8">
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Add Upto 10 Members</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>1000 MB Storage</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Upload PDF, Video Files</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Wellness Kit</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Access to Exclusive Article</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Premium Membership Card</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePremiumPayment}
                disabled={loading.premium || !razorpayLoaded}
                className="w-full mt-auto primary font-poppins-500 hover:bg-[#0331b5]  cursor-pointer disabled:bg-gray-400 text-white text-md sm:text-lg py-4 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {loading.premium ? 'Processing...' : !razorpayLoaded ? 'Loading...' : 'Go Premium'}
              </button>
            </div>

            {/* Advanced Plan */}
            <div className="flex flex-col justify-between bg-white w-full max-w-[21rem] mx-auto  rounded-2xl p-6 px-9 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              style={{ backgroundColor: '#90bcfc' }}>
              <div className='flex-grow '>


                <div className="text-center max-h-[5rem] mb-9">
                  <h3 className="font-poppins-600  text-3xl  text-[#0331b5]">Advanced</h3>
                  <div className="font-montserrat-600 text-2xl mt-4 font-bold text-[#333333]">Contact Sales</div>
                </div>

                <hr className="border-gray-800  mb-6" />



                <div className="space-y-5 mb-8">
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Add Unlimited Members</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Unlimited Storage</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Membership Card</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Wellness Program</span>
                  </div>
                  <div className="flex items-start text-black text-[16px] font-montserrat-500">
                    <svg className="text-[#000] w-[18px] h-[18px] mr-3 shrink-0 mt-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
                    <span>Personalized Solutions</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-auto primary font-poppins-500 hover:bg-[#0331b5]  cursor-pointer text-white text-md sm:text-lg py-4 px-4 rounded-lg transition-colors duration-200 "
              >
                Contact Sales
              </button>

            </div>


          </div>
        </div>

        {/* Contact Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-6 rounded-lg relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-4 text-2xl cursor-pointer hover:text-gray-600"
              >
                ×
              </button>

              <h3 className="text-xl font-bold mb-2">Drop us your query and we'll get in touch with you</h3>
              <p className="text-gray-600 mb-4">Please share some details regarding your query</p>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Business email*</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your email"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <small className="text-gray-500">No spam, we promise!</small>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Your query*</label>
                  <textarea
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="Tell us how we can help"
                    rows={4}
                    maxLength={500}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <small className="text-gray-500">{formData.query.length}/500 characters</small>
                </div>

                <button
                  onClick={handleQuerySubmit}
                  disabled={!formData.email.trim() || !formData.query.trim()}
                  className="w-full bg-blue-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed transition-colors border-none"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
      />
    </MasterHome>
  );
};

export default SubscriptionCards;
