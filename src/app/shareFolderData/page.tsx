"use client"
import React, { useState, useEffect } from 'react';
import { FaFolder, FaFile,  FaArrowLeft, FaCalendar, FaUser, FaClock, FaSpinner } from 'react-icons/fa';
import MasterHome from '../components/MasterHome';

interface Report {
    id: number;
    userId: number;
    userName: string;
    reportName: string;
    reportType: string;
    reportUrl: string;
    accessStatus: boolean;
    fileSize: number;
    userType: string;
    uploadedBy: string;
    reportDate: string;
    reportTime: string;
}

interface SharedFolder {
    folderId: number;
    folderName: string;
    createdEpoch: number;
    reports: Report[];
}

interface ApiResponse {
    success: boolean;
    data: SharedFolder[];
    message: string;
}

const SharedFolderViewer = () => {
    const [selectedFolder, setSelectedFolder] = useState<SharedFolder | null>(null);
    const [showReports, setShowReports] = useState(false);
    const [reports, setReports] = useState<ApiResponse | null>(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [shareId, setShareId] = useState<string>('');

    const extractShareId = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const shareIdParam = urlParams.get('shareId');
            if (shareIdParam) {
                let extractedId = '';
                // Handle case where shareId contains full API URL
                if (shareIdParam.includes('api/folders/shared/')) {
                    // Extract ID from: https://localhost:7113/api/folders/shared/8d3fe323b92b401f962652c5852007e4
                    extractedId = shareIdParam.split('api/folders/shared/').pop() || '';
                } else if (shareIdParam.includes('/')) {
                    // Handle other path formats
                    const parts = shareIdParam.split('/');
                    extractedId = parts[parts.length - 1];
                } else {
                    // Direct shareId
                    extractedId = shareIdParam;
                }

                // Clean up any trailing parameters or special characters
                extractedId = extractedId.split('&')[0].split('#')[0].trim();
                return extractedId;
            }

            return '';
        } catch (error) {
            console.error('💥 Error extracting shareId:', error);
            return '';
        }
    };

    // Extract shareId on component mount
    useEffect(() => {
        const extractedShareId = extractShareId();
        setShareId(extractedShareId);
    }, []);

    const fetchSharedReports = async () => {
        try {
            setLoading(true);
            setError('');

            if (!shareId) {
                console.error(' Cannot fetch: shareId is empty');
                setError('Invalid or missing share ID in the URL.');
                return;
            }

                const baseUrl =
                typeof window !== 'undefined' && window.location.hostname === 'localhost'
                    ? 'https://localhost:7113'
                    : 'https://test.testhfiles.in';

                const apiUrl = `${baseUrl}/api/folders/shared/${shareId}`;

            // CORRECT API endpoint - using /folders/shared/ (NOT /reports/shared/)
            // const apiUrl = `https://localhost:7113/api/folders/shared/${shareId}`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });


            const result: ApiResponse = await response.json();

            // FIXED: Actually set the reports data
            setReports(result);

            if (result.data && result.data.length > 0) {
                console.log('📊 DETAILED DATA ANALYSIS:');

                result.data.forEach((folder, folderIndex) => {
                    console.log(`📁 FOLDER ${folderIndex + 1}:`, {
                        folderId: folder.folderId,
                        folderName: folder.folderName,
                        createdEpoch: folder.createdEpoch,
                        createdDate: new Date(folder.createdEpoch * 1000).toLocaleString(),
                        reportsCount: folder.reports?.length || 0
                    });

                    if (folder.reports && folder.reports.length > 0) {
                        console.log(`📄 REPORTS IN "${folder.folderName}":`);
                        folder.reports.forEach((report, reportIndex) => {
                            console.log(`  📄 Report ${reportIndex + 1}:`, {
                                id: report.id,
                                reportName: report.reportName,
                                reportType: report.reportType,
                                userName: report.userName,
                                fileSize: `${report.fileSize} KB`,
                                uploadDate: report.reportDate,
                                uploadTime: report.reportTime,
                                reportUrl: report.reportUrl,
                                userType: report.userType,
                                accessStatus: report.accessStatus
                            });
                        });
                    } else {
                        console.log(`  📭 No reports found in "${folder.folderName}"`);
                    }
                });
            } else {
                console.warn('⚠️ No folders found in API response');
            }
        } catch (error) {
            console.error('💥 Error in fetchSharedReports:', error);
            setError(error instanceof Error ? error.message : 'Failed to load shared reports. Please check your connection.');
        } finally {
            setLoading(false);
            console.log('🏁 fetchSharedReports completed');
        }
    };

    useEffect(() => {
        if (shareId) {
            console.log('🎯 ShareId is available, starting data fetch...');
            fetchSharedReports();
        }
    }, [shareId]);

    // Log current component state
    console.log('🔄 CURRENT COMPONENT STATE:', {
        shareId,
        loading,
        error,
        reportsData: reports,
        hasReportsData: !!reports?.data,
        reportsCount: reports?.data?.length || 0,
        selectedFolder: selectedFolder?.folderName || null,
        showReports
    });

    const handleFolderClick = (folder: SharedFolder) => {
        console.log('👆 Folder clicked:', {
            folderId: folder.folderId,
            folderName: folder.folderName,
            reportsCount: folder.reports?.length || 0
        });
        setSelectedFolder(folder);
        setShowReports(true);
    };

    const handleBackClick = () => {
        console.log('⬅️ Back button clicked - returning to folder view');
        setShowReports(false);
        setSelectedFolder(null);
    };

    const formatFileSize = (sizeInKB: number): string => {
        if (sizeInKB < 1024) {
            return `${sizeInKB.toFixed(2)} KB`;
        } else {
            return `${(sizeInKB / 1024).toFixed(2)} MB`;
        }
    };

    const formatDate = (epochTime: number): string => {
        return new Date(epochTime * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFileExtension = (url: string): string => {
        return url.split('.').pop()?.toUpperCase() || 'FILE';
    };

    const handleDownload = (reportUrl: string, reportName: string) => {
        console.log('📥 Download initiated:', {
            reportUrl,
            reportName,
            timestamp: new Date().toISOString()
        });

        try {
            const link = document.createElement('a');
            link.href = reportUrl;
            link.download = reportName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(reportUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const getReportTypeColor = (reportType: string): string => {
        const colors: { [key: string]: string } = {
            'Medications/Prescription': 'bg-blue-100 text-blue-800',
            'Immunization': 'bg-green-100 text-green-800',
            'Lab Report': 'bg-purple-100 text-purple-800',
            'X-Ray': 'bg-red-100 text-red-800',
            'MRI': 'bg-orange-100 text-orange-800',
            'Blood Test': 'bg-pink-100 text-pink-800',
        };
        return colors[reportType] || 'bg-gray-100 text-gray-800';
    };

    const handleRetry = () => {
        console.log('🔄 Retry button clicked - reloading page');
        window.location.reload();
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FaSpinner className="text-4xl text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading shared folders...</p>
                    <p className="text-sm text-gray-500 mt-2">Check console for detailed logs</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !reports) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error loading folders</p>
                        <p className="text-sm">{error || 'Unknown error occurred'}</p>
                    </div>
                    <button
                        onClick={handleRetry}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Try Again
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Check console for detailed error logs</p>
                </div>
            </div>
        );
    }

    // API failure state
    if (!reports.success) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-lg">Failed to load folders</p>
                    <p className="text-gray-500">{reports.message}</p>
                    <button
                        onClick={handleRetry}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Try Again
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Check console for detailed error logs</p>
                </div>
            </div>
        );
    }

    return (
        <MasterHome>
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    {!showReports ? (
                        // Folder List View
                        <div>
                            <div className="mb-6">
                                <h1 className="text-3xl  text-center font-bold text-blue-800 mb-2">Shared Health Folders</h1>
                            </div>

                            <div className='border border-black mb-3'></div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {reports.data?.map((folder: SharedFolder) => (
                                    <div
                                        key={folder.folderId}
                                        onClick={() => handleFolderClick(folder)}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer p-6 border border-gray-200 hover:border-blue-300"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="mb-4">
                                                <FaFolder className="text-6xl text-blue-500" />
                                            </div>

                                            <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                                                {folder.folderName}
                                            </h3>

                                            <div className="space-y-2 text-sm text-gray-600 w-full">
                                                <div className="flex items-center justify-center gap-2">
                                                    <FaCalendar className="text-xs" />
                                                    <span>{formatDate(folder.createdEpoch)}</span>
                                                </div>

                                                <div className="flex items-center justify-center gap-2">
                                                    <FaFile className="text-xs" />
                                                    <span>{folder.reports?.length || 0} Report{(folder.reports?.length || 0) !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!reports.data || reports.data.length === 0) && (
                                <div className="text-center py-12">
                                    <FaFolder className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No shared folders found</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Reports View
                        <div>
                            <div className="mb-6">
                                <button
                                    onClick={handleBackClick}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                                >
                                    <FaArrowLeft />
                                    <span>Back to Folders</span>
                                </button>

                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedFolder?.folderName}</h1>
                                <p className="text-gray-600">
                                    {selectedFolder?.reports?.length || 0} report{(selectedFolder?.reports?.length || 0) !== 1 ? 's' : ''} in this folder
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {selectedFolder?.reports?.map((report) => (
                                    <div
                                        key={report.id}
                                        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {/* Report Header */}
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-xl text-gray-800 flex-1 mr-3">
                                                    {report.reportName}
                                                </h3>
                                            </div>

                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getReportTypeColor(report.reportType)}`}>
                                                {report.reportType}
                                            </span>
                                        </div>

                                        {/* Report Details */}
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-black" />
                                                    <span className="text-black">Uploaded by:</span>
                                                    <span className="font-medium text-gray-800">{report.userName}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <FaFile className="text-black" />
                                                    <span className="text-black">File size:</span>
                                                    <span className="font-medium text-gray-800">{formatFileSize(report.fileSize)}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <FaCalendar className="text-black" />
                                                    <span className="text-black">Date:</span>
                                                    <span className="font-medium text-gray-800">{report.reportDate}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <FaClock className="text-black" />
                                                    <span className="text-black">Time:</span>
                                                    <span className="font-medium text-gray-800">{report.reportTime}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-black">Type:</span>
                                                    <span className="font-medium text-gray-800">{report.userType}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-black">Format:</span>
                                                    <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                                        {getFileExtension(report.reportUrl)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Preview Button */}
                                            <button
                                                onClick={() => window.open(report.reportUrl, '_blank', 'noopener,noreferrer')}
                                                className="w-full mt-4 primary text-white py-3 rounded-lg transition-colors font-medium"
                                            >
                                                Preview Report
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MasterHome>
    );
};

export default SharedFolderViewer;