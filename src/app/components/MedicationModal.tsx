import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

interface MedicationModalProps {
    closeMedicationModal: () => void;
    newMedication: string;
    setNewMedication: (value: string) => void;
    handleAddMedication: () => void;
    medications: string[];
    handleDoneMedicationModal: () => void;
    handleRemoveMedication?: (index: number) => void; // Add this prop
}

const MedicationModal: React.FC<MedicationModalProps> = ({ 
    closeMedicationModal, 
    newMedication, 
    setNewMedication, 
    handleAddMedication, 
    medications, 
    handleDoneMedicationModal,
    handleRemoveMedication 
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

                {/* Medication Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                        className="w-full border border-gray-300 px-3 py-2 rounded text-sm"
                        placeholder="Enter medication name and press Enter"
                    />
                </div>

                {/* Medications List */}
                {medications.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Added Medications:</h3>
                        <div className="max-h-40 overflow-y-auto">
                            {medications.map((medication: string, index: number) => (
                                <div key={index} className="bg-gray-100 p-2 rounded mb-2 flex justify-between items-center">
                                    <span className="text-sm text-gray-800">{medication}</span>
                                    {handleRemoveMedication && (
                                        <button
                                            onClick={() => handleRemoveMedication(index)}
                                            className="text-red-500 hover:text-red-700 text-xs ml-2"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Debug Information */}
                <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
                    <p className="text-gray-600">Debug: {medications.length} medications loaded</p>
                    {medications.length > 0 && (
                        <p className="text-gray-600">Medications: {medications.join(', ')}</p>
                    )}
                </div>

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
    )
}

export default MedicationModal