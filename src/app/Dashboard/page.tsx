'use client';
import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterHome from '../components/MasterHome';


function Dashboard() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const handleHFilesClick = () => {
    router.push('/myHfiles');
  };

  const handleMedicalClick = () => {
    router.push('/medicalHistory');
  };

  return (
    <MasterHome>
      <div className="font-['Poppins',sans-serif] m-0 p-0 h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] xl:h-[calc(100vh-139px)] 2xl:h-[calc(100vh-140px)]">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-hidden">
          {/* Welcome Section */}
          <div className="text-center mx-[70px] mt-[30px] mb-[30px]">
            <p className="text-2xl font-medium text-black text-center leading-[34px] tracking-[1px] font-['Montserrat',sans-serif]">
              Welcome back! Your <span className="text-[#0331B5] font-semibold">healthiest self</span> is just a click away. Let's take that next step together!
            </p>
            <div className="h-px bg-[#333333] w-4/5 max-w-[200px] mx-auto mt-[10px]"></div>
          </div>

          {/* Journal Container */}
          <div className="relative w-full">
            <div className="mx-[30px] mb-[75px] p-[30px] rounded-xl flex justify-center items-center bg-gradient-to-b from-white via-white to-[#CAE5FF] relative z-10 shadow-[0px_8px_20px_rgba(0,0,0,0.2)] border border-black/30">
              {/* Main Grid */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center justify-items-center mx-5 gap-20 w-full">
                {/* Image Container */}
                <div className="flex flex-col items-center gap-5">
                  <div className="font-['Poppins',sans-serif] font-semibold text-[#0331B5] text-lg">
                    Hi {userName}!
                  </div>
                  <img src="/SamantaGIF.gif" alt="Personal Health Manager" className='max-w-[450px]' />
                  <div className="text-center text-black text-[23px] tracking-[2px] font-['Montserrat',sans-serif]">
                    <span>I Am Samantha, Your Personal Health Manager</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px bg-[#333333] min-h-[300px] self-center"></div>

                {/* Content Container */}
                <div className="flex flex-col justify-center">
                  <div className="mb-[10px]">
                    <p className="text-center text-[18px] font-semibold m-0 font-['Poppins',sans-serif]">
                      Your <span className="text-[#0331B5]">health records</span> are just a click away.
                    </p>
                    <div className="h-px bg-[#333333] w-4/5 max-w-[125px] mx-auto mt-[10px]"></div>
                  </div>

                  {/* Profile Cards */}
                  <div
                    className="h-[65px] rounded-[17.5px] mb-6 bg-[#F9E380] shadow-[0px_5px_10px_#393838] flex items-center justify-between py-[65px] px-[25px] gap-[10px] cursor-pointer transition-all duration-300 hover:bg-[#F9E380]"
                    onClick={handleHFilesClick}
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-[130px] h-[80px] overflow-hidden bg-white flex justify-center items-center border border-[#333333]/20 rounded-xl mr-5">
                        <img
                          src="/aad67678cd2f3dbe434a2fe7cb0455b82a85482b.png"
                          alt="H-Files"
                          className="w-[60px] h-[60px] object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-[5px] max-w-[75%]">
                        <h3 className="text-black font-semibold text-[20px] m-0 font-['Poppins',sans-serif]">
                          My H-Files
                        </h3>
                        <span className="text-black text-[11px] font-light font-['Montserrat',sans-serif]">
                          We've organized all your family's health reports, right here for you.
                        </span>
                      </div>
                    </div>
                    <div className="text-[#333333] text-xl">
                      <ChevronRight size={24} />
                    </div>
                  </div>

                  <div
                    className="h-[65px] rounded-[17.5px] mb-6 bg-white shadow-[0px_5px_10px_#393838] flex items-center justify-between py-[65px] px-[25px] gap-[10px] cursor-pointer transition-all duration-300 hover:bg-[#F9E380]"
                    onClick={handleMedicalClick}
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-[130px] h-[80px] overflow-hidden bg-white flex justify-center items-center border border-[#333333]/20 rounded-xl mr-5">
                        <img
                          src="/my_medical_history.png"
                          alt="Medical History"
                          className="w-[50px] h-[50px] object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-[5px] max-w-[75%]">
                        <h3 className="text-black font-semibold text-[20px] m-0 font-['Poppins',sans-serif]">
                          My Medical History
                        </h3>
                        <span className="text-black text-[11px] font-light font-['Montserrat',sans-serif]">
                          Access your family's complete medical history anytime.
                        </span>
                      </div>
                    </div>
                    <div className="text-[#333333] text-xl">
                      <ChevronRight size={24} />
                    </div>
                  </div>

                  <div className="h-[65px] rounded-[17.5px] mb-6 bg-white shadow-[0px_5px_10px_#393838] flex items-center justify-between py-[65px] px-[25px] gap-[10px] cursor-pointer transition-all duration-300 hover:bg-[#F9E380]">
                    <div className="flex items-center flex-1">
                      <div className="w-[130px] h-[80px] overflow-hidden bg-white flex justify-center items-center border border-[#333333]/20 rounded-xl mr-5">
                        <img
                          src="Reception Page/journal.png"
                          alt="Journal"
                          className="w-[70px] h-[60px] object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-[5px] max-w-[75%]">
                        <h3 className="text-black font-semibold text-[20px] m-0 font-['Poppins',sans-serif]">
                          Journal
                        </h3>
                        <span className="text-black text-[11px] font-light font-['Montserrat',sans-serif]">
                          Stay informed with doctor-written health articles.
                        </span>
                      </div>
                    </div>
                    <div className="text-[#333333] text-xl">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet View */}
        <div className="hidden md:block lg:hidden">
          <div className="relative w-full">
            <div className="mx-[30px] p-0 bg-none border-none shadow-none">
              <div
                className="flex flex-col items-center gap-5 shadow-[-5px_7.5px_10px_rgba(95,89,89,0.65)] rounded-xl py-[15px] px-5 pb-[25px] bg-gradient-to-b from-transparent via-transparent to-[#CAE5FF] bg-contain bg-top bg-no-repeat"
                style={{
                  backgroundImage: "url('https://via.placeholder.com/600x400/FFE4B5/000000?text=Samanta')"
                }}
              >
                {/* Image Container */}
                <div className="flex flex-col items-center gap-5 order-first">
                  <div className="font-['Poppins',sans-serif] font-semibold text-[#0331B5] text-lg">
                    Hi {userName}!
                  </div>
                  <img
                    src="/SamantaGIF.gif"
                    alt="Personal Health Manager"
                    className=" w-[350px] h-auto object-contain"
                  />
                  <div className="text-center text-black text-2xl tracking-[2px] font-medium font-['Montserrat',sans-serif]">
                    <span>I Am Samantha, Your Personal Health Manager</span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="order-1 w-full">
                  <div
                    className="h-[65px] rounded-[17.5px] mb-6 bg-[#F9E380] shadow-[0px_5px_10px_#393838] flex items-center justify-between py-[70px] px-[35px] gap-[10px] cursor-pointer transition-all duration-300"
                    onClick={handleHFilesClick}
                  >
                    <div className="flex items-center flex-1 flex-nowrap">
                      <div className="w-[80px] h-[70px] overflow-hidden bg-white flex justify-center items-center border border-[#333333]/20 rounded-xl mr-5">
                        <img
                          src="/aad67678cd2f3dbe434a2fe7cb0455b82a85482b.png"
                          alt="H-Files"
                          className="w-[60px] h-[60px] object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-[10px]">
                        <h3 className="text-black font-semibold text-[25px] m-0 font-['Poppins',sans-serif]">
                          My H-Files
                        </h3>
                        <span className="text-black text-[21px] font-light font-['Montserrat',sans-serif]">
                          We've organized all your family's health reports, right here for you.
                        </span>
                      </div>
                    </div>
                    <div className="text-[#333333]">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outside Card Section */}
          <div className="mx-[50px] mb-[120px] pb-[100px] flex flex-col gap-[25px] mt-[30px]">
            <div className="mb-0">
              <p className="m-0 text-[23px] font-medium text-center font-['Poppins',sans-serif]">
                Your <span className="text-[#0331B5]">health records</span> are just a click away.
              </p>
              <div className="h-px bg-[#333333] w-4/5 max-w-[125px] mx-auto mt-[10px]"></div>
            </div>

            <div
              className="h-[65px] rounded-[17.5px] mb-6 bg-white shadow-[0px_5px_10px_#393838] flex items-center justify-between py-[70px] px-[35px] gap-[10px] cursor-pointer transition-all duration-300 hover:bg-[#F9E380]"
              onClick={handleMedicalClick}
            >
              <div className="flex items-center flex-1 flex-nowrap">
                <div className="w-[60px] h-[60px] overflow-hidden bg-white flex justify-center items-center border border-[#333333]/20 rounded-xl mr-5">
                  <img
                    src="/my_medical_history.png"
                    alt="Medical History"
                    className="w-[50px] h-[50px] object-cover"
                  />
                </div>
                <div className="flex flex-col gap-[10px]">
                  <h3 className="text-black font-semibold text-[25px] m-0 font-['Poppins',sans-serif]">
                    My Medical History
                  </h3>
                  <span className="text-black text-[21px] font-light font-['Montserrat',sans-serif]">
                    Access your family's complete medical history anytime.
                  </span>
                </div>
              </div>
              <div className="text-[#333333]">
                <ChevronRight size={20} />
              </div>
            </div>

            <div className="h-[65px] rounded-[17.5px] mb-6 bg-white shadow-[0px_5px_10px_#393838] flex items-center justify-between py-[70px] px-[35px] gap-[10px] cursor-pointer transition-all duration-300 hover:bg-[#F9E380]">
              <div className="flex items-center flex-1 flex-nowrap">
                <div className="w-[60px] h-[60px] overflow-hidden bg-white flex justify-center items-center border border-[#333333]/20 rounded-xl mr-5">
                  <img
                    src="/52dfa155236ba07b3722d5d6eb1a4294762ff447.png"
                    alt="Journal"
                    className="w-[50px] h-[50px] object-cover"
                  />
                </div>
                <div className="flex flex-col gap-[10px]">
                  <h3 className="text-black font-semibold text-[25px] m-0 font-['Poppins',sans-serif]">
                    Journal
                  </h3>
                  <span className="text-black text-[21px] font-light font-['Montserrat',sans-serif]">
                    Stay informed with doctor-written health articles.
                  </span>
                </div>
              </div>
              <div className="text-[#333333]">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        {/* Mobile View - Updated Design */}
<div className="block md:hidden">
  <div className="bg-white min-h-screen px-4 py-6">
    
    {/* Header Section */}
    <div className="text-center mb-8">
      <h1 className="text-2xl font-semibold text-[#2C3E50] mb-2 font-['Poppins',sans-serif]">
        Hi {userName}!
      </h1>
    </div>

    {/* Main Character Card */}
    <div className="bg-gradient-to-b from-[#E8F4FD] to-[#F0F8FF]  rounded-[24px] p-3 mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-[#E3F2FD]">
      {/* Character Image */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img
            src="/SamantaGIF.gif"
            alt="Personal Health Manager"
            className="w-[180px] h-[180px] object-contain"
          />
        </div>
      </div>
      
      {/* Character Introduction */}
      <div className="text-center mb-6">
        <p className="text-base font-medium text-[#2C3E50] font-['Poppins',sans-serif] leading-relaxed">
          I Am Samantha, Your Personal Health Manager
        </p>
      </div>

      {/* Primary Action Card - My H-Files */}
      <div
        className="bg-gradient-to-r from-[#FFE082] to-[#FFCC02] rounded-[16px] p-2 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(255,204,2,0.3)]"
        onClick={handleHFilesClick}
      >
        <div className="flex items-center flex-1">
          <div className="w-[58px] h-[58px] bg-white rounded-[12px] mr-4 flex items-center justify-center shadow-sm overflow-hidden">
            <img
              src="/aad67678cd2f3dbe434a2fe7cb0455b82a85482b.png"
              alt="H-Files"
              className="w-[52px] h-[52px] object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-[#2C3E50] mb-1 font-['Poppins',sans-serif]">
              My H-Files
            </h3>
            <p className="text-[11px] text-[#5D6D7E] font-['Montserrat',sans-serif] leading-tight">
              We've organized all your family's health reports, right here for you.
            </p>
          </div>
        </div>
        <div className="ml-2">
          <ChevronRight size={20} className="text-[#2C3E50]" />
        </div>
      </div>
    </div>

    {/* Secondary Options */}
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-sm font-medium text-[#2C3E50] font-['Poppins',sans-serif]">
          Your <span className="text-[#0331B5] font-semibold">health records</span> are just a click away.
        </h2>
        <div className=" border border-black  w-[80px] mx-auto mt-2"></div>
      </div>

      {/* Medical History Card */}
      <div
        className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-[#F8F9FA]"
        onClick={handleMedicalClick}
      >
        <div className="flex items-center flex-1">
          <div className="w-[58px] h-[58px] bg-white border border-gray-200 rounded-[12px] mr-4 flex items-center justify-center overflow-hidden">
            <img
              src="/my_medical_history.png"
              alt="Medical History"
              className="w-[52px] h-[52px] object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-[#2C3E50] mb-1 font-['Poppins',sans-serif]">
              My Medical History
            </h3>
            <p className="text-[11px] text-[#5D6D7E] font-['Montserrat',sans-serif] leading-tight">
              Access your family's complete medical history anytime.
            </p>
          </div>
        </div>
        <div className="ml-2">
          <ChevronRight size={18} className="text-[#7F8C8D]" />
        </div>
      </div>

      {/* Journal Card */}
      <div className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.10)] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-[#F8F9FA]">
        <div className="flex items-center flex-1">
          <div className="w-[58px] h-[58px] bg-white border border-gray-200 rounded-[12px] mr-4 flex items-center justify-center overflow-hidden">
            <img
              src="/52dfa155236ba07b3722d5d6eb1a4294762ff447.png"
              alt="Journal"
              className="w-[42px] h-[42px] object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-[#2C3E50] mb-1 font-['Poppins',sans-serif]">
              Journal
            </h3>
            <p className="text-[13px] text-[#5D6D7E] font-['Montserrat',sans-serif] leading-tight">
              Stay informed with doctor-written health articles.
            </p>
          </div>
        </div>
        <div className="ml-2">
          <ChevronRight size={18} className="text-[#7F8C8D]" />
        </div>
      </div>
    </div>

    {/* Bottom Spacing */}
    <div className="h-8"></div>
  </div>
</div>
      </div>
    </MasterHome>
  );
}

export default Dashboard;