'use client';
export const runtime = 'edge'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { BasicDetailsList, ListFlag, OTPSend, VerigyOTps, ListPincode, listCounty, AddProfile, OTpVerifyMember, OTpSubmitMember } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import MasterHome from '../components/MasterHome';
import { toast } from 'react-toastify';
import { FaLessThan } from 'react-icons/fa';

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber: string;
  countryCode: string;
  email: string;
  gender: string;
  bloodGroup: string;
  pincode: string;
  state: string;
  city: string;
  emergencyContact: string;
  emergencyCountryCode: string;
}

const validationSchema = Yup.object({
  firstName: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .required('First name is required')
    .trim(),
  lastName: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .required('Last name is required')
    .trim(),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  contactNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits')
    .required('Contact number is required'),
  countryCode: Yup.string()
    .required('Country code is required'),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    )
    .required("Email is required"),
  gender: Yup.string()
    .required('Gender is required')
    .notOneOf([''], 'Please select a gender'),
  bloodGroup: Yup.string()
    .notRequired(),
  pincode: Yup.string()
    .matches(/^[1-9][0-9]{5}$/, 'Pincode must be 6 digits and cannot start with 0')
    .notRequired(),
  state: Yup.string()
    .required('State is required'),
  city: Yup.string()
    .required('City is required'),
  emergencyContact: Yup.string()
    .matches(/^[0-9]{10}$/, 'Emergency contact must be exactly 10 digits')
    .notRequired(),
  emergencyCountryCode: Yup.string()
    .notRequired()
});

const otpValidationSchema = Yup.object({
  otp: Yup.string()
    .matches(/^[0-9]{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required')
});

const AddBasicDetails: React.FC = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string>('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [listDetails, setListDetails] = useState<any>();
  const [mainContactFlagUrl, setMainContactFlagUrl] = useState<string | null>(null) as any;
  const [emergencyContactFlagUrl, setEmergencyContactFlagUrl] = useState<string | null>(null) as any;
  const [showOTPModal, setShowOTPModal] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string>('') as any;
  const [pincodeLoading, setPincodeLoading] = useState<boolean>(false);
  const [listCountyCode, setListCountryCode] = useState<any[]>([]);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean | null>(null);
  const [showOTPPhoneModal, setShowOTPPhoneModal] = useState<boolean>(false);
  const [oldCountryCode, setOldCountryCode] = useState<string>('');
  const [oldPhoneNumber, setOldPhoneNumber] = useState<string>('');
  const [phoneOtpStep, setPhoneOtpStep] = useState<'verify' | 'otp'>('verify');
  const [phoneOtpLoading, setPhoneOtpLoading] = useState<boolean>(false);
  const [phoneVerifyLoading, setPhoneVerifyLoading] = useState<boolean>(false);

  // Refs for OTP inputs to maintain focus
  const otpInputRef = useRef<HTMLInputElement>(null);
  const phoneOtpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem('isEmailVerified');
    const phoneStatus = localStorage.getItem('isPhoneVerified');
    if (storedValue !== null) {
      setIsEmailVerified(storedValue === 'true');
    }
    if (phoneStatus !== null) setIsPhoneVerified(phoneStatus === 'true');
  }, []);

  const otpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      await handleVerifyOTP(values.otp);
    }
  });

  const phoneOtpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      await handleVerifyPhoneOTP(values.otp);
    }
  });

  const formik = useFormik<FormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      contactNumber: '',
      countryCode: '',
      email: '',
      gender: '',
      bloodGroup: '',
      pincode: '',
      state: '',
      city: '',
      emergencyContact: '',
      emergencyCountryCode: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('FirstName', values.firstName.trim());
        formData.append('LastName', values.lastName.trim());
        formData.append('Email', values.email.trim());
        formData.append('Gender', values.gender);
        formData.append('Phone', values.contactNumber);
        formData.append('Dob', formatDateToDDMMYYYY(values.dateOfBirth));
        formData.append('City', values.city);
        formData.append('State', values.state);

        if (values.countryCode) {
          try {
            const countryData = JSON.parse(values.countryCode);
            const combinedCountryCode = `${countryData.country} ${countryData.dialingCode}`;
            formData.append('CountryCode', combinedCountryCode);
          } catch (e) {
            formData.append('CountryCode', values.countryCode);
          }
        } else {
          formData.append('CountryCode', '+91');
        }

        if (values.bloodGroup) {
          formData.append('BloodGroup', values.bloodGroup);
        }

        if (values.pincode) {
          formData.append('Pincode', values.pincode);
        }

        if (values.emergencyContact) {
          formData.append('EmergencyContact', values.emergencyContact);
        }

        if (values.emergencyCountryCode) {
          try {
            const countryData = JSON.parse(values.emergencyCountryCode);
            const combinedCountryCode = `${countryData.country} ${countryData.dialingCode}`;
            formData.append('EmergencyCountryCode', combinedCountryCode);
          } catch (e) {
            formData.append('EmergencyCountryCode', values.emergencyCountryCode);
          }
        }
        if (profileImageFile) {
          formData.append('ProfilePhoto', profileImageFile);
        }
        const currentUserId = await getUserId();
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        const response = await AddProfile(currentUserId, formData);
        toast.success(`${response.data.message}`);
        await ProfileDetailsList();
        router.push('/dashboard');
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setLoading(false);
      }
    }
  });

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

  const extractDialingCode = (countryCodeValue: string): string => {
    if (!countryCodeValue) return '';
    try {
      const countryData = JSON.parse(countryCodeValue);
      return countryData.country || '';
    } catch (e) {
      return countryCodeValue;
    }
  };

  const fetchMainContactFlag = async (countryCodeValue: string) => {
    try {
      const dialingCode = extractDialingCode(countryCodeValue);
      if (!dialingCode) {
        setMainContactFlagUrl(null);
        return;
      }

      const currentUserId = await getUserId();
      if (!currentUserId) return;

      const response = await ListFlag(currentUserId, dialingCode);
      setMainContactFlagUrl(response.data.data);
    } catch (error) {
      console.error("Error fetching main contact flag:", error);
      setMainContactFlagUrl(null);
    }
  };

  const fetchEmergencyContactFlag = async (countryCodeValue: string) => {
    try {
      const dialingCode = extractDialingCode(countryCodeValue);
      if (!dialingCode) {
        setEmergencyContactFlagUrl(null);
        return;
      }

      const currentUserId = await getUserId();
      if (!currentUserId) return;

      const response = await ListFlag(currentUserId, dialingCode);
      setEmergencyContactFlagUrl(response.data.data);
    } catch (error) {
      console.error("Error fetching emergency contact flag:", error);
      setEmergencyContactFlagUrl(null);
    }
  };

  const handlePincodeChange = useCallback(async (pincode: string) => {
    if (pincode.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await ListPincode(pincode);
        if (response && response.data) {
          const locationData = response.data.data;
          formik.setFieldValue('state', locationData.state || '');
          formik.setFieldValue('city', locationData.city || '');
        }
      } catch (error) {
        toast.error('Unable to fetch location details for this pincode');
        formik.setFieldValue('state', '');
        formik.setFieldValue('city', '');
      } finally {
        setPincodeLoading(false);
      }
    } else {
      formik.setFieldValue('state', '');
      formik.setFieldValue('city', '');
    }
  }, [formik]);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'firstName' || name === 'lastName') {
      processedValue = value.replace(/[^a-zA-Z ]/g, '');
    } else if (name === 'pincode') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      formik.setFieldValue(name, processedValue);
      handlePincodeChange(processedValue);
      return;
    } else if (name === 'emergencyContact' || name === 'contactNumber') {
      processedValue = value.replace(/[^0-9]/g, '');
    }
    formik.setFieldValue(name, processedValue);
  }, [formik, handlePincodeChange]);

  const handleRegularChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    formik.handleChange(e);
    if (name === 'countryCode') {
      fetchMainContactFlag(value);
    } else if (name === 'emergencyCountryCode') {
      fetchEmergencyContactFlag(value);
    }
  }, [formik]);

  // Fixed OTP change handler for email OTP
  const handleOTPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    const cursorPosition = e.target.selectionStart;
    
    otpFormik.setFieldValue('otp', value);
    
    // Restore focus and cursor position
    setTimeout(() => {
      if (otpInputRef.current) {
        otpInputRef.current.focus();
        otpInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, []);

  // Fixed OTP change handler for phone OTP
  const handlePhoneOTPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    const cursorPosition = e.target.selectionStart;
    
    phoneOtpFormik.setFieldValue('otp', value);
    
    // Restore focus and cursor position
    setTimeout(() => {
      if (phoneOtpInputRef.current) {
        phoneOtpInputRef.current.focus();
        phoneOtpInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  }, []);

  const handleEmailVerificationClick = async () => {
    setOtpLoading(true);
    try {
      const currentUserId = await getUserId();
      const currentEmail = formik.values.email || userEmail;
      if (!currentUserId || !currentEmail) {
        alert('User ID or email not found. Please refresh the page.');
        return;
      }
      const payload = {
        userId: currentUserId,
        email: currentEmail
      };
      const response = await OTPSend(payload);
      toast.success(`${response.data.message}`);
      setUserId(currentUserId);
      setUserEmail(currentEmail);
      setShowOTPModal(true);
      otpFormik.resetForm();
      localStorage.setItem('isEmailVerified', 'true');
    } catch (error) {
      console.log(error, "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePhoneVerificationClick = async () => {
    try {
      const encryptedUserId = localStorage.getItem("userId");
      if (!encryptedUserId) {
        toast.error('User ID not found. Please refresh the page.');
        return;
      }
      const userIdStr = await decryptData(encryptedUserId);
      const currentUserId = parseInt(userIdStr, 10);
      const response = await BasicDetailsList(currentUserId);
      const data = response?.data?.data;
      if (!data) {
        toast.error('Unable to fetch current phone details.');
        return;
      }
      const dbCountryCode = data.countryCode || '';
      const dbPhoneNumber = data.phone || '';
      let formattedOldCountryCode = '';
      if (dbCountryCode && Array.isArray(listCountyCode) && listCountyCode.length > 0) {
        let cleanDialingCode = dbCountryCode.toString().trim();
        if (!cleanDialingCode.startsWith('+')) {
          cleanDialingCode = '+' + cleanDialingCode;
        }
        const country = listCountyCode.find(c => {
          const countryDialingCode = c.dialingCode.toString().trim();
          return countryDialingCode === cleanDialingCode ||
            countryDialingCode === dbCountryCode.toString().trim();
        });
        if (country) {
          formattedOldCountryCode = ` ${country.dialingCode}`;
        } else {
          formattedOldCountryCode = dbCountryCode;
          console.log('No matching country found, using raw code:', dbCountryCode);
        }
      }
      setOldCountryCode(formattedOldCountryCode);
      setOldPhoneNumber(dbPhoneNumber);
      setPhoneOtpStep('verify');
      setShowOTPPhoneModal(true);
      phoneOtpFormik.resetForm();
    } catch (error) {
      console.error('Error opening phone verification modal:', error);
      toast.error('Error opening phone verification. Please try again.');
    }
  };

  const handleSendPhoneOTP = async () => {
    setPhoneOtpLoading(true);
    try {
      const currentUserId = await getUserId();
      const newCountryCode = formik.values.countryCode;
      const newPhoneNumber = formik.values.contactNumber;
      let parsedNewCountryCode = '';
      if (newCountryCode) {
        try {
          const countryData = JSON.parse(newCountryCode);
          parsedNewCountryCode = ` ${countryData.dialingCode}`;
        } catch (e) {
          parsedNewCountryCode = newCountryCode;
        }
      }
      const payload = {
        userId: currentUserId,
        oldCountryCode: oldCountryCode || '',
        oldPhoneNumber: oldPhoneNumber || '',
        newCountryCode: parsedNewCountryCode || oldCountryCode || '',
        newPhoneNumber: newPhoneNumber || oldPhoneNumber || ''
      };

      const response = await OTpVerifyMember(payload);
      toast.success(`${response.data.message}`);
      setPhoneOtpStep('otp');
    } catch (error) {
      console.error('Error sending phone OTP:', error);
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async (otp: string) => {
    setPhoneVerifyLoading(true);
    try {
      const currentUserId = await getUserId();
      const newPhoneNumber = formik.values.contactNumber;
      let parsedCountryCode = '';
      if (formik.values.countryCode) {
        try {
          const countryData = JSON.parse(formik.values.countryCode);
          parsedCountryCode = ` ${countryData.dialingCode}`;
        } catch (e) {
          parsedCountryCode = formik.values.countryCode;
        }
      }
      const payload = {
        userId: currentUserId,
        countryCode: parsedCountryCode || '',
        phoneNumber: newPhoneNumber || '',
        otp: otp
      };
      const response = await OTpSubmitMember(payload);
      toast.success(response.data.message);
      setShowOTPPhoneModal(false);
      setIsPhoneVerified(true);
      localStorage.setItem('isPhoneVerified', 'true');
      await ProfileDetailsList();
    } catch (error) {
      console.error('Error verifying phone OTP:', error);
    } finally {
      setPhoneVerifyLoading(false);
    }
  };

  const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      if (!year || !month || !day) return dateString;
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setVerifyLoading(true);
    try {
      const payload = {
        userId: userId,
        email: userEmail,
        otp: otp
      };
      const response = await VerigyOTps(payload);
      toast.success(`${response.data.message}`);
      setShowOTPModal(false);
      await ProfileDetailsList();
    } catch (error) {
      console.log(error, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await ListCountry();
      await ProfileDetailsList();
    };
    initializeData();
  }, []);

  const ProfileDetailsList = async () => {
    try {
      const encryptedUserId = localStorage.getItem("userId");
      if (!encryptedUserId) {
        return;
      }
      const userIdStr = await decryptData(encryptedUserId);
      const currentUserId = parseInt(userIdStr, 10);
      setUserId(currentUserId);
      const response = await BasicDetailsList(currentUserId);
      const data = response?.data?.data;
      setListDetails(data);
      setUserEmail(data.email || '');
      if (data.profileURL) {
        setProfileImage(data.profileURL);
      }
      const formatCountryCode = (dialingCode: any) => {
        if (!dialingCode || !Array.isArray(listCountyCode) || listCountyCode.length === 0) {
          return '';
        }
        let cleanDialingCode = dialingCode.toString().trim();
        if (!cleanDialingCode.startsWith('+')) {
          cleanDialingCode = '+' + cleanDialingCode;
        }
        const country = listCountyCode.find(c => {
          const countryDialingCode = c.dialingCode.toString().trim();
          return countryDialingCode === cleanDialingCode ||
            countryDialingCode === dialingCode.toString().trim();
        });
        if (country) {
          return JSON.stringify({
            country: country.country,
            dialingCode: country.dialingCode,
          });
        } else {
          console.log('No matching country found for:', dialingCode);
          return '';
        }
      };

      if (data.countryCode && data.phone) {
        const originalCountryCode = data.countryCode;
        const originalPhone = data.phone;

        if (Array.isArray(listCountyCode) && listCountyCode.length > 0) {
          let cleanDialingCode = originalCountryCode.toString().trim();
          if (!cleanDialingCode.startsWith('+')) {
            cleanDialingCode = '+' + cleanDialingCode;
          }

          const country = listCountyCode.find(c =>
            c.dialingCode.toString().trim() === cleanDialingCode ||
            c.dialingCode.toString().trim() === originalCountryCode.toString().trim()
          );

          if (country) {
            setOldCountryCode(` ${country.dialingCode}`);
          } else {
            setOldCountryCode(originalCountryCode);
          }
        } else {
          setOldCountryCode(originalCountryCode);
        }

        setOldPhoneNumber(originalPhone);
      }

      formik.setValues({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: formatDateToDDMMYYYY(data.dob || ''),
        contactNumber: data.phone || '',
        countryCode: formatCountryCode(data.countryCode),
        email: data.email || '',
        gender: data.gender?.toString() || '',
        bloodGroup: data.bloodGroup?.toString() || '',
        pincode: data.pincode || '',
        state: data.state || '',
        city: data.city || '',
        emergencyContact: data.emergencyContact || '',
        emergencyCountryCode: formatCountryCode(data.emergencyCountryCode),
      });

      if (data.countryCode) {
        const mainCountryCode = formatCountryCode(data.countryCode);
        if (mainCountryCode) {
          fetchMainContactFlag(mainCountryCode);
        }
      }

      if (data.emergencyCountryCode) {
        const emergencyCountryCode = formatCountryCode(data.emergencyCountryCode);
        if (emergencyCountryCode) {
          fetchEmergencyContactFlag(emergencyCountryCode);
        }
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  };

  useEffect(() => {
    ProfileDetailsList();
  }, []);

  const ListCountry = async () => {
    try {
      const response = await listCounty();
      setListCountryCode(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching country codes:", error);
    }
  };

  useEffect(() => {
    if (listCountyCode.length > 0 && listDetails) {
      const dbCountryCode = listDetails.countryCode;
      const dbEmergencyCountryCode = listDetails.emergencyCountryCode;

      if (dbCountryCode) {
        const formatCountryCode = (dialingCode: any) => {
          if (!dialingCode) return '';
          let cleanDialingCode = dialingCode.toString().trim();
          if (!cleanDialingCode.startsWith('+')) {
            cleanDialingCode = '+' + cleanDialingCode;
          }
          const country = listCountyCode.find(c => {
            const countryDialingCode = c.dialingCode.toString().trim();
            return countryDialingCode === cleanDialingCode ||
              countryDialingCode === dialingCode.toString().trim();
          });
          return country ? JSON.stringify({
            country: country.country,
            dialingCode: country.dialingCode,
          }) : '';
        };

        const mainCountryCodeValue = formatCountryCode(dbCountryCode);
        formik.setFieldValue('countryCode', mainCountryCodeValue);
        if (mainCountryCodeValue) {
          fetchMainContactFlag(mainCountryCodeValue);
        }

        if (dbEmergencyCountryCode) {
          const emergencyCountryCodeValue = formatCountryCode(dbEmergencyCountryCode);
          formik.setFieldValue('emergencyCountryCode', emergencyCountryCodeValue);
          if (emergencyCountryCodeValue) {
            fetchEmergencyContactFlag(emergencyCountryCodeValue);
          }
        }

        const country = listCountyCode.find(c => {
          const cleanDialingCode = dbCountryCode.toString().trim().startsWith('+')
            ? dbCountryCode.toString().trim()
            : '+' + dbCountryCode.toString().trim();
          return c.dialingCode.toString().trim() === cleanDialingCode;
        });

        if (country) {
          setOldCountryCode(`${country.country} ${country.dialingCode}`);
        }
      }
    }
  }, [listCountyCode, listDetails]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
        toast.error('Please select a valid image file (PNG, JPG, JPEG)');
        return;
      }
      setImageLoading(true);
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setImageLoading(false);
      };
      reader.onerror = () => {
        toast.error('Error reading the image file');
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const showFileUpload = () => {
    const fileInput = document.getElementById('profileUpload') as HTMLInputElement;
    fileInput?.click();
  };

  const ContactNumberField: React.FC = () => {
    return (
      <div className="relative mb-4">
        <div className="relative">
          <i className="fa-solid fa-phone absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
          <div className={`bg-white rounded-full border ${formik.touched.contactNumber && formik.errors.contactNumber ? 'border-red-500' :
            formik.touched.countryCode && formik.errors.countryCode ? 'border-red-500' : 'border-gray-300'
            } overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all duration-200`}>

            <div className="flex items-center">
              <select
                name="countryCode"
                aria-label="Country Code"
                value={formik.values.countryCode}
                onChange={handleRegularChange}
                onBlur={formik.handleBlur}
                className="border-0 bg-transparent py-2 sm:py-3 pl-6 sm:pl-7 pr-1 sm:pr-2 text-xs sm:text-sm focus:ring-0 focus:outline-none text-gray-700 font-medium"
                style={{ minWidth: '90px', maxWidth: '120px' }}
              >
                <option value="">Country</option>
                {Array.isArray(listCountyCode) &&
                  listCountyCode.map((country, index) => (
                    <option
                      key={index}
                      value={JSON.stringify({
                        country: country.country,
                        dialingCode: country.dialingCode,
                      })}
                    >
                      {country.country} {country.dialingCode}
                    </option>
                  ))}
              </select>

              <div className="h-4 sm:h-6 w-px bg-gray-300 mx-1"></div>
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formik.values.contactNumber}
                onChange={handleCustomChange}
                onBlur={formik.handleBlur}
                className="flex-1 border-0 py-2 sm:py-3 px-2 bg-transparent focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
                maxLength={10}
              />

              {mainContactFlagUrl && (
                <img
                  src={mainContactFlagUrl.flagUrl}
                  alt="Country flag"
                  width={20}
                  height={14}
                  className="mr-2 sm:mr-4"
                />
              )}
            </div>
          </div>
        </div>
        {formik.touched.countryCode && formik.errors.countryCode && (
          <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.countryCode}</span>
        )}
        {formik.touched.contactNumber && formik.errors.contactNumber && (
          <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.contactNumber}</span>
        )}
      </div>
    );
  };

  const EmergencyContactField: React.FC = () => {
    return (
      <div className="relative mb-4">
        <div className="relative">
          <i className="fa-solid fa-phone absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
          <div className={`bg-white rounded-full border overflow-hidden
            focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all duration-200`}>

            <div className="flex items-center">
              <select
                name="emergencyCountryCode"
                aria-label="Emergency Country Code"
                value={formik.values.emergencyCountryCode}
                onChange={handleRegularChange}
                onBlur={formik.handleBlur}
                className="border-0 bg-transparent py-2 sm:py-3 pl-6 sm:pl-7 pr-1 sm:pr-2 text-xs sm:text-sm focus:ring-0 focus:outline-none text-gray-700 font-medium"
                style={{ minWidth: '90px', maxWidth: '120px' }}
              >
                <option value="">Country</option>
                {Array.isArray(listCountyCode) &&
                  listCountyCode.map((country, index) => (
                    <option
                      key={index}
                      value={JSON.stringify({
                        country: country.country,
                        dialingCode: country.dialingCode,
                      })}
                    >
                      {country.country} {country.dialingCode}
                    </option>
                  ))}
              </select>

              <div className="h-4 sm:h-6 w-px bg-gray-300 mx-1"></div>

              <input
                type="text"
                name="emergencyContact"
                placeholder="Emergency Contact Number"
                value={formik.values.emergencyContact}
                onChange={handleCustomChange}
                onBlur={formik.handleBlur}
                className="flex-1 border-0 py-2 sm:py-3 px-2 bg-transparent focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
              />

              {emergencyContactFlagUrl && (
                <img
                  src={emergencyContactFlagUrl.flagUrl}
                  alt="Country flag"
                  width={20}
                  height={14}
                  className="mr-2 sm:mr-4"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OTPModal: React.FC = () => {
    if (!showOTPModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg mx-auto">
          <div className="p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="fa-solid fa-envelope text-blue-600 text-xl sm:text-2xl"></i>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                We've sent a 6-digit OTP to your email address
              </p>
            </div>

            <form onSubmit={otpFormik.handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-700 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">Enter OTP</label>
                <div className="relative">
                  <i className="fa-solid fa-key absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    ref={otpInputRef}
                    type="text"
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpFormik.values.otp}
                    onChange={handleOTPChange}
                    onBlur={otpFormik.handleBlur}
                    maxLength={6}
                    className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${otpFormik.touched.otp && otpFormik.errors.otp ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-center text-sm sm:text-lg tracking-wider sm:tracking-widest`}
                    placeholder="000000"
                  />
                </div>
                {otpFormik.touched.otp && otpFormik.errors.otp && (
                  <span className="block text-red-500 text-xs mt-1 ml-4">{otpFormik.errors.otp}</span>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={verifyLoading || !otpFormik.isValid}
                  className={`w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-semibold py-2 sm:py-3 px-6 rounded-full transition-all duration-300 text-sm sm:text-base ${verifyLoading || !otpFormik.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {verifyLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={handleEmailVerificationClick}
                    disabled={otpLoading}
                    className={`flex-1 bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700 font-medium py-2 px-4 rounded-full transition-all duration-300 text-xs sm:text-sm ${otpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {otpLoading ? 'Sending...' : 'Resend OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOTPModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700 font-medium py-2 px-4 rounded-full transition-all duration-300 text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const OTPPhoneModal: React.FC = () => {
    if (!showOTPPhoneModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg mx-auto">
          <div className="p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <i className="fa-solid fa-phone text-blue-600 text-xl sm:text-2xl"></i>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {phoneOtpStep === 'verify' ? 'Verify Your Phone' : 'Enter OTP'}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {phoneOtpStep === 'verify'
                  ? 'Confirm your phone number to receive OTP'
                  : 'Enter the 6-digit OTP sent to your phone'
                }
              </p>
            </div>

            {phoneOtpStep === 'verify' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Current Phone</label>
                  <div className="flex items-center bg-gray-50 rounded-full p-2 sm:p-3">
                    <span className="text-gray-600 text-xs sm:text-sm">
                      {oldCountryCode} {oldPhoneNumber}
                    </span>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">New Phone Number</label>
                  <div className={`bg-white rounded-full border ${formik.touched.contactNumber && formik.errors.contactNumber ? 'border-red-500' :
                    formik.touched.countryCode && formik.errors.countryCode ? 'border-red-500' : 'border-gray-300'
                    } overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-transparent transition-all duration-200`}>
                    <div className="flex items-center">
                      <select
                        name="countryCode"
                        aria-label="Country Code"
                        value={formik.values.countryCode}
                        onChange={handleRegularChange}
                        onBlur={formik.handleBlur}
                        className="border-0 bg-transparent py-2 sm:py-3 pl-4 sm:pl-6 pr-1 sm:pr-2 text-xs sm:text-sm focus:ring-0 focus:outline-none text-gray-700 font-medium"
                        style={{ minWidth: '90px', maxWidth: '120px' }}
                      >
                        <option value="">Country</option>
                        {Array.isArray(listCountyCode) &&
                          listCountyCode.map((country, index) => (
                            <option
                              key={index}
                              value={JSON.stringify({
                                country: country.country,
                                dialingCode: country.dialingCode,
                              })}
                            >
                              {country.country} {country.dialingCode}
                            </option>
                          ))}
                      </select>

                      <div className="h-4 sm:h-6 w-px bg-gray-300 mx-1"></div>

                      <input
                        type="text"
                        name="contactNumber"
                        placeholder="Phone Number"
                        value={formik.values.contactNumber}
                        onChange={handleCustomChange}
                        onBlur={formik.handleBlur}
                        className="flex-1 border-0 py-2 sm:py-3 px-2 bg-transparent focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 text-xs sm:text-sm"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  {formik.touched.countryCode && formik.errors.countryCode && (
                    <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.countryCode}</span>
                  )}
                  {formik.touched.contactNumber && formik.errors.contactNumber && (
                    <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.contactNumber}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={handleSendPhoneOTP}
                    disabled={phoneOtpLoading || !formik.values.contactNumber || !formik.values.countryCode}
                    className={`w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-semibold py-2 sm:py-3 px-6 rounded-full transition-all duration-300 text-sm sm:text-base ${phoneOtpLoading || !formik.values.contactNumber || !formik.values.countryCode
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                      }`}
                  >
                    {phoneOtpLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOTPPhoneModal(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700 font-medium py-2 px-4 rounded-full transition-all duration-300 text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={phoneOtpFormik.handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      value={`${formik.values.countryCode ? JSON.parse(formik.values.countryCode).dialingCode : ''} ${formik.values.contactNumber}`}
                      readOnly
                      className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-full bg-gray-50 text-gray-700 text-xs sm:text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Enter OTP</label>
                  <div className="relative">
                    <i className="fa-solid fa-key absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      ref={phoneOtpInputRef}
                      type="text"
                      name="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={phoneOtpFormik.values.otp}
                      onChange={handlePhoneOTPChange}
                      onBlur={phoneOtpFormik.handleBlur}
                      maxLength={6}
                      className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${phoneOtpFormik.touched.otp && phoneOtpFormik.errors.otp ? 'border-red-500' : 'border-gray-300'
                        } rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-center text-sm sm:text-lg tracking-wider sm:tracking-widest`}
                      placeholder="000000"
                    />
                  </div>
                  {phoneOtpFormik.touched.otp && phoneOtpFormik.errors.otp && (
                    <span className="block text-red-500 text-xs mt-1 ml-4">{phoneOtpFormik.errors.otp}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={phoneVerifyLoading || !phoneOtpFormik.isValid}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-6 rounded-full transition-all duration-300 text-sm sm:text-base ${phoneVerifyLoading || !phoneOtpFormik.isValid ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {phoneVerifyLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                    <button
                      type="button"
                      onClick={handleSendPhoneOTP}
                      disabled={phoneOtpLoading}
                      className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full transition-all duration-300 text-xs sm:text-sm ${phoneOtpLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {phoneOtpLoading ? 'Sending...' : 'Resend OTP'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPhoneOtpStep('verify');
                        phoneOtpFormik.resetForm();
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full transition-all duration-300 text-xs sm:text-sm"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOTPPhoneModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full transition-all duration-300 text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MasterHome>
      <div className="h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-134px)] 2xl:h-[calc(100vh-120x)] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <div className="flex justify-between items-center mx-3 p-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-black font-bold text-sm sm:text-base transition-colors duration-200"
          >
            <FaLessThan className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {!isEmailVerified && !userEmail?.isEmailVerified && (
          <div className="w-full flex justify-end">
            <div className="w-full sm:w-1/2 bg-red-700 text-white flex flex-col sm:flex-row justify-between items-center p-4 rounded-md mx-4 sm:mx-0 mb-4 shadow-md">
              {/* Message */}
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="font-semibold text-sm sm:text-base">Your email isn't verified yet.</p>
                <p className="text-sm sm:text-base">Please verify to access all features.</p>
              </div>

              {/* Button */}
              <button
                onClick={handleEmailVerificationClick}
                disabled={otpLoading}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 sm:ml-4 transition-colors duration-200"
              >
                {otpLoading ? 'Sending OTP...' : 'Verify Now'}
              </button>
            </div>
          </div>
        )}

        {!isPhoneVerified && (
          <div
            className='bg-red-300 text-center cursor-pointer hover:bg-red-400 transition-colors duration-200 py-2 mx-4 sm:mx-6'
            onClick={handlePhoneVerificationClick}
          >
            <p className="text-red-800 font-medium text-sm sm:text-base">
              {otpLoading ? 'Sending OTP...' : 'Please Verify Phone - Click Here'}
            </p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 xl:gap-16 items-start">
            <div className="w-full md:w-64 lg:w-80 xl:w-96 flex flex-col items-center">
              <div className="mb-4 sm:mb-6 relative">
                <div className="w-34 h-34 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-yellow-400 p-1 bg-white shadow-lg">
                  {imageLoading ? (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <img
                      id="imagePreview"
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/default-user-profile.png';
                      }}
                    />
                  )}
                </div>
                {imageLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="text-white text-xs sm:text-sm">Loading...</div>
                  </div>
                )}
              </div>

              <button
                onClick={showFileUpload}
                disabled={imageLoading}
                className={`bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-xs sm:text-sm ${imageLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {imageLoading ? 'Processing...' : 'Change Profile Image'}
              </button>
              <input
                id="profileUpload"
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700 mb-2 sm:mb-3">
                  Ready to manage your health? Let's get you set up!
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Fill in your details to kickstart your health journey
                </p>
                <div className="w-16 sm:w-20 h-1 bg-blue-400 mx-auto mt-3 sm:mt-4 rounded-full"></div>
              </div>

              <form onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div className="space-y-4">
                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <input
                          type="text"
                          name="firstName"
                          value={formik.values.firstName}
                          onChange={handleCustomChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm`}
                          placeholder="rahul"
                          required
                        />
                      </div>
                      {formik.touched.firstName && formik.errors.firstName && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.firstName}</span>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <input
                          type="text"
                          name="lastName"
                          value={formik.values.lastName}
                          onChange={handleCustomChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm`}
                          placeholder="sinha"
                          required
                        />
                      </div>
                      {formik.touched.lastName && formik.errors.lastName && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.lastName}</span>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-calendar-days absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formik.values.dateOfBirth}
                          onChange={handleRegularChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm`}
                          placeholder="15-12-1997"
                          required
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.dateOfBirth}</span>
                      )}
                    </div>

                    <ContactNumberField />

                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <input
                          type="email"
                          name="email"
                          value={formik.values.email}
                          onChange={handleRegularChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm`}
                          placeholder="kamleshfiles2024@gmail.com"
                          required
                        />
                      </div>
                      {formik.touched.email && formik.errors.email && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-venus-mars absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <select
                          name="gender"
                          value={formik.values.gender}
                          onChange={handleRegularChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.gender && formik.errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${formik.values.gender ? 'text-gray-700' : 'text-gray-400'}`}
                          required
                        >
                          <option value="" disabled>Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      {formik.touched.gender && formik.errors.gender && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.gender}</span>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-droplet absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <select
                          name="bloodGroup"
                          value={formik.values.bloodGroup}
                          onChange={handleRegularChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.bloodGroup && formik.errors.bloodGroup ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${formik.values.bloodGroup && formik.values.bloodGroup !== '0' ? 'text-gray-700' : 'text-gray-400'}`}
                        >
                          <option value="">Select BloodGroup</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                      {formik.touched.bloodGroup && formik.errors.bloodGroup && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.bloodGroup}</span>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-location-dot absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <input
                          type="text"
                          name="pincode"
                          value={formik.values.pincode}
                          onChange={handleCustomChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.pincode && formik.errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm ${pincodeLoading ? 'opacity-50' : ''}`}
                          placeholder="400020"
                          maxLength={6}
                          disabled={pincodeLoading}
                        />
                        {pincodeLoading && (
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                      {formik.touched.pincode && formik.errors.pincode && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.pincode}</span>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-map-location-dot absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <input
                          type="text"
                          name="state"
                          value={formik.values.state}
                          onChange={handleRegularChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.state && formik.errors.state ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm`}
                          placeholder="State (Auto-filled by pincode)"
                          required
                        />
                      </div>
                      {formik.touched.state && formik.errors.state && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.state}</span>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <div className="relative">
                        <i className="fa-solid fa-city absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 z-10 text-base sm:text-lg"></i>
                        <input
                          type="text"
                          name="city"
                          value={formik.values.city}
                          onChange={handleRegularChange}
                          onBlur={formik.handleBlur}
                          className={`w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border ${formik.touched.city && formik.errors.city ? 'border-red-500' : 'border-gray-300'} rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm`}
                          placeholder="City (Auto-filled by pincode)"
                          required
                        />
                      </div>
                      {formik.touched.city && formik.errors.city && (
                        <span className="block text-red-500 text-xs mt-1 ml-4">{formik.errors.city}</span>
                      )}
                    </div>

                    <EmergencyContactField />
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4 mt-6 sm:mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 sm:py-4 px-12 sm:px-16 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[160px] sm:min-w-[200px] text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>

                  <div className="text-center text-xs sm:text-sm hover:underline transition-all duration-200 cursor-pointer">
                    <span className="text-gray-600">Click Here to </span>
                    <span
                      className="text-blue-700 font-semibold underline"
                      onClick={() => router.push("/change-password")}
                    >
                      Change Password
                    </span>
                  </div>
                </div>

                {formik.status && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-xs sm:text-sm">
                    {formik.status}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <OTPModal />
        <OTPPhoneModal />
      </div>
    </MasterHome>
  );
};

export default AddBasicDetails;