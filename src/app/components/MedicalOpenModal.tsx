import React, { useState } from 'react';
import CustomRadioButton from './CustomRadioButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import EditDiseaseModal from './EditDiseaseModal';

type Disease = {
    id: number;
    diseaseType: string;
    myself: boolean;
    motherSide: boolean;
    fatherSide: boolean;
};

interface MedicalOpenModalProps {
    medicalHistory: any;
    selectedDiseases: any;
    setSelectedDiseases: (value: any) => void;
    toggleDiseaseModal: () => void;
    handleSaveDiseases: () => void;
    handleDeleteDisease?: (diseaseId: number) => void;
    handleEditDisease?: (diseaseId: number, newName: string) => void
}

const MedicalOpenModal: React.FC<MedicalOpenModalProps> = ({
    medicalHistory,
    selectedDiseases,
    setSelectedDiseases,
    toggleDiseaseModal,
    handleSaveDiseases,
    handleEditDisease,
    handleDeleteDisease
}) => {
    const [editMode, setEditMode] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingDisease, setEditingDisease] = useState<{ id: number, name: string } | null>(null);

    const handleEditModeToggle = () => setEditMode(!editMode);

    const openEditModal = (diseaseId: number, diseaseName: string) => {
        setEditingDisease({ id: diseaseId, name: diseaseName });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingDisease(null);
    };

    const handleEditSave = (diseaseId: number, newName: string) => {
        if (handleEditDisease) {
            handleEditDisease(diseaseId, newName);
        }
    };

    const handleEditDelete = (diseaseId: number) => {
        if (handleDeleteDisease) {
            handleDeleteDisease(diseaseId);
        }
    };

    const renderDesktopRow = (item: any, index: number) => {
        const key = item.type === 'static'
            ? `static-${index}-${item.diseaseType}`
            : `dynamic-${item.id}`;

        const label = item.diseaseType
            ? item.diseaseType.charAt(0).toUpperCase() + item.diseaseType.slice(1)
            : `Disease ${index + 1}`;

        const selected = selectedDiseases[key] || {
            myself: false,
            motherSide: false,
            fatherSide: false,
        };

        const handleChange = (field: keyof typeof selected) => {
            setSelectedDiseases((prev: any) => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    [field]: !prev[key]?.[field],
                },
            }));
        };

        // Edit mode for dynamic types - show checkbox with label and edit button
        if (editMode && item.type === 'dynamic') {
            return (
                <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                    <td colSpan={3} className="py-4 px-4">
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600"
                                checked={selected.myself}
                                onChange={() => handleChange("myself")}
                            />
                            <span className="text-sm text-gray-800">{label}</span>
                        </label>
                    </td>
                    <td className="py-4 px-4 text-right">
                        <button
                            onClick={() => openEditModal(item.id, item.diseaseType)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                            Edit
                        </button>
                    </td>
                </tr>
            );
        }

        // Normal radio buttons (for static or when edit mode is off)
        return (
            <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4 px-4 text-gray-800 font-medium">
                    <div className="flex items-center">
                        <span>{label}</span>
                        {!editMode && item.type === 'dynamic' && (
                            <button
                                onClick={() => openEditModal(item.id, item.diseaseType)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors ml-2"
                            >
                                <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </td>
                <td className="py-4 px-4">
                    <div className="flex justify-center items-center">
                        <CustomRadioButton
                            name={`${key}-self`}
                            checked={selected.myself}
                            onChange={() => handleChange("myself")}
                            value=""
                        />
                    </div>
                </td>
                <td className="py-4 px-4">
                    <div className="flex justify-center items-center">
                        <CustomRadioButton
                            name={`${key}-mother`}
                            checked={selected.motherSide}
                            onChange={() => handleChange("motherSide")}
                            value=""
                        />
                    </div>
                </td>
                <td className="py-4 px-4">
                    <div className="flex justify-center items-center">
                        <CustomRadioButton
                            name={`${key}-father`}
                            checked={selected.fatherSide}
                            onChange={() => handleChange("fatherSide")}
                            value=""
                        />
                    </div>
                </td>
            </tr>
        );
    };

    const renderDesktopTableHeader = () => (
        <thead>
            <tr className="border-b-2">
                <th className="py-3 px-4 text-left font-montserrat-600 text-gray-700 text-base">Type</th>
                {!editMode && (
                    <>
                        <th className="py-3 px-4 text-center font-montserrat-600 text-gray-700 text-base">Myself</th>
                        <th className="py-3 px-4 text-center font-montserrat-600 text-gray-700 text-base">Mother's</th>
                        <th className="py-3 px-4 text-center font-montserrat-600 text-gray-700 text-base">Father's</th>
                    </>
                )}
            </tr>
        </thead>
    );

    return (
        <>
            <div className="mx-1 sm:mx-4 mt-2">
                {/* Mobile View - Table Format */}
                <div className="block lg:hidden">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[250px]">
                                <thead>
                                    <tr className="border-b-2 border-gray-300 bg-gray-50">
                                        <th className="py-2 px-2 text-left font-montserrat-600 text-gray-700 text-xs">Disease</th>
                                        {!editMode && (
                                            <>
                                                <th className="py-2 px-1 text-center font-montserrat-600 text-gray-700 text-xs">Self</th>
                                                <th className="py-2 px-1 text-center font-montserrat-600 text-gray-700 text-xs">Mother</th>
                                                <th className="py-2 px-1 text-center font-montserrat-600 text-gray-700 text-xs">Father</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicalHistory.map((item: any, index: number) => {
                                        const key = item.type === 'static'
                                            ? `static-${index}-${item.diseaseType}`
                                            : `dynamic-${item.id}`;

                                        const label = item.diseaseType
                                            ? item.diseaseType.charAt(0).toUpperCase() + item.diseaseType.slice(1)
                                            : `Disease ${index + 1}`;

                                        const selected = selectedDiseases[key] || {
                                            myself: false,
                                            motherSide: false,
                                            fatherSide: false,
                                        };

                                        const handleChange = (field: keyof typeof selected) => {
                                            setSelectedDiseases((prev: any) => ({
                                                ...prev,
                                                [key]: {
                                                    ...prev[key],
                                                    [field]: !prev[key]?.[field],
                                                },
                                            }));
                                        };

                                        if (editMode && item.type === 'dynamic') {
                                            return (
                                                <tr key={key} className="border-b border-gray-200">
                                                    <td colSpan={4} className="py-3 px-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox h-4 w-4 text-blue-600"
                                                                    checked={selected.myself}
                                                                    onChange={() => handleChange("myself")}
                                                                />
                                                                <span className="text-xs text-gray-800">{label}</span>
                                                            </label>
                                                            <button
                                                                onClick={() => openEditModal(item.id, item.diseaseType)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (
                                            <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-2 text-gray-800 font-medium">
                                                    <div className="flex items-center">
                                                        <span className="text-xs leading-tight">{label}</span>
                                                        {item.type === 'dynamic' && (
                                                            <button
                                                                onClick={() => openEditModal(item.id, item.diseaseType)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors ml-2"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-1">
                                                    <div className="flex justify-center items-center">
                                                        <CustomRadioButton
                                                            name={`${key}-self`}
                                                            checked={selected.myself}
                                                            onChange={() => handleChange("myself")}
                                                            value=""
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-1">
                                                    <div className="flex justify-center items-center">
                                                        <CustomRadioButton
                                                            name={`${key}-mother`}
                                                            checked={selected.motherSide}
                                                            onChange={() => handleChange("motherSide")}
                                                            value=""
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-3 px-1">
                                                    <div className="flex justify-center items-center">
                                                        <CustomRadioButton
                                                            name={`${key}-father`}
                                                            checked={selected.fatherSide}
                                                            onChange={() => handleChange("fatherSide")}
                                                            value=""
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Footer */}
                        <div className="px-3 py-4 border-t border-gray-200">
                            <button
                                onClick={toggleDiseaseModal}
                                className="text-blue-800 hover:text-blue-800 text-sm font-medium transition-colors py-2"
                            >
                                Your disease isn't here? Add your own...
                            </button>

                            <button
                                onClick={handleSaveDiseases}
                                  className="w-full px-4 py-1 rounded-lg font-montserrat-600 text-white primary hover:shadow-md transition-all duration-200"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop View - Always Single Table */}
                <div className="hidden lg:block">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-2">
                        <table className="w-full">
                            {renderDesktopTableHeader()}
                            <tbody>
                                {medicalHistory.map((item: Disease, index: number) =>
                                    renderDesktopRow(item, index)
                                )}
                            </tbody>
                        </table>
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleDiseaseModal}
                                        className="text-center text-blue-800 hover:text-blue-800 text-sm font-medium transition-colors py-2"
                                    >
                                        Your disease isn't here? Add your own...
                                    </button>
                                </div>
                                <button
                                    onClick={handleSaveDiseases}
                                    className="px-6 py-2 rounded-lg font-montserrat-600 text-white primary hover:shadow-md transition-all duration-200"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Disease Modal */}
            {editModalOpen && editingDisease && (
                <EditDiseaseModal
                    isOpen={editModalOpen}
                    diseaseId={editingDisease.id}
                    currentName={editingDisease.name}
                    onClose={closeEditModal}
                    onSave={handleEditSave}
                    onDelete={handleEditDelete}
                />
            )}
        </>
    );
};

export default MedicalOpenModal;





 