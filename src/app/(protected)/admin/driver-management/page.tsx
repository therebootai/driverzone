import AdminTemplate from '@/templates/AdminTemplate'
import React, { Suspense } from 'react'

const DriverManagement = () => {
  return (
    <AdminTemplate>
        <Suspense fallback={<div>Loading...</div>}>

        </Suspense>
    </AdminTemplate>
  )
}

export default DriverManagement
