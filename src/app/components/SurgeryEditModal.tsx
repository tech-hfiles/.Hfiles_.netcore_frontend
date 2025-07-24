import { FormikProps } from 'formik';
import React from 'react'

interface SurgeryFormValues {
    surgeryName: string;
    hospitalName: string;
    drName: string;
    surgeryDate: string;
}

interface SurgeryEditModalProps {
    editFormik: FormikProps<SurgeryFormValues>;
    handleDeleteSurgery: () => void;
    handleCloseEditModal: () => void;
}
const SurgeryEditModal: React.FC<SurgeryEditModalProps> = ({
    editFormik,
    handleDeleteSurgery,
    handleCloseEditModal,
}) => {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-blue-800">Surgical History</h2>
                    <div className="border-t border-blue-800 w-32 sm:w-40 lg:w-70 mx-auto mt-2"></div>
                </div>

                <form onSubmit={editFormik.handleSubmit}>
                    {/* Surgery Details */}
                    <div className="mb-3 sm:mb-4">
                        <div className="bg-blue-100 text-center py-2 px-4 mb-2 rounded-lg border">
                            <span className="text-sm sm:text-lg font-bold text-black">Surgery Details</span>
                        </div>
                        <textarea
                            name="surgeryName"
                            value={editFormik.values.surgeryName}
                            onChange={editFormik.handleChange}
                            onBlur={editFormik.handleBlur}
                            className={`w-full border ${editFormik.touched.surgeryName && editFormik.errors.surgeryName ? 'border-red-500' : 'border-black'} px-3 py-2 rounded-lg h-20 sm:h-24 resize-none text-sm sm:text-base`}
                            placeholder="Enter surgery details..."
                        />
                        {editFormik.touched.surgeryName && editFormik.errors.surgeryName && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">{editFormik.errors.surgeryName}</p>
                        )}
                    </div>

                    {/* Doctor's Name */}
                    <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-bold text-black mb-1">
                            Doctor's Name:
                        </label>
                        <input
                            type="text"
                            name="drName"
                            value={editFormik.values.drName}
                            onChange={editFormik.handleChange}
                            onBlur={editFormik.handleBlur}
                            className={`w-full border ${editFormik.touched.drName && editFormik.errors.drName ? 'border-red-500' : 'border-black'} px-3 py-2 rounded text-sm sm:text-base`}
                            placeholder="Enter doctor's name"
                        />
                        {editFormik.touched.drName && editFormik.errors.drName && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">{editFormik.errors.drName}</p>
                        )}
                    </div>

                    {/* Hospital Name */}
                    <div className="mb-3 sm:mb-4">
                        <label className="block text-xs sm:text-sm font-bold text-black mb-1">
                            Hospital Name:
                        </label>
                        <input
                            type="text"
                            name="hospitalName"
                            value={editFormik.values.hospitalName}
                            onChange={editFormik.handleChange}
                            onBlur={editFormik.handleBlur}
                            className={`w-full border ${editFormik.touched.hospitalName && editFormik.errors.hospitalName ? 'border-red-500' : 'border-black'} px-3 py-2 rounded text-sm sm:text-base`}
                            placeholder="Enter hospital name"
                        />
                        {editFormik.touched.hospitalName && editFormik.errors.hospitalName && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">{editFormik.errors.hospitalName}</p>
                        )}
                    </div>
                    <div className="w-24 sm:w-32 lg:w-[120px] border border-black mb-2 mx-auto"></div>

                    {/* Surgery Date */}
                    <div className="mb-4 sm:mb-6">
                        <label className="block text-xs sm:text-sm font-bold text-blue-800 mb-1">
                            Surgery Date
                        </label>
                        <input
                            type="date"
                            name="surgeryDate"
                            value={editFormik.values.surgeryDate}
                            onChange={editFormik.handleChange}
                            onBlur={editFormik.handleBlur}
                            className={`w-full border ${editFormik.touched.surgeryDate && editFormik.errors.surgeryDate ? 'border-red-500' : 'border-black'} px-3 py-2 rounded text-sm sm:text-base`}
                        />
                        {editFormik.touched.surgeryDate && editFormik.errors.surgeryDate && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">{editFormik.errors.surgeryDate}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                        <button
                            type="button"
                            onClick={handleDeleteSurgery}
                            className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base w-full sm:w-auto"
                        >
                            Delete
                        </button>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={handleCloseEditModal}
                                className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm sm:text-base w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 sm:px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SurgeryEditModal
