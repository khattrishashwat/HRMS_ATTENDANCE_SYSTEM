import { createPortal } from "react-dom";
import Alert from "@/assets/svg/Alert.svg";

interface LoginModeModalProps {
  loading: boolean;
  error: string;
  onLoginAsAdmin: () => void;
  onLoginAsEmployee: () => void;
}

const LoginModeModal = ({
  loading,
  error,
  onLoginAsAdmin,
  onLoginAsEmployee,
}: LoginModeModalProps) => {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white dark:bg-[#252525] rounded-[24px] p-6 w-full max-w-[420px] flex flex-col items-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[60px] h-[60px] rounded-full bg-[#F3EEFF] dark:bg-purple-900/30 flex items-center justify-center mb-5">
          <img src={Alert} alt="Alert" className="w-7 h-7" />
        </div>
        <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-2 leading-[28px]">
          Choose Login Mode
        </h3>
        <p className="text-[14px] leading-[20px] text-gray-500 dark:text-gray-400 text-center mb-6 px-2">
          Do you want to login as Admin or Employee?
        </p>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onLoginAsAdmin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-[14px] hover:opacity-90 transition disabled:opacity-60"
          >
            Login as Admin
          </button>
          <button
            onClick={onLoginAsEmployee}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-primary text-primary font-semibold text-[14px] hover:bg-purple-50 transition disabled:opacity-60"
          >
            {loading ? "Switching…" : "Login as Employee"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoginModeModal;
