"use client"
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { FaLessThan, FaShareAlt } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Search from '../components/Search';
import MasterHome from '../components/MasterHome';
import { toast, ToastContainer } from 'react-toastify';
import { FolderCreate, FolderList, FolderEdit, FolderDelete, FolderAccess, FolderShare, MemberList } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { ChevronDown } from 'lucide-react';

interface FolderData {
    folderId: number;
    name: string;
    createdEpoch: number;
    reportCount: number;
    reportCounts: number;
    accessToUserIds?: number[];
    isOwner?: boolean;
    updatedEpoch?: number;
}

interface Member {
    id: number;
    firstName: string;
    lastName: string;
    profileURL?: string;
}

interface ShareData {
    shareUrl: string;
    expiryDate: string;
    expiryTime: string;
}

interface FloatingActionButtonProps {
    onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-[10%] md:bottom-[13%] right-[5%] bg-yellow-400 hover:bg-yellow-500 text-black rounded-full md:rounded-md px-0 md:px-6 py-0 md:py-3 w-16 h-16 md:w-auto md:h-auto flex items-center justify-center gap-2 shadow-lg z-50 transition-all"
        >
            <span className="text-4xl md:text-2xl mt-[-2px] font-bold">+</span>
            <span className="hidden md:inline text-[19px] font-semibold">Create New</span>
        </button>
    );
};

export default function Folders() {
    const [showPopup, setShowPopup] = useState(false);
    const [editingFolder, setEditingFolder] = useState<FolderData | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<FolderData | null>(null);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);

    // Share functionality states
    const [shareMode, setShareMode] = useState(false);
    const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState<ShareData | null>(null);
    const [isSharing, setIsSharing] = useState(false);

    const [independent, setIndependent] = useState<Member[]>([]);
    const [selectedIndependentIds, setSelectedIndependentIds] = useState<number[]>([]);
    const storedUserName = typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '';
    const [folderDataList, setFolderDataList] = useState<FolderData[]>([]);
    const [lastReportName, setLastReportName] = useState("");
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFolderDataList, setFilteredFolderDataList] = useState<FolderData[]>([]);

        const [memberList, setMemberList] = useState<Member[]>([]); 
    const [selectedUser, setSelectedUser] = useState<string>('all');

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

    const DataListFolder = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                return;
            }
            const includeArray = selectedUser !== 'all' ? [parseInt(selectedUser)] : [];
            const response = await FolderList(currentUserId,includeArray)
            const folders = response?.data?.data || [];
            setFolderDataList(folders);
            setFilteredFolderDataList(folders);

            if (folders.length > 0) {
                const lastFolder = folders[folders.length - 1];
                setLastReportName(lastFolder.name || "");
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearch = (searchValue: string) => {
        setSearchTerm(searchValue);

        if (!searchValue.trim()) {
            setFilteredFolderDataList(folderDataList);
        } else {
            const filtered = folderDataList.filter(folder => {
                const nameMatch = folder.name.toLowerCase().includes(searchValue.toLowerCase());
                const idMatch = folder.folderId.toString().includes(searchValue);
                return nameMatch || idMatch;
            });
            setFilteredFolderDataList(filtered);
        }
    };

    useEffect(() => {
        handleSearch(searchTerm);
    }, [folderDataList]);

    const ListMember = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                return;
            }
            const response = await MemberList(currentUserId);
            setIndependent(response?.data?.data?.independentMembers)
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    const getExistingAccessUserIds = () => {
        const accessUserIds = new Set<number>();

        selectedFolderIds.forEach(folderId => {
            const folder = folderDataList.find(f => f.folderId === folderId);
            if (folder && folder.accessToUserIds) {
                folder.accessToUserIds.forEach(userId => {
                    accessUserIds.add(userId);
                });
            }
        });

        return Array.from(accessUserIds);
    };

    useEffect(() => {
        DataListFolder();
    }, [selectedUser])

    const getRelativeTime = (epoch: number | null): string => {
        if (!epoch) return "Unknown time";

        const now = new Date();
        const createdDate = new Date(epoch * 1000);
        const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

        const units: [string, number][] = [
            ["year", 60 * 60 * 24 * 365],
            ["month", 60 * 60 * 24 * 30],
            ["week", 60 * 60 * 24 * 7],
            ["day", 60 * 60 * 24],
            ["hour", 60 * 60],
            ["minute", 60],
            ["second", 1],
        ];

        for (const [unit, secondsInUnit] of units) {
            const value = Math.floor(diffInSeconds / secondsInUnit);
            if (value > 0) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
        }

        return "Just now";
    };

    const handleCreateNew = () => {
        setEditingFolder(null);
        setShowPopup(true);
    };

    const handleEditFolder = (folder: FolderData) => {
        setEditingFolder(folder);
        setShowPopup(true);
    };

    const handleDeleteFolder = async (folder: FolderData) => {
        setFolderToDelete(folder);
        setShowDeleteConfirm(true);
    };

    // Share functionality handlers
    const handleShareClick = () => {
        if (!shareMode) {
            setShareMode(true);
            setSelectedReports(new Set());
            // Disable access mode if active
            setSelectionMode(false);
            setSelectedFolderIds([]);
        }
    };

    const handleReportSelect = (folderId: number, isSelected: boolean) => {
        setSelectedReports(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(folderId);
            } else {
                newSet.delete(folderId);
            }
            return newSet;
        });
    };

    const handleSendReports = async () => {
        if (selectedReports.size === 0) {
            toast.error("Please select at least one folder to share.");
            return;
        }
        setIsSharing(true);
        try {
            const payload = {
                folderIds: Array.from(selectedReports)
            };
            const response = await FolderShare(payload);
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
            toast.error("Failed to create share link. Please try again.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareData(null);
        setShareMode(false);
        setSelectedReports(new Set());
    };


    const handleWhatsAppShare = () => {
        if (shareData) {
            const cleanShareId = shareData.shareUrl;
            const shareUrl = `${window.location.origin}/shareFolderData?shareId=${cleanShareId}`;
            const message = `${shareUrl}\n\n${storedUserName}'s  Reports`;
            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    };

    const handleGmailShare = () => {
        if (shareData) {
            const cleanShareId = shareData.shareUrl;
            const shareUrl = `${window.location.origin}/shareFolderData?shareId=${cleanShareId}`;
            const subject = `${storedUserName}'s Medical Reports (${selectedReports.size} reports)`;
            const body = `Please find the medical reports here:\n${shareUrl}\n\nThis link will expire on ${shareData.expiryDate} at ${shareData.expiryTime}`;
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&tf=1`;

            window.open(gmailUrl, '_blank');
        }
    };

    const cancelShareMode = () => {
        setShareMode(false);
        setSelectedReports(new Set());
    };

    // Access functionality handlers
    const handleAccessClick = () => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedFolderIds([]);
            // Disable share mode if active
            setShareMode(false);
            setSelectedReports(new Set());
        } else {
            if (selectedFolderIds.length === 0) {
                toast.error("Please select at least one folder to grant access.");
                return;
            }

            const existingAccessUserIds = getExistingAccessUserIds();
            setSelectedIndependentIds(existingAccessUserIds);

            setShowAccessModal(true);
            ListMember();
        }
    };

    const handleFolderSelect = (folderId: number, isSelected: boolean) => {
        if (isSelected) {
            setSelectedFolderIds(prev => [...prev, folderId]);
        } else {
            setSelectedFolderIds(prev => prev.filter(id => id !== folderId));
        }
    };

    const handleCheckboxChange = (memberId: number) => {
        setSelectedIndependentIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const confirmDelete = async () => {
        if (!folderToDelete) return;

        try {
            const response = await FolderDelete(folderToDelete.folderId);
            toast.success(response?.data?.message);
            DataListFolder();
        } catch (error: any) {
            console.log(error);
        } finally {
            setShowDeleteConfirm(false);
            setFolderToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setFolderToDelete(null);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setEditingFolder(null);
    };

    const handleFolderUpdate = () => {
        DataListFolder();
    };

    const handleAccessSave = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                toast.error("Please log in to grant access.");
                return;
            }

            const payload = {
                folderIds: selectedFolderIds,
                accessToUserIds: selectedIndependentIds,
                revokeAccess: false
            };

            const response = await FolderAccess(currentUserId, payload);
            toast.success(response?.data?.message);

            setShowAccessModal(false);
            setSelectionMode(false);
            setSelectedFolderIds([]);
            setSelectedIndependentIds([]);

            DataListFolder();
        } catch (error: any) {
            console.error("Error granting access:", error);
        }
    };

    const handleAccessCancel = () => {
        setShowAccessModal(false);
        setSelectedIndependentIds([]);
    };

    const cancelSelectionMode = () => {
        setSelectionMode(false);
        setSelectedFolderIds([]);
    };

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

    return (
        <MasterHome>
            <div className='Main w-[95%] mx-auto sm:w-[90%]'>
                <div className="w-full flex items-center justify-between mt-4 px-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => router.push('/myHfiles')}
                            className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                        >
                            <FaLessThan className="w-4 h-4 mr-2" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Back</span>
                        </button>
                    </div>

                    <Search onSearch={handleSearch} placeholder="Search " />
                </div>

                <div className='mt-2'>
                    <div className='flex flex-col text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-sm\6 leading-tight'>
                        <span className='text-[#0331B5] font-bold'>{storedUserName}</span>
                        <span className='text-black font-bold'>Health Library</span>
                    </div>

                    <div className="text-sm md:text-lg text-[#353935] flex items-center space-x-2 mt-1 sm:mt-3 md:justify-end lg:mr-3 md:mt-[-16px]">
                        <span className="font-semibold">Last updated:</span>
                        <span>{lastReportName}</span>
                    </div>
                </div>
                <hr className="mt-2 h-[1px] sm:h-[2px] bg-gray-400 border-none" />

                <FloatingActionButton onClick={handleCreateNew} />

                <div className="flex justify-between items-center w-full sm:px-4 py-2">
                    <div className="flex gap-2 sm:gap-4">
                        {/* Share Button */}
                        <button
                            onClick={handleShareClick}
                            className={`flex items-center gap-3 border px-3 py-1.5 rounded-md text-sm transition-all ${shareMode
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaShareAlt className="text-xs sm:text-[16px]" />
                            <span className='sm:text-[16px]'>
                                {shareMode ? 'Select to Share' : 'Share'}
                            </span>
                        </button>

                        {/* Send Button - Show only in share mode */}
                        {shareMode && (
                            <button
                                onClick={handleSendReports}
                                disabled={selectedReports.size === 0 || isSharing}
                                className={`flex items-center gap-3 border px-3 py-1.5 rounded-md text-sm transition-all ${selectedReports.size > 0 && !isSharing
                                    ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
                                    : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSharing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span className='sm:text-[16px]'>Sending...</span>
                                    </>
                                ) : (
                                    <span className='sm:text-[16px]'>Send ({selectedReports.size})</span>
                                )}
                            </button>
                        )}

                        {/* Access Button */}
                        <button
                            onClick={handleAccessClick}
                            className={`flex items-center gap-3 border px-3 py-1.5 rounded-md text-sm transition-all ${selectionMode
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-400 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FaCheck className="text-xs sm:text-[16px]" />
                            <span className='sm:text-[16px]'>
                                {selectionMode ? 'Grant Access' : 'Access'}
                            </span>
                        </button>

                        {/* Cancel Share Button */}
                        {shareMode && (
                            <button
                                onClick={cancelShareMode}
                                className="flex items-center gap-3 border border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100"
                            >
                                <span className='sm:text-[16px]'>Cancel Share</span>
                            </button>
                        )}

                        {/* Cancel Selection Button */}
                        {selectionMode && (
                            <button
                                onClick={cancelSelectionMode}
                                className="flex items-center gap-3 border border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100"
                            >
                                <span className='sm:text-[16px]'>Cancel</span>
                            </button>
                        )}
                    </div>

                    {/* Selection Info */}
                    {selectionMode && (
                        <div className="text-sm text-gray-600">
                            {selectedFolderIds.length} folder(s) selected
                        </div>
                    )}

                    {shareMode && (
                        <div className="text-sm text-gray-600">
                            {selectedReports.size} folder(s) selected for sharing
                        </div>
                    )}

                    {/* User Dropdown */}
                    {/* <button className="flex items-center gap-3 h-[40px] border border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100"> */}
                    <div className="relative">
                          <select
                                        value={selectedUser}
                                        onChange={(e) => setSelectedUser(e.target.value)}
                                        className="appearance-none text-black border border-gray-400 px-3 md:px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                                    >
                                        <option value="all">Users</option>
                                        {memberList.map((member) => (
                                            <option key={member.id} value={member.id.toString()}>
                                                {member.firstName}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black" size={16} />
                                    </div>
                    {/* </button> */}
                </div>

                <div className="flex flex-row flex-wrap justify-center sm:justify-start mt-[3rem] gap-4 md:gap-6 lg:gap-8">
                    <div className="flex gap-6 md:gap-7 flex-wrap">
                        {filteredFolderDataList?.length > 0 ? (
                            filteredFolderDataList.map((folder: FolderData, index: number) => {
                                const title = folder.name || `Folder ${index + 1}`;
                                const subtitle = `${getRelativeTime(folder.createdEpoch)}  |  ${folder.reportCounts} Reports`;
                                const imageSrc = "/09ec0cd855c261e47cb0ec43164ad0fc45f948d8.png";

                                const encodedTitle = encodeURIComponent(title);
                                const encodedId = encodeURIComponent(folder.folderId);

                                return (
                                    <FolderCard
                                        key={folder.folderId}
                                        folder={folder}
                                        title={title}
                                        subtitle={subtitle}
                                        imageSrc={imageSrc}
                                        link={`/folders/${encodedId}/${encodedTitle}`}
                                        onEdit={handleEditFolder}
                                        onDelete={handleDeleteFolder}
                                        selectionMode={selectionMode}
                                        shareMode={shareMode}
                                        isSelected={selectedFolderIds.includes(folder.folderId)}
                                        isSelectedForShare={selectedReports.has(folder.folderId)}
                                        onSelect={handleFolderSelect}
                                        onSelectForShare={handleReportSelect}
                                    />
                                );
                            })
                        ) : (
                            searchTerm ? (
                                <div
                                    className="flex flex-col items-center justify-center text-center"
                                    style={{ marginLeft: '752px' }}
                                >
                                    <img
                                        src="/9d3b1e529ff482abe61dba009ba6478444538807.png"
                                        alt="No folders"
                                        className="mb-4 w-80 h-80 object-contain"
                                    />
                                    <p className="text-gray-500 text-lg">
                                        No folders found matching "{searchTerm}"
                                    </p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Try searching by folder name or ID
                                    </p>
                                </div>
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center text-center"
                                    style={{ marginLeft: '752px' }}
                                >
                                    <img
                                        src="/9d3b1e529ff482abe61dba009ba6478444538807.png"
                                        alt="No folders"
                                        className="mb-4 w-80 h-80 object-contain"
                                    />
                                    <p className="text-gray-500 text-lg">No folders found</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Share Modal */}
                {isShareModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg mx-4">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    Share {selectedReports.size} Folder(s)
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

                            {shareData && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Share this link:</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={shareData.shareUrl}
                                            readOnly
                                            className="flex-1 p-2 text-sm border border-gray-300 rounded bg-white"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareData.shareUrl);
                                                toast.success('Link copied to clipboard!');
                                            }}
                                            className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Expires on {shareData.expiryDate} at {shareData.expiryTime}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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

                {showPopup && (
                    <UploadPopup
                        onClose={handleClosePopup}
                        editingFolder={editingFolder}
                        onUpdate={handleFolderUpdate}
                    />
                )}

                {showDeleteConfirm && (
                    <DeleteConfirmationModal
                        folderName={folderToDelete?.name || ''}
                        onConfirm={confirmDelete}
                        onCancel={cancelDelete}
                    />
                )}

                {showAccessModal && (
                    <AccessModal
                        selectedFolderIds={selectedFolderIds}
                        folderDataList={folderDataList}
                        independent={independent}
                        selectedIndependentIds={selectedIndependentIds}
                        onCheckboxChange={handleCheckboxChange}
                        onSave={handleAccessSave}
                        onCancel={handleAccessCancel}
                    />
                )}
            </div>
            <ToastContainer />
        </MasterHome>
    )
}

interface FolderCardProps {
    folder: FolderData;
    title: string;
    subtitle: string;
    imageSrc: string;
    link: string;
    onEdit: (folder: FolderData) => void;
    onDelete: (folder: FolderData) => void;
    selectionMode: boolean;
    shareMode: boolean;
    isSelected: boolean;
    isSelectedForShare: boolean;
    onSelect: (folderId: number, isSelected: boolean) => void;
    onSelectForShare: (folderId: number, isSelected: boolean) => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
    folder, title, subtitle, imageSrc, link, onEdit, onDelete,
    selectionMode, shareMode, isSelected, isSelectedForShare, onSelect, onSelectForShare
}) => {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleEdit = () => {
        setMenuOpen(false);
        onEdit(folder);
    };

    const handleDelete = () => {
        setMenuOpen(false);
        onDelete(folder);
    };

    const handleClick = () => {
        if (selectionMode) {
            onSelect(folder.folderId, !isSelected);
        } else if (shareMode) {
            onSelectForShare(folder.folderId, !isSelectedForShare);
        } else {
            router.push(link);
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (selectionMode) {
            onSelect(folder.folderId, e.target.checked);
        } else if (shareMode) {
            onSelectForShare(folder.folderId, e.target.checked);
        }
    };

    const isInSelectionMode = selectionMode || shareMode;
    const isCurrentlySelected = selectionMode ? isSelected : isSelectedForShare;

    return (
        <div className={`relative flex flex-col items-center w-[140px] md:w-[180px] gap-2 p-3 rounded-md transition-all ${isInSelectionMode
            ? isCurrentlySelected
                ? shareMode
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-blue-100 border-2 border-blue-500'
                : 'hover:bg-gray-100 border-2 border-transparent'
            : 'hover:bg-gray-200'
            }`}>
            {/* Checkbox for selection/share mode */}
            {isInSelectionMode && (
                <div className="absolute top-2 left-2 z-10">
                    <input
                        type="checkbox"
                        checked={isCurrentlySelected}
                        onChange={handleCheckboxChange}
                        className={`w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 ${shareMode
                            ? 'text-green-600 focus:ring-green-500'
                            : 'text-blue-600 focus:ring-blue-500'
                            }`}
                    />
                </div>
            )}

            {/* Dots icon - only show when not in selection/share mode */}
            {!isInSelectionMode && (
                <div className="absolute top-2 right-2 text-gray-500 text-xl cursor-pointer">
                    <button
                        className="flex flex-col items-center text-gray-400 hover:text-gray-600 space-y-[3px] cursor-pointer"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span className="w-[4px] h-[4px] bg-gray-400 rounded-full"></span>
                        <span className="w-[4px] h-[4px] bg-gray-400 rounded-full"></span>
                        <span className="w-[4px] h-[4px] bg-gray-400 rounded-full"></span>
                    </button>

                    {menuOpen && (
                        <div className="absolute top-8 right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-4 py-2 w-full text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            >
                                <FontAwesomeIcon icon={faEdit} className="text-sm" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                            >
                                <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            <img
                src={imageSrc}
                alt="Folder"
                className="w-[70px] md:w-[110px] sm:w-[95px] lg:w-[140px] xl:w-[150px] cursor-pointer"
                onClick={handleClick}
            />
            <p
                className="text-center font-medium text-sm md:text-base text-[#333] leading-tight cursor-pointer"
                onClick={handleClick}
            >
                {title.length > 20 ? `${title.slice(0, 20)}...` : title}
            </p>

            <p
                className="text-center text-xs text-gray-500 cursor-pointer"
                onClick={handleClick}
            >
                {subtitle}
            </p>
        </div>
    );
};

interface AccessModalProps {
    selectedFolderIds: number[];
    folderDataList: FolderData[];
    independent: Member[];
    selectedIndependentIds: number[];
    onCheckboxChange: (memberId: number) => void;
    onSave: () => void;
    onCancel: () => void;
}

const AccessModal: React.FC<AccessModalProps> = ({
    selectedFolderIds,
    folderDataList,
    independent,
    selectedIndependentIds,
    onCheckboxChange,
    onSave,
    onCancel
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const selectedFolders = folderDataList.filter(folder =>
        selectedFolderIds.includes(folder.folderId)
    );

    const memberHasExistingAccess = (memberId: number) => {
        return selectedFolders.some(folder =>
            folder.accessToUserIds?.includes(memberId)
        );
    };

    const handleSave = async () => {
        if (selectedIndependentIds.length === 0) {
            toast.error("Please select at least one member to grant access.");
            return;
        }

        setIsLoading(true);
        try {
            await onSave();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[0.5px]"
            onClick={onCancel}
        >
            <div
                className="relative w-[95%] max-w-md md:max-w-[40rem] border border-gray-300 rounded-lg bg-white px-6 py-6 shadow-lg max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    &times;
                </button>

                <h2 className="text-center text-[#0331B5] font-semibold text-lg md:text-[20px] mb-2">
                    Grant Folder Access
                </h2>

                <hr className="w-[47%] md:w-[34%] mt-[-7px] mx-auto h-[2px] bg-[#0331b5] border-none" />

                <p className="text-center text-gray-600 text-sm md:text-[16px] mb-4 mt-3">
                    Grant access to selected folders for independent members.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Folders ({selectedFolders.length})
                    </label>
                    <div className="space-y-1 max-h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                        {selectedFolders.map((folder) => (
                            <div key={folder.folderId} className="text-sm text-gray-700 py-1">
                                • {folder.name}
                                {folder.accessToUserIds && folder.accessToUserIds.length > 0 && (
                                    <span className="text-xs text-blue-600 ml-2">
                                        ({folder.accessToUserIds.length} users have access)
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {independent?.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Independent Members
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded">
                            {independent.map((member: Member) => {
                                const hasExistingAccess = memberHasExistingAccess(member.id);
                                return (
                                    <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedIndependentIds.includes(member.id)}
                                            onChange={() => onCheckboxChange(member.id)}
                                            className="text-blue-600 focus:ring-blue-500"
                                            disabled={isLoading}
                                        />
                                        <span className={`text-sm ${hasExistingAccess ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                            {member.firstName} {member.lastName}
                                            {hasExistingAccess && (
                                                <span className="text-xs text-blue-500 ml-1">(has access)</span>
                                            )}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {independent?.length === 0 && (
                    <div className="mb-6 text-center text-gray-500 text-sm">
                        No independent members found.
                    </div>
                )}

                <div className="flex justify-center gap-3 mt-8">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-md shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-[#0331b5] hover:bg-[#ffd100] hover:text-black text-white font-semibold px-6 py-2 rounded-md shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating...
                            </>
                        ) : (
                            'Update Access'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UploadPopupProps {
    onClose: () => void;
    editingFolder?: FolderData | null;
    onUpdate: () => void;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ onClose, editingFolder, onUpdate }) => {
    const [folderName, setFolderName] = useState(editingFolder?.name || '');
    const [isLoading, setIsLoading] = useState(false);

    const isEditMode = !!editingFolder;

    const handleSubmit = async () => {
        if (!folderName.trim()) {
            toast.error("Folder name cannot be empty.");
            return;
        }

        setIsLoading(true);
        try {
            if (isEditMode) {
                const payload = { folderName: folderName.trim() };
                const response = await FolderEdit(editingFolder.folderId, payload);
                toast.success(response?.data?.message || "Folder updated successfully");
            } else {
                const payload = { folderName: folderName.trim() };
                const response = await FolderCreate(payload);
                toast.success(response?.data?.message || "Folder created successfully");
            }

            setFolderName("");
            onUpdate();
            onClose();
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} folder`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[0.5px]"
            onClick={onClose}
        >
            <div
                className="relative w-[95%] max-w-md md:max-w-[40rem] border border-gray-300 rounded-lg bg-[#EFF5FF] px-6 py-6 shadow-md"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
                    onClick={onClose}
                >
                    &times;
                </button>

                <h2 className="text-center text-[#0331B5] font-semibold text-lg md:text-[20px] mb-2">
                    {isEditMode ? 'Edit Folder' : 'Create a Folder'}
                </h2>

                <hr className="w-[47%] md:w-[34%] mt-[-7px] mx-auto h-[2px] bg-[#0331b5] border-none" />

                <p className="text-center text-gray-600 text-sm md:text-[16px] mb-4 mt-3">
                    {isEditMode
                        ? 'Update the folder name to better organize your health records.'
                        : 'Easily manage and share all records related to a specific health condition from one folder.'
                    }
                </p>

                <div>
                    <p className="text-sm md:text-[17px] text-[#000000] font-semibold mb-4">Folder Name:</p>
                    <input
                        type="text"
                        placeholder="Eg. Diabetes, Thyroid . . ."
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#0331b5]"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-[#0331b5] hover:bg-[#ffd100] hover:text-black text-white font-semibold px-8 py-3 rounded-md shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : (isEditMode ? 'Update' : 'Create')}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface DeleteConfirmationModalProps {
    folderName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ folderName, onConfirm, onCancel }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[0.5px]"
            onClick={onCancel}
        >
            <div
                className="relative w-[95%] max-w-md md:max-w-[35rem] border border-gray-300 rounded-lg bg-white px-6 py-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
                    onClick={onCancel}
                    disabled={isDeleting}
                >
                    &times;
                </button>

                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <FontAwesomeIcon icon={faTrash} className="h-6 w-6 text-red-600" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Delete Folder
                    </h3>

                    <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">"{folderName}"</span>?
                        <br />
                        This action cannot be undone and all reports in this folder will be removed.
                    </p>

                    <div className="flex justify-center gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};