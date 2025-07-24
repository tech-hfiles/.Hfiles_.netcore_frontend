import React, { useState } from 'react';
import CustomRadioButton from './CustomRadioButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

type Disease = {
    id: number;
    diseaseType: string;
    myself: boolean;
    motherSide: boolean;
    fatherSide: boolean;
    type: 'static' | 'dynamic';
};

interface MedicalOpenModalProps {
    medicalHistory: Disease[];
    selectedDiseases: any;
    setSelectedDiseases: (value: any) => void;
    toggleDiseaseModal: () => void;
    handleSaveDiseases: () => void;
    onEditDisease?: (diseaseId: number, diseaseName: string) => void;
    onDeleteDisease?: (diseaseId: number) => void;
}

interface EditDiseaseModalProps {
    isOpen: boolean;
    diseaseId: number;
    currentName: string;
    onClose: () => void;
    onSave: (diseaseId: number, newName: string) => void;
    onDelete: (diseaseId: number) => void;
}

const MedicalOpenModal: React.FC<EditDiseaseModalProps> = ({
    isOpen,
    diseaseId,
    currentName,
    onClose,
    onSave,
    onDelete
}) => {
    const [diseaseName, setDiseaseName] = useState(currentName);

    const handleSave = () => {
        if (diseaseName.trim()) {
            onSave(diseaseId, diseaseName.trim());
            onClose();
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this disease?')) {
            onDelete(diseaseId);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-blue-800">Edit Disease</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Disease Name
                    </label>
                    <input
                        type="text"
                        value={diseaseName}
                        onChange={(e) => setDiseaseName(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded text-sm sm:text-base"
                        placeholder="Enter disease name"
                    />
                </div>

                <div className="flex justify-between gap-3">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                        Delete
                    </button>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default MedicalOpenModal;