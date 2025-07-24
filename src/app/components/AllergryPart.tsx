import React from 'react'
import CustomRadioButton from './CustomRadioButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEdit } from '@fortawesome/free-solid-svg-icons';

interface AllergyItem {
    allergyType?: string;
    allergyName?: string;
    isAllergic: boolean;
    medicationNames?: string[];
    staticAllergyId?: number;
    id?: number; // Add this for dynamic allergies
}

interface AllergyPartProps {
    renderAllergyWarning: () => any;
    listAllergies: any[]; // Replace 'any' with your actual allergy type
    allergySelections: { [key: string]: boolean };
    medications: string[];
    toggleMedicationDropdown: () => void;
    isMedicationDropdownOpen: boolean;
    handleAllergyChange: (index: number, value: boolean) => void;
    toggleMedicationTextarea: () => void;
    isMedicationTextareaOpen: boolean;
    medicationTextarea: string;
    setMedicationTextarea: (value: string) => void;
    setIsMedicationTextareaOpen: (value: boolean) => void;
    handleSaveMedicationTextarea: () => void;
    toggleModal: () => void;
    handleSaveAllergies: () => void;
    isAllergySaving: boolean;
    openAllergyEditModal: (allergyId: number, allergyName: string) => void;
}

const AllergryPart: React.FC<AllergyPartProps> = ({
    renderAllergyWarning,
    listAllergies,
    allergySelections,
    medications,
    toggleMedicationDropdown,
    isMedicationDropdownOpen,
    handleAllergyChange,
    toggleMedicationTextarea,
    isMedicationTextareaOpen,
    medicationTextarea,
    setMedicationTextarea,
    setIsMedicationTextareaOpen,
    handleSaveMedicationTextarea,
    toggleModal,
    handleSaveAllergies,
    isAllergySaving,
    openAllergyEditModal
}) => {
    const midPoint = Math.ceil(listAllergies.length / 2);
    const leftAllergies = listAllergies.slice(0, midPoint);
    const rightAllergies = listAllergies.slice(midPoint);

    // Function to render allergy rows
    const renderAllergyRows = (allergies: AllergyItem[], startIndex: number) => {
        return allergies?.map((allergy: AllergyItem, localIndex: number) => {
            const index = startIndex + localIndex;
            const allergyName = allergy.allergyType || allergy.allergyName || '';
            const isMedicationAllergy = allergyName.toLowerCase() === 'medications';
            const isSelected = allergySelections[`allergy-${index}`] === true;

            // Multiple ways to check if this is a dynamic allergy
            const isDynamicAllergy = !!(allergy.allergyName);
            const hasStaticAllergyId = !!(allergy.staticAllergyId);
            const hasId = !!(allergy.id);

            // For edit functionality, we need either id or some way to identify the allergy
            const canEdit = isDynamicAllergy && (hasId || allergyName);
            const allergyIdForEdit = allergy.id || index;

            return (
                <React.Fragment key={index}>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                         <td className="py-2 sm:py-3 px-2 sm:px-4 text-black">
                            <div className="flex items-center gap-2">
                                <span>{allergyName}</span>

                                {isDynamicAllergy && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openAllergyEditModal(allergyIdForEdit, allergyName);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Edit allergy"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                                    </button>
                                )}

                                {isMedicationAllergy && isSelected && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMedicationDropdown();
                                        }}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Toggle medication details"
                                    >
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`w-3 h-3 transition-transform ${isMedicationDropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center align-middle">
                            <div className="flex justify-center items-center">
                                <CustomRadioButton
                                    name={`allergy-${index}`}
                                    value="yes"
                                    checked={allergySelections[`allergy-${index}`] === true}
                                    onChange={() => handleAllergyChange(index, true)}
                                />
                            </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center align-middle">
                            <div className="flex justify-center items-center">
                                <CustomRadioButton
                                    name={`allergy-${index}`}
                                    value="no"
                                    checked={allergySelections[`allergy-${index}`] === false}
                                    onChange={() => handleAllergyChange(index, false)}
                                />
                            </div>
                        </td>
                    </tr>

                    {/* Medication Textarea Section */}
                    {isMedicationAllergy && isSelected && isMedicationDropdownOpen && (
                        <tr key={`medication-${index}`} className="border-b border-gray-200">
                            <td colSpan={3} className="px-2 sm:px-4 py-3 bg-gray-50">
                                <div className="border border-gray-200 rounded-lg p-4 medication-dropdown" onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMedicationTextarea();
                                }}>
                                    <div className="flex items-center gap-2 mb-3 cursor-pointer" >
                                        <h4 className="text-sm font-semibold text-gray-700">Medications:</h4>
                                    </div>

                                    <div className="space-y-3">
                                        <textarea
                                            value={medicationTextarea}
                                            onChange={(e) => setMedicationTextarea(e.target.value)}
                                            className="w-full border border-gray-300 px-3 py-2 rounded text-sm min-h-[120px] resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter medication names (one per line)&#10;Example:&#10;Aspirin&#10;Ibuprofen&#10;Paracetamol"
                                            autoFocus
                                            style={{
                                                caretColor: 'auto',
                                                cursor: 'text'
                                            }}
                                            spellCheck={false}
                                        />
                                        <div className="text-xs text-gray-500">
                                            Enter each medication on a separate line
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => setIsMedicationTextareaOpen(false)}
                                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveMedicationTextarea}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-montserrat-600"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm px-3 sm:px-4 py-3 mx-1 sm:mx-4 mt-2">
            {renderAllergyWarning()}

            {/* Two Tables Side by Side */}
            <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-200">
                {/* Left Table */}
                <div className="flex-1 overflow-x-auto lg:pr-4">
                    <table className="w-full text-xs sm:text-sm border-collapse min-w-[200px]">
                        <thead>
                            <tr className="text-left border-b-2">
                                <th className="py-2 sm:py-3 px-2 sm:px-4 font-montserrat-600">Type</th>
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center font-montserrat-600">Yes</th>
                                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center font-montserrat-600">No</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {renderAllergyRows(leftAllergies, 0)}
                        </tbody>
                    </table>
                </div>

                {/* Right Table */}
                <div className="flex-1 overflow-x-auto lg:pl-4">
                    <table className="w-full text-xs sm:text-sm border-collapse min-w-[200px]">
                        <thead>
                            <tr className="text-left border-b-2">
                                <th className="py-2 sm:py-3 px-2 sm:px-4 font-montserrat-600">Type</th>
                                <th className="py-2 sm:py-3 px-4 sm:px-4 text-center font-montserrat-600">Yes</th>
                                <th className="py-2 sm:py-3 px-4 sm:px-4 text-center font-montserrat-600">No</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {renderAllergyRows(rightAllergies, midPoint)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Section */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 px-2 sm:px-4 pt-4">
                <span className="text-blue-800 cursor-pointer text-xs sm:text-sm hover:text-blue-600 transition-colors font-montserrat-600" onClick={toggleModal}>
                    Your Allergy isn't here? Add your own...
                </span>
                <button
                    onClick={handleSaveAllergies}
                    disabled={isAllergySaving}
                    className={`primary text-white font-montserrat-600 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2 rounded-md shadow-sm w-full sm:w-auto
                        ${isAllergySaving ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-blue-700'}
                    `}
                >
                    {isAllergySaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    )
}

export default AllergryPart