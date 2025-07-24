import React from "react";

interface CustomRadioButtonProps {
    name: string;
    value: string | number;
    checked: boolean;
    onChange: (event?: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
    name,
    value,
    checked,
    onChange,
    className = "",
}) => {
    const handleClick = () => {
        // Create a more accurate fake event or just call onChange directly
        onChange();
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="sr-only" // Hide default radio button
            />
            <div
                className={`
                    w-4 h-4 
                    rounded-full 
                    border-2 
                    cursor-pointer 
                    flex 
                    items-center 
                    justify-center 
                    transition-all 
                    duration-200 
                    ${checked 
                        ? 'bg-yellow-400 border-yellow-500' 
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }
                `}
                onClick={handleClick}
            >
                {checked && (
                    <svg
                        className="w-3 h-3 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default CustomRadioButton;