'use client';
import React, { useState, useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MasterHome from '../components/MasterHome';

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

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): {
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
  const [formData, setFormData] = useState<{
    email: string;
    query: string;
  }>({
    email: '',
    query: ''
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Standard Plan Payment Handler
  const handleStandardPayment = async (): Promise<void> => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded. Please try again.');
      return;
    }

    setLoading(prev => ({ ...prev, standard: true }));

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 9900, // Rs. 99 in paise
          currency: 'INR',
          plan: 'Standard'
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Razorpay options
      const options: RazorpayOptions = {
        key: "rzp_live_kpCWRpxOkiH9M7",
        amount: orderData.amount,
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
          address: "Hello World",
          merchant_order_id: "12312321",
        },
        theme: {
          color: "#0331B5",
          image_padding: false
        },
        handler: async function (response: RazorpayResponse) {
          console.log("Payment successful:", response);
          await handlePaymentSuccess(response, 'Standard');
        },
        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
            setLoading(prev => ({ ...prev, standard: false }));
          },
          escape: true,
          backdropclose: false
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Standard payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(prev => ({ ...prev, standard: false }));
    }
  };

  // Premium Plan Payment Handler
  const handlePremiumPayment = async (): Promise<void> => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded. Please try again.');
      return;
    }

    setLoading(prev => ({ ...prev, premium: true }));

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 39900, // Rs. 399 in paise
          currency: 'INR',
          plan: 'Premium'
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Razorpay options
      const options: RazorpayOptions = {
        key: "rzp_live_kpCWRpxOkiH9M7",
        amount: orderData.amount,
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
          address: "Hello World",
          merchant_order_id: "12312321",
        },
        theme: {
          color: "#0331B5",
          image_padding: false
        },
        handler: async function (response: RazorpayResponse) {
          console.log("Payment successful:", response);
          await handlePaymentSuccess(response, 'Premium');
        },
        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
            setLoading(prev => ({ ...prev, premium: false }));
          },
          escape: true,
          backdropclose: false
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Premium payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(prev => ({ ...prev, premium: false }));
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (response: RazorpayResponse, plan: string): Promise<void> => {
    try {
      setLoading(prev => ({ 
        ...prev, 
        [plan.toLowerCase()]: true 
      }));

      // Send to your charge endpoint
      const chargeResponse = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          plan: plan
        }),
      });

      const chargeData = await chargeResponse.json();

      if (chargeResponse.ok && chargeData.success) {
        alert(`✅ ${plan} subscription activated successfully!`);
        window.location.href = '/subscription/success';
      } else {
        throw new Error(chargeData.message || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Payment verification failed:', error);
      alert('❌ Payment verification failed. Please contact support.');
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        [plan.toLowerCase()]: false 
      }));
    }
  };


  return (
    <MasterHome>
      <div>
        {/* Back to Home Button */}
        <div className="flex justify-start py-1 px-4 md:px-6" style={{ marginTop: '30px', color: 'gray' }}>
          <Link href="/" className="back-arrow-btn">
            Back to Home
          </Link>
        </div>

        {/* Main Title Section */}
        <div 
          className="text-center mx-auto card-box" 
          style={{ marginTop: '5vh' }}
        >
          <div className="flex justify-center">
            <h1 
              className="font-bold text-2xl md:text-4xl lg:text-5xl px-4" 
              style={{ color: '#0331b5', textAlign: 'center' }}
            >
              Subscription Plans
              <hr/>
            </h1> 
          </div>
          <div className="flex justify-center mt-4">
            <h4 
              style={{ textAlign: 'center', marginBottom: '50px' }}
              className="font-bold text-base md:text-lg lg:text-xl text-black px-4 max-w-3xl"
            >
              Choose a plan that fits your needs and stay in control of your health - every step of your Health.
            </h4>
          </div>
        </div>

        {/* Cards Container - Responsive Layout */}
        <div className="w-full p-4">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            maxWidth: '1200px',
            margin: '0 auto',
            justifyItems: 'center'
          }}>
            
            {/* Basic Plan */}
            <div style={{ 
              backgroundColor: '#b0dcd4', 
              width: '100%',
              maxWidth: '280px',
              height: '466px',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p className="text-3xl font-bold mb-1" style={{ color: '#0331b5', fontSize: 'xx-large', fontWeight: '500' }}>Basic</p>
              <p className="text-2xl font-bold mb-4" style={{ fontWeight: '600', fontSize: '18px' }}>FREE</p>
              <hr style={{ marginTop: '19px', color: 'black' }} className="border-black mb-4 opacity-100" />
              
              <div className="text-left px-5 space-y-2" style={{ fontSize: '16px', textAlign: 'left', fontWeight: '400', padding: '10px 10px' }}>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Add upto 5 members</span>
                </div>
                <div className="flex items-start">
                  <div>
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Upload files with a total</span>
                    <div className="pl-5" style={{ marginLeft: '24px' }}>Storage of up to 100 MB</div>
                  </div>
                </div>
                <div className="flex items-start line-through text-gray-600">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span style={{ textDecoration: 'line-through' }}>Wellness kit</span>
                </div>
                <div className="flex items-start line-through text-gray-600">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span style={{ textDecoration: 'line-through' }}>Access to blogs</span>
                </div>
                <div className="flex items-start line-through text-gray-600">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span style={{ textDecoration: 'line-through' }}>Membership card</span>
                </div>
              </div>
            </div>

            {/* Standard Plan */}
            <div style={{ 
              backgroundColor: '#fff44c', 
              width: '100%',
              maxWidth: '280px',
              height: '466px',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p className="text-3xl font-bold mb-0" style={{ color: '#0331b5', fontSize: 'xx-large', fontWeight: '500' }}>Standard</p>
              <p className="text-2xl font-bold mb-0" style={{ fontWeight: '600', fontSize: '18px' }}>Rs. 99/year</p>
              <p className="text-lg line-through mb-1" style={{ textDecoration: 'line-through' }}>Rs. 149</p>
              <hr className="border-black mb-4 opacity-100" style={{ color: 'black' }} />
              
              <div className="text-left px-5 space-y-2 mb-4" style={{ fontSize: '16px', textAlign: 'left', fontWeight: '400', padding: '10px 10px' }}>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Add upto 7 members</span>
                </div>
                <div className="flex items-start">
                  <div>
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Upload files with a total</span>
                    <div className="pl-5" style={{ marginLeft: '24px' }}>Storage of up to 300 MB</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Wellness kit</span>
                </div>
                <div className="flex items-start">
                  <div>
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Access to exclusive</span>
                    <div className="pl-5">Article</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Membership card</span>
                </div>
              </div>

              <button
                onClick={handleStandardPayment}
                disabled={loading.standard}
                className="text-white font-medium border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  width: '186px',
                  height: '45px',
                  backgroundColor: loading.standard ? '#666' : '#0331B5',
                  fontSize: '20px',
                  marginTop: '20px',
                  borderRadius: '14px',
                  color: 'white'
                }}
              >
                {loading.standard ? 'Processing...' : 'Go Standard'}
              </button>
            </div>

            {/* Premium Plan */}
            <div style={{ 
              backgroundColor: '#f8ccc4', 
              width: '100%',
              maxWidth: '280px',
              height: '466px',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p className="text-3xl font-bold mb-0" style={{ color: '#0331b5', fontSize: 'xx-large', fontWeight: '500' }}>Premium</p>
              <p className="text-2xl font-bold mb-0" style={{ fontWeight: '600', fontSize: '18px' }}>Rs. 399/year</p>
              <p className="text-lg line-through mb-1" style={{ textDecoration: 'line-through' }}>Rs. 799</p>
              <hr className="border-black mb-4 opacity-100" style={{ color: 'black' }} />
              
              <div className="text-left px-5 space-y-2 mb-4" style={{ fontSize: '16px', textAlign: 'left', fontWeight: '400', padding: '10px 10px' }}>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Add upto 10 members</span>
                </div>
                <div className="flex items-start">
                  <div>
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Upload files with a total</span>
                    <div className="pl-5" style={{ marginLeft: '24px' }}>Storage of up to 1000 MB</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Wellness kit</span>
                </div>
                <div className="flex items-start">
                  <div>
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Access to exclusive</span>
                    <div className="pl-5">Article</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Membership card</span>
                </div>
              </div>

              <button
                onClick={handlePremiumPayment}
                disabled={loading.premium}
                className="text-white font-medium border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  width: '186px',
                  height: '45px',
                  backgroundColor: loading.premium ? '#666' : '#0331B5',
                  fontSize: '20px',
                  marginTop: '20px',
                  borderRadius: '14px',
                  color: 'white'
                }}
              >
                {loading.premium ? 'Processing...' : 'Go Premium'}
              </button>
            </div>

            {/* Advanced Plan */}
            <div style={{ 
              backgroundColor: '#90bcfc', 
              width: '100%',
              maxWidth: '280px',
              height: '466px',
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <p className="text-3xl font-bold mb-2" style={{ color: '#0331b5', fontSize: 'xx-large', fontWeight: '500' }}>Advanced</p>
              <p className="text-2xl font-bold mb-4" style={{ fontWeight: '600', fontSize: '18px', marginTop: '13px' }}>Contact Sales</p>
              <hr className="border-black mb-4 opacity-100" style={{ marginTop: '13px', color: 'black' }} />
              
              <div className="text-left px-5 space-y-2 mb-4" style={{ fontSize: '16px', textAlign: 'left', fontWeight: '400', padding: '10px 10px' }}>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Add unlimited members</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Unlimited storage</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Membership card</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Wellness program</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Personalized solutions</span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="text-white font-medium border-none cursor-pointer hover:opacity-90 transition-opacity"
                style={{
                  width: '186px',
                  height: '45px',
                  backgroundColor: '#0331B5',
                  fontSize: '20px',
                  marginTop: '104px',
                  borderRadius: '14px',
                  color: 'white'
                }}
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
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Your email"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <small className="text-gray-500">No spam, we promise!</small>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Your query*</label>
                  <textarea
                    value={formData.query}
                    onChange={(e) => setFormData({...formData, query: e.target.value})}
                    placeholder="Tell us how we can help"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors border-none">
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @media (max-width: 768px) {
            .cards-container {
              grid-template-columns: 1fr !important;
            }
          }
          
          @media (min-width: 769px) and (max-width: 1024px) {
            .cards-container {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          
          @media (min-width: 1025px) {
            .cards-container {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }
        `}</style>
        
      </div>
    </MasterHome>
  );
};

export default SubscriptionCards;