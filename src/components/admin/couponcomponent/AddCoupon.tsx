import React from 'react'

const AddCoupon = ({ onSuccess, onCancel}:{onSuccess?:()=>void,onCancel?:()=>void}) => {
  return (
    <div className=' flex flex-col gap-5 px-6'>
         <h3 className="text-site-black xl:text-xl md:text-base text-sm font-bold">
        Add Coupon
      </h3>
      
    </div>
  )
}

export default AddCoupon
