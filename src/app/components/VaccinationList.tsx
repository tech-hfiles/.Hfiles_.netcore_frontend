import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, User, Eye, Plus } from 'lucide-react';

const VaccinationList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedVaccines, setSelectedVaccines] = useState([]) as any;
    const [expandedCards, setExpandedCards] = useState({}) as any;

    const vaccinationData = [
        {
            id: 1,
            vaccine: 'BCG',
            dueAge: 'At Birth',
            vaccinationDate: '10/11/2004',
            doctorName: 'Dr. Patel',
            status: 'completed',
            checked: true
        },
        {
            id: 2,
            vaccine: 'Hepatitis B-Birth dose',
            dueAge: 'At Birth',
            vaccinationDate: '20/4/2004',
            doctorName: 'Dr. Kahini Patel',
            status: 'completed',
            checked: false
        },
        {
            id: 3,
            vaccine: 'OPV-0',
            dueAge: 'At Birth',
            vaccinationDate: '—',
            doctorName: '—',
            status: 'pending',
            checked: true
        },
        {
            id: 4,
            vaccine: 'OPV 1,2,&3',
            dueAge: 'At 6 weeks, 10&14 weeks',
            vaccinationDate: '—',
            doctorName: '—',
            status: 'pending',
            checked: false
        },
        {
            id: 5,
            vaccine: 'Pentavalent',
            dueAge: 'At 6 weeks, 10&14 weeks',
            vaccinationDate: '—',
            doctorName: '—',
            status: 'pending',
            checked: false
        },
    ];

    const handleCheckboxChange = (id: number) => {
        setSelectedVaccines((prev: number[]) =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleCardExpansion = (id: number) => {
        setExpandedCards((prev: any[]) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getActionButton = (status: string, id: number) => {
        if (status === 'completed') {
            return (
                <button className="px-3 py-2 md:px-4 bg-yellow-400 border hover:bg-yellow-500 text-gray-800 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm">
                    <Eye size={14} />
                    View
                </button>
            );
        } else {
            return (
                <button className="px-3 py-2 md:px-4 bg-blue-300 hover:bg-blue-600 text-black rounded-lg border font-medium transition-colors duration-200 flex items-center gap-2 text-xs md:text-sm">
                    <Plus size={14} />
                    Add
                </button>
            );
        }
    };

    const getRowBackground = (status: string, index: number) => {
        if (status === 'pending' && index === 3) {
            return 'bg-blue-50 border-blue-200';
        }
        return 'bg-white hover:bg-gray-50';
    };

    return (
        <div className="mx-2 mt-2 md:p-6 bg-gray-50 ">
            {/* Header Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full max-w-md bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white py-3 px-4 md:px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-between shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                    <span>Click here to see the full list of Vaccinations</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isOpen && (
                <>
                    {/* Desktop Table Layout */}
                    <div className="hidden md:block">
                        <div className="bg-gray-200 border-b-2 border-black">
          <div className="flex">
            <div className="flex items-center justify-center border-r border-black p-4 w-20">
              <span className="font-semibold text-gray-700 text-sm">Select</span>
            </div>
            <div className="flex items-center justify-center flex-1 border-r border-black p-4">
              <span className="font-semibold text-gray-700 text-sm">Vaccine</span>
            </div>
            <div className="flex items-center justify-center flex-1 border-r border-black p-4">
              <span className="font-semibold text-gray-700 text-sm">Due Age</span>
            </div>
            <div className="flex items-center justify-center flex-1 border-r border-black p-4">
              <span className="font-semibold text-gray-700 text-sm">Date</span>
            </div>
            <div className="flex items-center justify-center flex-1 border-r border-black p-4">
              <span className="font-semibold text-gray-700 text-sm">Doctor</span>
            </div>
            <div className="flex items-center justify-center flex-1 p-4">
              <span className="font-semibold text-gray-700 text-sm">Action</span>
            </div>
          </div>
        </div>


                             <div className="divide-y divide-black border border-gray-200 rounded-lg">
          {vaccinationData.map((item, index) => (
            <div
              key={item.id}
              className={`flex transition-colors duration-200 ${getRowBackground(item.status, index)}`}
            >
              <div className="flex items-center justify-center border-r border-black p-4 w-20">
                <input
                  type="checkbox"
                  checked={selectedVaccines.includes(item.id)}
                  onChange={() => handleCheckboxChange(item.id)}
                  className="w-6 h-6 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                <span className="font-medium text-gray-800 text-center text-sm">{item.vaccine}</span>
              </div>
              <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                <span className="text-gray-600 text-center text-sm">{item.dueAge}</span>
              </div>
              <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                <span className={`text-center text-sm ${item.vaccinationDate === '—' ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
                  {item.vaccinationDate}
                </span>
              </div>
              <div className="flex items-center justify-center flex-1 border-r border-black p-4">
                <span className={`text-center text-sm ${item.doctorName === '—' ? 'text-gray-400' : 'text-gray-800'}`}>
                  {item.doctorName}
                </span>
              </div>
              <div className="flex items-center justify-center flex-1 p-4">
                {getActionButton(item.status, item.id)}
              </div>
            </div>
          ))}
        </div>
      </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-3">
                        {vaccinationData.map((item, index) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                                {/* Card Header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 border-b border-gray-200"
                                    onClick={() => toggleCardExpansion(item.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedVaccines.includes(item.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleCheckboxChange(item.id);
                                            }}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-800 text-sm">{item.vaccine}</h3>
                                            <p className="text-xs text-gray-500">
                                                {item.status === 'completed' ? 'Uploaded' : 'Not uploaded'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        size={20}
                                        className={`text-gray-500 transition-transform duration-200 ${expandedCards[item.id] ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>

                                {/* Expanded Content */}
                                {expandedCards[item.id] && (
                                    <div className="p-4 space-y-4 bg-white">
                                        {item.status === 'completed' ? (
                                            <div className="">
                                                <h4 className="font-medium text-gray-800 mb-3 text-sm">Uploaded Vaccine:</h4>
                                                <div className="space-y-3 flex justify-around">
                                                    <p>Name</p> <p>vaccinationDate</p>
                                                </div>
                                                    <div className="flex justify-between items-center bg-white p-3 rounded border">
                                                            <p className="font-medium text-sm">{item.vaccine}</p> <p className="text-xs text-gray-500"> {item.vaccinationDate}</p>
                                                            
                                                        {getActionButton(item.status, item.id)}
                                                    </div>
                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <div className="text-xs text-gray-600">
                                                        <div><strong>Due Age:</strong> {item.dueAge}</div>
                                                        <div><strong>Doctor:</strong> {item.doctorName}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="text-xs text-gray-600">
                                                    <div><strong>Due Age:</strong> {item.dueAge}</div>
                                                    <div><strong>Status:</strong> Pending</div>
                                                </div>
                                                <div className="flex justify-center">
                                                    {getActionButton(item.status, item.id)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className='border mt-3'></div>
                </>
            )}
        </div>
    );
};

export default VaccinationList;