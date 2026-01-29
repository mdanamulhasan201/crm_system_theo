'use client';

import { useState } from 'react';

interface WelcomePopupProps {
    onClose: () => void;
    onStart: () => void;
    title: string;
    details: string;
    buttonText: string;
    description: string;
    infoText: string;
  }
  const WelcomePopup = ({ onClose, onStart ,
    title,
    details,
    buttonText,
    description,
    infoText
    
  }: WelcomePopupProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
      setIsLoading(true);
      try {
        onStart();
        // Small delay to show smooth loading animation
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error('Error starting:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-[999]">
        <div className="relative bg-gradient-to-b from-white to-slate-50 rounded-2xl p-6 sm:p-8 md:p-10 text-center w-[90%] max-w-[650px] shadow-xl">
          <button 
            className="absolute top-2.5 right-4 bg-transparent border-none text-xl sm:text-2xl text-slate-500 cursor-pointer transition-colors hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </button>
          <img 
            src="/clouds.png" 
            alt="Clouds" 
            className="w-full max-w-[330px] h-auto mx-auto mb-0" 
          />
          <br />
          <img 
            src="/snekars.png" 
            alt="Shoe" 
            className="w-[200px] h-auto mx-auto -mt-[100px]" 
          />
  
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-[#1b4332] leading-tight mb-4 mt-4">
            {title} <br /> {details}
          </h2>
  
          <p className="text-sm sm:text-base text-slate-500 mb-6 leading-relaxed">
            {description}
          </p>
  
          <button 
            className="bg-[#28a745] border-none text-white py-3 px-8 sm:px-9 rounded-full text-base sm:text-lg font-semibold cursor-pointer shadow-lg shadow-[#28a745]/40 transition-all duration-300 hover:bg-[#218838] hover:shadow-xl hover:shadow-[#28a745]/50 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#28a745] disabled:hover:shadow-lg disabled:active:scale-100 flex items-center justify-center gap-2 min-w-[180px] mx-auto" 
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg 
                  className="animate-spin h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              buttonText
            )}
          </button>
  
          <p className="text-xs sm:text-sm text-slate-500 mt-5">
            {infoText}
          </p>
        </div>
      </div>
    );
  };
  
  export default WelcomePopup;
  