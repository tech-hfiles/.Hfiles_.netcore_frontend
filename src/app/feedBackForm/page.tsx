'use client'
export const runtime = 'edge'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import MasterHome from '../components/MasterHome';

const FeedbackPage = () => {
    const router = useRouter();
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = () => {
        console.log('Feedback submitted:', { feedback, rating });
        alert('Thank you for your feedback!');
    };

    return (
        <MasterHome>
            <div className='p-2 sm:p-3 lg:p-4 min-w-[80%] mx-auto font-sans'>
                <div className="flex justify-between items-center mb-2 sm:mb-2">
                    <button
                        className="text-black font-bold hover:text-black text-sm sm:text-base cursor-pointer"
                        onClick={() => router.push("/dashboard")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-1 sm:mr-2" /> Back
                    </button>
                </div>

                {/* Recreated Feedback Design */}
                <div className="rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="text-center py-2 sm:py-3 lg:py-4 px-2 sm:px-4 bg-white">
                        <h1 className="text-xl sm:text-2xl md:text-3xl  font-bold text-blue-800 mb-2 font-poppins-600">
                            We appreciate your feedback
                        </h1>

                        {/* Centered border */}
                        <div className="border-b-2 border-black w-20 sm:w-24 md:w-30 mx-auto my-2 sm:my-4"></div>

                        <p className="text-black text-sm sm:text-base  mx-auto font-poppins-500">
                            Please take a moment to evaluate your experience and let us know how we're doing.
                        </p>
                    </div>

                    <div className="border border-black mx-auto"></div>

                    <div className="flex flex-col xl:flex-row bg-white mt-2">
                        {/* Left Section - Feedback Form */}
                        <div className="w-full xl:w-1/2 p-2  border border-gray-200 rounded-lg shadow-2xl">
                            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
                                {/* Illustration Area - Only show on small screens */}
                                <div className="text-center xl:hidden mb-4 sm:mb-6">
                                    <div className="flex justify-center space-x-4">
                                        <img 
                                            src="/11d0a1317e924575539c6d8d3842c71be05b128e.png" 
                                            alt="Person 1" 
                                            className="w-70 h-32"
                                        />
                                    </div>
                                </div>

                                {/* Illustration Area - Only show on xl+ screens */}
                                <div className="text-center hidden xl:block mb-4 lg:mb-6">
                                    <div className="flex justify-center space-x-4">
                                        <img 
                                            src="/11d0a1317e924575539c6d8d3842c71be05b128e.png" 
                                            alt="Person 1" 
                                            className="w-60 h-60"
                                        />
                                    </div>
                                </div>

                                {/* Feedback Textarea */}
                                <div className="mb-2">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="What can we do to improve your experience?"
                                        className="w-full h-24 sm:h-28 md:h-32 lg:h-36 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400 p-3 sm:p-4 text-sm sm:text-base"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    className="w-full primary text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-bold transition-colors duration-200 text-sm sm:text-base lg:text-lg"
                                >
                                    Submit Your Feedback
                                </button>
                            </div>
                        </div>

                        {/* Right Section - Character Illustration - Hidden on smaller screens */}
                        <div className="hidden xl:flex w-full xl:w-1/2 items-center justify-center p-2 ">
                            <div className="max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl w-full overflow-hidden">
                                {/* Header */}
                                <div className="text-center ">
                                    <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-black font-poppins-600">
                                        I'm Samantha
                                    </h1>
                                </div>
                                
                                {/* Character Illustration */}
                                <div className="flex-1 p-2 flex items-center justify-center">
                                    <img 
                                        src='/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png' 
                                        alt='samantha' 
                                        className="w-48 h-48 lg:w-60 lg:h-60 xl:w-72 xl:h-72 2xl:w-80 2xl:h-80 object-contain"
                                    />
                                </div>
                                
                                {/* Footer Text */}
                                <div className="text-center p-2">
                                    <p className="text-sm lg:text-base xl:text-lg text-black leading-relaxed font-montserrat-500">
                                        Simpler health starts with you - tell us what you think.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MasterHome>
    );
};

export default FeedbackPage;