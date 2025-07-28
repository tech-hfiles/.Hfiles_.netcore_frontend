'use client'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MasterHome from '../components/MasterHome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronDown, faShareAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import SurgicalHistory from '../components/SurgicalHistory';
import { AddedDisease, AddHistory, DeleteData, GeneratePdf, HistoryEdit, HistoryList, ListHistory, MetrixAdd, SocialHistoryAdd, StaticAllergies, UpdateDesease, MemberList, DiseaseEdit, DiseaseDelete, AllergyEdit, AllergyDelete } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import AddSurgeryDetails from '../components/AddSurgeryDetails';
import SurgeryEditModal from '../components/SurgeryEditModal';
import AddMetrixData from '../components/AddMetrixData';
import MedicalTable from '../components/MedicalTable';
import MedicalOpenModal from '../components/MedicalOpenModal';
import AllergryPart from '../components/AllergryPart';

interface FormErrors {
    [key: string]: string;
}

interface SurgeryFormData {
    surgeryName: string;
    hospitalName: string;
    drName: string;
    surgeryDate: string;
}

interface HistoryItem {
    user_surgery_id: number;
    user_id: number;
    user_surgery_details: string;
    user_surgery_year: string;
    hostname: string | null;
    drname: string | null;
}

interface DiseaseSelection {
    myself: boolean;
    motherSide: boolean;
    fatherSide: boolean;
}

type Disease = {
    id: number;
    diseaseType: string;
    myself: boolean;
    motherSide: boolean;
    fatherSide: boolean;
};

interface AllergyItem {
    allergyType?: string;
    allergyName?: string;
    isAllergic: boolean;
    medicationNames?: string[];
    staticAllergyId?: number;
}

interface MedicationModalProps {
    closeMedicationModal: () => void;
    newMedication: string;
    setNewMedication: (value: string) => void;
    medications: string[];
    handleDoneMedicationModal: () => void;
}

const MedicationModal: React.FC<MedicationModalProps> = ({
    closeMedicationModal,
    newMedication,
    setNewMedication,
    medications,
    handleDoneMedicationModal
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-blue-800">Enter Medication Names</h2>
                    <button onClick={closeMedicationModal} className="text-gray-500 hover:text-gray-700">
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {/* Medication Textarea */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter medication names (one per line):
                    </label>
                    <textarea
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded text-sm min-h-[120px] resize-vertical"
                        placeholder={`Enter medication names, one per line:\n\nExample:\nAspirin\nIbuprofen\nParacetamol`}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                        Enter each medication on a separate line
                    </div>
                </div>

                {/* Current medications preview */}
                {medications.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            Current Medications ({medications.length}):
                        </h3>
                        <div className="text-xs text-gray-600">
                            {medications.join(', ')}
                        </div>
                    </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={closeMedicationModal}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDoneMedicationModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

const MedicalPage = () => {
    const habits = [
        { question: "Do You Smoke?", key: "smoking" },
        { question: "Do You Consume Alcohol?", key: "alcohol" },
        { question: "Do You Exercise regularly?", key: "exercise" },
        { question: "Do You Consume Caffeine?", key: "caffeine" }
    ];

    const initialState = habits.reduce((acc, habit) => {
        acc[habit.key] = "";
        return acc;
    }, {} as Record<string, string>);

    const [isAllergyOpen, setIsAllergyOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAllergy, setNewAllergy] = useState("");
    const [isMedicalOpen, setIsMedicalOpen] = useState(false);
    const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
    const [newDisease, setNewDisease] = useState("");
    const [medicalHistory, setMedicalHistory] = useState() as any;
    const [showForm, setShowForm] = useState(false);
    const router = useRouter();

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [medicalData, setMedicalData] = useState() as any;
    const [heightFeet, setHeightFeet] = useState(0);
    const [heightInches, setHeightInches] = useState(0);
    const [weightKg, setWeightKg] = useState(0);
    const [bmi, setBmi] = useState('');
    const [isModified, setIsModified] = useState(false);
    const [habitSelections, setHabitSelections] = useState<{ [key: string]: string }>(initialState);
    const [isSocial, setISocial] = useState(false);
    const [listAllergies, setListAllergies] = useState<AllergyItem[]>([]);
    const [allergySelections, setAllergySelections] = useState<{ [key: string]: boolean }>({});
    const [isAllergySaving, setIsAllergySaving] = useState(false);

    // Medication modal states
    const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
    const [medications, setMedications] = useState<string[]>([]);
    const [newMedication, setNewMedication] = useState("");
    const [selectedAllergyIndex, setSelectedAllergyIndex] = useState<number | null>(null);
    // Textarea medication states
    const [medicationTextarea, setMedicationTextarea] = useState<string>("");
    const [isMedicationTextareaOpen, setIsMedicationTextareaOpen] = useState(false);
    const [isMedicationDropdownOpen, setIsMedicationDropdownOpen] = useState(false);
    const [selectedDiseases, setSelectedDiseases] = useState<{ [key: string]: DiseaseSelection }>({});
    const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bmiCategory, setBmiCategory] = useState('');
    const [memberList, setMemberList] = useState() as any;
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string>("all");

    const [isAllergyEditModalOpen, setIsAllergyEditModalOpen] = useState(false);
    const [editingAllergyId, setEditingAllergyId] = useState<number | null>(null);
    const [editingAllergyName, setEditingAllergyName] = useState("");



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



    const fetchMemberList = async () => {
        const currentUserId = await getUserId();
        try {
            const response = await MemberList(currentUserId);
            const data = response?.data?.data;

            if (data) {
                const allMembers = [...(data.dependentMembers || [])];
                setMemberList(allMembers);
            } else {
                setMemberList([]);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    useEffect(() => {
        fetchMemberList();
    }, []);


    const ShowAllList = async () => {
        const currentUserId = await getUserId();
        if (!currentUserId) {
            setIsLoading(false);
            return;
        }

        try {
            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);

            const response = await ListHistory(userIdToUse);
            const data = response.data.data;
            const capitalize = (text: string) =>
                text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
            const medicationsByAllergyId: { [key: number]: string[] } = {};
            const allMedicationNames: string[] = [];

            if (data.medicationAllergies && Array.isArray(data.medicationAllergies)) {
                data.medicationAllergies.forEach((medication: any) => {
                    const { staticAllergyId, medicationName } = medication;

                    if (!medicationsByAllergyId[staticAllergyId]) {
                        medicationsByAllergyId[staticAllergyId] = [];
                    }
                    medicationsByAllergyId[staticAllergyId].push(medicationName);
                    allMedicationNames.push(medicationName);
                });
            }

            // Process static allergies
            const staticAllergies = (data.staticAllergies || []).map((item: any) => {
                const allergyData = {
                    allergyType: capitalize(item.allergyType),
                    isAllergic: item.isAllergic,
                    staticAllergyId: item.id,
                    medicationNames: [] as string[],
                };

                if (item.id && medicationsByAllergyId[item.id]) {
                    allergyData.medicationNames = medicationsByAllergyId[item.id];
                }

                // If this is medications allergy, add all medications
                if (item.allergyType && item.allergyType.toLowerCase() === 'medications') {
                    allergyData.medicationNames = allMedicationNames;
                }
                return allergyData;
            });

            const dynamicAllergies = (data.dynamicAllergies || []).map((item: any) => ({
                id: item.id,
                allergyName: capitalize(item.allergyName),
                isAllergic: item.isAllergic,
            }));

            const combinedAllergies = [...staticAllergies, ...dynamicAllergies];
            setListAllergies(combinedAllergies);

            // Set medications and textarea
            if (allMedicationNames.length > 0) {
                setMedications(allMedicationNames);
                setMedicationTextarea(allMedicationNames.join('\n'));
            }

            // Extract static and dynamic diseases safely with type information
            const staticDiseases: (Disease & { type: 'static' })[] = (data.staticDiseases || []).map((item: any, index: number) => ({
                id: index,
                diseaseType: item.diseaseType,
                myself: item.myself,
                motherSide: item.motherSide,
                fatherSide: item.fatherSide,
                type: 'static' as const
            }));

            const dynamicDiseases: (Disease & { type: 'dynamic' })[] = (data.dynamicDiseases || []).map((item: any) => ({
                id: item.id,
                diseaseType: item.diseaseName,
                myself: item.myself,
                motherSide: item.motherSide,
                fatherSide: item.fatherSide,
                type: 'dynamic' as const
            }));

            const combinedDiseases = [...staticDiseases, ...dynamicDiseases];
            setMedicalHistory(combinedDiseases);
            const initialDiseases: { [key: string]: DiseaseSelection } = {};
            if (data.staticDiseases && Array.isArray(data.staticDiseases)) {
                data.staticDiseases.forEach((disease: any, index: number) => {
                    const key = `static-${index}-${disease.diseaseType}`;
                    initialDiseases[key] = {
                        myself: disease.myself || false,
                        motherSide: disease.motherSide || false,
                        fatherSide: disease.fatherSide || false,
                    };
                });
            }
            if (data.dynamicDiseases && Array.isArray(data.dynamicDiseases)) {
                data.dynamicDiseases.forEach((disease: any) => {
                    const key = `dynamic-${disease.id}`;
                    initialDiseases[key] = {
                        myself: disease.myself || false,
                        motherSide: disease.motherSide || false,
                        fatherSide: disease.fatherSide || false,
                    };
                });
            }
            setSelectedDiseases(initialDiseases);
            setMedicalData({
                ...data.userProfileSummary,
                gender: data.userProfileSummary.gender,
            });

            setHeightFeet(data.userProfileSummary.heightFeet);
            setHeightInches(data.userProfileSummary.heightInches);
            setWeightKg(data.userProfileSummary.weightKg);

            const savedSelections: { [key: string]: string } = {};

            if (data.socialHistory) {
                const keyMapping = {
                    'smokingFrequency': 'smoking',
                    'alcoholFrequency': 'alcohol',
                    'exerciseFrequency': 'exercise',
                    'caffeineFrequency': 'caffeine'
                };
                Object.entries(keyMapping).forEach(([apiKey, habitKey]) => {
                    if (data.socialHistory[apiKey]) {
                        savedSelections[habitKey] = data.socialHistory[apiKey].toLowerCase();
                    }
                });
            }
            setHabitSelections(savedSelections);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        (async () => {
            const id = await getUserId();
            if (id !== 0) {
                await ShowAllList(); // 👈 no parameter passed here
            }
        })();
    }, [selectedUser]);


    const handleSaveMetrics = async () => {
        const payload = {
            heightFeet,
            heightInches,
            weightKg,
        };
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                setIsLoading(false);
                return;
            }
            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
            const response = await MetrixAdd(userIdToUse, payload);
            toast.success(`${response.data.message}`);
            ShowAllList();
            setIsModified(false);
        } catch (error) {
            console.log('Update failed');
        }
    };

    useEffect(() => {
        const calculateBMIAndCategory = () => {
            if (heightFeet || heightInches || weightKg) {
                const totalInches = heightFeet * 12 + heightInches;
                const heightMeters = totalInches * 0.0254;

                if (heightMeters > 0) {
                    const bmiValue = weightKg / (heightMeters * heightMeters);
                    const roundedBmi = parseFloat(bmiValue.toFixed(1));
                    setBmi(roundedBmi.toFixed(1));

                    const age = medicalData?.age || 0;

                    let category = '';
                    if (age < 18) {
                        if (roundedBmi < 14) category = 'Low';
                        else if (roundedBmi < 20) category = 'Standard';
                        else if (roundedBmi < 24) category = 'High';
                        else category = 'Too High';
                    } else {
                        if (roundedBmi < 18.5) category = 'Low';
                        else if (roundedBmi < 24.9) category = 'Standard';
                        else if (roundedBmi < 29.9) category = 'High';
                        else category = 'Too High';
                    }

                    setBmiCategory(category);
                } else {
                    setBmi('');
                    setBmiCategory('');
                }
            }
        };

        calculateBMIAndCategory();
    }, [heightFeet, heightInches, weightKg, medicalData]);




    const AllHistory = async () => {
        setIsLoading(true);
        const currentUserId = await getUserId();
        if (!currentUserId) {
            setIsLoading(false);
            return;
        }
        try {
            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);

            const response = await HistoryList(userIdToUse);
            setHistoryList(response?.data?.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            setHistoryList([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        AllHistory();
    }, []);

    const handleSubmits = async () => {
        const filteredData = Object.fromEntries(
            Object.entries(habitSelections).filter(([_, value]) => value !== "")
        );

        if (Object.keys(filteredData).length === 0) {
            alert("Please select at least one habit.");
            return;
        }

        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                return;
            }
            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
            const response = await SocialHistoryAdd(userIdToUse, filteredData);
            toast.success(`${response.data.message}`);
            ShowAllList();
            setISocial(false);
        } catch (err) {
            console.error("Error submitting social history:", err);
        }
    };

    const handleSelectionChange = (habitKey: string, value: string) => {
        setHabitSelections((prev) => ({
            ...prev,
            [habitKey]: value.toLowerCase(),
        }));
    };

    const toggleAllergySection = () => {
        setIsAllergyOpen(!isAllergyOpen);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleAddAllergy = async () => {
        if (newAllergy.trim()) {
            try {
                const payload = {
                    staticAllergies: [],
                    dynamicAllergies: [
                        {
                            allergyName: newAllergy.trim(),
                            isAllergic: true,
                        },
                    ],
                };

                const currentUserId = await getUserId();
                const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
                const response = await StaticAllergies(userIdToUse, payload);
                toast.success(`${response.data.message}`);
                setNewAllergy("");
                toggleModal();
                ShowAllList();
            } catch (error) {
                console.error("Failed to add allergy:", error);
            }
        } else {
            toast.warning("Please enter a valid allergy type.");
        }
    };

    const toggleMedicalSection = () => {
        setIsMedicalOpen(!isMedicalOpen);
    };

    const toggleDiseaseModal = () => {
        setIsDiseaseModalOpen(!isDiseaseModalOpen);
    };

    const [formData, setFormData] = useState<SurgeryFormData>({
        surgeryName: "",
        hospitalName: "",
        drName: "",
        surgeryDate: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const formatDateToDDMMYYYY = (dateStr: string): string => {
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };

    const handleSubmit = async () => {
        const currentUserId = await getUserId();
        if (!currentUserId) {
            return;
        }

        const newErrors: FormErrors = {};
        if (!formData.surgeryName.trim()) newErrors.surgeryName = "Required";
        if (!formData.hospitalName.trim()) newErrors.hospitalName = "Required";
        if (!formData.drName.trim()) newErrors.drName = "Required";
        if (!formData.surgeryDate.trim()) newErrors.surgeryDate = "Required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const formattedData = {
                    ...formData,
                    surgeryDate: formatDateToDDMMYYYY(formData.surgeryDate),
                };
                const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);

                const response = await AddHistory(userIdToUse, formattedData);
                const savedData = response.data;
                setFormData({ surgeryName: "", hospitalName: "", drName: "", surgeryDate: "" });
                setShowForm(false);
                toast.success(`${savedData.message}`);
                await AllHistory();
            } catch (error) {
                console.error("Error saving surgical history:", error);
            }
        }
    };

    // Yup validation schema
    const validationSchema = Yup.object({
        surgeryName: Yup.string().required('Surgery details are required'),
        drName: Yup.string().required('Doctor name is required'),
        hospitalName: Yup.string().required('Hospital name is required'),
        surgeryDate: Yup.string().required('Surgery date is required'),
    });

    // Formik configuration for edit modal
    const editFormik = useFormik({
        initialValues: {
            surgeryName: "",
            drName: "",
            hospitalName: "",
            surgeryDate: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                return;
            }
            if (editingIndex !== null) {
                const surgeryId = historyList[editingIndex].surgeryId;
                console.log(historyList,"historyList")
                const formattedPayload = {
                    ...values,
                    surgeryDate: formatDateToDDMMYYYY(values.surgeryDate),
                };
                try {
                    const response = await HistoryEdit(surgeryId, formattedPayload);
                    toast.success(`${response.data.message}`);
                    setIsEditModalOpen(false);
                    setEditingIndex(null);
                    editFormik.resetForm();
                    await AllHistory();
                } catch (error) {
                    console.error("Error updating surgery:", error);
                }
            }
        },
    });

   const handleEdit = (index: number) => {
    const itemToEdit = historyList[index];
    setEditingIndex(index);
    const surgeryDate = itemToEdit.surgeryDate; // Changed from user_surgery_year
    let formattedDate = "";
    if (surgeryDate && surgeryDate.includes("-")) {
        const [day, month, year] = surgeryDate.split("-");
        formattedDate = `${year}-${month}-${day}`;
    }
    editFormik.setValues({
        surgeryName: itemToEdit.surgeryName || "", // Changed from user_surgery_details
        drName: itemToEdit.doctorName || "",        // Changed from drname
        hospitalName: itemToEdit.hospitalName || "", // Changed from hostname
        surgeryDate: formattedDate,
    });

    setIsEditModalOpen(true);
};

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingIndex(null);
        editFormik.resetForm();
    };

    const handleDeleteSurgery = async () => {
        if (editingIndex !== null) {
            const item = historyList[editingIndex];
            const surgeryId = item.surgeryId;
            try {
                const response = await DeleteData(surgeryId);
                toast.success(`${response.data.message}`);
                setIsEditModalOpen(false);
                setEditingIndex(null);
                editFormik.resetForm();
                await AllHistory();
            } catch (error) {
                console.error(" Error deleting surgery:", error);
            }
        }
    };

    const handleNavigation = () => {
        router.push('/familyPrescription');
    };

    useEffect(() => {
        if (listAllergies && listAllergies.length > 0) {
            const initialSelections: { [key: string]: boolean } = {};
            listAllergies.forEach((allergy: any, index: number) => {
                initialSelections[`allergy-${index}`] = allergy.isAllergic;
            });
            setAllergySelections(initialSelections);
        }
    }, [listAllergies]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if ((isMedicationDropdownOpen || isMedicationTextareaOpen) && !target.closest('.medication-dropdown')) {
                setIsMedicationDropdownOpen(false);
                setIsMedicationTextareaOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMedicationDropdownOpen, isMedicationTextareaOpen]);

    // Medication Functions
    const handleAllergyChange = (allergyIndex: number, isAllergic: boolean) => {
        setAllergySelections(prev => ({
            ...prev,
            [`allergy-${allergyIndex}`]: isAllergic
        }));

        const allergy = listAllergies[allergyIndex];
        const allergyName = allergy.allergyType || allergy.allergyName || '';

        if (allergyName.toLowerCase() === 'medications') {
            if (isAllergic) {
                setSelectedAllergyIndex(allergyIndex);
                if (allergy.medicationNames && allergy.medicationNames.length > 0) {
                    setMedications(allergy.medicationNames);
                    setNewMedication(allergy.medicationNames.join('\n'));
                    setMedicationTextarea(allergy.medicationNames.join('\n'));
                    setIsMedicationDropdownOpen(false);
                    setIsMedicationTextareaOpen(false);
                } else {
                    setMedications([]);
                    setNewMedication('');
                    setMedicationTextarea('');
                    setIsMedicationDropdownOpen(false);
                    setIsMedicationTextareaOpen(false);
                }

                setIsMedicationModalOpen(true);
            } else {
                setMedications([]);
                setNewMedication('');
                setMedicationTextarea('');
                setIsMedicationDropdownOpen(false);
                setIsMedicationTextareaOpen(false);
                setIsMedicationModalOpen(false);
            }
        }
    };

    const handleDoneMedicationModal = () => {
        const medicationLines = newMedication
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        setMedications(medicationLines);
        setMedicationTextarea(medicationLines.join('\n'));
        setIsMedicationModalOpen(false);
        setSelectedAllergyIndex(null);
        setNewMedication("");
        setIsMedicationDropdownOpen(false);
        setIsMedicationTextareaOpen(false);

        if (medicationLines.length > 0) {
            toast.info(`${medicationLines.length} medication(s) added`);
        }
    };

    const closeMedicationModal = () => {
        setIsMedicationModalOpen(false);
        setSelectedAllergyIndex(null);
        setNewMedication("");
        setIsMedicationDropdownOpen(false);
        setIsMedicationTextareaOpen(false);
    };

    const toggleMedicationDropdown = () => {
        setIsMedicationDropdownOpen(!isMedicationDropdownOpen);
    };

    const toggleMedicationTextarea = () => {
        if (!isMedicationTextareaOpen) {
            setMedicationTextarea(medications.join('\n'));
        }
        setIsMedicationTextareaOpen(!isMedicationTextareaOpen);
    };

    const handleSaveMedicationTextarea = async () => {
        const medicationLines = medicationTextarea
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        setMedications(medicationLines);
        setIsMedicationTextareaOpen(false);

        // Find the medications allergy from listAllergies
        const medicationAllergy = listAllergies.find(
            allergy => (allergy.allergyType || allergy.allergyName || '').toLowerCase() === 'medications'
        );

        if (!medicationAllergy) {
            toast.error("Medications allergy type not found.");
            return;
        }

        // Get existing medications
        const existingMedications = medicationAllergy.medicationNames || [];

        // Find only NEW medications (not already saved)
        const newMedications = medicationLines.filter(
            medication => !existingMedications.includes(medication)
        );

        // Find REMOVED medications (were saved but not in current list)
        const removedMedications = existingMedications.filter(
            medication => !medicationLines.includes(medication)
        );

        // Check if there are any changes
        if (newMedications.length === 0 && removedMedications.length === 0) {
            toast.info("No changes to save.");
            return;
        }

        if (medicationLines.length > 0) {
            if (newMedications.length > 0) {
                // Only send NEW medications in payload
                const payload = {
                    staticAllergies: [{
                        allergyType: medicationAllergy.allergyType || 'medications',
                        isAllergic: true,
                        medicationNames: newMedications, // ✅ Only new medications
                        ...(medicationAllergy.staticAllergyId && { staticAllergyId: medicationAllergy.staticAllergyId })
                    }],
                    dynamicAllergies: []
                };

                try {
                    const currentUserId = await getUserId();
                    const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
                    const response = await StaticAllergies(userIdToUse, payload);
                    toast.success(`${newMedications.length} new medication(s) added successfully!`);
                    ShowAllList(); // Refresh the list to show updated medications
                } catch (error) {
                    console.error("Failed to add medications:", error);
                    toast.error("Failed to update medications.");
                }
            } else {
                toast.success("Medications updated successfully!");
            }

        } else {
            // If no medications, clear all existing medications
            toast.success("All medications removed successfully!");

            const payload = {
                staticAllergies: [{
                    allergyType: medicationAllergy.allergyType || 'medications',
                    isAllergic: true,
                    medicationNames: [], // Empty medications array
                    ...(medicationAllergy.staticAllergyId && { staticAllergyId: medicationAllergy.staticAllergyId })
                }],
                dynamicAllergies: []
            };

            try {
                const currentUserId = await getUserId();
                const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
                await StaticAllergies(userIdToUse, payload);
                ShowAllList();
            } catch (error) {
                console.error("Failed to clear medications:", error);
            }
        }
    };


    const validateAllergySelections = () => {
        const hasAnySelection = Object.values(allergySelections).some(value => value !== undefined);
        return hasAnySelection;
    };

    const isStaticAllergy = (allergy: AllergyItem): boolean => {
        return allergy.hasOwnProperty("allergyType") && !allergy.hasOwnProperty("allergyName");
    };

    const handleSaveAllergies = async () => {
        setIsAllergySaving(true);
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to save allergies.");
                setIsAllergySaving(false);
                return;
            }

            const staticAllergies: any[] = [];
            const dynamicAllergies: any[] = [];
            let hasChanges = false;

            listAllergies?.forEach((allergy: AllergyItem, index: number) => {
                const currentSelection = allergySelections[`allergy-${index}`];
                const originalValue = allergy.isAllergic;

                if (currentSelection !== undefined && currentSelection !== originalValue) {
                    hasChanges = true;
                    if (isStaticAllergy(allergy)) {
                        const staticAllergy: any = {
                            allergyType: allergy.allergyType,
                            isAllergic: currentSelection,
                        };
                        if (allergy.staticAllergyId) {
                            staticAllergy.staticAllergyId = allergy.staticAllergyId;
                        }
                        const allergyName = allergy.allergyType || '';
                        if (allergyName.toLowerCase() === "medications" &&
                            currentSelection &&
                            medications.length > 0) {
                            staticAllergy.medicationNames = medications;
                        }
                        staticAllergies.push(staticAllergy);
                    } else {
                        const allergyName = allergy.allergyName || allergy.allergyType;
                        if (allergyName && allergyName.trim()) {
                            dynamicAllergies.push({
                                allergyName: allergyName.trim(),
                                isAllergic: currentSelection,
                            });
                        }
                    }
                }
            });
            // Check if medications were updated without allergy status change
            const medicationAllergy = listAllergies.find(
                allergy => (allergy.allergyType || allergy.allergyName || '').toLowerCase() === 'medications'
            );

            if (medicationAllergy && medicationAllergy.isAllergic) {
                const existingMedications = medicationAllergy.medicationNames || [];
                const newMedications = medications.filter(
                    (med) => !existingMedications.includes(med)
                );

                if (newMedications.length > 0 && !hasChanges) {
                    hasChanges = true;
                    staticAllergies.push({
                        allergyType: medicationAllergy.allergyType,
                        isAllergic: true,
                        medicationNames: newMedications,
                        ...(medicationAllergy.staticAllergyId && { staticAllergyId: medicationAllergy.staticAllergyId })
                    });
                }
            }

            if (!hasChanges) {
                toast.info("No changes to save.");
                setIsAllergySaving(false);
                return;
            }
            const allergiesPayload: any = {};
            if (staticAllergies.length > 0) {
                allergiesPayload.staticAllergies = staticAllergies;
            }
            if (dynamicAllergies.length > 0) {
                allergiesPayload.dynamicAllergies = dynamicAllergies;
            }
            if (Object.keys(allergiesPayload).length === 0) {
                toast.warning("No allergies found to save.");
                setIsAllergySaving(false);
                return;
            }
            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
            const response = await StaticAllergies(userIdToUse, allergiesPayload);
            toast.success(response.data.message);
            await ShowAllList();
        } catch (error: any) {
            console.error("Error saving allergies:", error);
            toast.error("Failed to save allergies.");
        } finally {
            setIsAllergySaving(false);
        }
    };

    const renderAllergyWarning = () => {
        const hasSelections = validateAllergySelections();
        const hasChanges = listAllergies.some((allergy, index) => {
            const currentSelection = allergySelections[`allergy-${index}`];
            return currentSelection !== undefined && currentSelection !== allergy.isAllergic;
        });

        return null;
    };

    const handleSaveDiseases = async () => {
        const currentUserId = await getUserId();
        const diseases = Object.entries(selectedDiseases)
            .filter(([key, value]) =>
                value.myself || value.motherSide || value.fatherSide
            )
            .map(([key, value]) => {
                if (key.startsWith('static-')) {
                    const diseaseType = key.split('-').slice(2).join('-');
                    return {
                        ...(value.myself && { myself: true }),
                        ...(value.motherSide && { motherSide: true }),
                        ...(value.fatherSide && { fatherSide: true }),
                        ...(diseaseType && { staticDiseaseType: diseaseType }),
                    };
                } else if (key.startsWith('dynamic-')) {
                    const diseaseId = parseInt(key.replace('dynamic-', ''));
                    return {
                        ...(value.myself && { myself: true }),
                        ...(value.motherSide && { motherSide: true }),
                        ...(value.fatherSide && { fatherSide: true }),
                        ...(diseaseId > 0 && { dynamicDiseaseTypeId: diseaseId }),
                    };
                }
                return null;
            })
            .filter(Boolean);
        if (diseases.length === 0) {
            toast.warning("No diseases selected to save.");
            return;
        }
        const payload = { diseases };
        try {
            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
            const response = await UpdateDesease(userIdToUse, payload);
            toast.success(`${response.data.message}`);
            await ShowAllList();
        } catch (error) {
            console.error("Failed to update diseases:", error);
        }
    };

    const handleAddDisease = async () => {
        if (newDisease.trim()) {
            const payload = {
                diseaseName: newDisease.trim(),
            };
            try {
                const currentUserId = await getUserId();
                const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
                const response = await AddedDisease(userIdToUse, payload);
                const addedDisease = response?.data?.data || response?.data;
                setMedicalHistory((prev: any[]) => [
                    ...prev,
                    { id: addedDisease.id || 0, name: addedDisease.diseaseName }
                ]);
                toast.success(`${response.data.message}`);
                setNewDisease("");
                toggleDiseaseModal();
                ShowAllList();
            } catch (error) {
                console.error("Failed to add disease:", error);
            }
        }
    };

    const HandlePdf = async () => {
        try {
            const currentUserId = await getUserId();
            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);
            const response = await GeneratePdf(userIdToUse);
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            toast.error("Failed to generate PDF");
        }
    };

    const handleEditDisease = async (diseaseId: number, newDiseaseName: string) => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to edit disease.");
                return;
            }

            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);

            const formData = {
                diseaseName: newDiseaseName
            };

            const response = await DiseaseEdit(userIdToUse, diseaseId, formData);
            toast.success(`${response.data.message}`);
            await ShowAllList(); // Refresh the list
        } catch (error) {
            console.error("Failed to edit disease:", error);
        }
    };

    const handleDeleteDisease = async (diseaseId: number) => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to delete disease.");
                return;
            }

            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);

            const response = await DiseaseDelete(userIdToUse, diseaseId);
            toast.success(`${response.data.message}`);
            await ShowAllList(); // Refresh the list
        } catch (error) {
            console.error("Failed to delete disease:", error);
        }
    };

    const handleEditAllergy = async (allergyId: number, newAllergyName: string) => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to edit allergy.");
                return;
            }

            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);

            const formData = {
                allergyName: newAllergyName
            };

            const response = await AllergyEdit(userIdToUse, allergyId, formData);
            toast.success(`${response.data.message}`);
            await ShowAllList(); // Refresh the list
            setIsAllergyEditModalOpen(false);
            setEditingAllergyId(null);
            setEditingAllergyName("");
        } catch (error) {
            console.error("Failed to edit allergy:", error);
        }
    };

    const handleDeleteAllergy = async (allergyId: number) => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to delete allergy.");
                return;
            }

            const userIdToUse = selectedUser === "all" ? currentUserId : parseInt(selectedUser, 10);

            const response = await AllergyDelete(userIdToUse, allergyId);
            toast.success(`${response.data.message}`);
            await ShowAllList(); // Refresh the list
            setIsAllergyEditModalOpen(false);
            setEditingAllergyId(null);
            setEditingAllergyName("");
        } catch (error) {
            console.error("Failed to delete allergy:", error);
        }
    };

    const openAllergyEditModal = (allergyId: number, allergyName: string) => {
        setEditingAllergyId(allergyId);
        setEditingAllergyName(allergyName);
        setIsAllergyEditModalOpen(true);
    };

    const closeAllergyEditModal = () => {
        setIsAllergyEditModalOpen(false);
        setEditingAllergyId(null);
        setEditingAllergyName("");
    };


    return (
        <MasterHome>
            <div className="p-2 sm:p-4 lg:p-6 xl:p-8 2xl:p-10 min-w-[80%] mx-auto font-sans">
                {/* Header */}
                <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-6">
                    <button
                        className="text-black font-bold hover:text-black text-sm sm:text-base cursor-pointer"
                        onClick={() => router.push("/dashboard")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-1 sm:mr-2" /> Back
                    </button>
                </div>

                {/* Hero Section */}
                <div className="flex items-center justify-center bg-white sm:mb-2">
                    <div className="text-center px-2 sm:px-4">
                        <p className="text-sm sm:text-base lg:text-xl xl:text-2xl font-medium leading-relaxed font-montserrat-600">
                            Your complete <span className="text-blue-800 font-semibold">  MEDICAL HISTORY</span>, always at your fingertips with <span className="text-blue-800 font-semibold">HFiles</span>.
                        </p>
                        <div className="border-t border-black w-24 sm:w-32 lg:w-36 mx-auto mt-2"></div>
                    </div>
                </div>

                {/* Share Button */}
                <button className="border border-gray-400 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded primary text-white mb-3 sm:mb-4" onClick={HandlePdf} >
                    <FontAwesomeIcon icon={faShareAlt} className="mr-1 sm:mr-2" />
                    Share
                </button>

                {/* Main Card */}
                <div className="bg-white shadow-lg rounded-lg flex flex-col border border-gray-300 lg:flex-row gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                    {/* Left Panel - Profile */}
                    {medicalData && (
                        <AddMetrixData
                            medicalData={medicalData}
                            weightKg={weightKg}
                            setIsModified={setIsModified}
                            setWeightKg={setWeightKg}
                            heightFeet={heightFeet}
                            setHeightFeet={setHeightFeet}
                            heightInches={heightInches}
                            setHeightInches={setHeightInches}
                            bmi={bmi}
                            isModified={isModified}
                            handleSaveMetrics={handleSaveMetrics}
                            setShowDropdown={setShowDropdown}
                            showDropdown={showDropdown}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                            memberList={memberList}

                        />
                    )}

                    {/* Right Panel - Social History */}
                    <MedicalTable
                        habits={habits}
                        habitSelections={habitSelections}
                        handleSelectionChange={handleSelectionChange}
                        setISocial={setISocial}
                        isSocial={isSocial}
                        handleSubmits={handleSubmits}
                    />
                </div>

                {/* Medical Prescription Section */}
                <div className='mt-3 sm:mt-4 mx-1 sm:mx-3'>
                    <p className='text-blue-800 font-bold text-base sm:text-lg lg:text-xl font-poppins'>View Medical Prescription</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-lg shadow-sm border px-3 sm:px-4 py-3 mx-1 sm:mx-4 mt-2 sm:mt-4 gap-3 sm:gap-0">
                    <p className="text-gray-800 text-xs sm:text-sm lg:text-base font-montserrat-600">
                        Easily access your family's prescriptions whenever you need.
                    </p>
                    <button
                        onClick={handleNavigation}
                        style={{ background: 'rgba(249, 227, 128, 1)' }}
                        className="text-gray-900 font-poppins text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-md shadow-sm transition cursor-pointer w-full sm:w-auto"
                    >
                        Family prescription
                    </button>
                </div>

                {/* Allergies Section */}
                <div className='mt-3 sm:mt-4 mx-1 sm:mx-3'>
                    <p className='text-blue-800 font-bold text-base sm:text-lg lg:text-xl font-poppins'>Update your Allergies</p>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border px-3 sm:px-4 py-3 mx-1 sm:mx-4 mt-2 sm:mt-4 cursor-pointer" onClick={toggleAllergySection}>
                    <p className="text-gray-800 text-xs sm:text-sm lg:text-base font-montserrat-600">
                        Know your allergies and take control. Add them now for safer, healthier living!
                    </p>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-blue-700 w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isAllergyOpen ? 'rotate-180' : ''}`} />
                </div>
                {isAllergyOpen && (
                    <AllergryPart renderAllergyWarning={renderAllergyWarning} listAllergies={listAllergies} allergySelections={allergySelections}
                        medications={medications} toggleMedicationDropdown={toggleMedicationDropdown} isMedicationDropdownOpen={isMedicationDropdownOpen}
                        handleAllergyChange={handleAllergyChange} toggleMedicationTextarea={toggleMedicationTextarea} isMedicationTextareaOpen={isMedicationTextareaOpen}
                        medicationTextarea={medicationTextarea} setMedicationTextarea={setMedicationTextarea} setIsMedicationTextareaOpen={setIsMedicationTextareaOpen} handleSaveMedicationTextarea={handleSaveMedicationTextarea}
                        toggleModal={toggleModal} handleSaveAllergies={handleSaveAllergies} isAllergySaving={isAllergySaving}
                        openAllergyEditModal={openAllergyEditModal} closeMedicationModal={closeMedicationModal} />
                )}

                {/* Medical History Section */}
                <div className='mt-3 sm:mt-4 mx-1 sm:mx-3'>
                    <p className='text-blue-800 font-bold text-base sm:text-lg lg:text-xl font-poppins'>Update your Medical History</p>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border px-3 sm:px-4 py-3 mx-1 sm:mx-4 mt-2 sm:mt-4 cursor-pointer" onClick={toggleMedicalSection}>
                    <p className="text-gray-800 text-xs sm:text-sm lg:text-base font-montserrate-600">
                        Stay ahead with your family health history. Update now for better care.
                    </p>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-blue-700 w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isMedicalOpen ? 'rotate-180' : ''}`} />
                </div>

                {isMedicalOpen && (
                    <MedicalOpenModal medicalHistory={medicalHistory} selectedDiseases={selectedDiseases} setSelectedDiseases={setSelectedDiseases} toggleDiseaseModal={toggleDiseaseModal} handleSaveDiseases={handleSaveDiseases}
                        handleEditDisease={handleEditDisease}
                        handleDeleteDisease={handleDeleteDisease} />
                )}

                {/* Surgical History Section */}
                <div className="mt-3 sm:mt-4 mx-1 sm:mx-3">
                    <div className="flex justify-start mb-2">
                        <p className="text-blue-800 text-base sm:text-lg lg:text-xl font-bold font-poppins">Surgical History</p>
                    </div>

                    <div className="border border-gray-300 rounded-lg p-3 sm:p-4 lg:p-6 bg-white shadow-sm">
                        {showForm ? (
                            <SurgicalHistory
                                formData={formData}
                                handleChange={handleChange}
                                errors={errors}
                                handleSubmit={handleSubmit}
                            />
                        ) : isLoading ? (
                            <div className="text-center py-6 sm:py-8">
                                <p className="text-gray-600 text-sm sm:text-base">Loading surgical history...</p>
                            </div>
                        ) : !historyList || historyList.length === 0 ? (
                            <div className="text-center">
                                <div className="inline-block border-b-1 border-gray-400 pb-1 px-4 sm:px-6">
                                    <p className="text-blue-800 text-base sm:text-lg lg:text-xl font-bold">Surgical History</p>
                                </div>
                                <p className="text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base px-2 sm:px-0">
                                    If you've had a surgery, add it now to keep a complete track of your medical history.
                                </p>
                                <button
                                    className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-semibold rounded border border-black text-sm sm:text-base"
                                    onClick={() => setShowForm(true)}
                                >
                                    Add Your First Surgery
                                </button>
                            </div>
                        ) : (
                            <AddSurgeryDetails historyList={historyList} handleEdit={handleEdit} setShowForm={setShowForm} />
                        )}
                    </div>
                </div>

                {/* Add Allergy Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-blue-800">Add New Allergy</h2>
                                <button onClick={toggleModal} className="text-gray-500 hover:text-gray-700">
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded mb-3 sm:mb-4 text-sm sm:text-base"
                                placeholder="Enter allergy type"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddAllergy}
                                    className="primary text-white font-semibold px-4 py-2 rounded hover:bg-blue-800 text-sm sm:text-base"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Disease Modal */}
                {isDiseaseModalOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-blue-800">Add Your Disease</h2>
                                <button onClick={toggleDiseaseModal} className="text-gray-500 hover:text-gray-700">
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={newDisease}
                                onChange={(e) => setNewDisease(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded mb-3 sm:mb-4 text-sm sm:text-base"
                                placeholder="Enter disease name"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddDisease}
                                    className="primary text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Allergy Modal */}
                {isAllergyEditModalOpen && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4">
                            <div className="flex justify-between items-center mb-3 sm:mb-4">
                                <h2 className="text-base sm:text-lg font-semibold text-blue-800">Edit Allergy</h2>
                                <button onClick={closeAllergyEditModal} className="text-gray-500 hover:text-gray-700">
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={editingAllergyName}
                                onChange={(e) => setEditingAllergyName(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded mb-3 sm:mb-4 text-sm sm:text-base"
                                placeholder="Enter allergy name"
                            />
                            <div className="flex justify-between">
                                <button
                                    onClick={() => editingAllergyId && handleDeleteAllergy(editingAllergyId)}
                                    className="bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => editingAllergyId && handleEditAllergy(editingAllergyId, editingAllergyName)}
                                    className="primary text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Medication Modal */}
                {isMedicationModalOpen && (
                    <MedicationModal
                        closeMedicationModal={closeMedicationModal}
                        newMedication={newMedication}
                        setNewMedication={setNewMedication}
                        medications={medications}
                        handleDoneMedicationModal={handleDoneMedicationModal}
                    />
                )}
                {/* Edit Modal */}
                {isEditModalOpen && (
                    <SurgeryEditModal
                        editFormik={editFormik}
                        handleDeleteSurgery={handleDeleteSurgery}
                        handleCloseEditModal={handleCloseEditModal}
                    />
                )}
            </div>
            <ToastContainer />
        </MasterHome>
    );
};

export default MedicalPage;