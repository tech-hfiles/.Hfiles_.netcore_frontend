'use client'
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, FileText, Edit, Trash2, Share2, MoreVertical } from 'lucide-react';
import MasterHome from '../components/MasterHome';
import { ListReport, DeleteReport, MemberList, ReportEdit, ReportShare } from '../services/HfilesServiceApi';
import { toast, ToastContainer } from 'react-toastify';
import { decryptData } from '../utils/webCrypto';
import VaccinationList from '../components/VaccinationList';

type Report = {
    userName(userName: any): unknown;
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
};

type ApiResponse = {
    success: boolean;
    data: {
        mainUserReportsCount: number;
        dependentUserReportsCounts: any[];
        totalReportsCount: number;
        reports: Report[];
    };
    message: string;
};

const ReportsPage = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [userId, setUserId] = useState<number>(0);
    const [reportType, setReportType] = useState<string>('');
    const [totalReportsCount, setTotalReportsCount] = useState<number>(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentReport, setCurrentReport] = useState<Report | null>(null);
    const [editedReportName, setEditedReportName] = useState('');
    const [userNames, setUserNames] = useState() as any;
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [independent, setIndependent] = useState() as any;
    const [selectedIndependentIds, setSelectedIndependentIds] = useState<number[]>([]);
    const [reportAccessMap, setReportAccessMap] = useState<Record<number, number[]>>({});
    const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shareData, setShareData] = useState<{
        shareUrl: string;
        expiryDate: string;
        expiryTime: string;
    } | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'edit' | 'access' | null>(null);
    const [userName, setUserName] = useState<string>('User');
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectModeType, setSelectModeType] = useState<'share' | 'access' | null>(null);

    const toggleDropdown = (id: any) => {
        setOpenDropdownId((prev) => (prev === id ? null : id));
    };

    useEffect(() => {
        const userIdParam = searchParams.get('userId');
        const reportTypeParam = searchParams.get('reportType');

        if (userIdParam && reportTypeParam) {
            setUserId(parseInt(userIdParam));
            setReportType(decodeURIComponent(reportTypeParam));
            fetchReports(parseInt(userIdParam), decodeURIComponent(reportTypeParam));
        } else {
            toast.error("Missing required parameters");
            router.push('/myHfiles');
        }
    }, [searchParams]);

    const fetchReports = async (userId: number, reportType: string) => {
        try {
            const response = await ListReport(userId, reportType);

            if (response && response.data && response.data.success) {
                const apiResponse: ApiResponse = response.data;
                setReports(apiResponse.data.reports || []);
                setTotalReportsCount(apiResponse.data.totalReportsCount || 0);
                setUserNames(apiResponse.data.reports[0].userName)

            } else {
                setReports([]);
                setTotalReportsCount(0);
                toast.info("No reports found for this category");
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            setReports([]);
            setTotalReportsCount(0);
        } finally {
        }
    };

    const handleView = (report: Report) => {
        if (report.reportUrl) {
            window.open(report.reportUrl, '_blank');
        } else {
            toast.error("File URL not available");
        }
    };

    const handleEdit = (report: Report) => {
        setModalType('edit');
        setCurrentReport(report);
        setEditedReportName(report.reportName);
        const savedAccessIds = reportAccessMap[report.id] || [];
        setSelectedIndependentIds(savedAccessIds);

        setIsEditModalOpen(true);
    };

    const handleDelete = (report: Report) => {
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
                setTotalReportsCount(prev => prev - 1);
                toast.success(`${response.data.message}`);
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            console.error("Error deleting report:", error);
            toast.error("Failed to delete report. Please try again.");
        } finally {
            setIsDeleting(null);
            setReportToDelete(null);
        }
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

    const formatFileSize = (sizeInKB: number) => {
        if (sizeInKB < 1024) {
            return `${sizeInKB.toFixed(2)} KB`;
        } else {
            return `${(sizeInKB / 1024).toFixed(2)} MB`;
        }
    };

    const getFileIcon = (reportUrl?: string) => {
        if (!reportUrl) return <FileText className="w-8 h-8 text-gray-500" />;

        const fileExtension = reportUrl.split('.').pop()?.toLowerCase();

        switch (fileExtension) {
            case 'pdf':
                return <FileText className="w-8 h-8 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <FileText className="w-8 h-8 text-green-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="w-8 h-8 text-blue-500" />;
            case 'xls':
            case 'xlsx':
                return <FileText className="w-8 h-8 text-green-600" />;
            default:
                return <FileText className="w-8 h-8 text-gray-500" />;
        }
    };

    const isImageFile = (reportUrl: string) => {
        const fileExtension = reportUrl.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '');
    };

    const renderFilePreview = (report: Report) => {
        if (isImageFile(report.reportUrl)) {
            return (
                <div className="w-full h-80 mb-4 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                    <img
                        src={report.reportUrl}
                        alt={report.reportName}
                        className="w-full h-full object-cover cursor-pointer hover:scale-102 transition-transform duration-300"
                        onClick={() => handleView(report)}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <div className="hidden w-full h-full  items-center justify-center">
                        {getFileIcon(report.reportUrl)}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="w-full h-32 mb-4 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleView(report)}>
                    <div className="text-center">
                        {getFileIcon(report.reportUrl)}
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                            {report.reportUrl.split('.').pop()?.toUpperCase() || 'FILE'}
                        </p>
                    </div>
                </div>
            );
        }
    };

    const handleSaveEdit = async () => {
        if (!currentReport) return;

        const payload = {
            reportName: editedReportName,
            accessUpdates: selectedIndependentIds.map(memberId => ({
                independentUserId: memberId,
                accessStatus: true
            }))
        };

        try {
            const response = await ReportEdit(currentReport.id, payload);
            if (response && response.data && response.data.success) {
                const updatedReports = reports.map((r) =>
                    r.id === currentReport.id ? { ...r, reportName: editedReportName } : r
                );
                setReports(updatedReports);
                setReportAccessMap(prev => ({
                    ...prev,
                    [currentReport.id]: [...selectedIndependentIds]
                }));

                toast.success(response.data.message);
            } else {
                toast.error(response?.data?.message);
            }

            setIsEditModalOpen(false);
            setSelectedIndependentIds([]);
            setCurrentReport(null);
            setEditedReportName('');

        } catch (error) {
            console.error("Error updating report:", error);
        }
    };

    const getUserId = async (): Promise<number> => {
        try {
            const encryptedUserId = localStorage.getItem("userId");
            if (!encryptedUserId) return 0;

            const userIdStr = await decryptData(encryptedUserId);
            return parseInt(userIdStr, 10);
        } catch (error) {
            console.error("Error getting userId:", error);
            return 0;
        }
    };

    const ListMember = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to view members.");
                return;
            }
            const response = await MemberList(currentUserId);
            setIndependent(response?.data?.data?.independentMembers)
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    useEffect(() => {
        ListMember();
    }, [])

    const handleCheckboxChange = (memberId: number) => {
        setSelectedIndependentIds((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
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

    // Modified Share button handler
    const handleShareButtonClick = () => {
        if (!isSelectMode) {
            // Enter share select mode
            setIsSelectMode(true);
            setSelectModeType('share');
            setSelectedReports(new Set());
        } else if (selectModeType === 'share') {
            // Execute share functionality
            if (selectedReports.size === 0) {
                toast.error("Please select at least one report to share.");
                return;
            }
            handleShare();
        }
    };

    // Modified Access button handler
    const handleAccessButtonClick = () => {
        if (!isSelectMode) {
            // Enter access select mode
            setIsSelectMode(true);
            setSelectModeType('access');
            setSelectedReports(new Set());
        } else if (selectModeType === 'access') {
            // Execute access functionality
            if (selectedReports.size === 0) {
                toast.error("Please select at least one report to access.");
                return;
            }
            const firstReportId = Array.from(selectedReports)[0];
            const firstReport = reports.find((report) => report.id === firstReportId);
            if (firstReport) handleAccess(firstReport);
        }
    };

    // Cancel selection mode
    const handleCancelSelection = () => {
        setIsSelectMode(false);
        setSelectModeType(null);
        setSelectedReports(new Set());
    };

    const handleShare = async () => {
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
            } else {
                toast.error("Failed to create share link. Please try again.");
            }
        } catch (error) {
            console.error("Error creating share link:", error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleAccess = (report: Report) => {
        setModalType('access');
        setCurrentReport(report);
        const savedAccessIds = reportAccessMap[report.id] || [];
        setSelectedIndependentIds(savedAccessIds);
        setIsEditModalOpen(true);
    };

    const getUserName = (): string => {
        const userName = localStorage.getItem("userName");
        return userName || "User";
    };

    useEffect(() => {
        const defaultUserName = getUserName();
        setUserName(defaultUserName);
    }, []);

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareData(null);
        setSelectedReports(new Set());
        setIsSelectMode(false);
        setSelectModeType(null);
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

    return (
        <MasterHome>
            <div className="min-h-[calc(100vh-140px)] bg-gray-50 p-2">
                {/* Header */}
                <div className="mb-6 ">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => router.push('/myHfiles')}
                            className="flex items-center text-black cursor-pointer hover:text-blue-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </button>
                    </div>
                    <h1 className="text-2xl flex justify-center font-bold">
                        <span className="text-blue-800">{userNames}'s&nbsp;</span>
                        <span className="text-gray-500">{reportType} Reports</span>
                    </h1>

                    <div className='border mt-2 mx-auto w-30'></div>
                    <p className="text-gray-600 mt-1">
                        {totalReportsCount} report{totalReportsCount !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 mb-4">
                    {isSelectMode ? (
                        // Selection mode buttons
                        <>
                            <button
                                onClick={selectModeType === 'share' ? handleShareButtonClick : handleAccessButtonClick}
                                disabled={isSharing || selectedReports.size === 0}
                                className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${selectedReports.size > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'text-gray-400 cursor-not-allowed'
                                    } ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSharing ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                ) : (
                                    selectModeType === 'share' ? <Share2 size={16} /> : <Eye size={16} />
                                )}
                                <span>
                                    {selectModeType === 'share' ? 'Share' : 'Set Access'} {selectedReports.size > 0 ? `(${selectedReports.size})` : ''}
                                </span>
                            </button>

                            <button
                                onClick={handleCancelSelection}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>

                            <span className="text-sm text-gray-600">
                                Select reports to {selectModeType === 'share' ? 'share' : 'set access for'}
                            </span>
                        </>
                    ) : (
                        // Normal mode buttons
                        <>
                            <button
                                onClick={handleShareButtonClick}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 transition-colors"
                            >
                                <Share2 size={16} />
                                <span>Share</span>
                            </button>

                            <button
                                onClick={handleAccessButtonClick}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 transition-colors"
                            >
                                <Eye size={16} />
                                <span>Access</span>
                            </button>

                            <button
                                onClick={() => router.push('/myHfiles')}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
                            >
                                Add Report
                            </button>
                        </>
                    )}
                </div>

                {reportType === 'IMMUNIZATION' &&
                    <div>
                        <VaccinationList />
                    </div>
                }

                {/* Reports Grid */}
                {reports.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mt-3">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className={`bg-white rounded-lg shadow-sm border transition-all ${selectedReports.has(report.id) && isSelectMode
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-gray-300 hover:shadow-md'
                                    }`}
                            >
                                {/* Checkbox - Only show in select mode */}
                                <div className="relative">
                                    {isSelectMode && (
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.has(report.id)}
                                            onChange={() => handleSelectReport(report.id)}
                                            className="absolute top-3 left-3 w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 z-10 shadow-sm"
                                        />
                                    )}

                                    {/* Report Preview */}
                                    <div className="aspect-[4/3] bg-gray-100 rounded-t-lg border-b border-gray-200 flex items-center justify-center relative overflow-hidden">
                                        {report.reportUrl ? (
                                            report.reportUrl.toLowerCase().endsWith('.pdf') ? (
                                                <img
                                                    src="/vecteezy_pdf-png-icon-red-and-white-color-for_23234824.png"
                                                    alt="PDF File"
                                                    className="object-contain w-full h-full"
                                                />
                                            ) : (
                                                <img
                                                    src={report.reportUrl}
                                                    alt="Report Preview"
                                                    className="object-contain w-full h-full"
                                                />
                                            )
                                        ) : (
                                            <span className="text-gray-400">No Preview Available</span>
                                        )}
                                    </div>
                                </div>

                                {/* Report Metadata */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-blue-800 mb-2 truncate text-lg flex-1">
                                            {report.reportName}
                                        </h3>
                                        {!isSelectMode && (
                                            <div className="relative dropdown-menu">
                                                <button
                                                    onClick={() => toggleDropdown(report.id)}
                                                    className="p-2 rounded-full hover:bg-gray-100"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>
                                                {openDropdownId === report.id && (
                                                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50 border">
                                                        <button
                                                            onClick={() => {
                                                                handleDelete(report);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleWhatsAppShare();
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                        >
                                                            <Share2 size={14} /> Share
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="border border-gray-300 mb-2"></div>

                                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                                        <div>
                                            <span className="font-medium">Report Type:</span> {report.reportType}
                                        </div>
                                        <div>
                                            <span className="font-medium">User Type:</span> {report.userType}
                                        </div>
                                        <div>
                                            <span className="font-medium">Date:</span> {report.reportDate} {report.reportTime}
                                        </div>
                                    </div>

                                    {/* Action Buttons - Hide in select mode */}
                                    {!isSelectMode && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleView(report)}
                                                className="flex-1 primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                View
                                            </button>

                                            <button
                                                onClick={() => handleEdit(report)}
                                                className="p-2 rounded-full hover:bg-yellow-100 transition-colors"
                                                title="Edit Report"
                                            >
                                                <Edit className="text-yellow-600 w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No reports found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            No {reportType.toLowerCase()} reports have been uploaded yet.
                        </p>
                        <button
                            onClick={() => router.push('/myHfiles')}
                            className="inline-flex items-center px-4 py-2 primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-semibold mb-4 text-center">Edit Report Name</h2>
                        {modalType === "edit" &&
                            <input
                                type="text"
                                value={editedReportName}
                                onChange={(e) => setEditedReportName(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter new report name"
                            />
                        }

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

                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveEdit()}
                                className="px-4 py-2 text-sm rounded-md primary text-white hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2 text-gray-900">Delete Report</h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{reportToDelete?.reportName}"? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setReportToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
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

export default ReportsPage;