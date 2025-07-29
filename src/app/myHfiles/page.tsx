/* eslint-disable @next/next/no-img-element */
'use client'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import MasterHome from '../components/MasterHome';
import { useRouter } from 'next/navigation';
import { decryptData } from '../utils/webCrypto';
import { ListStorage, MemberList, ReportAdd } from '../services/HfilesServiceApi';
import { toast, ToastContainer } from 'react-toastify';
import My_hfiles_phoneview from '../components/My_hfiles_phoneview/page';
import './style.css';
import AddReportsModal from '../components/AddReportsModal';

type User = {
    id: number;
    name: string;
    profileURL?: string;
};

const MedicalDashboard = () => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const [userNameFromStorage, setUserNameFromStorage] = useState<string>('');
    const [userIdFromStorage, setUserIdFromStorage] = useState<number>(0);
    const [users, setUsers] = useState<User[]>() as any;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [reportType, setReportType] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();
    const [independent, setIndependent] = useState() as any;
    const [selectedIndependentIds, setSelectedIndependentIds] = useState<number[]>([]);
    const [stroage, setStroage] = useState() as any;
    const [maxAllowed, setMaxAllowed] = useState<number>(0);

    const reportTypes = [
        { Id: 3, Name: "LAB REPORT" },
        { Id: 4, Name: "DENTAL REPORT" },
        { Id: 5, Name: "IMMUNIZATION" },
        { Id: 6, Name: "MEDICATIONS/PRESCRIPTION" },
        { Id: 7, Name: "RADIOLOGY" },
        { Id: 8, Name: "OPTHALMOLOGY" },
        { Id: 9, Name: "SPECIAL REPORT" },
        { Id: 10, Name: "INVOICES/MEDICLAIM INSURANCE" },
    ];

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

    const ListMember = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                return;
            }
            const response = await MemberList(currentUserId);
            setIndependent(response?.data?.data?.independentMembers)
            if (response && response.data && response.data.data) {
                const formattedUsers = [
                    ...response.data.data.independentMembers,
                    ...response.data.data.dependentMembers,
                ].map((member: any) => ({
                    id: member.id,
                    name: `${member.firstName} ${member.lastName}`,
                    avatar: member.firstName?.charAt(0).toUpperCase() || '?',
                    profileURL: member.profileURL,
                }));

                setUsers(formattedUsers);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error("Failed to load members. Please try again.");
        }
    };

    const handleCheckboxChange = (memberId: number) => {
        setSelectedIndependentIds((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleUserSelection = async (userName: string, userId: number) => {
        setSelectedUser(userName);
        setSelectedUserId(userId);
    };

    const handleReportCategoryClick = (reportTypeName: string) => {
        const currentUserId = selectedUserId || userIdFromStorage;
        const currentUserName = selectedUser || userNameFromStorage;
        if (!currentUserId) {
            toast.error("Please select a user first.");
            return;
        }

        // router.push(`/reportsPage?userId=${currentUserId}&reportType=${encodeURIComponent(reportTypeName)}`);
        router.push(
            `/reportsPage?userId=${currentUserId}&reportType=${encodeURIComponent(reportTypeName)}&userName=${encodeURIComponent(currentUserName)}`
        );

    };

    const handleAllReportsClick = () => {
        const currentUserId = selectedUserId || userIdFromStorage;
        if (!currentUserId) {
            toast.error("Please select a user first.");
            return;
        }

        router.push(`/allReports`);
    };

    const handleFolderClick = () => {
        const currentUserId = selectedUserId || userIdFromStorage;
        if (!currentUserId) {
            toast.error("Please select a user first.");
            return;
        }

        router.push(`/folders`);
    };

    useEffect(() => {
        ListMember();
    }, [])

    useEffect(() => {
        const loadUserFromStorage = async () => {
            const storedName = localStorage.getItem('userName');
            const storedUserId = await getUserId();

            if (storedName && storedUserId) {
                setUserNameFromStorage(storedName);
                setUserIdFromStorage(storedUserId);
                setSelectedUser(storedName);
                setSelectedUserId(storedUserId);
            }
        };

        loadUserFromStorage();
    }, []);

    const validateFile = (file: File): boolean => {
        const maxSize = 10 * 1024 * 1024;
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (file.size > maxSize) {
            toast.error("File size must be less than 10MB");
            return false;
        }
        return true;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (validateFile(file)) {
                setSelectedFile(file);
                if (!fileName) {
                    const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                    setFileName(nameWithoutExtension);
                }
            } else {
                event.target.value = '';
            }
        }
    };

    const handleSubmitReport = async () => {
        if (!reportType || !fileName || !selectedFile) {
            toast.error("Please fill in all required fields.");
            return;
        }
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const userId = selectedUserId || userIdFromStorage;
            if (!userId || userId === 0) {
                toast.error("Invalid or missing user ID. Please log in again.");
                return;
            }
            const selectedReportType = reportTypes.find(type => type.Name === reportType);
            if (!selectedReportType) {
                toast.error("Invalid report type selected.");
                return;
            }
            const formData = new FormData();
            formData.append("ReportName", fileName.trim());
            formData.append("ReportType", selectedReportType.Name.toString());
            formData.append("ReportFile", selectedFile);
            selectedIndependentIds.forEach((id) => {
                formData.append("IndependentUserIds", id.toString());
            });
            const response = await ReportAdd(userId, formData);
            if (response && response.data) {
                const message = response.data.message;
                toast.success(message);
                setReportType("");
                setFileName("");
                setSelectedFile(null);
                setIsModalOpen(false);
            } else {
                toast.error("Failed to add report. Please try again.");
            }

        } catch (error: any) {
            console.log(error, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
        setReportType('');
        setFileName('');
        setSelectedFile(null);
    };

    const StorageData = async () => {
        try {
            const currentUserId = await getUserId();
            if (!currentUserId) {
                return;
            }
            const response = await ListStorage(currentUserId)
            console.log(response.data.data)
            setStroage(response?.data?.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        StorageData();
    }, [])

    return (
        <MasterHome>
            <div className='md:hidden'>
                <My_hfiles_phoneview
                    // Report functionality
                    onReportClick={handleReportCategoryClick}
                    handleAllReportsClick={handleAllReportsClick}
                    handleFolderClick={handleFolderClick}

                    // User management
                    users={users || []}
                    selectedUser={selectedUser}
                    selectedUserId={selectedUserId}
                    userNameFromStorage={userNameFromStorage}
                    userIdFromStorage={userIdFromStorage}
                    handleUserSelection={handleUserSelection}
                    onAddMember={() => router.push('/addMember')}

                    // Modal and report submission
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    reportType={reportType}
                    setReportType={setReportType}
                    fileName={fileName}
                    setFileName={setFileName}
                    selectedFile={selectedFile}
                    handleFileChange={handleFileChange}
                    isSubmitting={isSubmitting}
                    handleSubmitReport={handleSubmitReport}
                    closeModal={closeModal}

                    // Independent members for sharing
                    independent={independent || []}
                    selectedIndependentIds={selectedIndependentIds}
                    handleCheckboxChange={handleCheckboxChange}

                    // Storage information
                    storage={stroage} // Note: You had a typo "stroage" in original code

                    // Report types
                    reportTypes={reportTypes}
                />
            </div>
            <div className="hidden md:flex h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-139px)] 2xl:h-[calc(100vh-140px)] bg-gray-50">
                {/* Left Sidebar */}
                <div className="w-full sm:w-80 md:w-72 lg:w-80 xl:w-96 main_left_side_bar bg-white shadow-lg flex flex-col items-center py-4 sm:py-6 h-full overflow-y-auto scroll-ultrathin">
                    {/* Top Divider */}
                    <p
                        className='font-bold text-black text-base sm:text-lg md:text-xl cursor-pointer px-4 text-center hover:text-blue-600 transition-colors'
                        onClick={() => handleUserSelection(userNameFromStorage, userIdFromStorage)}
                    >
                        {userNameFromStorage || 'No Name'}
                    </p>
                    <div className="w-full border-t mb-4 sm:mb-6"></div>

                    {/* Users List */}
                    <div className="flex flex-col items-center w-full space-y-3 sm:space-y-2 px-2 sm:px-4">
                        {users?.map((user: any, index: any) => (
                            <div key={user.id} className="flex flex-col items-center w-full">
                                <div
                                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-gray-300 cursor-pointer hover:scale-110 transition-transform ${selectedUser === user.name ? 'ring-2 ring-blue-400' : ''
                                        }`}
                                    onClick={() => handleUserSelection(user.name, user.id)}
                                >
                                    <img
                                        src={user?.profileURL}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                    {!user.profileURL && (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm sm:text-base">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-gray-800 mt-1 text-center px-1 truncate max-w-full">
                                    {user.name}
                                </p>
                                {index !== users.length - 1 && (
                                    <hr className="w-8/12 sm:w-10/12 border-t border-gray-300 my-2 sm:my-3" />
                                )}
                            </div>
                        ))}

                        {/* Add Member Button */}
                        <div className="flex flex-col items-center mt-3 sm:mt-2">
                            <button
                                onClick={() => router.push('/addMember')}
                                className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-dashed cursor-pointer border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors touch-manipulation"
                            >
                                <Plus size={16} className="sm:hidden" />
                                <Plus size={18} className="hidden sm:block" />
                            </button>
                            <p className="text-xs text-gray-500 mt-1 sm:mt-2 text-center">Add Member</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 relative overflow-visible">
                    {/* Background gradient */}
                    <div className="absolute"></div>

                    {/* Medical Categories positioned around the center */}
                    <div
                        className="relative h-full flex items-center justify-center bg-no-repeat bg-top bg-contain"
                        style={{ backgroundImage: 'url("/86d6da8763537d75129226caabec832819c2c2e5.png")' }}
                    >
                        {/* Layout container */}
                        <div
                            className="relative w-full xl:w-[80%] font-poppins-500 grid grid-cols-3 gap-8 items-center bg-no-repeat bg-top bg-contain"
                            style={{ backgroundImage: 'url("/5a11661c5ca37e627671619c40a376e3556d4066 (2).png")' }}
                        >

                            {/* Left Column */}
                            <div className="relative gap-6 h-[500px] lg:ml-[4rem] xl:ml-[0rem]  flex flex-col items-start justify-center">
                                {/* LAB REPORTS */}
                                <div
                                    className="  left-15 top-0 cursor-pointer gap-2 flex flex-col lg:flex-row items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("LAB REPORT")}
                                >
                                    <span className="text-sm hidden lg:text-[15px] xl:text-[16px] 2xl:text-[17px] lg:block  text-[#0331b5]">LAB REPORTS</span>
                                    <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border  border-gray-400 flex items-center justify-center">
                                        <img src="/85ba70165c3202c8ddd061ad6f2c3c0631c4c087.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm  lg:hidden  text-[#0331b5]">LAB REPORTS</span>

                                </div>

                                {/* IMMUNISATION */}
                                <div
                                    className="translate-x-[-60px] left-6 top-24 gap-2 cursor-pointer flex flex-col lg:flex-row items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("IMMUNIZATION")}
                                >
                                    <span className="text-sm hidden lg:text-[15px] xl:text-[16px] 2xl:text-[17px] lg:block   text-[#0331b5]">IMMUNISATION</span>
                                    <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border border-gray-400 flex items-center justify-center">
                                        <img src="/fe5ee132f6a4493c0e769828bd1dbb0608178822.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm lg:hidden  text-[#0331b5]">IMMUNISATION</span>
                                </div>

                                {/* MEDICATIONS/PRESCRIPTION */}
                                <div
                                    className="translate-x-[-55px] gap-2  cursor-pointer flex flex-col lg:flex-row items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("MEDICATIONS/PRESCRIPTION")}
                                >
                                    <span className="text-sm lg:text-[15px] xl:text-[16px] 2xl:text-[17px] w-min text-left hidden lg:block  text-[#0331b5]">MEDICATIONS/
                                        PRESCRIPTION</span>
                                    <div className="min-w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border border-gray-400 flex items-center justify-center">
                                        <img src="/a1edce9397deefd31218a308aacd0eb5cc1ffdfd.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm lg:hidden  text-[#0331b5]">MEDICATIONS/
                                        <br></br>PRESCRIPTION</span>
                                </div>

                                {/* RADIOLOGY */}
                                <div
                                    className=" left-9 top-72 cursor-pointer gap-2 flex flex-col lg:flex-row items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("RADIOLOGY")}
                                >
                                    <span className="text-sm lg:text-[15px] xl:text-[16px] 2xl:text-[17px]  hidden lg:block  text-[#0331b5]">RADIOLOGY</span>
                                    <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border border-gray-400 flex items-center justify-center">
                                        <img src="/4172b4920e863c393033ca338427fa942e7816e5.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm lg:text-[15px] xl:text-[16px] 2xl:text-[17px] lg:hidden  text-[#0331b5]">RADIOLOGY</span>

                                </div>
                            </div>

                            {/* -----------  Center Image & Name  --------------- */}
                            <div className="flex flex-col items-center justify-center">
                                <img
                                    src="/ff01d382ea10b4f8b615bb0a42e8c5c5a80ab9d8.png"
                                    alt="Character"
                                    className=" w-[100%]"
                                />
                                <h2 className="text-[24px] font-poppins-600  text-[#333333">{selectedUser}</h2>
                            </div>

                            {/* Right Column */}
                            <div className="relative gap-6 h-[500px] font-poppins-500 lg:mr-[2rem] xl:mr-[0rem] flex flex-col items-end justify-center ">
                                {/* OPHTHALMOLOGY */}
                                <div
                                    className="gap-2 flex flex-col lg:flex-row right-12 top-0 cursor-pointer  items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("OPTHALMOLOGY")}
                                >
                                    <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border border-gray-400 flex items-center justify-center">
                                        <img src="/0fc647c4f0b0490c5f5c928e2de0800fc71ad927.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm lg:text-[15px] xl:text-[16px] 2xl:text-[17px] text-[#0331b5]">OPHTHALMOLOGY</span>
                                </div>

                                {/* DENTAL REPORT */}
                                <div
                                    className="translate-x-[50px] gap-2 flex flex-col lg:flex-row right-6 top-24 cursor-pointer  items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("DENTAL REPORT")}
                                >
                                    <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border border-gray-400 flex items-center justify-center">
                                        <img src="/d6819f0d6def5d9acaf5f71284399dffd7f24d4c.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm lg:text-[15px] xl:text-[16px] 2xl:text-[17px] text-[#0331b5]">DENTAL REPORT</span>
                                </div>

                                {/* SPECIAL REPORTS */}
                                <div
                                    className="translate-x-[45px] gap-2 flex flex-col lg:flex-row right-2 top-48 cursor-pointer  items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("SPECIAL REPORT")}
                                >
                                    <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border border-gray-400 flex items-center justify-center">
                                        <img src="/24965f56eaf61ff937c105970ed368f780192e60.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm lg:text-[15px] xl:text-[16px] 2xl:text-[17px] text-[#0331b5]">SPECIAL REPORTS</span>
                                </div>

                                {/* MEDICINE & INVOICE */}
                                <div
                                    className="gap-2 flex flex-col lg:flex-row right-9 top-72 cursor-pointer  items-center w-60 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
                                    onClick={() => handleReportCategoryClick("INVOICES/MEDICLAIM INSURANCE")}
                                >
                                    <div className="w-14 h-14 xl:w-16 xl:h-16 bg-white rounded-full border border-gray-400 flex items-center justify-center">
                                        <img src="/95dad8e8466d68639e4a8200d6fa809742f20080.png" alt="icon" className="w-8 h-8 xl:w-10 xl:h-10 object-contain" />
                                    </div>
                                    <span className="text-sm lg:text-[15px] xl:text-[16px] 2xl:text-[17px] text-[#0331b5]">MEDICINE & INVOICE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-64 main_right_side_bar bg-white shadow-lg p-6 flex flex-col justify-between">
                    {/* Top Section */}
                    <div className="font-montserrat-600 space-y-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={isSubmitting}
                            className="w-full primary text-white p-6 cursor-pointer rounded-lg  shadow-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Adding Report..." : "Add Reports"}
                        </button>

                        {/* All Reports Card */}
                        <div className="bg-yellow-200 border cursor-pointer p-6 rounded-lg text-center shadow" onClick={handleAllReportsClick}>
                            <h3 className=" text-gray-800 text-lg">All Reports</h3>
                        </div>

                        <div className="bg-yellow-200 border cursor-pointer p-6 rounded-lg text-center shadow" onClick={handleFolderClick}>
                            <h3 className=" text-gray-800 text-lg">Manage Folder </h3>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="space-y-4 mt-6">
                        {/* Storage Used */}
                        <div className="border p-4 rounded-lg text-center shadow">
                            <p className="text-gray-800 font-semibold text-sm">{stroage?.usedStorageMbTotal || 0} MB<br />Storage Used</p>
                        </div>

                        {/* Storage Left */}
                        <div className="border p-4 rounded-lg text-center shadow border-blue-400">
                            <p className="text-gray-800 font-semibold text-sm">
                                {stroage?.quotaMb && stroage?.usedStorageMbTotal
                                    ? `${(stroage.quotaMb - stroage.usedStorageMbTotal).toFixed(2)} of ${stroage.quotaMb}`
                                    : '--'}<br />MB Left
                            </p>
                        </div>

                        {/* Contact Section */}
                        <div className="text-sm text-gray-600 border rounded-lg p-4 text-center shadow">
                            <p className="mb-1">Need Storage?</p>
                            <p className="text-blue-600 cursor-pointer hover:underline">Contact Us...</p>
                        </div>
                    </div>
                </div>

                {/* Add Reports Modal */}
                {isModalOpen && (
                    <AddReportsModal isSubmitting={isSubmitting} reportType={reportType} setReportType={setReportType} reportTypes={reportTypes}
                    fileName={fileName} setFileName={setFileName} handleFileChange={handleFileChange} selectedFile={selectedFile} handleCheckboxChange={handleCheckboxChange}
                    selectedIndependentIds={selectedIndependentIds} independent={independent} handleSubmitReport={handleSubmitReport} closeModal={closeModal} />
                )}
            </div>
            <ToastContainer />
        </MasterHome>
    );
};

export default MedicalDashboard;