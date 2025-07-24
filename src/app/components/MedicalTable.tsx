import React from 'react'
import CustomRadioButton from './CustomRadioButton';


interface MedicalTableProps {
    habits: any;
    habitSelections: Record<string, string>;
    handleSelectionChange: (key: string, value: string) => void;
    setISocial: (val: boolean) => void;
    isSocial: boolean;
    handleSubmits: () => void;
}

const MedicalTable: React.FC<MedicalTableProps> = ({ habits, habitSelections, handleSelectionChange, setISocial, isSocial, handleSubmits }) => {
    return (
        <div className="w-full lg:w-2/3 xl:w-3/4 2xl:w-2/3 p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg lg:text-xl text-center mt-4 font-bold font-poppins-600"
  style={{
    color: 'rgba(3, 49, 181, 1)'
  }}>
               Social History
            </h3>
            <p className="text-xs sm:text-sm mb-6 mt-4 sm:mb-4 text-center font-montserrat-600">
                Track your social history - Every habit counts for better health.
            </p>
            <div className="border border-black mb-6"></div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden sm:block">
                <table className="w-full text-xs sm:text-sm border-collapse min-w-[300px]">
                    <thead>
                        <tr className="text-left border-b border-gray-300">
                            <th className="py-2 px-4 font-montserrat-600" style={{
    color: 'rgba(3, 49, 181, 1)'
  }} >Lifestyle Habits Overview</th>
                            <th className="py-2 px-4 text-center">Daily</th>
                            <th className="py-2 px-4 text-center">Occasionally</th>
                            <th className="py-2 px-4 text-center">Rarely</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {habits.map((habit: any, index: any) => (
                            <tr key={index}>
                                <td className="py-4 px-6 text-black font-bold">{habit.question}</td>
                                {["Daily", "Occasionally", "Rarely"].map(option => {
                                    const lowerOption = option.toLowerCase();
                                    return (
                                        <td key={option} className="py-2 px-4 ">
                                            <div className="flex justify-center items-center h-full">
                                            <CustomRadioButton
                                                name={habit.key}
                                                value={lowerOption}
                                                checked={habitSelections[habit.key] === lowerOption}
                                                onChange={() => {
                                                    handleSelectionChange(habit.key, option);
                                                    setISocial(true);
                                                }}

                                            />
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card/List View */}
            <div className="block sm:hidden grid grid-cols-1 gap-3">
                {habits.map((habit: any, index: any) => (
                    <div key={index} className="">
                        <div className="font-montserrat-600 text-sm text-blue-800 mb-3">
                            {index + 1}. {habit.question}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {["Daily", "Occasionally", "Rarely"].map(option => {
                                const lowerOption = option.toLowerCase();
                                return (
                                    <label key={option} className="flex items-center justify-center gap-1 cursor-pointer">
                                        <CustomRadioButton
                                            name={habit.key}
                                            value={lowerOption}
                                            checked={habitSelections[habit.key] === lowerOption}
                                            onChange={() => {
                                                handleSelectionChange(habit.key, option);
                                                setISocial(true);
                                            }}

                                        />
                                        <span className="text-xs text-gray-800">{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            {isSocial && (
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSubmits}
                        className="px-6 py-2 primary hover:bg-blue-700 text-white text-sm font-montserrat-600 rounded-lg shadow"
                    >
                        Save
                    </button>
                </div>
            )}

        </div>
    )
}

export default MedicalTable
