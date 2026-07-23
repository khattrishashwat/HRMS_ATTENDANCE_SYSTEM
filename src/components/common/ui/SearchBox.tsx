import type { InputHTMLAttributes } from "react";
import { FiSearch } from "react-icons/fi";

type SearchBoxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  containerClassName?: string;
};

/** Pill search input with leading icon. */
export default function SearchBox({
  containerClassName = "",
  className = "",
  ...props
}: SearchBoxProps) {
  return (
    <label
      className={`flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:max-w-xs md:max-w-sm ${containerClassName}`}
    >
      <FiSearch className="h-4 w-4 shrink-0 text-[#9CA3AF]" aria-hidden />
      <input
        type="search"
        className={`min-w-0 flex-1 bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] ${className}`}
        {...props}
      />
    </label>
  );
}
