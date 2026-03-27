'use client'

import { NavbarWithMobile } from '@/components/NavBar'
import { AppHeader } from '@/components/AppHeader'
import SyncLogsTable from './components/SyncPlLogsTable'

export default function SyncLogsPage() {
  return (
    <div>
      <NavbarWithMobile />
      <AppHeader />
      <div className=" bg-white text-gray-600 m-2 font-sans">
        <div className="container mx-auto px-4 pt-3">
          <SyncLogsTable />
        </div>
      </div>
    </div>
  )
}