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
    return (
      <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-[999]">
        <div className="relative bg-gradient-to-b from-white to-slate-50 rounded-2xl p-6 sm:p-8 md:p-10 text-center w-[90%] max-w-[650px] shadow-xl">
          <button 
            className="absolute top-2.5 right-4 bg-transparent border-none text-xl sm:text-2xl text-slate-500 cursor-pointer transition-colors hover:text-slate-600" 
            onClick={onClose}
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
            className="bg-[#28a745] border-none text-white py-3 px-8 sm:px-9 rounded-full text-base sm:text-lg font-semibold cursor-pointer shadow-lg shadow-[#28a745]/40 transition-all duration-300 hover:bg-[#218838] hover:shadow-xl hover:shadow-[#28a745]/50 active:scale-95" 
            onClick={onStart}
          >
            {buttonText}
          </button>
  
          <p className="text-xs sm:text-sm text-slate-500 mt-5">
            {infoText}
          </p>
        </div>
      </div>
    );
  };
  
  export default WelcomePopup;
  