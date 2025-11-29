import { IoClose } from 'react-icons/io5';

const ConfirmationPopup = ({ 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string;
  message: string;
}) => {
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
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]" 
            onClick={onClose}
          >
            Abbrechen
          </button>
          <button 
            className="py-2.5 px-6 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 border-none outline-none bg-[#36A866] text-white hover:bg-[#2d8a55] active:scale-[0.98]" 
            onClick={onConfirm}
          >
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
