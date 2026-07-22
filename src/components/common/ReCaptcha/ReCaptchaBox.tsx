import React, { useState, useEffect } from "react";
import Recapture from "@/assets/images/recaptcha.png";

declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface ReCaptchaBoxProps {
  setCaptcha: (token: string | null) => void;
}

const ReCaptchaBox: React.FC<ReCaptchaBoxProps> = ({ setCaptcha }) => {
  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY as string;

  const [checked, setChecked] = useState(false);

  // ✅ Load script once
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [siteKey]);

  const executeCaptcha = async () => {
    if (window.grecaptcha) {
      const token = await window.grecaptcha.execute(siteKey, { action: "submit" });
      setCaptcha(token);
    }
  };

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);

    if (isChecked) {
      await executeCaptcha();
    } else {
      setCaptcha(null);
    }
  };

  return (
    <div className="w-[300px] justify-between px-3 h-[66px] border border-gray-300 rounded flex items-center">
      <div className="gap-2 flex flex-row">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          className="w-[20px] h-[20px] accent-primary"
        />
        <span className="text-gray-500 text-sm">I'm not a robot</span>
      </div>
      <div className="flex flex-col">
        <img src={Recapture} alt="recaptcha" />
        <p className="text-[5px] font-medium text-[#A6A6A6]">Privacy - Terms</p>
      </div>
    </div>
  );
};

export default ReCaptchaBox;
