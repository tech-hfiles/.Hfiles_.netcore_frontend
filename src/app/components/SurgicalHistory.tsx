import { Calendar } from 'lucide-react';
import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface FormData {
    surgeryName: string;
    hospitalName: string;
    drName: string;
    surgeryDate: string;
}

interface FormErrors {
    surgeryName?: string;
    hospitalName?: string;
    drName?: string;
    surgeryDate?: string;
}

interface SurgicalHistoryProps {
    formData: FormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: FormErrors;
    handleSubmit: () => void;
}

const SurgicalHistory: React.FC<SurgicalHistoryProps> = ({
    formData,
    handleChange,
    errors,
    handleSubmit,
}) => {
    // Handle date change separately to ensure proper formatting
    const handleDateChange = (date: Date | null) => {
        const formattedDate = date ? date.toISOString().split('T')[0] : '';
        
        // Create a proper synthetic event
        const syntheticEvent = {
            target: {
                name: 'surgeryDate',
                value: formattedDate
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleChange(syntheticEvent);
    };

    return (
        <div className="mt-4 flex flex-col lg:flex-row justify-between items-start gap-6 px-3 sm:px-4">
            {/* Left Text */}
            <div className="w-full lg:w-1/2 text-left">
                <p className="text-black text-lg font-semibold border-b pb-1 mb-3 w-fit">
                    Add your Surgery Now
                </p>
                <p className="text-gray-700 text-sm sm:text-base font-montserrat-600">
                    If you've had a surgery, add it now to keep a complete track of your
                    medical history – because every detail matters when it comes to your
                    health.
                </p>
            </div>

            {/* Right Form */}
            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="w-full">
                    <input
                        type="text"
                        name="surgeryName"
                        value={formData.surgeryName}
                        onChange={handleChange}
                        placeholder="Surgery Name"
                        className="border p-2 rounded w-full text-sm font-montserrat-600"
                    />
                    {errors.surgeryName && (
                        <p className="text-red-500 text-sm mt-1">{errors.surgeryName}</p>
                    )}
                </div>

                <div className="w-full">
                    <input
                        type="text"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleChange}
                        placeholder="Enter Hospital Name"
                        className="border p-2 rounded w-full text-sm font-montserrat-600"
                    />
                    {errors.hospitalName && (
                        <p className="text-red-500 text-sm mt-1">{errors.hospitalName}</p>
                    )}
                </div>

                <div className="w-full">
                    <input
                        type="text"
                        name="drName"
                        value={formData.drName}
                        onChange={handleChange}
                        placeholder="Enter Dr. Name"
                        className="border p-2 rounded w-full text-sm font-montserrat-600"
                    />
                    {errors.drName && (
                        <p className="text-red-500 text-sm mt-1">{errors.drName}</p>
                    )}
                </div>

                <div className="w-full relative">
                    <DatePicker
                        selected={formData.surgeryDate ? new Date(formData.surgeryDate) : null}
                        onChange={handleDateChange}
                        name="surgeryDate"
                        placeholderText="Surgery Date"
                        dateFormat="yyyy-MM-dd"
                        maxDate={new Date()}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                        className="border p-2 pr-10 rounded w-full text-sm font-montserrat-600 placeholder:text-gray-400"
                        wrapperClassName="w-full"
                        popperClassName="z-50"
                        calendarClassName="border-2 border-gray-300 rounded-lg shadow-lg"
                    />
                    <Calendar className="absolute right-3 top-3 h-5 w-5 text-[#333333] pointer-events-none" />
                    {errors.surgeryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.surgeryDate}</p>
                    )}
                </div>

                <div className="flex justify-center col-span-1 sm:col-span-2">
                    <button
                        onClick={handleSubmit}
                        style={{ background: 'rgba(249, 227, 128, 1)' }}
                        className="w-full sm:w-auto px-30 py-2 text-gray-800 font-semibold rounded border border-black"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurgicalHistory;