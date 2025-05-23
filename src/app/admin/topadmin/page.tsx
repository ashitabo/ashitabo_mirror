'use server'

import { notFound } from 'next/navigation'
import TopAdminBuyPage from '@/features/admin/components/TopAdminBuyPage'
import {
	getUserRoleAction,
	getBuyBookingByStatusAction,
} from '@/features/admin/components/action'
import { getSession } from '@/app/actions'
import SessionForbidden from '@/components/ui/atoms/SessionNotFound'

const Page = async () => {
	const session = await getSession()
	if (!session) {
		return <SessionForbidden />
	}

	const userRole = await getUserRoleAction(session.user.id)
	if (userRole.response !== 'TOPADMIN' || userRole.status !== 200) {
		return notFound()
	}

	const buyBookings = await getBuyBookingByStatusAction({
		status: ['UNPAID', 'EXPIRED'],
	})
	if (buyBookings.status !== 200) {
		return notFound()
	}

	return <TopAdminBuyPage buyBookings={buyBookings.response} />
}

export default Page
