'use client';
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlus, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import MasterHome from '../components/MasterHome';
import PrescriptionTable from '../components/PrescriptionTable';
import PrescriptionCard from '../components/PrescriptionCard';
import { useRouter } from 'next/navigation';
import PrescriptionModal from '../components/PrescriptionModal';
import { GetFmailyData,  FamilyMemberAdded, FamilyMemberEdit, FamilyShare } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import { toast, ToastContainer } from 'react-toastify';

interface PrescriptionData {
    condition: string;
    member: string;
    customCondition: string;
    medications: {
        medication: string;
        dosage: string;
        schedule: string[];
        timings: string[];
    }[];
}

interface Prescription {
    id?: number; // Add id field for prescription identification
    prescriptionId?: number; // Alternative id field name
    memberId: string;
    condition: string;
    otherCondition: string;
    medicine: string;
    dosage: string;
    schedule: string;
    timings: string;
}

// API Payload interface
interface ApiPayload {
    userId: number;
    memberId: number;
    condition: string;
    otherCondition: string;
    createdEpoch: number;
    medicines: {
        medicine: string;
        dosage: string;
        schedule: string;
        timings: string;
    }[];
}

interface ShareData {
    shareUrl: string;
    expiryDate: string;
    expiryTime: string;
}

const FamilyPrescriptionPage = () => {
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [userlist, setUserlist] = useState('');
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([0, 2]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prescriptions, setPrescriptions] = useState() as any;
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Share functionality state
    const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState<ShareData | null>(null);
    const [isSharing, setIsSharing] = useState(false);

     const storedUserName = typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '';

    useEffect(() => {
        console.log('Modal state changed:', isModalOpen);
    }, [isModalOpen]);

    // Function to transform modal data to API payload
    const transformToApiPayload = async (data: PrescriptionData): Promise<ApiPayload> => {
        const currentUserId = await getUserId();

        // Transform medications array
        const medicines = data.medications.map(med => ({
            medicine: med.medication,
            dosage: med.dosage,
            schedule: med.schedule.join(','), // Convert array to comma-separated string
            timings: med.timings.join(',')    // Convert array to comma-separated string
        }));

        return {
            userId: currentUserId,
            memberId: parseInt(data.member) || 0, // Assuming member is stored as string ID
            condition: data.condition,
            otherCondition: data.customCondition || "",
            createdEpoch: Math.floor(Date.now() / 1000), // Current timestamp in seconds
            medicines: medicines
        };
    };

    const handleSave = async (data: PrescriptionData) => {
        try {

            // Log medication details
            data.medications.forEach((med, index) => {
                console.log(`Medication ${index + 1}:`, {
                    name: med.medication,
                    dosage: med.dosage,
                    schedule: med.schedule,
                    timings: med.timings
                });
            });

            if (isEditMode && editingPrescription) {
                // Handle edit mode

                // Transform data to API payload format
                const apiPayload = await transformToApiPayload(data);
                console.log('Edit API Payload:', apiPayload);

                // Get prescription ID - check for different possible field names
                const prescriptionId = editingPrescription.id ||
                    editingPrescription.prescriptionId ||
                    editingPrescription.memberId;

                if (!prescriptionId) {
                    toast.error("Prescription ID not found. Cannot update prescription.");
                    return;
                }

                // Make API call for edit
                const response = await FamilyMemberEdit(
                    parseInt(prescriptionId.toString()),
                    apiPayload
                );
                toast.success(`${response.data.message}`)


            } else {
                // Handle add mode

                // Transform data to API payload format
                const apiPayload = await transformToApiPayload(data);

                // Make API call for add
                const response = await FamilyMemberAdded(apiPayload);

                if (response.data) {
                    toast.success(response.data.message);

                    // Refresh the prescription list
                    await ListDataFmaily();
                } else {
                }
            }

            // Close modal and reset state
            setIsModalOpen(false);
            setEditingPrescription(null);
            setIsEditMode(false);

        } catch (error) {
            console.error("Error saving prescription:", error);
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
            setPrescriptions(response.data.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        ListDataFmaily();
    }, [])

    const handleChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setUserlist(e.target.value);
    };

    const handleBack = () => {
        router.push('/medicalHistory')
    };

    const handleSelectChange = (index: number, checked: boolean) => {
        // Update selectedIndexes for backward compatibility
        if (checked) {
            setSelectedIndexes([...selectedIndexes, index]);
        } else {
            setSelectedIndexes(selectedIndexes.filter(i => i !== index));
        }

        // Update selectedReports for sharing functionality
        const newSelectedReports = new Set(selectedReports);
        if (checked) {
            // Use the prescription ID if available, otherwise use index
            const prescriptionId = prescriptions[index]?.id || 
                                 prescriptions[index]?.prescriptionId || 
                                 index;
            newSelectedReports.add(prescriptionId);
        } else {
            const prescriptionId = prescriptions[index]?.id || 
                                 prescriptions[index]?.prescriptionId || 
                                 index;
            newSelectedReports.delete(prescriptionId);
        }
        setSelectedReports(newSelectedReports);
    };

    const handleEdit = (index: number) => {
        if (prescriptions && prescriptions[index]) {
            const prescriptionToEdit = prescriptions[index];
            setEditingPrescription(prescriptionToEdit);
            setIsEditMode(true);
            setIsModalOpen(true);
        }
    };

    const handleAdd = () => {
        setEditingPrescription(null);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPrescription(null);
        setIsEditMode(false);
    };

    // Share functionality
    const handleSendReports = async () => {
        if (selectedReports.size === 0) {
            toast.error("Please select at least one prescription to share.");
            return;
        }
        setIsSharing(true);
        try {
            const payload = {
                prescriptionIds: Array.from(selectedReports)
            };
            const response = await FamilyShare(payload);
            if (response && response.data && response.data.success) {
                setShareData({
                    shareUrl: response.data.data.shareUrl,
                    expiryDate: response.data.data.expiryDate,
                    expiryTime: response.data.data.expiryTime
                });
                setIsShareModalOpen(true);
                toast.success(response.data.message);
            } else {
                toast.error("Failed to create share link. Please try again.");
            }
        } catch (error) {
            console.error("Error creating share link:", error);
            toast.error("Failed to create share link. Please try again.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareData(null);
    };


    const handleWhatsAppShare = () => {
        if (shareData) {
            const cleanShareId = shareData.shareUrl;
            const shareUrl = `${window.location.origin}/shareFamilyPrescripation?shareId=${cleanShareId}`;
              const message = `${shareUrl}\n\n${storedUserName}'s Medical Reports`;
            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
             window.open(url, '_blank');
        }
    };

    const handleGmailShare = () => {
        if (shareData) {

            const shareUrl = `${window.location.origin}/shareReportPage?shareId=${shareData.shareUrl}`;
             const subject = `${storedUserName}'s Medical Reports (${selectedReports.size} reports)`;
            const body = `Please find the medical reports here:\n${shareUrl}\n\nThis link will expire on ${shareData.expiryDate} at ${shareData.expiryTime}`;
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&tf=1`;

        window.open(gmailUrl, '_blank');
        }
    };

    const handleShareToggle = () => {
        setShowCheckbox(!showCheckbox);
        if (showCheckbox) {
            // Reset selections when hiding checkboxes
            setSelectedReports(new Set());
            setSelectedIndexes([]);
        }
    };

    return (
        <MasterHome>
            <div className="p-2">
                {/* Responsive Views */}
                {/* {For Desktop view table} */}
                <div className="hidden md:block mx-4">
                    <PrescriptionTable
                        prescriptions={prescriptions}
                        showCheckbox={showCheckbox}
                        onEdit={handleEdit}
                        userlist={userlist}
                        handleBack={handleBack}
                        handleChange={handleChange}
                        setShowCheckbox={setShowCheckbox}
                        handleAdd={handleAdd}
                        selectedReports={selectedReports}
                        handleSendReports={handleSendReports}
                        isSharing={isSharing}
                        onSelectChange={handleSelectChange}
                    />
                </div>

                {/* Mobile View */}
                <div className="block md:hidden mx-4">
                    {/* Header Section - Only shown once */}
                    <div className="mt-6 mb-6 mx-3 flex justify-center items-center">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800">
                                Family prescription
                            </h2>
                            <div className="w-32 border border-blue-300 bg-blue-300 rounded mx-auto mt-2"></div>
                        </div>
                    </div>

                    {/* Controls Section - Only shown once */}
                    <div className="mb-6 mx-auto">
                        <div className="flex flex-col items-end gap-4">
                            {/* Select Dropdown */}
                            <div className="mx-1">
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
                            
                            {/* Send Button - Show only when checkboxes are visible and items are selected */}
                            {showCheckbox && selectedReports.size > 0 && (
                                <button
                                    onClick={handleSendReports}
                                    disabled={isSharing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    {isSharing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Creating Share Link...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faShareAlt} />
                                            Send {selectedReports.size} Prescription(s)
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Button Row */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleShareToggle}
                                    className="flex items-center gap-2 border border-black text-sm font-medium text-black px-4 py-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <FontAwesomeIcon icon={faShareAlt} />
                                    Share
                                </button>

                                <button
                                    className="flex items-center gap-2 border cursor-pointer border-black text-sm font-medium text-black px-4 py-2 rounded-full hover:bg-gray-100 transition"
                                    onClick={handleAdd}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    Add
                                </button>

                                <button className="flex items-center gap-2 border cursor-pointer border-black text-sm font-medium text-black px-4 py-2 rounded-full hover:bg-gray-100 transition">
                                    <FontAwesomeIcon icon={faCheck} />
                                    Access
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Prescription Cards */}
                    {/* {For Mobile view card} */}
                    {Array.isArray(prescriptions) && prescriptions.map((item, index) => (
                        <PrescriptionCard
                            key={index}
                            prescription={item}
                            showCheckbox={showCheckbox}
                            isSelected={selectedIndexes.includes(index)}
                            onEdit={() => handleEdit(index)}
                            onSelectChange={(checked) => handleSelectChange(index, checked)}
                            cardNumber={index + 1}
                        />
                    ))}
                </div>

                {/* Prescription Modal */}
                <PrescriptionModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    editingPrescription={editingPrescription}
                    isEditMode={isEditMode}
                />

                {/* Share Modal */}
                {isShareModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg mx-4">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    Share {selectedReports.size} Prescription(s)
                                </h2>
                                <button
                                    onClick={handleCloseShareModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {shareData && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Share this link:</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={shareData.shareUrl}
                                            readOnly
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded bg-white"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareData.shareUrl);
                                                toast.success('Link copied to clipboard!');
                                            }}
                                            className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Expires on {shareData.expiryDate} at {shareData.expiryTime}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={handleWhatsAppShare}
                                    disabled={isSharing}
                                    className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 ${isSharing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">WhatsApp</span>
                                </button>

                                <button
                                    onClick={handleGmailShare}
                                    disabled={isSharing}
                                    className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 ${isSharing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700 text-sm sm:text-base">Gmail</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </MasterHome>
    );
};

export default FamilyPrescriptionPage