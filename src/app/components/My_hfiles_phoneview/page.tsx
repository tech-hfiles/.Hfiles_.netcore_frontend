/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useState } from 'react';
import { FaFolderPlus, FaFileMedicalAlt, FaArrowRight } from 'react-icons/fa';
import {  X, Upload } from 'lucide-react';
import './style.css';
import { useRouter } from 'next/navigation';

type User = {
    id: number;
    name: string;
    profileURL?: string;
};

interface My_hfiles_phoneviewProps {
    // Report functionality
    onReportClick: (reportType: string) => void;
    handleAllReportsClick: () => void;
    handleFolderClick: () => void;

    // User management
    users: User[];
    selectedUser: string;
    selectedUserId: number;
    userNameFromStorage: string;
    userIdFromStorage: number;
    handleUserSelection: (userName: string, userId: number) => void;
    onAddMember: () => void;

    // Modal and report submission
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    reportType: string;
    setReportType: (type: string) => void;
    fileName: string;
    setFileName: (name: string) => void;
    selectedFile: File | null;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isSubmitting: boolean;
    handleSubmitReport: () => void;
    closeModal: () => void;

    // Independent members for sharing
    independent: any[];
    selectedIndependentIds: number[];
    handleCheckboxChange: (memberId: number) => void;

    // Storage information
    storage: any;

    // Report types
    reportTypes: Array<{ Id: number, Name: string }>;
}

const My_hfiles_phoneview = ({
    onReportClick,
    handleAllReportsClick,
    handleFolderClick,
    users = [],
    selectedUser,
    selectedUserId,
    userNameFromStorage,
    userIdFromStorage,
    handleUserSelection,
    onAddMember,
    isModalOpen,
    setIsModalOpen,
    reportType,
    setReportType,
    fileName,
    setFileName,
    selectedFile,
    handleFileChange,
    isSubmitting,
    handleSubmitReport,
    closeModal,
    independent = [],
    selectedIndependentIds,
    handleCheckboxChange,
    storage,
    reportTypes
}: My_hfiles_phoneviewProps) => {
      const router = useRouter();

    return (
        <div className="">
            <SpotlightCard
                users={users}
                selectedUser={selectedUser}
                handleUserSelection={handleUserSelection}
                userNameFromStorage={userNameFromStorage}
                userIdFromStorage={userIdFromStorage}
                onAddMember={onAddMember}
            />

            <div className="p-4 space-y-4">
                {/* Top buttons */}
                <div className="flex flex-row whitespace-nowrap gap-3 w-full">
                    {/* Add Reports Button */}
                    <button
                        className="flex custom_create_folder items-center justify-center gap-2 px-4 py-2 border border-black rounded-md text-black font-medium text-sm sm:text-base flex-1"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isSubmitting}
                    >
                        <FaFileMedicalAlt className="text-black custom_icon text-base sm:text-lg" />
                        <span className="leading-none">{isSubmitting ? "Adding Report..." : "Add Reports"}</span>
                    </button>

                    {/* Create Folder Button */}
                    <button
                        className="flex custom_create_folder items-center justify-center gap-2 px-4 py-2 bg-[#FFE37D] border border-black rounded-md text-black font-medium text-sm sm:text-base flex-1"
                        onClick={handleFolderClick}
                    >
                        <FaFolderPlus className="text-black custom_icon text-base sm:text-lg" />
                        <span className="leading-none">Create Folder</span>
                    </button>
                </div>

                {/* Add Family Members Link */}
                <button
                    className="flex items-center custom_add_family border border-black justify-between w-full px-4 py-2 rounded-md text-[#0331B5] font-medium"
                    onClick={onAddMember}
                >
                    <span className="leading-none">Add Your Family Members</span>
                    <FaArrowRight className="ml-2 text-[#0331B5]" />
                </button>
            </div>

            <ViewReports onReportClick={onReportClick} />

            <div className="bg-white text-center p-3 shadow-sm">
                      <span className="text-[15px] text-black">
      Out of space? Click here to{' '}
      <span
        onClick={() => router.push("/SubscriptionPlan")}
        className="text-[#0331b5] font-montserrat-600 underline hover:text-[#0331b5] cursor-pointer"
      >
        Upgrade your storage.
      </span>
    </span>
            </div>

            {/* Add Reports Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                                    {reportTypes.map((type) => (
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
                                        id="file-upload-mobile"
                                        accept="*/*"
                                    />
                                    <label
                                        htmlFor="file-upload-mobile"
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

                            {/* Independent Members */}
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
            )}
        </div>
    );
};

export default My_hfiles_phoneview;

interface SpotlightCardProps {
    users: User[];
    selectedUser: string;
    handleUserSelection: (userName: string, userId: number) => void;
    userNameFromStorage: string;
    userIdFromStorage: number;
    onAddMember: () => void;
}

function SpotlightCard({
    users,
    selectedUser,
    handleUserSelection,
    userNameFromStorage,
    userIdFromStorage,
    onAddMember
}: SpotlightCardProps) {
    const [showUsersList, setShowUsersList] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center relative">
            {/* Spotlight Background */}
            <div className="relative w-[20rem] h-[14rem]">
                {/* Background Light Image */}
                <img
                    src="/86d6da8763537d75129226caabec832819c2c2e5.png"
                    alt="Spotlight"
                    className="absolute top-0 left-0 w-full h-full object-contain"
                />

                {/* Girl Image */}
                <img
                    src="/ff01d382ea10b4f8b615bb0a42e8c5c5a80ab9d8.png"
                    alt="Character"
                    className="absolute top-0 left-0 w-full h-full mt-[3rem] object-contain z-10"
                />
            </div>

            {/* User Selection */}
            <div className="relative mt-[4rem]">
                <div
                    onClick={() => setShowUsersList(!showUsersList)}
                    className="flex items-center cursor-pointer"
                >
                    <span className="text-lg font-medium text-black mr-2">
                        {selectedUser || userNameFromStorage || 'Select User'}
                    </span>
                    <svg
                        className={`w-4 h-4 text-black transition-transform ${showUsersList ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Users Dropdown */}
                {showUsersList && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                        {/* Current user */}
                        <div
                            onClick={() => {
                                handleUserSelection(userNameFromStorage, userIdFromStorage);
                                setShowUsersList(false);
                            }}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="font-sm">{userNameFromStorage || 'Current User'}</span>
                            </div>
                        </div>

                        {/* Family members */}
                        {users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => {
                                    handleUserSelection(user.name, user.id);
                                    setShowUsersList(false);
                                }}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                            >
                                <div className="flex items-center space-x-3">
                                    <span>{user.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ViewReportsProps {
    onReportClick: (reportType: string) => void;
}

const reports = [
    {
        title: "Lab Report",
        icon: "/85ba70165c3202c8ddd061ad6f2c3c0631c4c087.png",
        reportType: "LAB REPORT"
    },
    {
        title: "Immunization",
        icon: "/fe5ee132f6a4493c0e769828bd1dbb0608178822.png",
        reportType: "IMMUNIZATION"
    },
    {
        title: "Prescription",
        icon: "/a1edce9397deefd31218a308aacd0eb5cc1ffdfd.png",
        reportType: "MEDICATIONS/PRESCRIPTION"
    },
    {
        title: "Radiology",
        icon: "/4172b4920e863c393033ca338427fa942e7816e5.png",
        reportType: "RADIOLOGY"
    },
    {
        title: "Ophthalmology",
        icon: "/0fc647c4f0b0490c5f5c928e2de0800fc71ad927.png",
        reportType: "OPTHALMOLOGY"
    },
    {
        title: "Dental Report",
        icon: "/d6819f0d6def5d9acaf5f71284399dffd7f24d4c.png",
        reportType: "DENTAL REPORT"
    },
    {
        title: "Special Report",
        icon: "/24965f56eaf61ff937c105970ed368f780192e60.png",
        reportType: "SPECIAL REPORT"
    },
    {
        title: "Mediclaim & Invoice",
        icon: "/95dad8e8466d68639e4a8200d6fa809742f20080.png",
        reportType: "INVOICES/MEDICLAIM INSURANCE"
    },
    {
        title: "All Reports",
        icon: "/26c2de4c74fc17d8812e9bde7f08c646c10cf70c.png",
        reportType: "ALL"
    },
];

function ViewReports({ onReportClick }: ViewReportsProps) {
      const router = useRouter();

  const handleClick = (reportType: string) => {
    if (reportType === "ALL") {
      router.push("/allReports");
    } else {
      onReportClick(reportType);
    }
  };

    return (
        <div className="mx-auto bg-white rounded-2xl shadow p-4">
            {/* Header */}
            <div className="border rounded-2xl">
                <div className="bg-[#0033A1] text-white px-4 py-3 rounded-t-2xl flex justify-between items-end shadow-[0_4px_6px_-3px_rgba(0,0,0,0.6)]">
                    <h2 className="text-lg font-semibold custom_text">View Reports</h2>
                    {/* <span className="text-[#ffd100] font-bold">125 Reports</span> */}
                </div>

                {/* Grid of Report Types */}
                <div className="grid grid-cols-3 mt-1 gap-4 px-4 py-3">
                    {reports.map((report, index) => (
                        <div
                            key={index}
                            className="flex flex-col mt-4 items-center text-center cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleClick(report.reportType)}
                        >
                            <div className="w-15 h-15 img_box sm:w-18 sm:h-18 rounded-xl border border-gray-300 flex items-center justify-center">
                                <img
                                    src={report.icon}
                                    alt={report.title}
                                    className="w-8 h-8 icons_img sm:w-10 sm:h-10 object-contain"
                                />
                            </div>
                            <p className="text-xs custom_category_title sm:text-sm font-medium mt-2 leading-tight">
                                {report.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}