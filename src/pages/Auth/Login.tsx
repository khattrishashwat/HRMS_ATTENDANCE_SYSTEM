import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import ReCaptchaBox from "../../components/common/ReCaptcha/ReCaptchaBox.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginSuccess,
  prepareOrgAdminLogin,
  completeOrgAdminLoginAsAdmin,
} from "../../redux/store.ts";
import { RootState, store } from "../../redux/index.ts";
import {
  mapPasswordLoginResponse,
  mapOtpLoginResponse,
} from "../../utils/authHelpers.ts";
import { activateEmployeeRole, getAdminOrgId } from "../../servicesAPI/roleSwitchService.ts";
import LoginModeModal from "../../components/common/Modals/LoginModeModal.tsx";
import { AuthData } from "../../redux/authTypes.ts";
import authApi from "../../servicesAPI/authApi.ts";
import Logo from "@/assets/images/Logo.png";
import LoginBg from "@/assets/images/Background.png";
import TabMobile from "@/assets/images/Tab&Mobile.png";


const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reduxDispatch = useDispatch();
  const { accessToken, refreshToken, isAwaitingRoleSelection, adminAuthData } = useSelector(
    (state: RootState) => state.auth
  );

  const [showLoginModeModal, setShowLoginModeModal] = useState(false);
  const [pendingAdminAuthData, setPendingAdminAuthData] = useState<AuthData | null>(null);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);
  const [roleSwitchError, setRoleSwitchError] = useState("");

  const [login, setLogin] = useState({
    userId: "",
    password: "",
    otpuserId: "",
  });

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [view, setView] = useState<"Login" | "OTP" | "OTPCODE" | "FORGOT" | "RESET_PASSWORD">(
    "Login"
  );
  const [otpUseCase, setOtpUseCase] = useState<"LOGIN" | "FORGOT_PASSWORD">("LOGIN");
  const [isUnauthorized, setIsUnauthorized] = useState(false); // Track 401 status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alphaNumRegex = /^[a-zA-Z0-9@.]*$/;
  const passwordRegex = /^[A-Za-z0-9@#$%^&*!_+=\-\(\)\{\}\[\]|:;"',.?/~`\\]*$/;

  // Redirect if already logged in (skip while role-selection modal is open)
  useEffect(() => {
    if (accessToken && refreshToken && !isAwaitingRoleSelection && !showLoginModeModal) {
      navigate("/dashboard", { replace: true });
    }
  }, [accessToken, refreshToken, isAwaitingRoleSelection, showLoginModeModal, navigate]);

  useEffect(() => {
    if (isAwaitingRoleSelection && adminAuthData) {
      setPendingAdminAuthData(adminAuthData);
      setShowLoginModeModal(true);
    }
  }, [isAwaitingRoleSelection, adminAuthData]);

  const completeStandardLogin = (authPayload: AuthData) => {
    reduxDispatch(loginSuccess(authPayload));
    navigate("/dashboard", { replace: true });
  };

  const handleOrgAdminLogin = (authData: AuthData) => {
    setPendingAdminAuthData(authData);
    setRoleSwitchError("");
    reduxDispatch(prepareOrgAdminLogin({ adminAuthData: authData }));
    setShowLoginModeModal(true);
  };

  const handleLoginAsAdmin = () => {
    setRoleSwitchError("");
    reduxDispatch(completeOrgAdminLoginAsAdmin());
    setShowLoginModeModal(false);
    setPendingAdminAuthData(null);
    navigate("/dashboard", { replace: true });
  };

  const handleLoginAsEmployee = async () => {
    const adminData = pendingAdminAuthData ?? adminAuthData;
    if (!adminData?.accessToken) {
      setRoleSwitchError("Admin session is unavailable. Please sign in again.");
      return;
    }

    const orgId = getAdminOrgId(adminData);
    if (!orgId) {
      setRoleSwitchError("Organization ID is unavailable. Please sign in again.");
      return;
    }

    setRoleSwitchLoading(true);
    setRoleSwitchError("");
    try {
      await activateEmployeeRole(reduxDispatch, adminData);

      const { accessToken: activeAccessToken, refreshToken: activeRefreshToken } =
        store.getState().auth;

      if (!activeAccessToken || !activeRefreshToken) {
        setRoleSwitchError("Employee session tokens are missing. Please try again.");
        return;
      }

      setShowLoginModeModal(false);
      setPendingAdminAuthData(null);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setRoleSwitchError(err?.response?.data?.message || err?.message || "Failed to switch role");
    } finally {
      setRoleSwitchLoading(false);
    }
  };

  const processLoginResponse = (authData: AuthData) => {
    if (authData.userType === "ORG_ADMIN") {
      handleOrgAdminLogin(authData);
      return;
    }

    completeStandardLogin(authData);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loginId = params.get("loginId");
    const otpCode = params.get("otp");
    if (loginId && otpCode && view !== "RESET_PASSWORD") {
      setLogin((prev) => ({ ...prev, otpuserId: loginId }));
      setOtp(otpCode);
      setOtpUseCase("FORGOT_PASSWORD");
      setView("RESET_PASSWORD");
    }
  }, [location.search]);

  // Reset captcha and error on view change
  useEffect(() => {
    setCaptchaValue(null);
    setError("");
  }, [view]);

  const handleChangeUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (alphaNumRegex.test(value)) {
      setLogin((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (passwordRegex.test(value)) {
      setLogin((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Login with password ---
  const handleSignIn = async () => {
    if (!login.userId) {
      setError("Please fill Email or Phone Number");
      return;
    }
    if (!login.password) {
      setError("Please fill Password");
      return;
    }
    if (!captchaValue) {
      setError("Please complete the captcha before logging in");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await authApi.loginWithPassword({
        loginId: login.userId,
        password: login.password,
        rememberMe: false,
        captcha: captchaValue,
      });

      const responseData = response.data.data;
      const authData = mapPasswordLoginResponse(responseData);
      processLoginResponse(authData);
    } catch (err: any) {
      const statusCode = err?.response?.status;
      const errorMessage = err?.response?.data?.message || "Login failed";
      
      setError(errorMessage);
      
      // Check if status code is 401 (Unauthorized)
      if (statusCode === 401) {
        setIsUnauthorized(true);
      } else {
        setIsUnauthorized(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Send OTP for login ---
  const handleSendOtp = async () => {
    if (!login.otpuserId) {
      setError("Please fill your Email or Mobile Number");
      return;
    }
    if (!captchaValue) {
      setError("Please complete the captcha");
      return;
    }

    try {
      await authApi.sendUnauthorizedOtp({
        loginId: login.otpuserId,
        useCase: "LOGIN",
        captcha: captchaValue,
      });
      setOtpUseCase("LOGIN");
      setView("OTPCODE");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  // --- Send OTP for forgot password ---
  const handleForgotPasswordOtp = async () => {
    if (!login.otpuserId) {
      setError("Please fill your Email or Mobile Number");
      return;
    }
    if (!captchaValue) {
      setError("Please complete the captcha");
      return;
    }

    try {
      await authApi.sendUnauthorizedOtp({
        loginId: login.otpuserId.trim(),
        useCase: "FORGOT_PASSWORD",
        captcha: captchaValue,
      });
      setOtpUseCase("FORGOT_PASSWORD");
      setView("OTPCODE");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  // --- Verify OTP (used for both login and forgot-password flows) ---
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    if (!captchaValue) {
      setError("Please complete the captcha");
      return;
    }

    try {
      if (otpUseCase === "LOGIN") {
        const response = await authApi.loginWithOtp({
          loginId: login.otpuserId,
          otp,
          rememberMe: false,
          captcha: captchaValue,
        });

        const responseData = response.data.data;
        const authData = mapOtpLoginResponse(responseData);
        processLoginResponse(authData);
      } else {
        // FORGOT_PASSWORD — OTP verified, move to reset password within this component
        setView("RESET_PASSWORD");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP verification failed");
    }
  };

  // --- Reset password ---
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill all required fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!captchaValue) {
      setError("Please complete the captcha");
      return;
    }

    try {
      await authApi.forgotPassword({
        loginId: login.otpuserId,
        otp,
        newPassword,
        captcha: captchaValue,
      });
      setError("");
      navigate("/sign-in", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Reset password failed");
    }
  };

  // Handle Reset Password navigation — pass userId only (never password in router state)
  const handleResetPasswordNavigation = () => {
    navigate("/reset-password", {
      state: {
        userId: login.userId,
      },
    });
  };

  // Back button navigation logic
  const handleBack = () => {
    if (view === "OTPCODE") {
      setView(otpUseCase === "LOGIN" ? "OTP" : "FORGOT");
    } else if (view === "RESET_PASSWORD") {
      setView("FORGOT");
    } else {
      setView("Login");
    }
  };

  return (
    <div className="w-full relative md:flex-row flex-col h-screen flex bg-gray-200">
      <div className="md:w-1/2 w-full bg-white flex flex-col justify-center md:px-20 px-6 relative">
        {view !== "Login" && (
          <button
            onClick={handleBack}
            className="rounded-[28px] absolute top-4 left-4 border border-primary px-3 py-1"
          >
            <ArrowLeft className="text-primary" />
          </button>
        )}

        <div className="mb-10 flex justify-center">
          <img src={Logo} alt="LP Bank" />
        </div>

        {/* ── LOGIN WITH PASSWORD ── */}
      {view === "Login" && (
          <>
            <h2 className="text-[24px] font-semibold text-center">Login To Your Account</h2>
            <p className="text-[14px] text-[#4B5563] text-center mt-1 mb-8">
              Please enter your login details.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[16px] font-medium">User ID</label>
                <input
                  name="userId"
                  value={login.userId}
                  placeholder="Please Enter UserId"
                  onChange={handleChangeUserId}
                  className="w-full py-[17px] b-1 border-black border rounded-[15px] px-[40px]"
                />
              </div>

              <div>
                <label className="text-[16px] font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={login.password}
                    onChange={handleChangePassword}
                    placeholder="Please Enter Password"
                    className="w-full py-[17px] rounded-[15px] border px-[40px] b-1 border-black"
                  />
                  <span
                    className="absolute mt-1 right-3 top-3 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <ReCaptchaBox setCaptcha={setCaptchaValue} />
                {isUnauthorized ? (
                  <span
                    onClick={handleResetPasswordNavigation}
                    className="text-primary text-sm cursor-pointer"
                  >
                    Reset Password?
                  </span>
                ) : (
                  <span
                    onClick={() => setView("FORGOT")}
                    className="text-primary text-sm cursor-pointer"
                  >
                    Forgot Password?
                  </span>
                )}
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleSignIn}
                className="bg-primary text-white w-full py-3 rounded-[18px]"
              >
                Login
              </button>

              <button
                onClick={() => setView("OTP")}
                className="border border-primary text-primary w-full py-3 rounded-[18px]"
              >
                Login With OTP
              </button>
            </div>
          </>
        )}

        {/* ── LOGIN WITH OTP (enter email/phone) ── */}
        {view === "OTP" && (
          <>
            <h2 className="text-[24px] font-semibold text-center">Login To Your Account</h2>
            <p className="text-[14px] text-[#4B5563] text-center mt-1 mb-8">
              Please enter your registered Email or Mobile Number.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[16px] font-medium">Registered Mobile No or Email</label>
                <input
                  name="otpuserId"
                  value={login.otpuserId}
                  onChange={handleChangeUserId}
                  className="w-full py-[17px] rounded-[15px] px-[40px] border b-1 border-black"
                />
              </div>

              <ReCaptchaBox setCaptcha={setCaptchaValue} />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleSendOtp}
                className="bg-primary text-white w-full py-3 rounded-[18px]"
              >
                Send OTP
              </button>

              <button
                onClick={() => setView("Login")}
                className="border border-primary text-primary w-full py-3 rounded-[18px]"
              >
                Login With Password
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD (enter email/phone) ── */}
        {view === "FORGOT" && (
          <>
            <h2 className="text-[24px] font-semibold text-center">Forgot Password</h2>
            <p className="text-[14px] text-[#4B5563] text-center mt-1 mb-8">
              Enter your registered Email or Mobile Number to receive an OTP.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[16px] font-medium">Registered Mobile No or Email</label>
                <input
                  name="otpuserId"
                  value={login.otpuserId}
                  onChange={handleChangeUserId}
                  className="w-full py-[17px] rounded-[15px] px-[40px] border b-1 border-black"
                />
              </div>

              <ReCaptchaBox setCaptcha={setCaptchaValue} />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleForgotPasswordOtp}
                className="bg-primary text-white w-full py-3 rounded-[18px]"
              >
                Send OTP
              </button>

              <button
                onClick={() => setView("Login")}
                className="border border-primary text-primary w-full py-3 rounded-[18px]"
              >
                Back To Login
              </button>
            </div>
          </>
        )}

        {/* ── OTP CODE ENTRY ── */}
        {view === "OTPCODE" && (
          <>
            <h2 className="text-[24px] font-semibold text-center">Enter Verification Code</h2>
            <p className="text-[14px] text-[#4B5563] text-center mt-1 mb-8">
              Please enter the 6-digit code we sent to your email or mobile.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[16px] font-medium">Verification Code</label>
                <input
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full py-[17px] rounded-[15px] px-[40px] b-1 border border-black"
                />
              </div>

              <ReCaptchaBox setCaptcha={setCaptchaValue} />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                className="bg-primary text-white w-full py-3 rounded-[18px]"
              >
                Submit
              </button>

              <p
                onClick={otpUseCase === "LOGIN" ? handleSendOtp : handleForgotPasswordOtp}
                className="text-primary text-center text-sm cursor-pointer underline"
              >
                Didn't receive OTP? Send Again
              </p>
            </div>
          </>
        )}

        {/* ── RESET PASSWORD ── */}
        {view === "RESET_PASSWORD" && (
          <>
            <h2 className="text-[24px] font-semibold text-center">Reset Password</h2>
            <p className="text-[14px] text-[#4B5563] text-center mt-1 mb-8">
              Enter your new password.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[16px] font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full py-[17px] rounded-[15px] border px-[40px] b-1 border-black"
                  />
                  <span
                    className="absolute mt-1 right-3 top-3 cursor-pointer"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[16px] font-medium">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full py-[17px] rounded-[15px] border px-[40px] b-1 border-black"
                  />
                  <span
                    className="absolute mt-1 right-3 top-3 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
              </div>

              <ReCaptchaBox setCaptcha={setCaptchaValue} />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                onClick={handleResetPassword}
                className="bg-primary text-white w-full py-3 rounded-[18px]"
              >
                Reset Password
              </button>

              <button
                onClick={() => setView("Login")}
                className="border border-primary text-primary w-full py-3 rounded-[18px]"
              >
                Back To Login
              </button>
            </div>
          </>
        )}
      </div>

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

      {showLoginModeModal && (
        <LoginModeModal
          loading={roleSwitchLoading}
          error={roleSwitchError}
          onLoginAsAdmin={handleLoginAsAdmin}
          onLoginAsEmployee={handleLoginAsEmployee}
        />
      )}
    </div>
  );
};

export default SignIn;