import { Trash2 } from 'lucide-react';
import { FamilyMemberDelete, GetFmailyData } from '../services/HfilesServiceApi';
import { toast } from 'react-toastify';
import { decryptData } from '../utils/webCrypto';
import { useEffect } from 'react';

interface Props {
    cardNumber: number;
    prescription: {
         id: number;
        memberName: string;
        condition: string;
        otherCondition: string;
        medicine: string;
        dosage: string;
        schedule: string;
        timings: string;
    };
    isSelected: boolean;
    showCheckbox: boolean;
    onEdit: () => void;
    onSelectChange?: (checked: boolean) => void;
}

const PrescriptionCard: React.FC<Props> = ({
    cardNumber,
    prescription,
    isSelected,
    showCheckbox,
    onEdit,
    onSelectChange
}) => {
  const transformedPrescription = {
    member: `${prescription.memberName}`,
    condition: prescription.condition === 'Others' ? prescription.otherCondition : prescription.condition,
    medication: prescription.medicine,
    dosage: prescription.dosage,
    schedule: prescription.schedule.split(',').join(', '),
    timing: prescription.timings,
    id: prescription.id, // ✅ use lowercase "id"
};


    const rows = [
        ['Member', transformedPrescription.member],
        ['Condition', transformedPrescription.condition],
        ['Medication', transformedPrescription.medication],
        ['Dosage', transformedPrescription.dosage],
        ['Schedule', transformedPrescription.schedule],
        ['Timing', transformedPrescription.timing],
        // ['Id', transformedPrescription.id],
    ];

    const handleDelete = async (prescriptionId: number) => {
        try {
            const response = await FamilyMemberDelete(prescriptionId);
            toast.success(`${response.data.message}`);
            ListDataFmaily();
        } catch (error) {
            console.error('Delete failed:', error);
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

    return (
        <div className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex overflow-hidden mb-[2px]">
                <div
                    className="w-24 bg-sky-200 p-3 text-sm font-semibold text-black text-center rounded-tl-2xl border border-black border-r font-poppins-800"
                >
                    Fields
                </div>


                <div className="flex-1 bg-white flex justify-between items-center px-4 rounded-tr-2xl border border-black border-l-0">
                    <h3 className="text-blue-600 font-semibold text-base text-center flex-1">
                        Prescription {cardNumber}
                    </h3>
                    {showCheckbox && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onSelectChange?.(e.target.checked)}
                            className="w-4 h-4 accent-blue-600"
                        />
                    )}
                </div>
            </div>

            {/* Field Rows */}
            {rows.map(([label, value], idx) => (
                <div
                    key={idx}
                    className="flex mb-[2px] rounded border border-black overflow-hidden"
                >
                    <div className="w-24 bg-sky-200 p-3 text-sm font-medium text-black text-center border-r border-black">
                        {label}
                    </div>
                    <div className="flex-1 p-3 text-sm text-center">{value}</div>
                </div>
            ))}

            {/* Action Row */}
            <div className="flex rounded-lg border border-black overflow-hidden">
                <div className="w-24 bg-sky-200 p-3 text-sm font-medium text-black text-center border-r border-black rounded-bl-md">
                    Action
                </div>
                <div className="flex-1 p-3 text-center rounded-br-2xl">
                    <div className="flex justify-center items-center gap-3">
                        <button
                            onClick={onEdit}
                            className={`px-4 py-1 rounded-md text-black text-sm ${isSelected
                                ? 'bg-green-600 border border-black'
                                : 'bg-blue-200 border border-black'
                                } hover:opacity-90 transition-opacity`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(transformedPrescription.id)}
                            className="text-gray-600 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionCard;