import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

const ConfirmationPopup = ({ 
  onClose, 
  onConfirm, 
  title, 
  message,
  isLoading: externalLoading
}: { 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string;
  message: string;
  isLoading?: boolean;
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-[90%] max-w-[500px] shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}} />
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 m-0">{title}</h2>
          <div 
            className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-slate-100" 
            onClick={onClose}
          >
            <IoClose className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        <div className="p-6">
          <p className="text-[15px] text-slate-600 leading-relaxed m-0">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t border-slate-200">
          <button 
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onClose}
            disabled={isLoading}
          >
            Abbrechen
          </button>
          <button 
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-[#36A866] text-white hover:bg-[#2d8a55] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center gap-2" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Wird verarbeitet...</span>
              </>
            ) : (
              'Bestätigen'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
