"use client";
export const runtime = 'edge'
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image"; // Add Next.js Image import
import MasterHome from "../components/MasterHome";
import { Reportedit } from "@/app/services/HfilesServiceApi"; // Import the edit API
import { decryptData } from "@/app/utils/webCrypto";
import { toast, ToastContainer } from "react-toastify";

// Define error type interface
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
}

const ViewReportPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [reportName, setReportName] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const reportUrl = searchParams.get("src") || "";
  const title = searchParams.get("title") || "";
  const epoch = searchParams.get("date") || "";
  const category = searchParams.get("category") || "";
  const reportId = searchParams.get("reportId") || ""; // Get reportId from URL params

  useEffect(() => {
    setReportName(title);
    if (epoch) {
      const date = new Date(Number(epoch) * 1000); // Convert epoch to milliseconds
      setReportDate(date.toISOString().split("T")[0]);
    }
  }, [epoch, title]);

  // Get user ID from localStorage
  const getUserId = async (): Promise<number> => {
    try {
      const encryptedUserId = localStorage.getItem('userId');
      if (!encryptedUserId) return 0;
      const userIdStr = await decryptData(encryptedUserId);
      return parseInt(userIdStr, 10);
    } catch (error) {
      console.error('Error getting userId:', error);
      return 0;
    }
  };

  // Format date for API (based on the API spec showing "34-92-9983" format)
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    return `${day}-${month}-${year}`;
  };

  const handleSave = async () => {
    if (!reportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }

    if (!reportId) {
      toast.error("Report ID is missing");
      return;
    }

    setIsLoading(true);

    try {
      // Get current user ID
      const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error('Please log in to edit reports.');
        setIsLoading(false);
        return;
      }
      const payload = {
        reportName: reportName.trim(),
        editDate: formatDateForAPI(reportDate)
      };
      // Call the edit API
      const response = await Reportedit(currentUserId, parseInt(reportId),payload);
      toast.success(`${response.data.message}`);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);

    } catch (error: unknown) { // Fix: Replace 'any' with 'unknown'
      console.error('Error updating report:', error);
      const apiError = error as ApiError; // Type assertion for better type safety
      
      if (apiError.response) {
        // API returned an error response
        const message = apiError.response.data?.message || 'An error occurred';
        toast.error(message);
      } else if (apiError.request) {
        // Network error
        toast.error('Network error. Please check your connection.');
      } else {
        // Other errors
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <MasterHome>
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button - Fix: Use the handleBack function */}
          <button
            onClick={handleBack}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-95">
            {/* Image Section */}
            <div className="relative p-4">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                {/* Fix: Replace img with Next.js Image component */}
                <div className="relative w-full h-64">
                  <Image
                    src={reportUrl}
                    alt={reportName || "Report"}
                    fill
                    className="object-contain rounded-lg"
                    onError={(e) => {
                      // Handle image load error
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No image available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-4">
              <div className="space-y-3">
                {/* Report Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Report Name *
                  </label>
                  <input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    placeholder="Enter report name..."
                    disabled={isLoading}
                  />
                </div>

                {/* Date */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    disabled={isLoading}
                  />
                </div>

                {/* Category */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Category
                  </label>
                  <div className="relative">
                    <input
                      value={category}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Category not specified"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Debug Info (remove in production) */}
                {reportId && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Report ID: {reportId}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !reportName.trim() || !reportId}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isSaved
                        ? 'bg-green-500 hover:bg-green-600'
                        : isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : !reportName.trim() || !reportId
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    ) : isSaved ? (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Updated Successfully!
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Update Report
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </MasterHome>
  );
};

export default ViewReportPage;