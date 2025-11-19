import CouponFullPage from '@/components/admin/couponcomponent/CouponFullPage'
import AdminTemplate from '@/templates/AdminTemplate'
import React, { Suspense } from 'react'

const CouponPage = () => {
  return (
    <AdminTemplate>
        <Suspense fallback={<div>Loading...</div>}>
            <CouponFullPage/>
        </Suspense>
    </AdminTemplate>
  )
}

export default CouponPage
