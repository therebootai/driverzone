import DriverFullPage from '@/components/admin/driver/DriverFullPage'
import AdminTemplate from '@/templates/AdminTemplate'
import React, { Suspense } from 'react'

const DriverManagement = () => {
  return (
    <AdminTemplate>
        <Suspense fallback={<div>Loading...</div>}>
            <DriverFullPage/>
        </Suspense>
    </AdminTemplate>
  )
}

export default DriverManagement
