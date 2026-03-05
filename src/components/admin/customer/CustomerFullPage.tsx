"use client";
import React, { useEffect, useRef, useState } from "react";
import CustomerPageHeader from "./CustomerPageHeader";
import ManageCustomer from "./ManageCustomer";
import { customerTypes } from "@/types/types";
import { useSearchParams } from "next/navigation";
import { getAllCustomers } from "@/actions/customerActions";

const CustomerFullPage = () => {
  const [allCustomer, setAllCustomer] = useState<customerTypes[]>([]);
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
      const result = await getAllCustomers({
        page,
        limit,
        searchTerm: search,
        status: statusFilter,
      });

      if (result?.success) {
        setAllCustomer(result.data || []);
        setPagination(result.paginations);
      } else {
        console.error(result?.error || "Failed to fetch customers");
        setAllCustomer([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllCustomer([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    }
  };

  useEffect(() => {
    fetchData(pageFromUrl, 20, searchTerm, status);
  }, [pageFromUrl, searchTerm, status]);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* <div>
        <CustomerPageHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          status={status}
          setStatus={setStatus}
        />
      </div> */}
      <div className="">
        <ManageCustomer
          allCustomer={allCustomer}
          pagination={pagination}
          fetchData={fetchData}
        />
      </div>
    </div>
  );
};

export default CustomerFullPage;
