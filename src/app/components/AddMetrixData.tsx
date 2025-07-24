import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Dispatch, SetStateAction } from 'react'
import { decryptData } from '../utils/webCrypto';

interface AddMetrixDataProps {
    medicalData: any;
    weightKg: number | string;
    setWeightKg: any;
    heightFeet: number | string;
    setHeightFeet: any;
    heightInches: number | string;
    setHeightInches: any;
    bmi: number | string;
    setIsModified: Dispatch<SetStateAction<boolean>>;
    handleSaveMetrics: () => void;
    isModified: boolean;
    setShowDropdown:any;
    showDropdown:any;
    setSelectedUser:any;
    selectedUser:any;
    memberList:any;
}


const AddMetrixData: React.FC<AddMetrixDataProps> = ({ medicalData, weightKg, setWeightKg, setIsModified, heightFeet, setHeightFeet, heightInches, setHeightInches, bmi, handleSaveMetrics, isModified, showDropdown ,setShowDropdown , setSelectedUser , selectedUser ,memberList }) => {

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
     const handleSelect = async (value: string) => {
    setSelectedUser(value);
    setShowDropdown(false); // close dropdown after selection
    const resolvedUserId = value === "all" ? await getUserId() : parseInt(value, 10);
  console.log("Selected Member ID:", resolvedUserId);
  };

  // BMI Visualization Logic
  const getBMIIndicatorPosition = () => {
    const bmiValue = typeof bmi === 'string' ? parseFloat(bmi) : bmi;
    if (isNaN(bmiValue) || bmiValue <= 0) return 0;
    
    if (bmiValue <= 18.5) {
      return (bmiValue / 18.5) * 25;
    } else if (bmiValue <= 25) {
      return 25 + ((bmiValue - 18.5) / (25 - 18.5)) * 25;
    } else if (bmiValue <= 30) {
      return 50 + ((bmiValue - 25) / (30 - 25)) * 25;
    } else {
      return 75 + Math.min(((bmiValue - 30) / 10) * 25, 25);
    }
  };

    return (
        <div className="relative flex flex-col items-center text-center w-full lg:w-1/3 xl:w-1/4 2xl:w-1/3 bg-blue-50 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md">
            <div className="absolute top-0 right-0 bg-white text-xs px-2 sm:px-3 py-1 rounded-bl-lg font-semibold shadow">
                {medicalData?.hfId}
            </div>

            <img
                src={medicalData?.profilePhoto}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-full object-cover border-4 border-white shadow-md"
            />

            <div className="relative inline-block text-left">
      {/* Header and toggle icon */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-1 text-blue-800 flex items-center">
        {medicalData?.fullName}
        <FontAwesomeIcon
          icon={faChevronDown}
          className="text-black text-sm ml-2 cursor-pointer"
          onClick={() => setShowDropdown((prev:any) => !prev)}
        />
      </h2>

      {/* Custom dropdown list */}
      {showDropdown && (
        <div className="absolute z-10 mt-2 w-44 bg-white border border-gray-300 rounded-lg shadow-md">
          <div
            onClick={() => handleSelect("all")}
            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
              selectedUser === "all" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            All Users
          </div>
          {memberList?.map((member:any) => (
            <div
              key={member.id}
              onClick={() => handleSelect(member.id.toString())}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                selectedUser === member.id.toString() ? "bg-gray-100 font-medium" : ""
              }`}
            >
              {member.firstName}
            </div>
          ))}
        </div>
      )}
    </div>

            <div className="mt-2 sm:mt-2 text-xs sm:text-sm text-left w-full px-2 sm:px-4 space-y-3 sm:space-y-4">

                {/* Blood Group */}
                <div className="flex items-center justify-between">
                    <span className="font-medium">Blood Group :</span>
                    <input
                        type="text"
                        value={medicalData?.bloodGroup || ''}
                        readOnly
                        className="border border-gray-300 px-2 sm:px-3 py-1 rounded w-16 sm:w-20 text-center bg-white text-xs sm:text-sm"
                    />
                </div>

                {/* Weight */}
                <div className="flex items-center justify-between">
                    <span className="font-medium">Weight :</span>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <input
                            type="number"
                            value={weightKg}
                            onChange={(e) => {
                                setWeightKg(Number(e.target.value));
                                setIsModified(true);
                            }}
                            className="border border-gray-300 px-2 sm:px-3 py-1 rounded w-16 sm:w-20 text-center bg-white text-xs sm:text-sm"
                        />
                        <span className="text-xs sm:text-sm">Kg</span>
                    </div>
                </div>

                {/* Height */}
                <div className="flex items-center justify-between">
                    <span className="font-medium">Height :</span>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <input
                            type="number"
                            value={heightFeet}
                            onChange={(e) => {
                                setHeightFeet(Number(e.target.value));
                                setIsModified(true);
                            }}
                            className="border border-gray-300 px-2 sm:px-3 py-1 rounded w-12 sm:w-16 text-center bg-white text-xs sm:text-sm"
                        />
                        <span className="text-xs sm:text-sm">Feet</span>

                        <input
                            type="number"
                            value={heightInches}
                            onChange={(e) => {
                                setHeightInches(Number(e.target.value));
                                setIsModified(true);
                            }}
                            className="border border-gray-300 px-2 sm:px-3 py-1 rounded w-12 sm:w-16 text-center bg-white text-xs sm:text-sm"
                        />
                        <span className="text-xs sm:text-sm">inch</span>
                    </div>
                </div>

                {/* BMI */}
                <div className="flex items-center justify-between">
                    <span className="font-medium">Bmi :</span>
                    <input
                        type="text"
                        value={bmi}
                        readOnly
                        className="border border-gray-300 px-2 sm:px-3 py-1 rounded w-16 sm:w-20 text-center bg-white text-xs sm:text-sm"
                    />
                </div>

                {/* BMI VISUALIZATION - INLINE */}
                <div className="w-full mt-3">
                  {/* BMI Value Display */}
                  <div className="flex justify-between items-center mb-2">
                    
                    <div className="flex items-center">
                     
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                        <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* BMI Scale Numbers */}
                  <div className="flex justify-between text-xs text-gray-600 mb-1 font-montserrat">
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                  </div>

                  {/* BMI Color Bar */}
                  <div className="relative h-3 rounded-full overflow-hidden mb-2">
                    <div className="absolute h-full bg-blue-500" style={{ left: '0%', width: '25%' }} />
                    <div className="absolute h-full bg-green-500" style={{ left: '25%', width: '25%' }} />
                    <div className="absolute h-full bg-orange-500" style={{ left: '50%', width: '25%' }} />
                    <div className="absolute h-full bg-red-500" style={{ left: '75%', width: '25%' }} />
                    
                    {/* BMI Indicator */}
                    <div
                      className="absolute top-0 w-1 h-full bg-white border border-gray-300 shadow-sm transform -translate-x-1/2"
                      style={{ left: `${getBMIIndicatorPosition()}%` }}
                    />
                  </div>

                  {/* Category Labels */}
                  <div className="flex justify-between text-xs text-gray-600 font-montserrat">
                    <span>Low</span>
                    <span>Standard</span>
                    <span>High</span>
                    <span>Too high</span>
                  </div>
                </div>

                {/* Save Button */}
                {isModified && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveMetrics}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded shadow"
                        >
                            Save Metrics
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AddMetrixData
