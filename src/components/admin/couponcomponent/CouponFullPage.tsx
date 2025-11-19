"use client"
import React, { useEffect, useState } from 'react'
import CouponPageHeader from './CouponPageHeader'
import ManageCoupon from './ManageCoupon'
import { getAllCoupon } from '@/actions/couponActions';
import { useSearchParams } from 'next/navigation';
import { CouponFormState } from '@/types/types';

const CouponFullPage = () => {
       const [allCoupon, setAllCoupon] = useState<CouponFormState[]>([]);
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
      const result = await getAllCoupon({
        page,
        limit,
        searchTerm: search,
        status: statusFilter,
      });
  
      if (result?.success) {
        setAllCoupon(result.data || []);
        setPagination(result.paginations);
      } else {
        console.error(result?.error || "Failed to fetch customers");
        setAllCoupon([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAllCoupon([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
    }
  };
  
    useEffect(() => {
      fetchData(pageFromUrl, 20, searchTerm, status);
    }, [pageFromUrl, searchTerm, status]);
  
  return (
    <div className=' p-4 flex flex-col gap-4'>
        <div>
        <CouponPageHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} status={status} setStatus={setStatus} fetchData={fetchData}/>
        </div>
        <div>
            <ManageCoupon allCoupon={allCoupon} pagination={pagination} fetchData={fetchData}/>
        </div>
      
    </div>
  )
}

export default CouponFullPage
