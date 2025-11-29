import React, { Suspense } from 'react'
import AdminTemplate from '@/templates/AdminTemplate'
import BookingFullPage from '@/components/admin/booking/BookingFullPage'

const BookingManagement = () => {
  return (
    <AdminTemplate>
        <Suspense fallback={<div>Loading...</div>}>
          <BookingFullPage/>
        </Suspense>
    </AdminTemplate>
  )
}

export default BookingManagement
