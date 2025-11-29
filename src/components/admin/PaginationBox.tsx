import Link from "next/link";
import React from "react";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

const PaginationBox = ({
  pagination,
  prefix,
}: {
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  prefix: string;
}) => {
  const { currentPage = 1, totalPages = 1 } = pagination;

  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(endPage - maxVisiblePages + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-4 px-6 flex justify-end items-center   rounded-md">
      <div className="flex flex-row gap-6 items-center justify-end">
        {currentPage === 1 ? null : (
          <Link
            className="flex items-center gap-1 cursor-pointer text-site-black"
            href={`${prefix}?page=${currentPage - 1}`}
          >
            <MdOutlineKeyboardDoubleArrowLeft /> Prev
          </Link>
        )}

        <div className="flex flex-row gap-2">
          {pageNumbers.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={`${prefix}?page=${pageNumber}`}
              className={`size-8 rounded-md ${
                pageNumber === currentPage
                  ? "bg-site-saffron text-white"
                  : "bg-site-neongreen hover:bg-site-saffron hover:text-white transition-colors duration-500 "
              } border-custom-black border flex justify-center items-center text-base font-medium cursor-pointer`}
            >
              {pageNumber}
            </Link>
          ))}
        </div>

        {currentPage === totalPages ? null : (
          <Link
            className="flex items-center gap-1 cursor-pointer text-site-black"
            href={`${prefix}?page=${currentPage + 1}`}
          >
            Next <MdOutlineKeyboardDoubleArrowRight />
          </Link>
        )}
      </div>
    </div>
  );
};

export default PaginationBox;
