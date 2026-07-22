export const getKycColor = (status: string) => {
  if (status === "VERIFIED") return "text-green-600";
  if (status === "Pending") return "text-yellow-500";
  if (status === "NA") return "text-red-600";
  return "text-gray-500";
};

export const getVisiblePages = (totalPages: any, currentPage: any) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage < 3) return [1, 2, "...", totalPages];
  if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", "input", "...", totalPages];
};

export const handlePageClick = (page: number | string, setCurrentPage: any) => {
  if (typeof page === "number") {
    setCurrentPage(page);
  }
};

export const handleInputKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  setCurrentPage: any,
  inputPage: any,
  totalPages: any,
  setInputPage: any
) => {
  if (e.key === "Enter") {
    const page = Number(inputPage);
    if (!Number.isInteger(page) || page < 1) {
      setCurrentPage(1);
    } else if (page > totalPages) {
      setCurrentPage(totalPages);
    } else {
      setCurrentPage(page);
    }
    setInputPage("");
  }
};

export const getItemClass = (path?: string, isActive?: (path: string) => boolean) =>
  `flex items-center justify-between w-full px-4 h-12 group transition-colors duration-200 ${
    path && isActive?.(path)
      ? "bg-[#FBEAEA] dark:bg-[#751212] border-l-4 border-l-[#E39191] border-l-[#751212] text-black dark:text-white"
      : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
  }`;

export const getSubItemClass = (path: string, isActive?: (path: string) => boolean) =>
  `text-sm pl-8 py-2 h-8 ml-3 flex items-center transition-colors duration-200 ${
    isActive?.(path)
      ? "bg-[#FBEAEA] dark:bg-[#751212] border-l-4 border-l-[#E39191] border-l-[#751212]  text-black dark:text-white font-medium"
      : "text-gray-500 hover:text-black dark:hover:text-white"
  }`;

export const getImageClass = (path?: string, isActive?: (path: string) => boolean) =>
  `h-5 w-5 transition duration-200 filter ${
    path && isActive?.(path)
      ? "brightness-0 dark:invert"
      : "group-hover:brightness-0 dark:group-hover:invert"
  }`;
export function formatDate(dateStr: string) {
  if (!dateStr) return "";

  const formatSingleDate = (dateString: string) => {
    const date = new Date(dateString.trim());

    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "short" });

    return `${day} ${month} ${year}`;
  };

  if (dateStr.includes("to")) {
    const [start, end] = dateStr.split("to");
    return `${formatSingleDate(start)} to ${formatSingleDate(end)}`;
  }

  return formatSingleDate(dateStr);
}
export const formatTimeToAMPM = (time?: string) => {
  if (!time || time === "00:00:00") return "-";
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${minutes} ${ampm}`;
};

export const formatMinutesToHours = (minutes?: number) => {
  if (!minutes && minutes !== 0) return "-";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;

  return `${hrs}h ${mins}m`;
};

// utils/departmentColors.ts

const departmentColorCache = new Map<
  string,
  { hex: string; lightBgHex: string; textHex: string }
>();

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getDepartmentColor = (department: string) => {
  const key = department?.trim().toLowerCase() || "general";

  if (!departmentColorCache.has(key)) {
    const hash = hashString(key);
    const hue = hash % 360; // full hue wheel
    const saturation = 55 + (hash % 20); // 55–75% — vivid but not neon
    const lightness = 42 + (hash % 15); // 42–57% — deep enough for white text

    const bgHex = hslToHex(hue, saturation, lightness);
    const lightBgHex = hslToHex(hue, saturation, 92); // very light tint for designation badge
    const textHex = hslToHex(hue, saturation, 25); // dark shade for badge text

    departmentColorCache.set(key, {
      hex: bgHex, // avatar background (deep color)
      lightBgHex, // designation badge background (light tint)
      textHex, // designation badge text (dark shade)
    });
  }

  return departmentColorCache.get(key)!;
};
