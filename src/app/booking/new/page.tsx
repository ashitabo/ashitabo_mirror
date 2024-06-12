'use client'

import React, { Suspense } from 'react'
import NewBooking from '@/components/NewBooking'
import Loading from '@/components/atom/Loading'

const Page = () => {
	return (
		<Suspense fallback={<Loading/>}>
			<NewBooking />
		</Suspense>
	)
}

export default Page
