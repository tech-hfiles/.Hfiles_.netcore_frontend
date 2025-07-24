// pages/CreateAbhaCard.js
'use client'
import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/LandingPage/Header';
import Footer from '../components/LandingPage/Footer';

export default function CreateAbhaCard() {
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
    const [otp, setOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [txnId, setTxnId] = useState(''); // Store transaction ID from first API
const [verifyLoading, setVerifyLoading] = useState(false);
 const [downloadLoading, setDownloadLoading] = useState(false);
  const [abhaGenerated, setAbhaGenerated] = useState(false);
const handleGetOTP = async () => {
    // Validate Aadhar number
    if (!aadharNumber || aadharNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhar number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://localhost:44358/api/abha/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(aadharNumber)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('OTP Request Success:', data);
        if (data.txnId) {
        setTxnId(data.txnId);
        console.log('Transaction ID captured:', data.txnId);
      
      } else {
        console.warn('Transaction ID not found in response:', data);
        setError('Transaction ID not received. Please try again.');
        return;
      }
      
        setOtpSent(true);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('API Error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    // Validate inputs
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!txnId) {
      setError('Transaction ID not found. Please request OTP again.');
      return;
    }

    setVerifyLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const requestBody = {
        "Otp": otp,
        "TxnId": txnId,
        "mobile": mobileNumber
      };

      const response = await fetch('https://localhost:44358/api/abha/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('OTP Verification Success:', data);
        setSuccessMessage('ABHA Card generated successfully! You can now download your card.');
        setError('');
          setAbhaGenerated(true);
        // Reset form or redirect as needed
        // You might want to show the ABHA card details here
        
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification API Error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

   const handleDownloadABHA = async () => {
    if (!abhaGenerated) {
      setError('Please complete ABHA generation first before downloading.');
      return;
    }

    setDownloadLoading(true);
    setError('');

    try {
      const response = await fetch('https://localhost:44358/api/abha/download-card', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          // Add any authentication headers if required
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from response headers or use default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'ABHA_Card.pdf';
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccessMessage('ABHA Card downloaded successfully!');
        
      } else {
        const errorData = await response.text();
        setError('Failed to download ABHA Card. Please try again.');
        console.error('Download error:', errorData);
      }
    } catch (error) {
      console.error('Download API Error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setDownloadLoading(false);
    }
  };
  return (
    <>
    <Header/>
        <title>ABHA Card Registration | Hfiles</title>
        <meta name="description" content="Register for ABHA Card on Hfiles" />
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        <style jsx>{`
          :root {
            --primary-color: #0331b5;
            --secondary-color: #cae5ff;
            --button-green: #238B02;
            --button-yellow: #ffd100;
            --text-hover-color: #323232;
          }

          * {
            font-family: 'Montserrat', sans-serif;
            box-sizing: border-box;
          }

          .poppins {
            font-family: 'Poppins', sans-serif;
          }

          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }

          .bg-gradient {
            background: linear-gradient(
              to right,
              rgba(172, 237, 255, 0.7) 70%,
              rgba(255, 255, 255, 0.9) 80%,
              white 100%
            );
          }
        `}</style>
    

     

      {/* Main Content */}
      <div style={{ padding: '40px 20px'}}>
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left: ABHA Card Image */}
            <div className="lg:w-2/5">
              <div className="bg-white rounded-2xl" style={{maxWidth: '330px'}}>
                <img
                  src="/journal-page-images/article/abha_header_imag.png"
                  alt="ABHA Card"
                  className="w-full h-auto"
                  style={{maxHeight: '450px', objectFit: 'contain'}}
                />
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="lg:w-4/5">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                
                {/* Form Header */}
                <div className="text-white text-center py-4 text-xl font-semibold" style={{backgroundColor: '#496BCA'}}>
                  ABHA Card Registration
                </div>

                {/* Form Body */}
                <div className="space-y-4" style={{width: '105%',maxWidth: '110%',marginLeft: '-22px',padding: '3rem 2rem 3rem 2rem'}}>
                   {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <i className="fas fa-exclamation-circle"></i>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <i className="fas fa-check-circle"></i>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}
                  {/* Aadhaar & OTP Row */}
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter Adhar Number"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Enter OTP"
                       value={otp}
                       onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-32 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Get OTP Button */}
                  <button
                    onClick={handleGetOTP}
                     disabled={loading}
                    className="w-full py-3 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                    style={{backgroundColor: '#f1f5f9'}}
                  >
                     {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-spinner fa-spin"></i>
              Sending OTP...
            </span>
          ) : (
            'Get OTP'
          )}
                  </button>

                  <hr className="border-black-400" />

                  {/* Mobile & Verify Row */}
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                     onClick={handleVerifyOTP}
            disabled={!otpSent || verifyLoading || !otp || !mobileNumber}
                      className="px-6 py-3 rounded-lg font-medium text-sm transition"
                      style={{
              backgroundColor: (!otpSent || verifyLoading || !otp || !mobileNumber) ? '#e5e7eb' : '#ACEDFF', 
              color: '#0F172A'
            }}
                    >
                      {verifyLoading ? (
              <span className="flex items-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                Verifying...
              </span>
            ) : (
              'Verify OTP & Generate ABHA'
            )}
                    </button>
                  </div>

                  {/* Success Message */}
                  {otpSent && (
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        <i className="fas fa-check-circle"></i>
                        <span className="text-sm font-medium">OTP Sent Successfully!</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-white rounded-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <p className="text-lg text-gray-700 font-medium lg:text-left text-center">
                Stay ready with your digital health ID - one click to access your healthcare journey.
              </p>
              <button 
               onClick={handleDownloadABHA}
            disabled={!abhaGenerated || downloadLoading}
                className="py-3 rounded-lg font-semibold text-black transition hover:opacity-90"
                 style={{
              backgroundColor: (!abhaGenerated || downloadLoading) ? '#e5e7eb' : '#FEF08A', 
              minWidth: '250px'
            }}
              >
               {downloadLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                Downloading...
              </span>
            ) : !abhaGenerated ? (
              'Download ABHA Card'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-download"></i>
                Download ABHA Card
              </span>
            )}
              </button>
            </div>
            {/* Status message for download section */}
        {!abhaGenerated && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Complete the ABHA card generation process above to enable download.
            </p>
          </div>
        )}
          </div>

        </div>
      </div>
<hr className="border-black-400"/>
      {/* What is ABHA Card Section */} 
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left: Content */}
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6" style={{color: '#0331b5'}}>What is ABHA Card?</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The Ayushman Bharat Health Account (ABHA) Card is a part of India's Ayushman Bharat Digital Mission (ABDM). It serves as a digital health identity that enables individuals to securely store, manage, and share their medical records with healthcare providers.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                With an ABHA Card, you can access your health records anytime, anywhere and share them with doctors, hospitals, and labs with your consent—ensuring seamless and efficient healthcare services.
              </p>
            </div>

            {/* Right: Card Image */}
           
            <div className="lg:w-1/2">
              <img src="/journal-page-images/article/Group 28.png" alt="NHA Logo" className="w-full h-auto rounded-lg" />
            </div>
             
     

          </div>
        </div>
      </section>
<hr className="border-black-400"/>
      {/* What is ABHA Number Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left: Image */}
            <div className="lg:w-1/2">
              <img src="/journal-page-images/article/Group 18.png" alt="ABHA Number" className="w-full h-auto rounded-lg" />
            </div>

            {/* Right: Content */}
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold mb-6" style={{color: '#0331b5'}}>What is an ABHA Number?</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                An ABHA Number is a 14-digit unique health ID assigned to every individual under the Ayushman Bharat Digital Mission. It acts as a personal health identity that links all your medical records and ensures a paperless, hassle-free healthcare experience.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                With this number, you can securely share your health records with hospitals, clinics, and labs, eliminating the need to carry physical documents.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
  <div className="max-w-4xl mx-auto px-6">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold mb-4" style={{color: '#0331b5'}}>Benefits of ABHA Card</h2>
      <div className="w-24 h-1 mx-auto" style={{backgroundColor: '#0331b5'}}></div>
    </div>

    {/* Benefits List - Single Column */}
    <div className="space-y-6">
      {/* First 3 Benefits */}
      <div className="flex gap-4 items-start">
        <i className="fas fa-check-circle text-xl mt-1" style={{color: '#0331b5'}}></i>
        <div>
          <span className="font-semibold text-lg">Unique & Trustable Identity:</span>
          <span className="text-gray-700 ml-1">Establish your presence in India's digital healthcare system.</span>
        </div>
      </div>
      
      <div className="flex gap-4 items-start">
        <i className="fas fa-check-circle text-xl mt-1" style={{color: '#0331b5'}}></i>
        <div>
          <span className="font-semibold text-lg">Seamless Access to Medical Records:</span>
          <span className="text-gray-700 ml-1">Store and manage all your health records digitally in one place.</span>
        </div>
      </div>
      
      <div className="flex gap-4 items-start">
        <i className="fas fa-check-circle text-xl mt-1" style={{color: '#0331b5'}}></i>
        <div>
          <span className="font-semibold text-lg">Consent-Based Sharing:</span>
          <span className="text-gray-700 ml-1">Securely share your health data with hospitals, labs, and doctors with your permission.</span>
        </div>
      </div>
    </div>

    {/* Blue Guide Section */}
    <div className="my-12 px-6 rounded-lg bg-gradient w-full" style={{backgroundColor: '#CAE5FF',paddingTop: '47px'}}>
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">
          Your guide to ABHA: Everything you need to know
        </h3>
        <div className="w-22 h-1 mx-auto mb-6" style={{backgroundColor: 'black'}}></div>
        <div className="flex justify-end">
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
            Read More <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>

    {/* Remaining Benefits */}
    <div className="space-y-6">
      <div className="flex gap-4 items-start">
        <i className="fas fa-check-circle text-xl mt-1" style={{color: '#0331b5'}}></i>
        <div>
          <span className="font-semibold text-lg">Hassle-Free Healthcare Experience:</span>
          <span className="text-gray-700 ml-1">Avoid long queues and paperwork during hospital visits.</span>
        </div>
      </div>
      
      <div className="flex gap-4 items-start">
        <i className="fas fa-check-circle text-xl mt-1" style={{color: '#0331b5'}}></i>
        <div>
          <span className="font-semibold text-lg">Linked to Public Health Benefits:</span>
          <span className="text-gray-700 ml-1">Connect with government health programs and insurance schemes.</span>
        </div>
      </div>
      
      <div className="flex gap-4 items-start">
        <i className="fas fa-check-circle text-xl mt-1" style={{color: '#0331b5'}}></i>
        <div>
          <span className="font-semibold text-lg">Data Privacy & Security:</span>
          <span className="text-gray-700 ml-1">Your health data is encrypted and shared only with your consent.</span>
        </div>
      </div>
    </div>
  </div>
</section>

      <Footer />
    </>
  );
}