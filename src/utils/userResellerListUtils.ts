export const data = Array.from({ length: 0 }, (_, i) => ({
  userId: `VPAD${i + 1}`,
  postId: i % 3 === 0 ? "Super Admin" : "VPM Enterprises",
  firmName: "Demo",
  mobileNumber: `12345${String(i).padStart(5, "0")}`,
  kycStatus: i % 4 === 0 ? "Verified" : i % 4 === 1 ? "Pending" : "Failed",
}));

export const getKycColor = (status: string) => {
  if (status === "Verified") return "text-green-600";
  if (status === "Pending") return "text-yellow-500";
  if (status === "Failed") return "text-red-600";
  return "text-gray-500";
};

export const getVisiblePages = (totalPages: any, currentPage: any) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

  if (currentPage < 3) return [1, 2, "...", totalPages];
  if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];

  return [1, "...", "input", "...", totalPages];
};

export const handlePageClick = (
  page: number | string,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
) => {
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
