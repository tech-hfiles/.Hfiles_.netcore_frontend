'use client';
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MasterHome from '../components/MasterHome';
import { MemberList, GetRequestList, RespondToRequest, SoftDeleteMember, EditMember } from '../services/HfilesServiceApi';
import { decryptData } from '../utils/webCrypto';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLessThan } from 'react-icons/fa';

interface Member {
    id: number; requestId?: number; type: 'dependent' | 'independent';
    firstName: string; lastName: string;
    email: string; phoneNumber: string | null;
    hfId: string; profileURL: string;
}

const BackToHome = () => {
    const router = useRouter();
    return (
        <div className="w-full flex items-center mb-4">
  <button
    onClick={() => router.push('/dashboard')}
    className="flex items-center text-black px-3 py-1 rounded transition-colors duration-200"
  >
    <FaLessThan className="w-4 h-4 mr-2" />
    Back
  </button>
</div>

    );
};

const MyMembers = () => {
    const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
    const [members, setMembers] = useState<Member[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editEmail, setEditEmail] = useState('');
    const [editPhoneNumber, setEditPhoneNumber] = useState('');
    const [requestCount, setRequestCount] = useState(0);
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const router = useRouter();

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

    const fetchMembers = async () => {
        const userId = await getUserId();
        if (!userId) {
            toast.error('User not logged in.');
            return;
        }
        try {
            const response = await MemberList(userId);
            const data = response?.data?.data;
            if (data) {
                const allMembers: Member[] = [
                    ...(data.independentMembers || []).map((m: any) => ({
                        id: m.id,
                        requestId: m.id,
                        firstName: m.firstName,
                        lastName: m.lastName,
                        email: m.email,
                        phoneNumber: m.phoneNumber,
                        hfId: m.hfId,
                        profileURL: m.profileURL,
                        type: 'independent',
                    })),
                    ...(data.dependentMembers || []).map((m: any) => ({
                        id: m.id,
                        firstName: m.firstName,
                        lastName: m.lastName,
                        email: m.email,
                        phoneNumber: m.phoneNumber,
                        hfId: m.hfId,
                        profileURL: m.profileURL,
                        type: 'dependent',
                    })),
                ];
                setMembers(allMembers);
            } else {
                toast.error('No members found.');
            }
        } catch (err) {
            console.error('Error fetching members:', err);
            toast.error('Failed to load members.');
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchRequestsAndUpdateCount = async () => {
        try {
            const encryptedUserId = localStorage.getItem('userId');
            if (!encryptedUserId) return;
            const userIdStr = await decryptData(encryptedUserId);
            const userId = parseInt(userIdStr, 10);
            const response = await GetRequestList(userId);
            if (response?.data?.success) {
                setRequestCount(response.data.data.length);
                if (activeTab === 'requests') {
                    setRequests(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };
    useEffect(() => {
        fetchRequestsAndUpdateCount();
    }, [activeTab]);

    const handleRequestResponse = async (
        requestId: number,
        status: 'Accepted' | 'Rejected'
    ) => {
        if (!requestId || requestId === 0) {
            toast.error('Invalid request ID.');
            return;
        }
        const action = status === 'Accepted' ? 'accept' : 'reject';
        try {
            const response = await RespondToRequest({ requestId, status: action });
            toast.success(`${response.data.message}`);
            setRequests((prev) => prev.filter((r) => r.id !== requestId));
            fetchRequestsAndUpdateCount();
        } catch (error: any) {
            console.error('API error:', error?.response?.data || error);
        }
    };

    const handleDelete = async (id: number, isIndependent: boolean) => {
        try {
            const response = await SoftDeleteMember(id);
                toast.success(`${response.data.message}`);
                setMembers((prev) =>
                    prev.filter((member) => {
                        const compareId = isIndependent ? member.requestId : member.id;
                        return compareId !== id;
                    })
                );
        } catch (error) {
            console.error('Soft delete error:', error);
        }
    };

    useEffect(() => {
        if (selectedMember) {
            setEditEmail(selectedMember.email);
            setEditPhoneNumber(selectedMember.phoneNumber || '');
        }
    }, [selectedMember]);

    const handleEditSave = async () => {
        if (!selectedMember) {
            toast.error('No member selected for editing.');
            return;
        }
        let valid = true;
        setEmailError('');
        setPhoneError('');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;
        if (!editEmail || !emailRegex.test(editEmail)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
        }
        if (!editPhoneNumber || !phoneRegex.test(editPhoneNumber)) {
            setPhoneError('Please enter a valid 10-digit phone number.');
            valid = false;
        }
        if (!valid) return;
        const formData = new FormData();
        if (editEmail) formData.append('Email', editEmail);
        if (editPhoneNumber) formData.append('PhoneNumber', editPhoneNumber);
        if (image) formData.append('ProfilePhoto', image);

        try {
            const id = selectedMember.requestId || selectedMember.id;
            const response = await EditMember(id, formData);
            if (response.data?.success) {
                toast.success('Member updated successfully!');
                setSelectedMember(null);
                setImage(null);
                setPreviewImage(null);
                fetchMembers();
            } else {
                toast.error(response.data?.message );
            }
        } catch (err: any) {
            console.error('Edit error:', err.response?.data || err);
        }
    };

    return (
        <MasterHome>
            <div className="p-2 sm:p-4 lg:p-6 xl:p-8 relative font-poppins h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-139px)] 2xl:h-[calc(100vh-140px)]">
                <BackToHome />

                {/* Header Section */}
                <div className="text-center mt-2 sm:mt-4">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-800">
                        Your Health Circle
                    </h2>
                    <p className="mt-2 px-2 sm:px-4 py-2 rounded text-black font-montserrat text-sm sm:text-base lg:text-lg">
                        Let your loved ones be a part of your health journey and build a healthier future together.
                    </p>
                </div>

                <div className="border-b my-2 sm:my-4" />

                {/* Tab Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-8 py-2 sm:py-3 rounded-md font-montserrat transition duration-300 text-sm sm:text-base ${activeTab === 'members'
                                ? 'bg-gradient-to-r from-cyan-300 to-white text-black shadow'
                                : 'border border-black hover:bg-gray-100 text-black'
                            }`}>
                        Family Members List
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setActiveTab('requests')}
                            style={activeTab === 'requests' ? { background: 'rgba(249, 227, 128, 1)' } : {}}
                            className={`flex items-center border border-black px-4 sm:px-6 py-2 sm:py-3 rounded-md font-montserrat transition duration-300 text-sm sm:text-base ${activeTab === 'requests'
                                    ? 'text-black'
                                    : 'bg-white text-black hover:bg-gray-100'
                                }`}>
                            Request
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        {requestCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {requestCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Members Tab Content */}
                {activeTab === 'members' && (
                    <div className="mt-4 sm:mt-6">
                        {members.length === 0 ? (
                            <p className="text-gray-600 text-center text-sm sm:text-base">No family members found.</p>
                        ) : (
                            <>
                                {/* Responsive Grid Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="w-full max-w-[478px] mx-auto rounded-lg sm:rounded-[22px] border border-[#333] shadow-md flex flex-col justify-between pt-4 sm:pt-6 pb-0 relative group bg-white lg:bg-gradient-to-br lg:from-white lg:via-blue-50 lg:to-blue-100"
                                            style={{ minHeight: '320px' }}>

                                            {/* Badge */}
                                            <span
                                                className="absolute top-0 right-0 text-xs font-montserrat px-3 sm:px-6 lg:px-9 py-1 sm:py-2 rounded-bl-xl rounded-tr-lg sm:rounded-tr-[22px]"
                                                style={{
                                                    background:
                                                        member.type === 'independent'
                                                            ? 'rgba(249, 227, 128, 1)'
                                                            : 'rgba(35, 139, 2, 1)',
                                                    color: member.type === 'independent' ? 'black' : 'white',
                                                }}>
                                                {member.type === 'independent' ? 'Independent' : 'Dependent'}
                                            </span>

                                            {/* Profile Info */}
                                            <div className="px-3 sm:px-6 flex-grow">
                                                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                                                    <img
                                                        src={
                                                            member.profileURL &&
                                                                member.profileURL !== 'Profile Photo Not Available'
                                                                ? member.profileURL
                                                                : '/assets/Asset 9.png'
                                                        }
                                                        alt="Avatar"
                                                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40 rounded-full border border-[#333] object-cover flex-shrink-0"
                                                    />
                                                    <div className="text-center sm:text-left flex-grow">
                                                        <h3 className="text-base sm:text-lg lg:text-xl font-bold font-poppins text-blue-800 break-words">
                                                            {member.firstName} {member.lastName}
                                                        </h3>
                                                        <p className="text-xs sm:text-sm text-black-700 font-montserrat mt-1">
                                                            <span className="font-montserrat">HFID:</span> {member.hfId}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                                                    <p className="text-xs sm:text-sm text-black-700 font-montserrat break-all">
                                                        <span className="font-montserrat">Email:</span> {member.email}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-black-700 font-montserrat">
                                                        <span className="font-montserrat">Phone:</span>{' '}
                                                        {member.phoneNumber || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="w-full border-t border-[#333] px-3 sm:px-6 py-2 sm:py-3 bg-gray-50 rounded-b-lg sm:rounded-b-[22px] flex items-center justify-center text-xs sm:text-sm text-black relative">
                                                <div className="flex items-center justify-center w-full gap-2 sm:gap-4">
                                                    {member.type !== 'independent' ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMember(member);
                                                                setEditEmail(member.email || '');
                                                                setEditPhoneNumber(member.phoneNumber || '');
                                                                setPreviewImage(member.profileURL || null);
                                                            }}
                                                            className="font-bold font-montserrat text-blue-800 text-sm sm:text-base lg:text-lg hover:text-blue-600 transition-colors">
                                                            Edit
                                                        </button>
                                                    ) : (
                                                        <div className="text-xs sm:text-sm flex gap-1 sm:gap-2 text-gray-600 font-montserrat items-center">
                                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                    d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
                                                            </svg>
                                                            <span className="text-center">Independent users are not Editable!</span>
                                                        </div>
                                                    )}

                                                    {/* Delete icon */}
                                                    <svg
                                                        onClick={() => {
                                                            const isIndependent = member.type === 'independent';
                                                            const idToDelete = isIndependent ? member.requestId : member.id;
                                                            if (!idToDelete) {
                                                                toast.error("Can't delete: missing ID");
                                                                return;
                                                            }
                                                            handleDelete(idToDelete, isIndependent);
                                                        }}
                                                        className="w-5 h-5 sm:w-6 sm:h-6 absolute right-2 sm:right-4 text-gray-400 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200 hover:text-blue-800"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Member Button */}
                                <div className="text-center mt-6 sm:mt-8 lg:mt-10 w-full">
                                    <button
                                        onClick={() => router.push('/addMember')}
                                        className="font-poppins text-black font-montserrat px-6 sm:px-8 lg:px-11 py-2 sm:py-3 rounded-md text-sm sm:text-base lg:text-lg transition-colors hover:bg-yellow-400"
                                        style={{ background: 'rgba(249, 227, 128, 1)' }}>
                                        Add Family Member
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Requests Tab Content */}
                {activeTab === 'requests' && (
                    <div className="mt-6 sm:mt-10">
                        {requests.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm sm:text-base">No pending requests.</p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                                {requests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="w-full max-w-[478px] mx-auto rounded-lg sm:rounded-[22px] border border-[#333] shadow-md flex flex-col justify-between pt-4 sm:pt-6 pb-0 bg-white lg:bg-gradient-to-br lg:from-white lg:via-blue-50 lg:to-blue-100"
                                        style={{ minHeight: '320px' }}>

                                        <div className="px-3 sm:px-6 flex-grow">
                                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4">
                                                <img
                                                    src={
                                                        req.profileURL && req.profileURL !== 'Profile Photo Not Available'
                                                            ? req.profileURL
                                                            : '/assets/Asset 9.png'
                                                    }
                                                    alt="Avatar"
                                                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40 rounded-full border border-[#333] object-cover flex-shrink-0"
                                                />
                                                <div className="text-center sm:text-left">
                                                    <h3 className="text-base sm:text-lg lg:text-xl font-poppins font-bold text-blue-800 break-words">
                                                        {req.firstName} {req.lastName}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-[#333] font-montserrat">{req.hfId || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                                                <p className="text-xs sm:text-sm text-[#000] font-montserrat break-all">
                                                    <span className="font-montserrat">Email:</span> {req.email}
                                                </p>
                                                <p className="text-xs sm:text-sm text-[#000] font-montserrat">
                                                    <span className="font-montserrat">Number:</span> {req.phoneNumber || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 sm:mt-6">
                                            <button
                                                onClick={() => {
                                                    const confirm = window.confirm('Are you sure you want to accept this request?');
                                                    if (confirm) handleRequestResponse(req.id, 'Accepted');
                                                }}
                                                className="w-full bg-[#0056BA] hover:bg-[#004494] transition duration-300 text-white py-2 sm:py-3 font-montserrat rounded-none text-sm sm:text-base">
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const confirm = window.confirm('Are you sure you want to reject this request?');
                                                    if (confirm) handleRequestResponse(req.id, 'Rejected');
                                                }}
                                                className="w-full border-t border-[#333] text-[#0056BA] hover:bg-[#E6F0FF] transition duration-300 py-2 sm:py-3 font-montserrat rounded-b-lg sm:rounded-b-[22px] text-sm sm:text-base">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Edit Modal */}
                {selectedMember && (
                    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md lg:max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">Edit User</h3>

                            {/* Email */}
                            <label className="block text-gray-700 text-sm mb-1">Email</label>
                            <input
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Email"
                                className={`w-full border px-3 sm:px-4 py-2 rounded mb-1 text-sm sm:text-base ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {emailError && <p className="text-red-500 text-xs sm:text-sm mb-2">{emailError}</p>}

                            {/* Mobile Number */}
                            <label className="block text-gray-700 text-sm mb-1">Mobile Number</label>
                            <input
                                value={editPhoneNumber}
                                onChange={(e) => setEditPhoneNumber(e.target.value)}
                                placeholder="Mobile Number"
                                className={`w-full border px-3 sm:px-4 py-2 rounded mb-1 text-sm sm:text-base ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {phoneError && <p className="text-red-500 text-xs sm:text-sm mb-2">{phoneError}</p>}

                            {/* Change Profile Image Button */}
                            <div className="flex justify-center">
                                <label className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 sm:px-4 py-2 rounded cursor-pointer mb-4 inline-block text-xs sm:text-sm text-center">
                                    Change Profile Image
                                    <input type="file" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) { setImage(file); setPreviewImage(URL.createObjectURL(file)); }
                                    }} className="hidden" />
                                </label>
                            </div>

                            {/* Optional Preview */}
                            {previewImage && (
                                <div className="flex justify-center  mb-4">
                                    <img src={previewImage} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 border border-gray-300 rounded-full object-cover" />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setSelectedMember(null);
                                        setImage(null);
                                        setPreviewImage(null);
                                        setEmailError('');
                                        setPhoneError('');
                                    }}
                                    className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm sm:text-base">
                                    Close
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded text-sm sm:text-base">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decorative Image - Hidden on mobile */}
                <div className="fixed bottom-11 right-0 z-[-1] w-[240px] md:w-[320px] lg:w-[400px] xl:w-[480px] max-h-[90vh] pointer-events-none hidden lg:block">
                    <img src="/135faa613f0538c4e00d4c35094135efd510597d.png" alt="Family illustration" className="w-full h-full object-contain" />
                </div>

                <ToastContainer />
            </div>
        </MasterHome>
    );
};

export default MyMembers;