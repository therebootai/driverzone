"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

const PaginationBox = ({
  pagination,
  baseUrl,
}: {
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  baseUrl: string;
}) => {
  const searchParams = useSearchParams();
  const { currentPage = 1, totalPages = 1 } = pagination;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

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

  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  return (
    <div className="p-4 px-6 flex justify-end items-center bg-white rounded-md">
      <div className="flex flex-row gap-6 items-center justify-end">
        {currentPage === 1 ? null : (
          <Link
            className="flex items-center gap-1 cursor-pointer text-custom-darkred"
            href={buildUrl(currentPage - 1)}
          >
            <MdOutlineKeyboardDoubleArrowLeft /> Prev
          </Link>
        )}

        <div className="flex flex-row gap-2">
          {/* Show first page with ellipsis if needed */}
          {startPage > 1 && (
            <>
              <Link
                href={buildUrl(1)}
                className="size-8 rounded-md bg-custom-green hover:bg-site-saffron hover:text-white transition-colors duration-500 border-custom-black border flex justify-center items-center text-base font-medium cursor-pointer"
              >
                1
              </Link>
              {startPage > 2 && (
                <span className="size-8 flex justify-center items-center text-gray-500">
                  ...
                </span>
              )}
            </>
          )}

          {/* Page numbers */}
          {pageNumbers.map((pageNumber) => (
            <Link
              key={pageNumber}
              href={buildUrl(pageNumber)}
              className={`size-8 rounded-md ${
                pageNumber === currentPage
                  ? "bg-site-saffron text-white"
                  : "bg-custom-green hover:bg-site-saffron hover:text-white transition-colors duration-500"
              } border-custom-black border flex justify-center items-center text-base font-medium cursor-pointer`}
            >
              {pageNumber}
            </Link>
          ))}

          {/* Show last page with ellipsis if needed */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="size-8 flex justify-center items-center text-gray-500">
                  ...
                </span>
              )}
              <Link
                href={buildUrl(totalPages)}
                className="size-8 rounded-md bg-custom-green hover:bg-site-saffron hover:text-white transition-colors duration-500 border-custom-black border flex justify-center items-center text-base font-medium cursor-pointer"
              >
                {totalPages}
              </Link>
            </>
          )}
        </div>

        {currentPage === totalPages ? null : (
          <Link
            className="flex items-center gap-1 cursor-pointer text-custom-darkred"
            href={buildUrl(currentPage + 1)}
          >
            Next <MdOutlineKeyboardDoubleArrowRight />
          </Link>
        )}
      </div>
    </div>
  );
};

export default PaginationBox;
