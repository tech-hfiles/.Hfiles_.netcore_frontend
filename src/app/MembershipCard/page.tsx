'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import MasterHome from '../components/MasterHome';
import { FaLessThan } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { MemberList } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';

interface UserData {
  user_id?: number;
  user_firstname: string;
  user_image: string;
  blood_group: string;
  emergency_contact: string;
  membership_id: string;
  expiry: string;
  relation?: string;
}

interface ApiMemberData {
  id: number;
  firstName: string;
  lastName: string;
  relation: string;
  email: string;
  phoneNumber: string;
  hfId: string;
  profileURL: string;
}

interface MembershipCardDisplayProps {
  user: UserData;
  isMyCard?: boolean;
  customerService: string;
}

const MembershipCardDisplay: React.FC<MembershipCardDisplayProps> = ({
  user,
  isMyCard = false,
  customerService
}) => {
  return (
    <div className="w-full px-2 sm:px-4">
      <div className="relative overflow-hidden text-center max-w-7xl mx-auto my-2 sm:my-4">
        <div
          className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 xl:h-72 p-2 sm:p-3 md:p-4 lg:p-5"
          style={{
            backgroundImage: `url('${'/membershipcard/member.png'}')`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Main Content Container */}
          <div className="flex h-full">
            {/* Left Spacer */}
            <div className="flex-1"></div>

            {/* Main Content */}
            <div className="flex-[2.5] p-1 sm:p-2 md:p-3">
              <div className="h-full flex flex-col justify-start text-left space-y-1 sm:space-y-2 mx-5">

                {/* Membership ID */}
                <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-14">
                  <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-black">
                    {user.membership_id}
                  </h3>
                </div>

                {/* Name */}
                <div className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-medium text-black">
                  {user.user_firstname}
                </div>

                {/* Relation (for family members) */}
                {!isMyCard && user.relation && (
                  <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600">
                    Relation: {user.relation}
                  </div>
                )}

                {/* Blood Group and Expiry */}
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-1 sm:mt-2">
                  {/* Blood Group */}
                  <div className="flex items-center text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                    <span className="text-gray-700">Blood Group:</span>
                    <span className="ml-1 font-semibold text-black">{user.blood_group || NaN}</span>
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
                    <span className="text-gray-700">Expiry:</span>
                    <span className="ml-1 font-semibold text-black">{user.expiry || NaN}</span>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="flex items-center text-[8px] sm:text-[10px] md:text-xs lg:text-sm mt-1">
                  <span className="text-gray-700">Contact:</span>
                  <span className="ml-1 font-bold text-black">{user.emergency_contact}</span>
                </div>

                {/* Customer Service */}
                <div className="absolute bottom-1 sm:bottom-2 md:bottom-3 lg:bottom-4 right-2 sm:right-3 md:right-4 lg:right-6">
                  <div className="text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-gray-600 text-right">
                    <span className="whitespace-nowrap">Customer service: {customerService}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MembershipCard: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<number | string | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [myCard, setMyCard] = useState<UserData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserData[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const customerService = '+91 9978043453'; // You can make this dynamic if needed

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
  // Function to get data from localStorage
  const getLocalStorageData = () => {
    try {
      // Get data directly from localStorage
      const userName = localStorage.getItem("userName");
      const phone = localStorage.getItem("phone");
      const hfid = localStorage.getItem("hfid");

      // If any required data is missing, return null
      if (!userName || !phone || !hfid) {
        console.log("Missing localStorage data");
        return null;
      }

      return {
        userName,
        phone,
        hfid
      };
    } catch (error) {
      console.error("Error getting localStorage data:", error);
      return null;
    }
  };

  // Function to map localStorage data to UserData structure
  const mapLocalStorageToUserData = (localData: { userName: string; phone: string; hfid: string }, userId: number): UserData => {
    return {
      user_id: userId,
      user_firstname: localData.userName,
      user_image: '/membershipcard/member.png', // Default image
      blood_group: '', // Can be added to localStorage if needed
      emergency_contact: localData.phone,
      membership_id: localData.hfid,
      expiry: '', // Can be added to localStorage if needed
      relation: undefined // Not applicable for my card
    };
  };

  // Function to map API data to component data structure
  const mapApiDataToUserData = (apiMember: ApiMemberData): UserData => {
    return {
      user_id: apiMember.id,
      user_firstname: `${apiMember.firstName} ${apiMember.lastName}`,
      user_image: apiMember.profileURL === "Profile Photo Not Available"
        ? '/membershipcard/member.png' // Default image
        : apiMember.profileURL,
      blood_group: '', // Not available in API, you might want to add this field
      emergency_contact: apiMember.phoneNumber,
      membership_id: apiMember.hfId,
      expiry: '', // Not available in API, you might want to add this field
      relation: apiMember.relation
    };
  };

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      setError('');

      const currentUserId = await getUserId();
      if (!currentUserId) {
        setError('User ID not found');
        return;
      }

      // Get my card data from localStorage
      const localData = getLocalStorageData();
      if (localData) {
        const myCardData = mapLocalStorageToUserData(localData, currentUserId);
        setMyCard(myCardData);
      } else {
        setError('User data not found in localStorage');
        return;
      }

      // Fetch family members from API (if needed)
      try {
        const response = await MemberList(currentUserId);
        const data = response?.data?.data;

        console.log('API Response:', data);

        if (data) {
          // Map all members (both independent and dependent) except the current user
          const allOtherMembers = [
            ...(data.independentMembers || []).filter((member: ApiMemberData) => member.id !== currentUserId),
            ...(data.dependentMembers || [])
          ];

          const mappedFamilyMembers = allOtherMembers.map(mapApiDataToUserData);
          setFamilyMembers(mappedFamilyMembers);
        }
      } catch (apiError) {
        console.warn('API call failed, but user data loaded from localStorage:', apiError);
        // Don't set error here since we have my card data from localStorage
        setFamilyMembers([]); // Just set empty family members
      }

    } catch (error) {
      console.error('Error fetching membership data:', error);
      setError('Error loading membership data');
    } finally {
      setLoading(false);
    }
  };

  const handleCardToggle = (cardId: number | string): void => {
    if (!isDesktop) {
      setExpandedCard(expandedCard === cardId ? null : cardId);
    }
  };

  const handleBackClick = () => {
    router.push('/dashboard');
  };

  useEffect(() => {
    const handleResize = (): void => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    fetchMembershipData();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDesktop]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading membership cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMembershipData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <MasterHome>
      <div className="h-screen bg-gray-50">
        <div className="relative overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <button
              className="flex items-center text-black font-bold hover:text-gray-700 transition-colors duration-200 text-sm sm:text-base"
              onClick={handleBackClick}
            >
              <FaLessThan className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>

          {/* Title Section */}
          <div className="text-center mx-auto mt-2 pb-16 sm:pb-20">
            <div className="flex flex-col gap-2 sm:gap-4 mx-3 sm:mx-5 rounded-3xl p-2 sm:p-4 lg:p-8 justify-center">
              <h1 className="font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-blue-700">
                Membership Card
              </h1>
              <div className="w-32 sm:w-40 md:w-48 border-b-2 border-blue-700 mx-auto mb-2 sm:mb-4" />
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 px-2 sm:px-4">
                Easily view your membership card and your family's—all in one place, right here.
              </p>
            </div>

            <hr className="border-t-2 border-gray-800 w-[90%] mx-auto mb-6 sm:mb-8" />

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-5 md:px-8 lg:px-12 w-full mx-auto">

              {/* My Card */}
              {myCard && (
                <div className="flex flex-col py-2">
                  <div
                    className="flex items-center justify-between cursor-pointer md:cursor-default p-3 sm:p-5 md:p-6 w-full hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => handleCardToggle('mycard')}
                  >
                    <span className="text-lg sm:text-xl font-semibold text-black md:text-center md:w-full">
                      My Card
                    </span>
                    <div className="md:hidden">
                      {expandedCard === 'mycard' ?
                        <ChevronUp className="w-5 h-5" /> :
                        <ChevronDown className="w-5 h-5" />
                      }
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 md:p-6 w-[95%] md:w-full mx-auto 
  bg-transparent sm:bg-white 
  rounded-none sm:rounded-3xl 
  shadow-none sm:shadow-lg">
                    <div className="h-px bg-black w-full mb-3 mt-1"></div>
                    <div className={`transition-all duration-300 ease-in-out ${(expandedCard === 'mycard' || isDesktop) ? 'block opacity-100' : 'hidden opacity-0'
                      } md:block md:opacity-100`}>
                      <MembershipCardDisplay
                        user={myCard}
                        isMyCard={true}
                        customerService={customerService}
                      />
                    </div>
                  </div>

                  {/* <div className="text-right mt-3 sm:mt-4 px-2">
                    <a
                      href="#"
                      className="text-blue-600 underline text-xs sm:text-sm hover:text-blue-800 transition-colors duration-200"
                    >
                      View ABHA card here
                    </a>
                  </div> */}
                </div>
              )}

              {/* Family Member Cards */}
              {familyMembers.map((user: UserData) => (
                <div key={user.user_id} className="flex flex-col py-2">
                  <div
                    className="flex items-center justify-between cursor-pointer md:cursor-default p-3 sm:p-5 md:p-6 w-full hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    onClick={() => user.user_id !== undefined && handleCardToggle(user.user_id)}
                  >
                    <span className="text-lg sm:text-xl font-semibold text-black md:text-center md:w-full">
                      {user.user_firstname.split(' ')[0]}'s Card
                    </span>
                    <div className="md:hidden">
                      {expandedCard === user.user_id ?
                        <ChevronUp className="w-5 h-5" /> :
                        <ChevronDown className="w-5 h-5" />
                      }
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 md:p-6 w-[95%] md:w-full mx-auto 
  bg-transparent sm:bg-white 
  rounded-none sm:rounded-3xl 
  shadow-none sm:shadow-lg">                    <div className="h-px bg-black w-full mb-3 mt-1"></div>
                    <div className={`transition-all duration-300 ease-in-out ${(expandedCard === user.user_id || isDesktop) ? 'block opacity-100' : 'hidden opacity-0'
                      } md:block md:opacity-100`}>
                      <MembershipCardDisplay
                        user={user}
                        customerService={customerService}
                      />
                    </div>
                  </div>

                  {/* <div className="text-right mt-3 sm:mt-4 px-2">
                    <a
                      href="#"
                      className="text-blue-600 underline text-xs sm:text-sm hover:text-blue-800 transition-colors duration-200"
                    >
                      View ABHA card here
                    </a>
                  </div> */}
                </div>
              ))}
            </div>

            {/* Show message if no data */}
            {!myCard && familyMembers.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-600">No membership cards found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MasterHome>
  );
};

export default MembershipCard;