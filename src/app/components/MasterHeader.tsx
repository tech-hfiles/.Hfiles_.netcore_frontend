'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { decryptData } from '../utils/webCrypto';
import { BasicDetailsList, ListHFID, PlaneShift } from '../services/HfilesServiceApi';
import { toast } from 'react-toastify';
import { log } from 'console';

const MasterHeader = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAccountSubmenuOpen, setIsAccountSubmenuOpen] = useState(false);
  const [hfid, setHfid] = useState<any>();
  const [planeDetails, setPlaneDetails] = useState() as any;
  const [userInfo, setUserInfo] = useState(() => {
    const storedUserName = localStorage.getItem('userName') || '';
    return {
      name: storedUserName,
      hfId: '',
      profileImage: '/images/default-profile.png',
      subscriptionType: 'basic' // Default to basic instead of premium
    };
  });

  const [profilee ,setProfile] = useState() as any;

 const getUserId = async (): Promise<number> => {
    try {
        const encryptedUserId = localStorage.getItem("userId");
        if (!encryptedUserId) return 0;

        const userIdStr = await decryptData(encryptedUserId); // decrypted string: "123"
        return parseInt(userIdStr, 10); // converts to number 123
    } catch (error) {
        console.error("Error getting userId:", error);
        return 0;
    }
};

  const HfidList = async () => {
    try {
      const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error("Please log in to view members.");
        return;
      }
      const response = await ListHFID(currentUserId);

      const fetchedHfid = response.data?.data;
      setHfid(fetchedHfid);

      setUserInfo((prev) => ({
        ...prev,
        hfId: fetchedHfid,
      }));
    } catch (error) {
      console.error("Error fetching HFID:", error);
    }
  };

  useEffect(() => {
    HfidList();
  }, []);

  const Plane = async () => {
    try {
      const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error("Please log in to view members.");
        return;
      }
      const response = await PlaneShift(currentUserId);
      const planeData = response.data.data;
      setPlaneDetails(planeData);

      // Update userInfo with subscription type from API
      if (planeData && planeData.subscriptionPlan) {
      const subscriptionPlan = planeData.subscriptionPlan;
         localStorage.setItem('subscriptionPlan', subscriptionPlan);

        setUserInfo((prev) => ({
          ...prev,
          subscriptionType: planeData.subscriptionPlan.toLowerCase() // Convert to lowercase to match getSubscriptionRingClass cases
        }));
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    Plane();
  }, [])

  const navigateTo = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (!event.target.closest('.profile') && !event.target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
        setIsAccountSubmenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sub');
    localStorage.removeItem('userId');
    localStorage.removeItem('isPhoneVerified');
    localStorage.removeItem('isEmailVerified');
    localStorage.removeItem('userName');
    localStorage.removeItem('rzp_checkout_anon_id');
    localStorage.removeItem('rzp_device_id');
    localStorage.removeItem('rzp_stored_checkout_id');
     localStorage.removeItem('subscriptionPlan');
    router.push('/login');
  };

  const getSubscriptionRingClass = (type: any) => {
    switch (type) {
      case 'basic': return 'ring-4 ring-[#b0dcd4]';
      case 'standard': return 'ring-4 ring-[#fff44c]';
      case 'premium': return 'ring-4 ring-[#f8ccc4]';
      default: return 'ring-4 ring-[#b0dcd4]';
    }
  };


  const ProfileDetailsList = async () => {
      try {
      
        const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error("Please log in to view members.");
        return;
      }
        const response = await BasicDetailsList(currentUserId);
        const data = response?.data?.data;
        if (data.profileURL) {
          setProfile(data.profileURL);
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
      }
    };
  
    useEffect(() => {
      ProfileDetailsList();
    }, []);

  return (
    <div className="bg-[#0331B5] px-5 py-4 flex justify-between items-center w-full sticky top-0 z-[1000] font-['Poppins',sans-serif] shadow-md">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          className="block"
        >
          <img
            // src="https://hfiles.in/wp-content/uploads/2022/11/hfiles.png"
          src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
            alt="HFiles Logo"
            className="w-32 h-[53px]"
          />
        </a>
      </div>

      {/* Profile Section */}
      <div className="flex items-center">
        <div
          className="profile relative flex justify-end items-center gap-3 cursor-pointer text-right text-white"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        >
          <div className="text-right">
            <span className="font-['Red_Hat_Display',sans-serif] font-semibold text-white">
              {userInfo.name}
            </span>
          </div>
          <div className={`relative w-12 h-12 rounded-full p-[3px] transition-all duration-300 ${getSubscriptionRingClass(userInfo.subscriptionType)}`}>
            <img
              src={profilee}
              alt="User Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Profile Dropdown Menu */}
        <div className={`profile-menu absolute top-[calc(100%+8px)] right-0 w-[250px] min-h-[100px] bg-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] rounded-lg z-[1001] transition-all duration-300 ${isProfileMenuOpen
          ? 'opacity-100 translate-y-0 visible'
          : 'opacity-0 -translate-y-2.5 invisible'
          } md:right-0 md:w-[250px] sm:right-2.5 sm:w-[220px] max-sm:w-[200px]`}>
          <ul className="p-0 m-0 list-none">
            {/* Profile HF ID */}
            <li className="flex flex-col items-center p-4 border-b-2 border-[#0331B5] bg-gray-50">
              <a className="flex flex-col items-center gap-1.5 border-b-0 p-0">
                <i className="fa fa-id-badge text-[#0331B5] text-xl w-5"></i>
                <span className="text-[#0331B5] font-semibold font-['Red_Hat_Display',sans-serif]">
                  {userInfo.hfId}
                </span>
              </a>
            </li>

            {/* My Account with Submenu */}
            <li className="relative">
              <a
                onClick={() => setIsAccountSubmenuOpen(!isAccountSubmenuOpen)}
                className="text-[#0331B5] p-4 flex items-center gap-2.5 text-base border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <i className="fa fa-user-circle text-xl w-5"></i>
                My Account
              </a>
              <ul className={`${isAccountSubmenuOpen ? 'block' : 'hidden'} pl-6 bg-gray-50`}>
                <li className="hover:bg-gray-200 transition-colors">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/addbasicdetails');
                    }}
                    className="text-[#0331B5] p-2.5 flex items-center gap-2.5 text-sm border-b border-gray-200 cursor-pointer"
                  >
                    <i className="fa fa-circle-info text-lg w-5"></i>
                    My Profile
                  </a>
                </li>
                <li className="hover:bg-gray-200 transition-colors">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/MembershipCard');
                    }}
                    className="text-[#0331B5] p-2.5 flex items-center gap-2.5 text-sm border-b border-gray-200 cursor-pointer"
                  >
                    <i className="fa fa-id-card text-lg w-5"></i>
                    Membership Card
                  </a>
                </li>
                <li className="hover:bg-gray-200 transition-colors">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/SubscriptionPlan');
                    }}
                    className="text-[#0331B5] p-2.5 flex items-center gap-2.5 text-sm border-b border-gray-200 cursor-pointer"
                  >
                    <i className="fa fa-credit-card text-lg w-5"></i>
                    Subscription Plans
                  </a>
                </li>
                <li className="hover:bg-gray-200 transition-colors">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigateTo('/wellness-kit'); }}
                    className="text-[#0331B5] p-2.5 flex items-center gap-2.5 text-sm border-b border-gray-200 cursor-pointer"
                  >
                    <i className="fa fa-heart-o text-lg w-5"></i>
                    Wellness Kit
                  </a>
                </li>
                <li className="hover:bg-gray-200 transition-colors">
                  <a
                    href="#"
                     onClick={(e) => {
                      e.preventDefault();
                      router.push('/feedBackForm');
                    }}
                    className="text-[#0331B5] p-2.5 flex items-center gap-2.5 text-sm border-b border-gray-200 cursor-pointer"
                  >
                    <i className="fa fa-comments-o text-lg w-5"></i>
                    Feedback Form
                  </a>
                </li>
              </ul>
            </li>

            {/* My Members */}
            <li className="hover:bg-gray-50 transition-colors">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/myMembers');
                }}
                className="text-[#0331B5] p-4 flex items-center gap-2.5 text-base border-b border-gray-200 cursor-pointer"
              >
                <i className="fa fa-user text-xl w-5"></i>
                My Members
                <span className="bg-[#ffd101] text-[#0331B5] px-2 py-0.5 rounded-full text-xs font-semibold ml-1.5">
                  2
                </span>
              </a>
            </li>

            {/* Sign Out */}
            <li>
              <button
                onClick={handleLogout}
                className="bg-none border-none text-gray-500 flex items-center gap-2.5 p-4 w-full text-left cursor-pointer text-base hover:bg-gray-50 transition-colors"
              >
                <i className="fa fa-right-from-bracket text-xl w-5"></i>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MasterHeader;