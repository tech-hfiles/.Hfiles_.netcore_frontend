import { faCheck, faPlus, faShareAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaLessThan } from 'react-icons/fa';
import { FamilyMemberDelete, GetFmailyData } from '../services/HfilesServiceApi';
import { toast } from 'react-toastify';
import { decryptData } from '../utils/webCrypto';

interface Prescription {
    id?: number;
    prescriptionId?: number;
    memberName: string;
    condition: string;
    otherCondition: string;
    medicine: string;
    dosage: string;
    schedule: string;
    timings: string;
}

interface PrescriptionTableProps {
    prescriptions: Prescription[];
    showCheckbox: boolean;
    selectedIndexes?: number[];
    onEdit?: (index: number) => void;
    onSelectChange?: (index: number, checked: boolean) => void;
    userlist?: any;
    handleBack?: any;
    setShowCheckbox?: any;
    handleChange?: any;
    handleAdd?: () => void;
    selectedReports?: Set<number>;
    handleSendReports?: () => void;
    isSharing?: boolean;
}

const PrescriptionTable: React.FC<PrescriptionTableProps> = ({
    prescriptions,
    onEdit,
    userlist,
    handleBack,
    handleChange,
    setShowCheckbox,
    showCheckbox,
    handleAdd,
    selectedReports = new Set(),
    handleSendReports,
    isSharing = false,
    onSelectChange
}) => {

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([0, 2]);

    const handleSelectChange = (index: number, checked: boolean) => {
        // Update local state for backward compatibility
        if (checked) {
            setSelectedIndexes([...selectedIndexes, index]);
        } else {
            setSelectedIndexes(selectedIndexes.filter(i => i !== index));
        }

        // Call parent's selection handler if provided
        if (onSelectChange) {
            onSelectChange(index, checked);
        }
    };

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

    const ListDataFmaily = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to view members.");
                return;
            }
            const response = await GetFmailyData(currentUserId)
        } catch (error) {
            console.log(error)
            toast.error("Failed to load prescription data.");
        }
    }

    useEffect(() => {
        ListDataFmaily();
    }, [])

    const handleDelete = async (prescriptionId: number) => {
        try {
            const response = await FamilyMemberDelete(prescriptionId);
            toast.success(`${response.data.message}`);
            ListDataFmaily();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleShareToggle = () => {
        if (setShowCheckbox) {
            setShowCheckbox(!showCheckbox);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mt-6 mb-6 relative mx-3">
                {/* Left: Back */}
                <div className="flex items-center">
                    <button
                        onClick={handleBack}
                        className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                    >
                        <FaLessThan className="w-4 h-4 mr-2" />
                        <span className="text-xs sm:text-lg font-bold text-black  hidden sm:inline">Back</span>
                    </button>
                </div>

                {/* Center: Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 absolute left-1/2 transform -translate-x-1/2">
                    Family prescription
                </h2>
            </div>

            {/* Decorative Border */}
            <div className="border-4 border-gray-200 rounded-full mt-2 mb-6 sm:mt-4 sm:mb-8"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                {/* Left: Buttons */}
                <div className="flex flex-wrap gap-3 mx-4">
                    
                    {/* Share Button */}
                    <button
                        onClick={handleShareToggle}
                        className="flex items-center gap-2 border border-black cursor-pointer text-sm font-medium text-black px-4 py-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <FontAwesomeIcon icon={faShareAlt} />
                        Share
                    </button>

                    {/* Add Button */}
                    <button
                        className="flex items-center gap-2 border cursor-pointer border-black text-sm font-medium text-black px-4 py-2 rounded-full hover:bg-gray-100 transition"
                        onClick={handleAdd}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Add
                    </button>

                    {/* Access Button */}
                    <button className="flex items-center gap-2 border border-black text-sm font-medium text-black px-4 py-2 rounded-full hover:bg-gray-100 transition">
                        <FontAwesomeIcon icon={faCheck} />
                        Access
                    </button>
                </div>

                {/* Right: Select Dropdown */}
                <div className="mx-3">
                    <select
                        name="userlist"
                        value={userlist}
                        onChange={handleChange}
                        className="px-3 py-2 border border-black rounded-lg focus:outline-none bg-white"
                        required
                    >
                        <option value="" disabled>Select a user</option>
                        <option value="Ankit">Ankit</option>
                        <option value="Rahul">Rahul</option>
                        <option value="Priya">Priya</option>
                    </select>
                </div>
            </div>

            {/* Send Button - Show only when checkboxes are visible and items are selected */}
            {showCheckbox && selectedReports.size > 0 && handleSendReports && (
                <div className="mx-4 mb-6">
                    <button
                        onClick={handleSendReports}
                        disabled={isSharing}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-3"
                    >
                        {isSharing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Creating Share Link...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faShareAlt} />
                                Send {selectedReports.size} Prescription(s)
                            </>
                        )}
                    </button>
                </div>
            )}

           <div className="overflow-x-auto">
  {prescriptions && prescriptions.length > 0 ? (
    <table className="w-full border-separate text-sm text-center">
      <thead>
        <tr>
          {showCheckbox && (
            <th className="p-2 border border-black rounded-l-lg bg-cyan-300 font-semibold text-black">
              Select
            </th>
          )}
          <th className="p-2 border border-black bg-cyan-300 font-semibold text-black">Member</th>
          <th className="p-2 border border-black bg-cyan-300 font-semibold text-black">Condition</th>
          <th className="p-2 border border-black bg-cyan-300 font-semibold text-black">Medication</th>
          <th className="p-2 border border-black bg-cyan-300 font-semibold text-black">Dosage</th>
          <th className="p-2 border border-black bg-cyan-300 font-semibold text-black">Schedule</th>
          <th className="p-2 border border-black bg-cyan-300 font-semibold text-black">Timing</th>
          <th className="p-2 border border-black rounded-r-lg bg-cyan-300 font-semibold text-black">Action</th>
        </tr>
      </thead>

      <tbody>
        {prescriptions.map((item: any, index) => {
          const isSelected = selectedIndexes.includes(index);
          return (
            <tr
              key={index}
              className={`border border-black group ${isSelected ? 'bg-blue-100' : 'bg-white'} hover:bg-blue-50 transition`}
            >
              {showCheckbox && (
                <td className="p-3 border border-black">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectChange(index, e.target.checked)}
                    className="w-5 h-5 accent-black"
                  />
                </td>
              )}
              <td className="p-3 border border-black">{item.memberName}</td>
              <td className="p-3 border border-black">
                {item.condition}
                {item.otherCondition ? `, ${item.otherCondition}` : ''}
              </td>
              <td className="p-3 border border-black">{item.medicine}</td>
              <td className="p-3 border border-black">{item.dosage}</td>
              <td className="p-3 border border-black">{item.schedule}</td>
              <td className="p-3 border border-black whitespace-pre-line">{item.timings}</td>
              <td className="p-3 border border-black whitespace-pre-line flex items-center justify-center gap-2">
                <button
                  className={`px-4 py-1 rounded text-black ${
                    isSelected ? 'bg-green-700 border border-black text-white' : 'bg-sky-200 border border-black'
                  }`}
                  onClick={() => onEdit?.(index)}
                >
                  Edit
                </button>

                <button
                  className="text-black hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(item.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
   <div className="w-full flex flex-col justify-center items-center py-12">
  <img
    src="/9d3b1e529ff482abe61dba009ba6478444538807.png"
    alt="No data found"
    className="w-68 h-68 object-contain mb-4"
  />
  <p className="text-black text-sm">No Data Found</p>
</div>

  )}
</div>

        </div>
    );
};

export default PrescriptionTable;