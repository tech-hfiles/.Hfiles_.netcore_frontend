import { Upload, X } from 'lucide-react'
import React from 'react'

interface AddReportsModalProps {
    closeModal: any;
    isSubmitting: any;
    reportType: any;
    setReportType: any;
    reportTypes: any;
    fileName: any;
    setFileName: any;
    handleFileChange: any;
    selectedFile: any;
    independent: any;
    selectedIndependentIds: any;
    handleCheckboxChange: any;
    handleSubmitReport: any;
}

const AddReportsModal: React.FC<AddReportsModalProps> = ({ closeModal, isSubmitting, reportType, setReportType, reportTypes, fileName, setFileName,
    handleFileChange, selectedFile, independent, selectedIndependentIds, handleCheckboxChange, handleSubmitReport
}) => {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Add New Report</h2>
                    <button
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Form */}
                <div className="space-y-4">
                    {/* Report Type Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Report Type *
                        </label>
                        <select
                            name="reportType"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                        >
                            <option value="" disabled>Select a report</option>
                            {reportTypes.map((type: any) => (
                                <option key={type.Id} value={type.Name}>
                                    {type.Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* File Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Name *
                        </label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Enter file name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select File *
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                                className="hidden"
                                id="file-upload"
                                accept="*/*"
                            />
                            <label
                                htmlFor="file-upload"
                                className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">
                                        {selectedFile ? selectedFile.name : 'Click to upload file'}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        All file types supported (Max: 10MB)
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        {independent?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Independent Members (optional)
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded">
                                    {independent.map((member: any) => (
                                        <label key={member.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIndependentIds.includes(member.id)}
                                                onChange={() => handleCheckboxChange(member.id)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {member.firstName} {member.lastName}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex space-x-3 mt-6">
                    <button
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitReport}
                        disabled={!reportType || !fileName || !selectedFile || isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Adding Report..." : "Add Report"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddReportsModal
