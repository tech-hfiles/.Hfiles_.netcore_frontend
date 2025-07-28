import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X, Calendar, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { DataImmunaztion, ImmunationAdd, ImmunatiomnEdit, ImmunatiomnDelete } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import { toast } from 'react-toastify';

interface VaccinationItem {
    id: number;
    vaccineTypeId: number; // Add this for the actual vaccine type ID
    vaccinationRecordId?: number; // Add this for the vaccination record ID used in edit/delete
    vaccine: string;
    dueAge: string;
    vaccinationDate: string;
    doctorName: string;
    status: string;
    checked: boolean;
    reportUrl?: string;
    epochTime?: number;
}

interface ModalData {
    id: number;
    vaccineTypeId: number;
    vaccinationRecordId?: number;
    vaccine: string;
    dueAge: string;
}

interface ViewModalData extends VaccinationItem {}

const VaccinationList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedVaccines, setSelectedVaccines] = useState<number[]>([]);
    const [expandedCards, setExpandedCards] = useState<{[key: number]: boolean}>({});
    const [vaccinationData, setVaccinationData] = useState<VaccinationItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Add Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalData | null>(null);
    const [formData, setFormData] = useState({
        vaccinationDate: '',
        doctorName: '',
        reportFile: null as File | null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // View Modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewModalData, setViewModalData] = useState<ViewModalData | null>(null);

    const ShowDataList = async () => {
        try {
             const currentUserId = await getUserId();
            setLoading(true);
            const response = await DataImmunaztion(currentUserId);
            console.log('Vaccination Data:', response.data.data);
            
            // Transform API data to match component structure
            const transformedData = response.data.data.map((item: any) => ({
                id: item.vaccineTypeId, // Keep using vaccineTypeId for component logic
                vaccineTypeId: item.vaccineTypeId, // Store the vaccine type ID
                vaccinationRecordId: item.id || item.vaccinationId, // Store the vaccination record ID for edit/delete
                vaccine: formatVaccineName(item.vaccine),
                dueAge: item.dueAge,
                vaccinationDate: item.vaccinationDate || '—',
                doctorName: item.doctorName || '—',
                status: (item.vaccinationDate && item.doctorName) ? 'completed' : 'pending',
                checked: false, // Default unchecked
                reportUrl: item.reportUrl,
                epochTime: item.epochTime
            }));
            
            setVaccinationData(transformedData);
        } catch (error) {
            console.error('Error fetching vaccination data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to format vaccine names for better display
    const formatVaccineName = (vaccineName: string) => {
        const nameMap: { [key: string]: string } = {
            'BCG': 'BCG',
            'HepatitisBBirthDose': 'Hepatitis B-Birth dose',
            'OPV0': 'OPV-0',
            'OPV123': 'OPV 1,2,&3',
            'Pentavalent': 'Pentavalent'
        };
        return nameMap[vaccineName] || vaccineName;
    };

    useEffect(() => {
        ShowDataList();
    }, []);

    const handleCheckboxChange = (id: number) => {
        setSelectedVaccines((prev: number[]) =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleCardExpansion = (id: number) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Handle Add button click
    const handleAddVaccination = (item: VaccinationItem) => {
        setModalData({
            id: item.id,
            vaccineTypeId: item.vaccineTypeId,
            vaccine: item.vaccine,
            dueAge: item.dueAge
        });
        setFormData({
            vaccinationDate: '',
            doctorName: '',
            reportFile: null
        });
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    // Handle View button click
    const handleViewVaccination = (item: VaccinationItem) => {
        console.log('Viewing vaccination data:', item);
        setViewModalData(item);
        setIsViewModalOpen(true);
    };

    // Handle Edit button click from view modal
    const handleEditVaccination = (item: ViewModalData) => {
        console.log('Editing vaccination data:', item);
        setModalData({
            id: item.id,
            vaccineTypeId: item.vaccineTypeId,
            vaccinationRecordId: item.vaccinationRecordId,
            vaccine: item.vaccine,
            dueAge: item.dueAge
        });
        setFormData({
            vaccinationDate: item.vaccinationDate !== '—' ? item.vaccinationDate : '',
            doctorName: item.doctorName !== '—' ? item.doctorName : '',
            reportFile: null
        });
        setIsEditMode(true);
        setIsViewModalOpen(false);
        setIsModalOpen(true);
    };

    // Handle Delete button click
    const handleDeleteVaccination = async (item: ViewModalData) => {
        if (window.confirm(`Are you sure you want to delete ${item.vaccine} vaccination record?`)) {
            console.log('Deleting vaccination data:', item);
            try {
                if (item.vaccinationRecordId) {
                    const response = await ImmunatiomnDelete(item.vaccinationRecordId);
                    toast.success(response.data.message || 'Vaccination record deleted successfully');
                    setIsViewModalOpen(false);
                    ShowDataList(); // Refresh the list
                } else {
                    toast.error('No vaccination record ID found for deletion');
                }
            } catch (error) {
                console.error('Error deleting vaccination:', error);
                toast.error('Failed to delete vaccination record');
            }
        }
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle file upload
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFormData(prev => ({
            ...prev,
            reportFile: file
        }));
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

    // Handle form submission
    const handleSubmitVaccination = async () => {
        if (!modalData || !formData.vaccinationDate || !formData.doctorName) {
            alert('Please fill all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const currentUserId = await getUserId();
            
            // Create FormData for file upload
            const submitData = new FormData();
            
            if (isEditMode) {
                // For edit mode, include the vaccination record ID in the payload
                submitData.append('id', modalData.vaccinationRecordId?.toString() || '');
                submitData.append('UserId', currentUserId.toString());
                submitData.append('VaccineTypeId', modalData.vaccineTypeId.toString());
                submitData.append('VaccinationDate', formData.vaccinationDate);
                submitData.append('DoctorName', formData.doctorName);
                
                if (formData.reportFile) {
                    submitData.append('ReportFile', formData.reportFile);
                }
            } else {
                // For add mode, use the original structure
                submitData.append('userId', currentUserId.toString());
                submitData.append('vaccineTypeId', modalData.vaccineTypeId.toString());
                submitData.append('vaccinationDate', formData.vaccinationDate);
                submitData.append('doctorName', formData.doctorName);
                
                if (formData.reportFile) {
                    submitData.append('reportFile', formData.reportFile);
                }
            }

            console.log('Submitting vaccination data:', {
                isEditMode: isEditMode,
                vaccinationRecordId: modalData.vaccinationRecordId,
                userId: currentUserId,
                vaccineTypeId: modalData.vaccineTypeId,
                vaccinationDate: formData.vaccinationDate,
                doctorName: formData.doctorName,
                reportFile: formData.reportFile
            });

            let response;
            if (isEditMode && modalData.vaccinationRecordId) {
                // Use edit API for updating existing vaccination
                response = await ImmunatiomnEdit(modalData.vaccinationRecordId, submitData);
                toast.success(response.data.message || 'Vaccination record updated successfully');
            } else {
                // Use add API for new vaccination
                response = await ImmunationAdd(submitData);
                toast.success(response.data.message || 'Vaccination record added successfully');
            }
            
            setIsModalOpen(false);
            ShowDataList();
        } catch (error) {
            console.error('Error submitting vaccination:', error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'save'} vaccination record`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close add/edit modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
        setFormData({
            vaccinationDate: '',
            doctorName: '',
            reportFile: null
        });
        setIsEditMode(false);
    };

    // Handle View Certificate button click
    const handleViewCertificate = (reportUrl?: string) => {
        if (reportUrl) {
            console.log('Opening certificate URL:', reportUrl);
            window.open(reportUrl, '_blank');
        } else {
            toast.warning('No certificate available for this vaccination');
        }
    };

    // Close view modal
    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewModalData(null);
    };

    const getActionButton = (status: string, item: VaccinationItem) => {
        if (status === 'completed') {
            return (
                <button 
                    onClick={() => handleViewVaccination(item)}
                    className="px-3 py-2 md:px-4 bg-yellow-400 border hover:bg-yellow-500 text-gray-800 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm"
                >
                    <Eye size={14} />
                    View
                </button>
            );
        } else {
            return (
                <button 
                    onClick={() => handleAddVaccination(item)}
                    className="px-3 py-2 md:px-4 bg-blue-300 hover:bg-blue-600 text-black rounded-lg border font-medium transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm"
                >
                    Add
                </button>
            );
        }
    };

    const getRowBackground = (status: string, index: number) => {
        if (status === 'pending' && index === 3) {
            return 'bg-blue-50 border-blue-200';
        }
        return 'bg-white hover:bg-gray-50';
    };

    if (loading) {
        return (
            <div className="mx-2 mt-2 md:p-6 bg-gray-50">
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading vaccination data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-2 mt-2 md:p-6 bg-gray-50">
            {/* Header Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full max-w-md bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white py-3 px-4 md:px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-between shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                    <span>Click here to see the full list of Vaccinations</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isOpen && (
                <>
                    {/* Desktop Table Layout */}
                    <div className="hidden md:block">
                        <div className="bg-gray-200 border-b-2 border-black">
                            <div className="flex">
                                <div className="flex items-center justify-center border-r border-black p-4 w-20">
                                    <span className="font-semibold text-gray-700 text-sm">Select</span>
                                </div>
                                <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                    <span className="font-semibold text-gray-700 text-sm">Vaccine</span>
                                </div>
                                <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                    <span className="font-semibold text-gray-700 text-sm">Due Age</span>
                                </div>
                                <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                    <span className="font-semibold text-gray-700 text-sm">Date</span>
                                </div>
                                <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                    <span className="font-semibold text-gray-700 text-sm">Doctor</span>
                                </div>
                                <div className="flex items-center justify-center flex-1 p-4">
                                    <span className="font-semibold text-gray-700 text-sm">Action</span>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-black border border-gray-200 rounded-lg">
                            {vaccinationData.map((item: VaccinationItem, index: number) => (
                                <div
                                    key={item.id}
                                    className={`flex transition-colors duration-200 ${getRowBackground(item.status, index)}`}
                                >
                                    <div className="flex items-center justify-center border-r border-black p-4 w-20">
                                        <input
                                            type="checkbox"
                                            checked={selectedVaccines.includes(item.id)}
                                            onChange={() => handleCheckboxChange(item.id)}
                                            className="w-6 h-6 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                        <span className="font-medium text-gray-800 text-center text-sm">{item.vaccine}</span>
                                    </div>
                                    <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                        <span className="text-gray-600 text-center text-sm">{item.dueAge}</span>
                                    </div>
                                    <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                        <span className={`text-center text-sm ${item.vaccinationDate === '—' ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
                                            {item.vaccinationDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                                        <span className={`text-center text-sm ${item.doctorName === '—' ? 'text-gray-400' : 'text-gray-800'}`}>
                                            {item.doctorName}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center flex-1 p-4">
                                        {getActionButton(item.status, item)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-3">
                        {vaccinationData.map((item: VaccinationItem, index: number) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                                {/* Card Header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 border-b border-gray-200"
                                    onClick={() => toggleCardExpansion(item.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedVaccines.includes(item.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleCheckboxChange(item.id);
                                            }}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-800 text-sm">{item.vaccine}</h3>
                                            <p className="text-xs text-gray-500">
                                                {item.status === 'completed' ? 'Uploaded' : 'Not uploaded'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        size={20}
                                        className={`text-gray-500 transition-transform duration-200 ${expandedCards[item.id] ? 'rotate-180' : ''}`}
                                    />
                                </div>

                                {/* Expanded Content */}
                                {expandedCards[item.id] && (
                                    <div className="p-4 space-y-4 bg-white">
                                        {item.status === 'completed' ? (
                                            <div className="">
                                                <h4 className="font-medium text-gray-800 mb-3 text-sm">Uploaded Vaccine:</h4>
                                                <div className="space-y-3 flex justify-around">
                                                    <p>Name</p> <p>vaccinationDate</p>
                                                </div>
                                                <div className="flex justify-between items-center bg-white P-4 rounded border">
                                                    <p className="font-medium text-sm">{item.vaccine}</p> 
                                                    <p className="text-xs text-gray-500">{item.vaccinationDate}</p>
                                                    {getActionButton(item.status, item)}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <div className="text-xs text-gray-600">
                                                        <div><strong>Due Age:</strong> {item.dueAge}</div>
                                                        <div><strong>Doctor:</strong> {item.doctorName}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="text-xs text-gray-600">
                                                    <div><strong>Due Age:</strong> {item.dueAge}</div>
                                                </div>
                                                <div className="flex justify-center">
                                                    {getActionButton(item.status, item)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className='border mt-3'></div>
                </>
            )}

            {/* View Modal */}
            {isViewModalOpen && viewModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-blue-600">{viewModalData.vaccine} Vaccine</h2>
                            <button
                                onClick={closeViewModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Vaccination Details Table */}
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 border-b border-gray-300">
                                    <div className="flex">
                                        <div className="flex-1 p-3 border-r border-gray-300">
                                            <span className="font-medium text-gray-700 text-sm">Due Age</span>
                                        </div>
                                        <div className="flex-1 p-3 border-r border-gray-300">
                                            <span className="font-medium text-gray-700 text-sm">Vaccination Date</span>
                                        </div>
                                        <div className="flex-1 p-3">
                                            <span className="font-medium text-gray-700 text-sm">Doctor's Name</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white">
                                    <div className="flex">
                                        <div className="flex-1 p-3 border-r border-gray-300">
                                            <span className="text-sm text-gray-800">{viewModalData.dueAge}</span>
                                        </div>
                                        <div className="flex-1 p-3 border-r border-gray-300">
                                            <span className="text-sm text-gray-800">{viewModalData.vaccinationDate}</span>
                                        </div>
                                        <div className="flex-1 p-3">
                                            <span className="text-sm text-gray-800">{viewModalData.doctorName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => handleEditVaccination(viewModalData)}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteVaccination(viewModalData)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>

                            {/* View Certificate Button */}
                            <div className="mt-4">
                                <button 
                                    onClick={() => handleViewCertificate(viewModalData.reportUrl)}
                                    disabled={!viewModalData.reportUrl}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                                        viewModalData.reportUrl 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {viewModalData.reportUrl ? 'View Your Certificate' : 'No Certificate Available'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && modalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-blue-600">
                                {isEditMode ? 'Edit' : 'Add'} {modalData.vaccine} Vaccine
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* Due Age */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Due Age:
                                </label>
                                <p className="text-gray-600">{modalData.dueAge}</p>
                            </div>

                            {/* Vaccination Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vaccination Date: <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.vaccinationDate}
                                        onChange={(e) => handleInputChange('vaccinationDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Ex: 28-05-2025"
                                    />
                                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Doctor's Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Doctor's Name: <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.doctorName}
                                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter Doctor's Name"
                                />
                            </div>

                            {/* Attach Certificate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attach Certificate:
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                    </label>
                                    {formData.reportFile && (
                                        <span className="text-sm text-gray-600">
                                            {formData.reportFile.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t">
                            <button
                                onClick={handleSubmitVaccination}
                                disabled={isSubmitting || !formData.vaccinationDate || !formData.doctorName}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {isEditMode ? 'Updating...' : 'Saving...'}
                                    </>
                                ) : (
                                    isEditMode ? 'Update' : 'Save'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaccinationList;