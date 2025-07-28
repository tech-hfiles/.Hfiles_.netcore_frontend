'use client'
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {  Share2, Trash2, ChevronDown, Search, Send, X } from 'lucide-react';
import MasterHome from '../components/MasterHome';
import { ListReport, MemberList, DeleteReport, ReportShare } from '../services/HfilesServiceApi';
import { toast, ToastContainer } from 'react-toastify';
import { decryptData } from '../utils/webCrypto';
import { FaLessThan } from 'react-icons/fa';

interface Report {
    id: number;
    userId: number;
    reportName: string;
    reportType: string;
    reportUrl: string;
    fileSize: number;
    userType: string;
    uploadedBy: string;
    reportTime: string;
    reportDate: string;
    userName: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        mainUserReportsCount: number;
        dependentUserReportsCounts: any[];
        totalReportsCount: number;
        reports: Report[];
    };
    message: string;
}

interface Member {
    id: number;
    name: string;
    firstName: string;
}

const AllReportsPage = () => {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedReportType, setSelectedReportType] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [userName, setUserName] = useState<string>('User');
    const [memberList, setMemberList] = useState<Member[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shareData, setShareData] = useState<{
        shareUrl: string;
        expiryDate: string;
        expiryTime: string;
    } | null>(null);
    
    // New state for multi-step share flow
    const [isSelectMode, setIsSelectMode] = useState(false);

    const reportTypes = [
        "Lab Report",
        "Dental Report",
        "Immunization",
        "Medications/Prescription",
        "Radiology",
        "Ophthalmology",
        "Special Report",
        "Invoices/Mediclaim Insurance"
    ];

    const getUserName = (): string => {
        const userName = localStorage.getItem("userName");
        return userName || "User";
    };

    useEffect(() => {
        const defaultUserName = getUserName();
        setUserName(defaultUserName);
    }, []);

    useEffect(() => {
        if (selectedUser === 'all') {
            const defaultUserName = getUserName();
            setUserName(defaultUserName);
        } else {
            const selectedMember = memberList.find(member => member.id.toString() === selectedUser);
            if (selectedMember) {
                setUserName(selectedMember.firstName);
            }
        }
    }, [selectedUser, memberList]);

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

    
    useEffect(() => {
        const fetchCurrentUserId = async () => {
          const id = await getUserId();
          console.log("Setting currentUserId to:", id);
          setCurrentUserId(id);
        };
      
        fetchCurrentUserId();
      }, []);
      
    

    const fetchMemberList = async () => {
        const currentUserId = await getUserId();
        try {
            const response = await MemberList(currentUserId);
            const data = response?.data?.data;

            if (data) {
                const allMembers = [...(data.independentMembers || []), ...(data.dependentMembers || [])];
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

    const fetchAllReports = async () => {
        try {
            setError('');
    
            let userId: number | undefined;
    
            if (selectedUser === 'current') {
                userId = await getUserId();
            } else if (selectedUser !== 'all') {
                const parsed = parseInt(selectedUser, 10);
                userId = isNaN(parsed) ? undefined : parsed;
            } // else keep userId as undefined to fetch all users' reports
    
            const reportType = selectedReportType !== 'all' ? selectedReportType : undefined;
    
            const response = await ListReport(userId, reportType);
    
            if (response && response.data && response.data.success) {
                const apiData: ApiResponse = response.data;
                setReports(apiData.data.reports || []);
            } else {
                setReports([]);
                toast.error('Failed to load reports');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            setError('You are not authorized to view reports for this user.');
        }
    };
    
    
    useEffect(() => {
        fetchAllReports();
    }, [selectedUser, selectedReportType]);

    const handleBack = () => {
        router.back();
    };

    const handleViewFile = (report: Report) => {
        if (report.reportUrl) {
            window.open(report.reportUrl, '_blank');
        } else {
            toast.info('File not available for viewing');
        }
    };

    const handleDeleteReport = (report: Report) => {
        setReportToDelete(report);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!reportToDelete) return;

        setIsDeleting(reportToDelete.id);
        setIsDeleteModalOpen(false);

        try {
            const response = await DeleteReport(reportToDelete.id);
            if (response && response.data.message) {
                setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
                toast.success(`${response.data.message}`);
            } else {
                toast.error(response?.data?.message || "Failed to delete report");
            }
        } catch (error) {
            console.error("Error deleting report:", error);
            toast.error("Failed to delete report. Please try again.");
        } finally {
            setIsDeleting(null);
            setReportToDelete(null);
        }
    };

    // Modified share button handler to enable select mode
    const handleShareClick = () => {
        setIsSelectMode(true);
        setSelectedReports(new Set());
    };

    // Cancel selection mode
    const handleCancelSelection = () => {
        setIsSelectMode(false);
        setSelectedReports(new Set());
    };

    // Send selected reports (same functionality as before)
    const handleSendReports = async () => {
        if (selectedReports.size === 0) {
            toast.error("Please select at least one report to share.");
            return;
        }

        setIsSharing(true);

        try {
            const payload = {
                reportIds: Array.from(selectedReports)
            };

            const response = await ReportShare(payload);

            if (response && response.data && response.data.success) {
                setShareData({
                    shareUrl: response.data.data.shareUrl,
                    expiryDate: response.data.data.expiryDate,
                    expiryTime: response.data.data.expiryTime
                });
                setIsShareModalOpen(true);
                toast.success(response.data.message);
                // Keep select mode active until modal is closed
            } else {
                toast.error("Failed to create share link. Please try again.");
            }
        } catch (error) {
            console.error("Error creating share link:", error);
            toast.error("Failed to create share link. Please try again.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareData(null);
        setSelectedReports(new Set());
        setIsSelectMode(false); // Exit select mode when modal is closed
    };

    const handleWhatsAppShare = () => {
        if (!shareData) return;

        const cleanShareId = shareData.shareUrl;
        const shareUrl = `${window.location.origin}/shareReportPage?shareId=${cleanShareId}`;
        const message = `${shareUrl}\n\n${userName}'s Medical Reports`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        setIsShareModalOpen(false);
    };

    const handleGmailShare = () => {
        if (!shareData) return;

        const shareUrl = `${window.location.origin}/shareReportPage?shareId=${shareData.shareUrl}`;
        const subject = `${userName}'s Medical Reports (${selectedReports.size} reports)`;
        const body = `Please find the medical reports here:\n${shareUrl}\n\nThis link will expire on ${shareData.expiryDate} at ${shareData.expiryTime}`;

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&tf=1`;

        window.open(gmailUrl, '_blank');
        setIsShareModalOpen(false);
    };

    const handleSelectReport = (reportId: number) => {
        const newSelected = new Set(selectedReports);
        if (newSelected.has(reportId)) {
            newSelected.delete(reportId);
        } else {
            newSelected.add(reportId);
        }
        setSelectedReports(newSelected);
    };

    const filteredReports = reports.filter((report) => {
        const term = searchTerm.toLowerCase();
      
        const matchesSearch =
          report.reportName?.toLowerCase().includes(term) ||
          report.reportType?.toLowerCase().includes(term) ||
          report.userType?.toLowerCase().includes(term) ||
          report.userId?.toString().includes(term);
      
        const matchesReportType =
          selectedReportType === 'all' || report.reportType === selectedReportType;
      
          console.log(currentUserId);
          Number(currentUserId);

        const matchesUser =
          selectedUser === 'all' ||
          (selectedUser === 'current' && currentUserId !== null && report.userId === currentUserId) ||
          report.userId.toString() === selectedUser;
      
        return matchesSearch && matchesReportType && matchesUser;
      });

      

    return (
        <MasterHome>
            <div className="h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] xl:h-[calc(100vh-139px)] 2xl:h-[calc(100vh-140px)]">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        <div className="relative h-14 sm:h-16 md:h-18 lg:h-20 flex items-center justify-between">

                            {/* Back Button */}
                            <div className="flex items-center">
                                <button
                                    onClick={handleBack}
                                    className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                                >
                                   <FaLessThan className="w-4 h-4 mr-2" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Back</span>
                                </button>
                            </div>

                            {/* Title */}
                            <div className="flex-1 text-center px-2">
                                <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">
                                    <span className="text-blue-600">{userName.toUpperCase()}'S</span>{' '}
                                    <span className="text-gray-600">REPORTS</span>
                                </h1>
                            </div>

                            {/* Search - Desktop */}
                            <div className="hidden lg:block">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-48 xl:w-64 2xl:w-72 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Mobile Search */}
                        <div className="lg:hidden pb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Share */}
                <div className="bg-white border-b lg:border-0">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        {/* Desktop Filters */}
                        <div className="hidden lg:flex items-center justify-between py-3 md:py-4">
                            <div className="flex items-center space-x-2">
                                {!isSelectMode ? (
                                    // Initial Share Button
                                    <button
                                        onClick={handleShareClick}
                                        className="flex items-center space-x-2 px-3 md:px-4 py-2 border border-gray-300 rounded-lg transition-colors text-sm md:text-base hover:bg-gray-50 text-gray-900"
                                    >
                                        <Share2 size={16} />
                                        <span>Share</span>
                                    </button>
                                ) : (
                                    // Selection Mode Buttons
                                    <>
                                        <button
                                            onClick={handleSendReports}
                                            disabled={isSharing || selectedReports.size === 0}
                                            className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                                                selectedReports.size > 0 && !isSharing
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {isSharing ? (
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <Send size={16} />
                                            )}
                                            <span>
                                                Send {selectedReports.size > 0 ? `(${selectedReports.size})` : ''}
                                            </span>
                                        </button>
                                        <button
                                            onClick={handleCancelSelection}
                                            className="flex items-center space-x-2 px-3 md:px-4 py-2 border border-gray-300 rounded-lg transition-colors text-sm md:text-base hover:bg-gray-50 text-gray-700"
                                        >
                                            <X size={16} />
                                            <span>Cancel</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 md:space-x-4">
                                <div className="relative">
                                    <select
                                        value={selectedReportType}
                                        onChange={(e) => setSelectedReportType(e.target.value)}
                                        className="appearance-none text-black px-3 md:px-4 py-2 pr-8 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                                    >
                                        <option value="all">All Types</option>
                                        {reportTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black" size={16} />
                                </div>

                                <div className="relative">
                                    <select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="appearance-none text-black border border-gray-400 px-3 md:px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                                    >
                                        <option value="all">All Users</option>
                                         <option value="current">Self</option>
                                        {memberList.map((member) => (
                                            <option key={member.id} value={member.id.toString()}>
                                                {member.firstName}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Filters */}
                        <div className={`lg:hidden transition-all duration-300 ${'max-h-96 opacity-100'}`}>
                            <div className="py-3">
                                {/* Horizontal Layout for Mobile */}
                                <div className="flex items-center gap-2 mb-3">
                                    {!isSelectMode ? (
                                        // Initial Share Button
                                        <button
                                            onClick={handleShareClick}
                                            className="flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg transition-colors text-sm hover:bg-gray-50 text-gray-900"
                                        >
                                            <Share2 size={14} />
                                            <span>Share</span>
                                        </button>
                                    ) : (
                                        // Selection Mode Buttons
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleSendReports}
                                                disabled={isSharing || selectedReports.size === 0}
                                                className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                                                    selectedReports.size > 0 && !isSharing
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {isSharing ? (
                                                    <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                                ) : (
                                                    <Send size={14} />
                                                )}
                                                <span>
                                                    Send {selectedReports.size > 0 ? `(${selectedReports.size})` : ''}
                                                </span>
                                            </button>
                                            <button
                                                onClick={handleCancelSelection}
                                                className="flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg transition-colors text-sm hover:bg-gray-50 text-gray-700"
                                            >
                                                <X size={14} />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* User Filter */}
                                    <div className="relative flex-1">
                                    <select
  value={selectedUser}
  onChange={(e) => setSelectedUser(e.target.value)}
  className="appearance-none text-black border border-gray-400 px-3 py-3 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
>
  <option value="current">Current User</option>
  <option value="all">All Users</option>
  {memberList.map((member) => (
    <option key={member.id} value={member.id.toString()}>
      {member.firstName}
    </option>
  ))}
</select>
  <ChevronDown
    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black"
    size={14}
  />
</div>
<select
  value={selectedUser}
  onChange={(e) => setSelectedUser(e.target.value)}
  className="appearance-none text-black border border-gray-400 px-3 py-3 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
>
  <option value="current">Current User</option>
  <option value="all">All Users</option>
  {memberList.map((member) => (
    <option key={member.id} value={member.id.toString()}>
      {member.firstName}
    </option>
  ))}
</select>

                                    {/* Report Type Filter */}
                                    <div className="relative flex-1">
                                        <select
                                            value={selectedReportType}
                                            onChange={(e) => setSelectedReportType(e.target.value)}
                                            className="appearance-none text-black px-3 py-2 pr-7 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
                                        >
                                            <option value="all">All Types</option>
                                            {reportTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black" size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 md:py-4">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base">
                            {error}
                        </div>
                    </div>
                )}

                {/* Reports Grid */}
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-6 md:pb-8 pt-4 md:pt-6 overflow-y-auto">
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-8 md:py-12">
                            <div className="text-gray-400 mb-3 md:mb-4">
                                <svg className="mx-auto h-12 w-12 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No Reports Found</h3>
                            <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
                                {searchTerm || selectedReportType !== 'all' || selectedUser !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'No reports have been uploaded yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                            {filteredReports.map((report) => (
                                <div
                                    key={report.id}
                                    className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${selectedReports.has(report.id)
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-gray-300'
                                        }`}
                                >
                                    {/* Checkbox positioned at top left - only show in select mode */}
                                    <div className="relative">
                                        {isSelectMode && (
                                            <input
                                                type="checkbox"
                                                checked={selectedReports.has(report.id)}
                                                onChange={() => handleSelectReport(report.id)}
                                                className="absolute top-2 sm:top-3 left-2 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 z-10 shadow-sm"
                                            />
                                        )}

                                        <div className="aspect-[4/3] bg-gray-100 rounded-t-lg border-b border-gray-200 flex items-center justify-center relative overflow-hidden">
                                            {report.reportUrl ? (
                                                report.reportUrl.toLowerCase().endsWith('.pdf') ? (
                                                    <img
                                                        src="/vecteezy_pdf-png-icon-red-and-white-color-for_23234824.png"
                                                        alt="PDF File"
                                                        className="object-contain w-full h-full p-2 sm:p-4"
                                                    />
                                                ) : (
                                                    <img
                                                        src={report.reportUrl}
                                                        alt="Report Preview"
                                                        className="object-contain w-full h-full"
                                                    />
                                                )
                                            ) : (
                                                <span className="text-gray-400 text-xs sm:text-sm">No Preview Available</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4">
                                        <h3 className="font-semibold text-blue-800 mb-2 truncate text-sm sm:text-base">
                                            {report.reportName}
                                        </h3>
                                        <div className='border border-gray-400 mb-2'></div>

                                        <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                            <div>
                                                <span className="font-medium">Type:</span> {report.reportType}
                                            </div>
                                            <div>
                                                <span className="font-medium">User:</span> {report.userName}
                                            </div>
                                            <div>
                                                <span className="font-medium">Date:</span> {report.reportDate} {report.reportTime}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewFile(report)}
                                                className="flex-1 primary text-white py-2 px-2 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm"
                                            >
                                                View File
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReport(report)}
                                                disabled={isDeleting === report.id}
                                                className={`p-2 rounded-full transition-colors ${isDeleting === report.id
                                                    ? 'cursor-not-allowed bg-gray-100'
                                                    : 'hover:bg-red-100'
                                                    }`}
                                                title="Delete Report"
                                            >
                                                {isDeleting === report.id ? (
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 size={16} className="text-red-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                Share {selectedReports.size} Report(s)
                            </h2>
                            <button
                                onClick={handleCloseShareModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Share Options */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {/* WhatsApp Option */}
                            <button
                                onClick={handleWhatsAppShare}
                                disabled={isSharing}
                                className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 ${isSharing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097" />
                                    </svg>
                                </div>
                                <span className="font-medium text-gray-700 text-sm sm:text-base">WhatsApp</span>
                            </button>

                            {/* Gmail Option */}
                            <button
                                onClick={handleGmailShare}
                                disabled={isSharing}
                                className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 ${isSharing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                    </svg>
                                </div>
                                <span className="font-medium text-gray-700 text-sm sm:text-base">Gmail</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-3 sm:mb-4">
                                <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Delete Report</h2>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                Are you sure you want to delete "{reportToDelete?.reportName}"? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setReportToDelete(null);
                                }}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </MasterHome>
    );
};

export default AllReportsPage;