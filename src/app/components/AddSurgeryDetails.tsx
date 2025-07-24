import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'

interface HistoryItem {
    user_surgery_id: number;
    user_id: number;
    user_surgery_details: string;
    user_surgery_year: string;
    hostname: string | null;
    drname: string | null;
}

interface AddSurgeryDetailsProps {
    historyList: HistoryItem[];
    handleEdit: (index: number) => void;
    setShowForm: (value: boolean) => void;
}

const AddSurgeryDetails: React.FC<AddSurgeryDetailsProps> = ({
    historyList, handleEdit, setShowForm }) => {
    return (
        <div>
            {/* Table with responsive design */}
            <div className="rounded-xl overflow-hidden border border-gray-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[200px]">
                        <thead className="bg-blue-100 text-gray-800 font-poppins">
                            <tr>
                                <th className="p-2 sm:p-3 border-r text-xs sm:text-sm font-poppins">Surgery Name</th>
                                <th className="p-2 sm:p-3 border-r text-xs sm:text-sm hidden sm:table-cell font-poppins">Surgery Year</th>
                                <th className="p-2 sm:p-3 border-r text-xs sm:text-sm hidden sm:table-cell font-poppins">Hospital Name</th>
                                <th className="p-2 sm:p-3 border-r text-xs sm:text-sm hidden sm:table-cell font-poppins">Doctor Name</th>
                                <th className="p-2 sm:p-3 text-xs sm:text-sm">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {historyList.map((item: HistoryItem, index: number) => (
                                <tr key={index} className="border-t">
                                    <td className="p-2 sm:p-3 border-r text-xs sm:text-sm">{item.user_surgery_details || "—"}</td>
                                    <td className="p-2 sm:p-3 border-r text-xs sm:text-sm hidden sm:table-cell">
                                        {item.user_surgery_year
                                            ? new Date(item.user_surgery_year).toLocaleDateString("en-US", {
                                                year: "numeric",month:"numeric",day:"numeric"
                                            })
                                            : "—"}
                                    </td>
                                    <td className="p-2 sm:p-3 border-r text-xs sm:text-sm hidden sm:table-cell">{item.hostname || "—"}</td>
                                    <td className="p-2 sm:p-3 border-r text-xs sm:text-sm hidden sm:table-cell">{item.drname || "—"}</td>
                                    <td className="p-2 sm:p-3">
                                        <button
                                            className="text-red-500 hover:text-red-700 mr-4"
                                            onClick={() => handleEdit(index)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>

                                        <button className="text-red-500 hover:text-red-700">
                                            <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* Add More Section - Outside table */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 sm:mt-4 gap-3 sm:gap-0">
                <span
                    className="text-blue-800 font-medium cursor-pointer text-sm sm:text-base"
                    onClick={() => setShowForm(true)}
                >
                    Have another surgery to add?
                </span>
                <button
                    style={{ background: 'rgba(249, 227, 128, 1)' }}
                    className="px-4 sm:px-6 py-2 text-gray-800 font-poppins rounded-lg text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => setShowForm(true)}
                >
                    Add More
                </button>
            </div>
        </div>
    )
}

export default AddSurgeryDetails
