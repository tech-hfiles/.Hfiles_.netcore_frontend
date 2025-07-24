'use client'
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { Calendar,  User, FileText,  Eye, ArrowLeft } from 'lucide-react';
import MasterHome from '../components/MasterHome';

interface SharedReport {
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
    data: SharedReport[];
    message: string;
}

const SharedReportsCard = () => {
    const [reports, setReports] = useState<SharedReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [shareId, setShareId] = useState<string>('');

    const extractShareId = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const shareIdParam = urlParams.get('shareId');

            if (shareIdParam) {
                if (shareIdParam.includes('/')) {
                    const parts = shareIdParam.split('/');
                    return parts[parts.length - 1];
                } else {
                    return shareIdParam;
                }
            }
            return '';
        } catch (error) {
            console.error('Error extracting shareId:', error);
            return '';
        }
    };

    // Extract shareId on component mount
    useEffect(() => {
        const extractedShareId = extractShareId();
        setShareId(extractedShareId);

        if (!extractedShareId) {
            setError('Invalid or missing share ID in the URL.');
            setLoading(false);
        }
    }, []);

    const fetchSharedReports = async () => {
        try {
            setLoading(true);
            setError('');

            if (!shareId) {
                setError('Invalid or missing share ID in the URL.');
                return;
            }
            const baseUrl =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'https://localhost:7113'
    : 'https://test.testhfiles.in';

const response = await fetch(`${baseUrl}/api/reports/shared/${shareId}`);

            // const response = await fetch(`https://localhost:7113/api/prescriptions/shared/${shareId}`);
            const result: ApiResponse = await response.json();

            if (result.success) {
                setReports(result.data);
            } else {
                setError(result.message || 'Failed to load shared reports');
            }
        } catch (error) {
            console.error('Error fetching shared reports:', error);
            setError('Failed to load shared reports. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shareId) {
            fetchSharedReports();
        }
    }, [shareId]);

    const formatUserName = (name: string) => {
        return name.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleViewFile = (report: SharedReport) => {
        if (report.reportUrl) {
            window.open(report.reportUrl, '_blank');
        }
    };


    return (
        <MasterHome>
            <div className="">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
                    <div className="min-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative h-20 flex items-center justify-center">
                            <div className="absolute left-0 flex items-center">
                                <button
                                    onClick={() => window.history.back()}
                                    className="mr-2 p-3 rounded-xl hover:bg-blue-50 transition-all flex items-center group"
                                >
                                    <ArrowLeft size={20} className="text-gray-600 mr-2 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Back</span>
                                </button>
                            </div>

                            <h1 className="text-2xl font-bold text-center">
                                <span className="text-blue-800">SHARED</span>{' '}
                                <span className="text-gray-700">MEDICAL REPORTS</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">
                            Shared Reports ({reports.length})
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
                                >
                                    {/* Report Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-white truncate">
                                                    {report.reportName}
                                                </h3>
                                                <p className="text-blue-100 text-sm">{report.reportType}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report Preview */}
                                    <div className="relative h-48 bg-gray-100">
                                        {report.reportUrl ? (
                                            report.reportUrl.toLowerCase().endsWith('.pdf') ? (
                                                <div className="h-full flex items-center justify-center">
                                                    <FileText className="w-16 h-16 text-red-500" />
                                                    <span className="ml-2 text-gray-600 font-medium">PDF Report</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={report.reportUrl}
                                                    alt={`${report.reportType} - ${report.reportName}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = '<div class="h-full flex items-center justify-center"><span class="text-gray-400">No Preview Available</span></div>';
                                                        }
                                                    }}
                                                />
                                            )
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <span className="text-gray-400">No Preview Available</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Report Details */}
                                    <div className="p-6">
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-sm">
                                                <User className="w-4 h-4 text-blue-600 mr-2" />
                                                <span className="text-gray-600">Patient:</span>
                                                <span className="ml-2 font-medium text-gray-800">
                                                    {formatUserName(report.userName)}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-sm">
                                                <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                                                <span className="text-gray-600">Date:</span>
                                                <span className="ml-2 font-medium text-gray-800">
                                                    {report.reportDate}
                                                </span>
                                            </div>


                                            {report.fileSize > 0 && (
                                                <div className="flex items-center text-sm">
                                                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                                                    <span className="text-gray-600">Size:</span>
                                                    <span className="ml-2 font-medium text-gray-800">
                                                        {formatFileSize(report.fileSize * 1024)}
                                                    </span>
                                                </div>
                                            )}


                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleViewFile(report)}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MasterHome>
    );
};

export default SharedReportsCard;