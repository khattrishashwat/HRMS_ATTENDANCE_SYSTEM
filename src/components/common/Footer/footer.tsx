import React from "react";

const Footer = () => {
  return (
    <div className="w-full z-40  px-6 pb-4">
      <div className="flex z-40 shadow-[2px_4px_24px_rgba(0,0,0,0.05)] min-h-[108px] items-center border-[1px] justify-between bg-white rounded-[16px] shadow-sm px-6 py-4  border-[#F3F4F6]">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center justify-center gap-2 rounded-md text-sm font-bold">
            <img src="/assets/SideNavBar/LogoMinimized.svg" alt="logo" />
            <span className="font-bold">WorkPulse</span>
          </div>
          <div className="text-sm text-gray-700">
            <p className="text-[14px] font-normal text-black">
              © Copyright 2026. All Rights Reserved.
            </p>
          </div>
        </div>

        <div className="text-sm text-[#4B1B91] flex items-center gap-2">
          <span className="font-medium">Powered By</span>
          <span className="font-semibold text-purple-600">
            <img src="/assets/SideNavBar/LuckPayLogo.svg" alt="" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
