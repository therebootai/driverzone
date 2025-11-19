import React from 'react'
import CouponPageHeader from './CouponPageHeader'
import ManageCoupon from './ManageCoupon'

const CouponFullPage = () => {
  return (
    <div className=' p-4 flex flex-col gap-4'>
        <div>
        <CouponPageHeader/>
        </div>
        <div>
            <ManageCoupon/>
        </div>
      
    </div>
  )
}

export default CouponFullPage
