"use client";
import { useQueryParamsAdvanced } from "@/hooks/useQueryParamsAdvanced";
import React, { useState, useEffect } from "react";
import { IoSearch, IoCalendarOutline, IoCloseOutline } from "react-icons/io5";
import useClickOutside from "@/hooks/useClickOutside";

const BookingPageHeader = ({
  searchTerm,
  status,
}: {
  searchTerm?: string;
  status?: string;
}) => {
  const { updateFilters, getParam } = useQueryParamsAdvanced();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useClickOutside<HTMLDivElement>(() => {
    setShowDatePicker(false);
  });

  const currentStatus = getParam("status") || "";
  const currentTripType = getParam("tripType") || "";
  const currentStartDate = getParam("startDate") || "";
  const currentEndDate = getParam("endDate") || "";
  const [localSearch, setLocalSearch] = useState(getParam("search") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters("search", localSearch);
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch, updateFilters]);

  const formatDateForDisplay = () => {
    if (currentStartDate && currentEndDate) {
      return `${currentStartDate} to ${currentEndDate}`;
    }
    if (currentStartDate) return `From ${currentStartDate}`;
    if (currentEndDate) return `Until ${currentEndDate}`;
    return "Filter by Date";
  };

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-wrap gap-4 items-center w-full">
        {/* Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateFilters("status", e.target.value)}
          className="w-fit px-4 border border-gray-200 rounded-lg h-[2.5rem] bg-white text-site-black font-medium text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="accepted">Accepted</option>
          <option value="arrived">Arrived</option>
          <option value="started">Started</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Trip Type Filter */}
        <select
          value={currentTripType}
          onChange={(e) => updateFilters("tripType", e.target.value)}
          className="w-fit px-4 border border-gray-200 rounded-lg h-[2.5rem] bg-white text-site-black font-medium text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Trip Types</option>
          <option value="one-way">One Way</option>
          <option value="round-trip">Round Trip</option>
          <option value="local">Local</option>
          <option value="outstation">Outstation</option>
        </select>

        {/* Date Filters Popover */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-2 px-4 border rounded-lg h-[2.5rem] font-medium text-sm transition-colors ${
              currentStartDate || currentEndDate
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 pr-2"
                : "bg-white border-gray-200 text-site-black hover:bg-gray-50"
            }`}
          >
            {currentStartDate || currentEndDate ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateFilters("startDate", "");
                  updateFilters("endDate", "");
                }}
                className="p-1 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                title="Clear Date Filter"
              >
                <IoCloseOutline className="size-4" />
              </button>
            ) : (
              <IoCalendarOutline className="size-4" />
            )}
            <span>{formatDateForDisplay()}</span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-[300px]">
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                  Select Date Range
                </h3>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={currentStartDate}
                    onChange={(e) => updateFilters("startDate", e.target.value)}
                    className="w-full px-3 border border-gray-200 rounded-lg h-[2.5rem] bg-white text-site-black font-medium text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={currentEndDate}
                    onChange={(e) => updateFilters("endDate", e.target.value)}
                    className="w-full px-3 border border-gray-200 rounded-lg h-[2.5rem] bg-white text-site-black font-medium text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="w-full rounded-lg flex gap-2 items-center px-3 bg-white border border-gray-200 focus-within:border-blue-500 transition-colors h-[2.5rem]">
            <IoSearch className="text-gray-400 size-5" />
            <input
              type="text"
              value={localSearch}
              placeholder="Search by name/mobile/id"
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-full w-full text-sm outline-none placeholder:text-gray-400 text-site-black bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPageHeader;
