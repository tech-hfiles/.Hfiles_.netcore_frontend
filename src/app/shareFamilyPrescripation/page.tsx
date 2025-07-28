'use client'
export const runtime = 'edge'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { FaLessThan, FaPills, FaClock, FaCalendarAlt, FaUser } from 'react-icons/fa'
import MasterHome from '../components/MasterHome';

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any[];
}

interface Prescription {
    id: number;
    condition: string;
    otherCondition: string;
    medicine: string;
    dosage: string;
    schedule: string;
    timings: string;
    createdEpoch: number;
    prescribedFor: string;
}

const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => {
    const formatDate = (epoch: number) => {
        return new Date(epoch * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTiming = (timing: string) => {
        return timing.replace(/([A-Z])/g, ' $1').trim();
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 mb-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {prescription.condition}
                        {prescription.otherCondition && (
                            <span className="text-gray-600 font-normal"> - {prescription.otherCondition}</span>
                        )}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                        <FaUser className="w-3 h-3 mr-1" />
                        <span>Prescribed for: {prescription.prescribedFor}</span>
                    </div>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    ID: {prescription.id}
                </span>
            </div>

            {/* Medicine Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                    <FaPills className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Medicine & Dosage</span>
                </div>
                <div className="text-gray-700">
                    <p className="font-semibold">{prescription.medicine}</p>
                    <p className="text-sm text-gray-600">{prescription.dosage}</p>
                </div>
            </div>

            {/* Schedule & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                    <FaCalendarAlt className="w-4 h-4 text-green-600 mr-2" />
                    <div>
                        <span className="text-sm text-gray-500 block">Schedule</span>
                        <span className="font-medium text-gray-700">{prescription.schedule}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <FaClock className="w-4 h-4 text-orange-600 mr-2" />
                    <div>
                        <span className="text-sm text-gray-500 block">Timing</span>
                        <span className="font-medium text-gray-700">{formatTiming(prescription.timings)}</span>
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                    Created: {formatDate(prescription.createdEpoch)}
                </span>
            </div>
        </div>
    );
};

const page = () => {
    const router = useRouter();

    const [reports, setReports] = useState<Prescription[]>([]);
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

                const response = await fetch(`${baseUrl}/api/prescriptions/shared/${shareId}`);

            // const response = await fetch(`https://localhost:7113/api/reports/shared/${shareId}`);
            const result: ApiResponse = await response.json();

            if (result.success && result.data) {
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

    const handleBack = () => {
        router.push('/medicalHistory')
    };

    return (
        <MasterHome>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mt-6 mb-6 relative mx-3">
                        {/* Left: Back */}
                        <div className="flex items-center">
                            <button
                                onClick={handleBack}
                                className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                            >
                                <FaLessThan className="w-4 h-4 mr-2" />
                                <span className="text-xs sm:text-lg font-bold text-black hidden sm:inline">Back</span>
                            </button>
                        </div>

                        {/* Center: Title */}
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 absolute left-1/2 transform -translate-x-1/2">
                            Family Prescription
                        </h2>
                    </div>

                    {/* Decorative Border */}
                    <div className="border-4 border-gray-200 rounded-full mt-2 mb-6 sm:mt-4 sm:mb-8"></div>

                    {/* Content */}
                    <div className="mt-8">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Loading prescriptions...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <div className="text-red-600 font-medium mb-2">Error</div>
                                <div className="text-red-500">{error}</div>
                                <button
                                    onClick={() => shareId && fetchSharedReports()}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                <FaPills className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <div className="text-gray-600 font-medium mb-2">No Prescriptions Found</div>
                                <div className="text-gray-500">There are no shared prescriptions available.</div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        Shared Prescriptions ({reports.length})
                                    </h3>
                                </div>

                                {/* Prescription Cards */}
                                <div className="space-y-4">
                                    {reports.map((prescription) => (
                                        <PrescriptionCard
                                            key={prescription.id}
                                            prescription={prescription}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MasterHome>
    );
};

export default page;