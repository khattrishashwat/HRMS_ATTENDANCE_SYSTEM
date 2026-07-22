import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import ReCaptchaBox from "../../components/common/ReCaptcha/ReCaptchaBox.tsx";
import { toast } from "react-toastify";
import authApi from "../../servicesAPI/authApi.ts";
import Logo from "@/assets/images/Logo.png";
import LoginBg from "@/assets/images/Background.png";
import TabMobile from "@/assets/images/Tab&Mobile.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"RESET" | "OTP">("RESET");
  const [loginId, setLoginId] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [passwordLevel, setPasswordLevel] = useState({ level: "", count: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Get userId from navigation state when component mounts (password is never passed via router)
  useEffect(() => {
    const state = location.state as { userId?: string; password?: string } | null;
    if (state?.userId) {
      setLoginId(state.userId);
    }
  }, [location]);

  const validatePassword = (pass: string) => {
    let level = "";
    let count = 0;

    if (pass.length === 0) {
      level = "";
      count = 0;
    } else if (pass.length < 8) {
      level = "Weak";
      count = 1;
    } else {
      const hasUpperCase = /[A-Z]/.test(pass);
      const hasLowerCase = /[a-z]/.test(pass);
      const hasNumbers = /\d/.test(pass);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

      const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

      if (strength <= 2) {
        level = "Weak";
        count = 1;
      } else if (strength === 3) {
        level = "Medium";
        count = 2;
      } else {
        level = "Strong";
        count = 3;
      }
    }

    setPasswordLevel({ level, count });
    return level !== "Weak";
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    validatePassword(e.target.value);
  };

  // Step 1: Validate old password and send OTP
  const handleGenerateOtp = async () => {
    const trimmedLoginId = loginId.trim();
    
    if (!trimmedLoginId) {
      setError("Please enter your registered mobile number or email");
      return;
    }
    if (!oldPassword) {
      setError("Please enter your old password");
      return;
    }
    if (!newPassword) {
      setError("Please enter new password");
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }
    
    if (!captchaValue) {
      setError("Please complete the captcha before continuing");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authApi.sendUnauthorizedOtp({
        loginId: trimmedLoginId,
        useCase: "RESET_PASSWORD",
        captcha: captchaValue,
      });

      setStep("OTP");
      toast.info("OTP sent successfully to your registered mobile/email!", {
        autoClose: 3000,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleVerifyOtpAndReset = async () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetExpiredPassword({
        loginId: loginId,
        oldPassword: oldPassword,
        newPassword: newPassword,
        otp: otpString,
      });

      toast.success("Password reset successful! Please login with your new password.", {
        autoClose: 3000,
      });
      
      navigate("/sign-in", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleBack = () => {
    if (step === "RESET") {
      navigate("/sign-in");
    } else if (step === "OTP") {
      setStep("RESET");
      setOtp(["", "", "", "", "", ""]);
      setCaptchaValue(null);
      setError("");
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordLevel.level === "Strong") return "bg-green-500";
    if (passwordLevel.level === "Medium") return "bg-yellow-500";
    if (passwordLevel.level === "Weak") return "bg-red-500";
    return "bg-gray-200";
  };

  const getPasswordStrengthText = () => {
    if (passwordLevel.level === "Strong") return "Strong Password ✓";
    if (passwordLevel.level === "Medium") return "Medium Password";
    if (passwordLevel.level === "Weak") return "Weak Password";
    return "";
  };

  return (
    <div className="w-full relative md:flex-row flex-col h-screen flex bg-gray-200 overflow-hidden">
      {/* Left Section - Form with Scroll */}
      <div className="md:w-1/2 w-full bg-white flex flex-col md:px-20 px-6 relative overflow-y-auto">
        {step !== "RESET" && (
          <button
            onClick={handleBack}
            className="rounded-[28px] absolute top-4 left-4 border border-primary px-3 py-1 z-10"
          >
            <ArrowLeft className="text-primary" />
          </button>
        )}

        <div className="mb-10 flex justify-center mt-8">
          <img src={Logo} alt="LP Bank" />
        </div>

        {/* Step 1: Reset Password Form */}
        {step === "RESET" && (
          <>
            <h2 className="text-[24px] font-semibold text-center">Reset Your Password</h2>
            <p className="text-[14px] text-[#4B5563] text-center mt-1 mb-8">
              Update your password to securely access your account
            </p>

            <div className="flex flex-col gap-3 pb-8">
              <div>
                <label className="text-[16px] font-medium">Registered Mobile Number or Email</label>
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter your registered mobile number or email"
                  className="w-full py-[17px] border border-black rounded-[15px] px-[40px]"
                  disabled={!!location.state?.userId}
                />
              </div>

              <div>
                <label className="text-[16px] font-medium">Old Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your old password"
                    className="w-full py-[17px] rounded-[15px] border px-[40px] border-black"
                  />
                  <span
                    className="absolute mt-1 right-3 top-3 cursor-pointer"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[16px] font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter your new password"
                    className="w-full py-[17px] rounded-[15px] border px-[40px] border-black"
                  />
                  <span
                    className="absolute mt-1 right-3 top-3 cursor-pointer"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
                
                {/* Password strength indicator */}
                {newPassword && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordLevel.count ? getPasswordStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordLevel.level === "Strong" ? "text-green-600" :
                      passwordLevel.level === "Medium" ? "text-yellow-600" :
                      passwordLevel.level === "Weak" ? "text-red-600" : "text-gray-500"
                    }`}>
                      {getPasswordStrengthText()}
                    </p>
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      Must be at least 8 characters with uppercase, lowercase, number & special character
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[16px] font-medium">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full py-[17px] rounded-[15px] border px-[40px] border-black"
                  />
                  <span
                    className="absolute mt-1 right-3 top-3 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
                {confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="mt-2">
                <ReCaptchaBox setCaptcha={setCaptchaValue} />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleGenerateOtp}
                disabled={isLoading}
                className="bg-primary text-white w-full py-3 rounded-[18px] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending OTP..." : "Generate OTP"}
              </button>

              <button
                onClick={handleBack}
                className="border border-primary text-primary w-full py-3 rounded-[18px]"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === "OTP" && (
          <>
            <h2 className="text-[24px] font-semibold text-center">Enter Verification Code</h2>
            <p className="text-[14px] text-[#4B5563] text-center mt-1 mb-2">
              Please enter the 6-digit code we sent to
            </p>
            <p className="text-[14px] font-semibold text-primary text-center mb-8">
              {loginId}
            </p>

            <div className="flex flex-col gap-3 pb-8">
              <div>
                <label className="text-[16px] font-medium text-center block">Verification Code</label>
                <div className="flex gap-2 sm:gap-3 justify-center mt-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <div className="mt-2 flex justify-center">
                <ReCaptchaBox setCaptcha={setCaptchaValue} />
              </div>

              <button
                onClick={handleVerifyOtpAndReset}
                disabled={isLoading}
                className="bg-primary text-white w-full py-3 rounded-[18px] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify & Reset Password"}
              </button>

              <button
                onClick={handleGenerateOtp}
                disabled={isLoading || !captchaValue}
                className="text-primary text-center text-sm cursor-pointer underline disabled:opacity-50"
              >
                Didn't receive OTP? Send Again
              </button>

              <button
                onClick={() => setStep("RESET")}
                className="border border-primary text-primary w-full py-3 rounded-[18px]"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right Section - Hero Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden items-start justify-center">
        <img
          src={LoginBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="relative z-10 flex h-full w-full flex-col items-center px-8 pt-20 text-center text-white">
          <div>
            <h1 className="max-w-[430px] text-[39px] font-semibold leading-[1.08]">
              Simplifying Workforce Management
            </h1>
            <p className="mx-auto mt-5 max-w-[360px] text-[18px] leading-[1.35] text-white/85">
              Built to help HR teams manage operations faster, smarter, and more efficiently.
            </p>
          </div>

          <img
            src={TabMobile}
            alt="WorkPulse dashboard shown on tablet and mobile"
            className="absolute bottom-0 right-0 z-10 w-[92%] max-w-[520px] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;