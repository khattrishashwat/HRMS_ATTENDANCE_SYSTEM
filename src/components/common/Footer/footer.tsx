import Logo from "@/assets/svg/LogoMinimized.svg";
import LuckPayLogo from "@/assets/svg/LuckPayLogo.svg";

const Footer = () => {
  return (
    <footer className="w-full">
      <div className="flex min-h-[88px] flex-col items-start justify-between gap-4 rounded-2xl border border-[#F3F4F6] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] sm:flex-row sm:items-center sm:px-6 sm:py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <img src={Logo} alt="WorkPulse" className="h-6 w-6 object-contain" />
            <span>WorkPulse</span>
          </div>
          <p className="text-sm font-normal text-[#374151]">
            © Copyright 2026. All Rights Reserved.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-primary">
          <span className="font-medium">Powered By</span>
          <img src={LuckPayLogo} alt="Fintech" className="h-6 w-auto object-contain" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
