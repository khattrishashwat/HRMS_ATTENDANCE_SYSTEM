import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { FaAngleLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/index.ts";
import authApi from "../../../servicesAPI/authApi.ts";
import { performSessionLogout } from "../../../utils/sessionLogout.ts";

// Import all images
import IconSvg from "@/assets/svg/Icon.svg";
import AlertSvg from "@/assets/svg/Alert.svg";
import ProfileSvg from "@/assets/svg/Profile.svg";
import PasswordSvg from "@/assets/svg/Password.svg";
import LogoutSvg from "@/assets/svg/logout.svg";

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <li className={`flex items-center gap-2 text-[12px] ${met ? "text-green-600" : "text-gray-500"}`}>
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        met ? "bg-green-500" : "bg-gray-300"
      }`}
    />
    {text}
  </li>
);

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
}) => (
  <div>
    <label className="label-heading">{label}</label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
      </button>
    </div>
  </div>
);

const ChangePasswordView = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [otpLoading, setOtpLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const toggle = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    otp: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const reqs = {
    length: form.newPassword.length >= 8,
    upper: /[A-Z]/.test(form.newPassword) && /[a-z]/.test(form.newPassword),
    number: /[0-9]/.test(form.newPassword),
    special: /[^A-Za-z0-9]/.test(form.newPassword),
  };

  const loginId = useSelector((state: RootState) => state.auth.email);

  const handleRequestOtp = async () => {
    if (!form.currentPassword) {
      toast.error("Please enter your current password first");
      return;
    }

    setOtpLoading(true);
    try {
      await authApi.sendAuthorizedOtp({
        useCase: "RESET_PASSWORD",
        currentPassword: form.currentPassword,
      });
      toast.success("OTP sent");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!Object.values(reqs).every(Boolean)) {
      toast.error("Password does not meet requirements");
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!form.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setSubmitLoading(true);
    try {
      await authApi.resetPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
        loginId,
        otp: form.otp,
      });
      toast.success("Password updated successfully");
      onBack();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="bg-[#F8F7FA] border-b border-[#E6E2E9]">
        <div className="flex items-center gap-3 px-5 pt-5 pb-2">
          <FaAngleLeft onClick={onBack} className="backbutton cursor-pointer flex-shrink-0" />
          <div>
            <h2 className="firstText">Change Password</h2>
            <p className="text-[12px] text-gray-400 leading-tight mt-0.5">
              Update your account password
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center my-5">
        <img src={IconSvg} className="w-14 h-14" alt="Icon" />
      </div>

      <div className="flex flex-col gap-4 px-5">
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="Enter current password"
          show={show.current}
          onToggle={() => toggle("current")}
        />

        {step === 1 && (
          <button
            onClick={handleRequestOtp}
            disabled={otpLoading}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium text-[14px] transition hover:opacity-90 disabled:opacity-60"
          >
            {otpLoading ? "Sending OTP…" : "Send OTP"}
          </button>
        )}

        {step === 2 && (
          <>
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              show={show.new}
              onToggle={() => toggle("new")}
            />

            <PasswordInput
              label="Confirm New Password"
              name="confirmNewPassword"
              value={form.confirmNewPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              show={show.confirm}
              onToggle={() => toggle("confirm")}
            />

            <div>
              <label className="label-heading">OTP</label>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                maxLength={6}
                className="input pr-10"
              />
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <p className="text-[12px] font-semibold text-gray-700 mb-2">Password Requirements:</p>
              <ul className="space-y-1.5">
                <RequirementItem met={reqs.length} text="At least 8 characters" />
                <RequirementItem met={reqs.upper} text="Contains uppercase and lowercase letters" />
                <RequirementItem met={reqs.number} text="Contains at least one number" />
                <RequirementItem
                  met={reqs.special}
                  text="Contains at least one special character"
                />
              </ul>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitLoading}
              className="w-full bg-primary text-white py-2.5 rounded-xl font-medium text-[14px] transition hover:opacity-90 disabled:opacity-60"
            >
              {submitLoading ? "Updating…" : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const LogoutConfirmationModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return createPortal(
    <div
      data-panel-ignore
      className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="bg-white dark:bg-[#252525] rounded-[24px] p-6 w-full max-w-[400px] flex flex-col items-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[60px] h-[60px] rounded-full bg-[#F3EEFF] dark:bg-purple-900/30 flex items-center justify-center mb-5">
          <img src={AlertSvg} alt="Alert" className="w-7 h-7" />
        </div>
        <h3 className="text-[20px] font-bold text-gray-900 dark:text-white mb-2 leading-[28px]">
          Confirm Logout
        </h3>
        <p className="text-[14px] leading-[20px] text-gray-500 dark:text-gray-400 text-center mb-8 px-2">
          Are you sure you want to logout? You'll need to sign in again to access your account.
        </p>
        <div className="flex gap-4 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="flex-1 py-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-[14px] hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <img
              src={LogoutSvg}
              alt="Logout"
              className="w-[18px] h-[18px] brightness-0 invert"
            />
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

type PanelView = "profile" | "changePassword";

const ProfilePanel = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<PanelView>("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { userName, userType, profileImage } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await performSessionLogout({ callServer: true, hardRedirect: true });
  };

  return (
    <div
      data-panel-ignore
      className="w-[343px] h-full bg-[#FAFAFA] dark:bg-[#1e1e1e] border-l shadow-lg flex flex-col font-[Public_Sans] overflow-hidden"
    >
      {view === "changePassword" ? (
        <ChangePasswordView onBack={() => setView("profile")} />
      ) : (
        <>
          <div className="flex justify-end p-4">
            <X className="cursor-pointer text-red-500" onClick={onClose} />
          </div>

          <div className="flex flex-col items-center">
            <img
              src={profileImage || ProfileSvg}
              className="w-[114px] h-[114px] rounded-full border-[4px] border-white object-cover"
              alt="Profile"
            />
            <h2 className="mt-4 text-[18px] font-medium leading-[22px] text-center text-gray-900 dark:text-white">
              {userName || "User"}
            </h2>
            <p className="text-[14px] font-semibold leading-[20px] text-gray-500">
              {userType}
            </p>
          </div>

          <div className="mt-8 px-4">
            <p className="text-[14px] font-semibold leading-[20px] text-gray-600 mb-3">Profile</p>

            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div
                onClick={() => {
                  onClose();
                  navigate("/profile");
                }}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-tertiary dark:hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <img src={ProfileSvg} className="w-4 h-4" alt="Profile" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold leading-[20px] text-gray-900 dark:text-white">
                      Personal Information
                    </p>
                    <p className="text-[12px] font-normal leading-[20px] text-gray-500">
                      Make Changes to your account
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{">"}</span>
              </div>

              <div
                onClick={() => setView("changePassword")}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-tertiary dark:hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <img src={PasswordSvg} className="w-4 h-4" alt="Password" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold leading-[20px] text-gray-900 dark:text-white">
                      Password
                    </p>
                    <p className="text-[12px] font-normal leading-[20px] text-gray-500">
                      Manage Your Password
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{">"}</span>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLogoutModal(true);
                }}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-tertiary dark:hover:bg-red-900/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <img src={LogoutSvg} className="w-4 h-4" alt="Logout" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold leading-[20px] text-gray-900 dark:text-white">
                      Logout
                    </p>
                    <p className="text-[12px] font-normal leading-[20px] text-gray-500">
                      Further secure your account for safety
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{">"}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {showLogoutModal && (
        <LogoutConfirmationModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePanel;