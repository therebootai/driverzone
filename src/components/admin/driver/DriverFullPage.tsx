"use client";
import React, { useEffect, useState } from "react";
import DriverHeader from "./DriverHeader";
import ManageDriver from "./ManageDriver";
import { getAllDriver } from "@/actions/driverActions";
import { DriverDocument } from "@/types/types";
import { useSearchParams } from "next/navigation";

const DriverFullPage = () => {
  const [allDrivers, setAllDrivers] = useState<DriverDocument[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,
  });

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [status, setStatus] = useState<boolean | undefined>(undefined);
  const searchParams = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const fetchData = async (
    page = 1,
    limit = 20,
    search = searchTerm,
    statusFilter = status
  ) => {
    try {
      const result = await getAllDriver({
        page,
        limit,
        searchTerm: search,
        status: statusFilter,
      });

      if (result?.success) {
        setAllDrivers(result.data || []);
        setPagination(result.paginations);
      } else {
        console.error(result?.error || "Failed to fetch customers");
        setAllDrivers([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllDrivers([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    }
  };

  useEffect(() => {
    fetchData(pageFromUrl, 20, searchTerm, status);
  }, [pageFromUrl, searchTerm, status]);
  return (
    <div className="p-6 flex flex-col gap-6 ">
      <div>
        <DriverHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          status={status}
          setStatus={setStatus}
          fetchData={fetchData}
        />
      </div>
      <div>
        <ManageDriver
          allDrivers={allDrivers}
          pagination={pagination}
          fetchData={fetchData}
        />
      </div>
    </div>
  );
};

export default DriverFullPage;
