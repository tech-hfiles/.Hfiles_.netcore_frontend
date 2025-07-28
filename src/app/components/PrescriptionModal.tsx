import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { LIstAllData } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import { toast } from 'react-toastify';

interface PrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: PrescriptionData) => void;
    editingPrescription?: any;
    isEditMode?: boolean;
}

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

interface FormData {
    member: string;
    condition: string;
    customCondition: string;
    medications: {
        medication: string;
        dosage: string;
        schedule: string[];
        timings: string[];
    }[];
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingPrescription,
    isEditMode = false
}) => {
    const [prescriptionData, setPrescriptionData] = useState() as any;

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

    const DataLIstAll = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                return;
            }
            const response = await LIstAllData(currentUserId);
            setPrescriptionData(response.data.data.members);
            console.log("Prescription Data:", response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        DataLIstAll();
    }, []);

    const [formData, setFormData] = useState<FormData>({
        member: '',
        condition: '',
        customCondition: '',
        medications: [{
            medication: '',
            dosage: '',
            schedule: [],
            timings: []
        }],
    });

    // Helper function to parse schedule string to array
    const parseScheduleString = (scheduleStr: string): string[] => {
        if (!scheduleStr) return [];
        return scheduleStr.split(',').map(day => day.trim()).filter(day => day);
    };

    // Helper function to parse timings string to array
    const parseTimingsString = (timingsStr: string): string[] => {
        if (!timingsStr) return [];
        return timingsStr.split(',').map(timing => timing.trim()).filter(timing => timing);
    };

    // Effect to populate form when editing
    useEffect(() => {
        if (isEditMode && editingPrescription) {
            setFormData({
                member: editingPrescription.memberId || '',
                condition: editingPrescription.condition === 'Others' ? 'Others' : editingPrescription.condition || '',
                customCondition: editingPrescription.condition === 'Others' ? editingPrescription.otherCondition || '' : '',
                medications: [{
                    medication: editingPrescription.medicine || '',
                    dosage: editingPrescription.dosage || '',
                    schedule: parseScheduleString(editingPrescription.schedule),
                    timings: parseTimingsString(editingPrescription.timings)
                }]
            });
        } else {
            // Reset form for add mode
            setFormData({
                member: '',
                condition: '',
                customCondition: '',
                medications: [{
                    medication: '',
                    dosage: '',
                    schedule: [],
                    timings: []
                }],
            });
        }
    }, [isEditMode, editingPrescription, isOpen]);

    const conditionOptions = [
        'Alzheimers', 'Arthritis', 'Asthma', 'Anxiety', 'BloodPressure',
        'Cholesterol', 'Cancer', 'COPD', 'Diabetes', 'Depression',
        'Epilepsy', 'Thyroid', 'Vitamins', 'Others'
    ];

    const dayOptions = [
        'AllDays', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    const timingOptions = [
        "AfterBreakFast",
        "BeforeBreakFast",
        "AfterLunch",
        "BeforeLunch",
        "AfterDinner",
        "BeforeDinner",
        "WithAMeal",
        "Noon",
        "TeaTime"
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleMedicationChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }));
    };

    const handleScheduleChange = (medIndex: number, day: string) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) => {
                if (i !== medIndex) return med;

                if (day === 'AllDays') {
                    return {
                        ...med,
                        schedule: med.schedule.includes('AllDays') ? [] : ['AllDays']
                    };
                }

                const newSchedule = med.schedule.filter(d => d !== 'AllDays');
                if (newSchedule.includes(day)) {
                    return {
                        ...med,
                        schedule: newSchedule.filter(d => d !== day)
                    };
                } else {
                    return {
                        ...med,
                        schedule: [...newSchedule, day]
                    };
                }
            })
        }));
    };

    const handleTimingChange = (medIndex: number, timing: string) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) => {
                if (i !== medIndex) return med;
                if (med.timings.includes(timing)) {
                    return {
                        ...med,
                        timings: med.timings.filter(t => t !== timing)
                    };
                } else {
                    return {
                        ...med,
                        timings: [...med.timings, timing]
                    };
                }
            })
        }));
    };

    const addMedication = () => {
        setFormData(prev => ({
            ...prev,
            medications: [...prev.medications, {
                medication: '',
                dosage: '',
                schedule: [],
                timings: []
            }]
        }));
    };

    const removeMedication = (index: number) => {
        if (formData.medications.length > 1) {
            setFormData(prev => ({
                ...prev,
                medications: prev.medications.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSave = () => {
        const finalCondition = formData.condition === 'Others' && formData.customCondition
            ? formData.customCondition
            : formData.condition;

        const prescriptionData: PrescriptionData = {
            ...formData,
            condition: finalCondition,
        };

        onSave(prescriptionData);

        // Reset form
        setFormData({
            member: '',
            condition: '',
            customCondition: '',
            medications: [{
                medication: '',
                dosage: '',
                schedule: [],
                timings: []
            }],
        });

        onClose();
    };

    const handleClose = () => {
        setFormData({
            member: '',
            condition: '',
            customCondition: '',
            medications: [{
                medication: '',
                dosage: '',
                schedule: [],
                timings: []
            }]
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white mt-4 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl max-h-[80vh] sm:max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {isEditMode ? 'Edit Prescription' : 'Add Prescription'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                    {/* Member Selection */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="bg-cyan-200 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full sm:w-20 md:w-24 text-center">
                            Member
                        </div>
                        <select
                            value={formData.member}
                            onChange={(e) => handleInputChange('member', e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                            <option value="">Select Member</option>
                            {Array.isArray(prescriptionData) &&
                                prescriptionData.map((member: any) => (
                                    <option key={member.id} value={member.id}>
                                        {member.fullName}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Condition Selection */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="bg-cyan-200 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full sm:w-20 md:w-24 text-center">
                                Condition
                            </div>
                            <select
                                value={formData.condition}
                                onChange={(e) => {
                                    handleInputChange('condition', e.target.value);
                                    if (e.target.value !== 'Others') {
                                        handleInputChange('customCondition', '');
                                    }
                                }}
                                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            >
                                <option value="">Select Condition</option>
                                {conditionOptions.map(condition => (
                                    <option key={condition} value={condition}>{condition}</option>
                                ))}
                            </select>
                        </div>

                        {/* Custom Condition Input */}
                        {formData.condition === 'Others' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="w-full sm:w-20 md:w-24"></div>
                                <input
                                    type="text"
                                    placeholder="Type Other Condition"
                                    value={formData.customCondition}
                                    onChange={(e) => handleInputChange('customCondition', e.target.value)}
                                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                />
                            </div>
                        )}
                    </div>

                    {/* Medications */}
                    {formData.medications.map((med, index) => (
                        <div key={index} className="space-y-3 sm:space-y-4 border border-gray-200 rounded-lg p-3 sm:p-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-700 text-sm sm:text-base">Medication {index + 1}</h3>
                                {formData.medications.length > 1 && (
                                    <button
                                        onClick={() => removeMedication(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                    >
                                        <X size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Medication Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="bg-cyan-200 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full sm:w-20 md:w-24 text-center">
                                    Medication
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type Medication"
                                    value={med.medication}
                                    onChange={(e) => handleMedicationChange(index, 'medication', e.target.value)}
                                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                />
                            </div>

                            {/* Dosage */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="bg-cyan-200 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full sm:w-20 md:w-24 text-center">
                                    Dosage
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type Dosage"
                                    value={med.dosage}
                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                />
                            </div>

                            {/* Schedule Selection for this medication */}
                            <div className="flex flex-col lg:flex-row lg:items-start gap-2 sm:gap-4">
                                <div className="bg-cyan-200 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full lg:w-20 xl:w-24 text-center lg:mt-0">
                                    Schedule
                                </div>
                                <div className="flex-1">
                                    <div className="border border-gray-300 rounded-lg p-2 sm:p-3 max-h-24 sm:max-h-32 overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                                            {dayOptions.map(day => (
                                                <label key={day} className="flex items-center gap-5 py-1 cursor-pointer hover:bg-gray-50 rounded text-xs sm:text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={med.schedule.includes(day)}
                                                        onChange={() => handleScheduleChange(index, day)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                                                    />
                                                    <span className="text-xs sm:text-sm">{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {med.schedule.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-xs text-gray-600 mb-1">Selected days ({med.schedule.length}):</div>
                                            <div className="flex flex-wrap gap-1">
                                                {med.schedule.map(day => (
                                                    <span
                                                        key={day}
                                                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                                                    >
                                                        <span className="truncate">{day}</span>
                                                        <button
                                                            onClick={() => handleScheduleChange(index, day)}
                                                            className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                                                        >
                                                            <X size={10} className="sm:w-3 sm:h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timings Selection for this medication */}
                            <div className="flex flex-col lg:flex-row lg:items-start gap-2 sm:gap-4">
                                <div className="bg-cyan-200 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full lg:w-20 xl:w-24 text-center lg:mt-0">
                                    Timings
                                </div>
                                <div className="flex-1">
                                    <div className="border border-gray-300 rounded-lg p-2 sm:p-3 max-h-24 sm:max-h-32 overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1">
                                            {timingOptions.map(timing => (
                                                <label key={timing} className="flex items-center gap-5 py-1 cursor-pointer hover:bg-gray-50 rounded text-xs sm:text-sm">
                                                    <input
                                                        type="checkbox"
                                                        name={`timing-${index}`}
                                                        checked={med.timings.includes(timing)}
                                                        onChange={() => handleTimingChange(index, timing)}
                                                        className="border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3 sm:w-4 sm:h-4"
                                                    />
                                                    <span className="text-xs sm:text-sm">{timing}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {med.timings.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-xs text-gray-600 mb-1">
                                                Selected timings ({med.timings.length}):
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {med.timings.map(timing => (
                                                    <span
                                                        key={timing}
                                                        className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                                                    >
                                                        <span className="truncate">{timing}</span>
                                                        <button
                                                            onClick={() => handleTimingChange(index, timing)}
                                                            className="text-green-500 hover:text-green-700 flex-shrink-0"
                                                        >
                                                            <X size={10} className="sm:w-3 sm:h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Buttons */}
                <div className="sticky bottom-0 bg-white border-t px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-center sm:justify-end gap-2 sm:gap-3">
                    {/* Add More Button - Only show in add mode or if editing and want to allow multiple medications */}
                    {!isEditMode && (
                        <button
                            onClick={addMedication}
                            className="flex items-center justify-center gap-2 primary text-white px-4 sm:px-6 py-2 rounded-full transition-colors text-sm sm:text-base order-3 sm:order-1"
                        >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                            Add More
                        </button>
                    )}

                    <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 sm:flex-none primary text-white px-4 sm:px-6 py-2 rounded-full transition-colors text-sm sm:text-base"
                        >
                            {isEditMode ? 'Update' : 'Save'}
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex-1 sm:flex-none bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-gray-600 transition-colors text-sm sm:text-base"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;