'use client'

import { useState, useRef } from 'react' // Removed useEffect, use
import { useRouter } from 'next-nprogress-bar'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
	adminRevalidateTagAction,
	deleteUserAction,
	updateUserRoleAction,
	getAllUserDetailsAction,
} from './action'
import {
	UserDetail,
	RoleMap,
	PartMap,
	AccountRoleMap,
	AccountRole,
} from '@/features/user/types'
import { ErrorType } from '@/utils/types/responseTypes'
import { Session } from 'next-auth'
import Pagination from '@/components/ui/atoms/Pagination'
import SelectField from '@/components/ui/atoms/SelectField'
import Popup, { PopupRef } from '@/components/ui/molecules/Popup'

interface AdminUserPageProps {
	session: Session
	initialUsers: UserDetail[]
	initialPageMax: number
	initialCurrentPage: number
	initialUsersPerPage: number
	initialSort: 'new' | 'old'
}

const AdminUserPage = ({
	session,
	initialUsers,
	initialPageMax,
	initialCurrentPage,
	initialUsersPerPage,
	initialSort,
}: AdminUserPageProps) => {
	const router = useRouter()
	const [currentPage, setCurrentPage] = useState<number>(
		initialCurrentPage || 1,
	)
	const [usersPerPage, setUsersPerPage] = useState(initialUsersPerPage || 10)
	const [sort, setSort] = useState<'new' | 'old'>(initialSort || 'new')
	const [isLoading, setIsLoading] = useState<boolean>(false) // For actions like delete/role change, not for fetching list
	const [popupData, setPopupData] = useState<UserDetail>()
	const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
	const popupRef = useRef<PopupRef>(undefined)
	const [isdeletePopupOpen, setIsDeletePopupOpen] = useState<boolean>(false)
	const deletePopupRef = useRef<PopupRef>(undefined)

	const [error, setError] = useState<ErrorType>()
	const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState<boolean>(false)
	const successPopupRef = useRef<PopupRef>(undefined)

	// pageMax and users are now from props
	const users = initialUsers
	const pageMax = initialPageMax

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
		router.push(
			`?adminUserPage=${page}&adminUserLimit=${usersPerPage}&adminUserSort=${sort}`,
			{ scroll: false },
		)
	}

	const handleUsersPerPageChange = (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newUsersPerPage = parseInt(e.target.value)
		setUsersPerPage(newUsersPerPage)
		setCurrentPage(1) // Reset to first page
		router.push(
			`?adminUserPage=1&adminUserLimit=${newUsersPerPage}&adminUserSort=${sort}`,
			{ scroll: false },
		)
	}

	const handleSortChange = (newSort: 'new' | 'old') => {
		setSort(newSort)
		setCurrentPage(1) // Reset to first page
		router.push(
			`?adminUserPage=1&adminUserLimit=${usersPerPage}&adminUserSort=${newSort}`,
			{ scroll: false },
		)
	}

	const onDelete = async (id: string) => {
		setIsLoading(true) // Keep isLoading for this action
		const res = await deleteUserAction({ id, role: 'ADMIN' })
		if (res.status === 200) {
			setIsPopupOpen(false)
			setIsDeletePopupOpen(false)
			await adminRevalidateTagAction('users')
		} else {
			setError(res)
		}
		setIsLoading(false)
	}

	const onRoleChange = async (id: string, role: AccountRole) => {
		setIsLoading(true)
		const res = await updateUserRoleAction({ id, role })
		if (res.status === 200) {
			await adminRevalidateTagAction('users')
			setIsPopupOpen(false)
		} else {
			setError(res)
		}
		setIsLoading(false)
	}

	return (
		<div className="flex flex-col items-center justify-center gap-y-2">
			<h1 className="text-2xl font-bold">ユーザ管理</h1>
			<p className="text-sm text-center">
				このページでは登録ユーザの確認、削除、三役権限の追加が可能です。
				<br />
				見知らぬユーザやサイト上での不審な動きのあるユーザを削除可能ですが、基本的にそんなことしないでください。
				<br />
				また、三役権限の追加もむやみに行わないでください。大いなる責任が伴います。お前らを信用しています。
			</p>
			<button
				className="btn btn-primary btn-md"
				onClick={async () => await adminRevalidateTagAction('users')}
			>
				ユーザ情報を更新
			</button>
			<div className="overflow-x-auto w-full flex flex-col justify-center gap-y-2">
				<div className="flex flex-row items-center ml-auto space-x-2 w-1/2">
					<p className="text-sm whitespace-nowrap">表示件数:</p>
					<SelectField
						value={usersPerPage}
						onChange={handleUsersPerPageChange}
						options={{ 10: '10件', 20: '20件', 50: '50件', 100: '100件' }}
						name="usersPerPage"
					/>
				</div>
				<div className="flex flex-row gap-x-2">
					<input
						type="radio"
						name="adminUserSort" // Changed name to avoid conflict
						value="new"
						checked={sort === 'new'}
						className="btn btn-tetiary btn-sm"
						aria-label="新しい順"
						onChange={() => handleSortChange('new')}
					/>
					<input
						type="radio"
						name="adminUserSort" // Changed name to avoid conflict
						value="old"
						checked={sort === 'old'}
						className="btn btn-tetiary btn-sm"
						aria-label="古い順"
						onChange={() => handleSortChange('old')}
					/>
				</div>
				<table className="table table-zebra table-sm w-full max-w-36 justify-center">
					<thead>
						<tr>
							<th>LINE登録名</th>
							<th>本名</th>
							<th>学籍番号</th>
							<th>学籍状況</th>
							<th>役割</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user) => (
							<tr
								key={user.id}
								onClick={() => {
									setPopupData(user)
									setIsPopupOpen(true)
								}}
							>
								<td>{user.name}</td>
								<td>{user.fullName}</td>
								<td>{user.studentId}</td>
								<td>{user.role !== undefined ? RoleMap[user.role] : '不明'}</td>
								<td>
									{user.AccountRole !== undefined && user.AccountRole !== null
										? AccountRoleMap[user.AccountRole]
										: '不明'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Popup
				id={`user-detail-popup-${popupData?.id}`}
				ref={popupRef}
				title="ユーザ詳細"
				open={isPopupOpen}
				onClose={() => setIsPopupOpen(false)}
			>
				<div className="flex flex-col space-y-2 text-sm">
					<div className="grid grid-cols-2 gap-2">
						<div className="font-bold">LINE登録名</div>
						<div>{popupData?.name}</div>
						<div className="font-bold">本名:</div>
						<div>{popupData?.fullName}</div>
						<div className="font-bold">学籍番号:</div>
						<div>{popupData?.studentId}</div>
						<div className="font-bold">学籍状況:</div>
						<div>
							{popupData?.role !== undefined ? RoleMap[popupData.role] : '不明'}
						</div>
						<div className="font-bold">役割:</div>
						<div>
							{popupData?.AccountRole != null
								? AccountRoleMap[popupData.AccountRole]
								: '不明'}
						</div>
						<div className="font-bold">使用楽器:</div>
						<div>
							{popupData?.part?.map((part) => (
								<div key={part}>{PartMap[part]}</div>
							))}
						</div>
						<div className="font-bold">卒業予定:</div>
						<div>{popupData?.expected}年度</div>
						<div className="font-bold">作成日:</div>
						<div>
							{popupData?.createAt
								? format(popupData.createAt, 'yyyy年MM月dd日hh時mm分ss秒', {
										locale: ja,
									})
								: ''}
						</div>
						<div className="font-bold">更新日:</div>
						<div>
							{popupData?.updateAt
								? format(popupData.updateAt, 'yyyy年MM月dd日hh時mm分ss秒', {
										locale: ja,
									})
								: ''}
						</div>
					</div>
					<div className="flex flex-row justify-center gap-x-2">
						<button
							className="btn btn-primary"
							disabled={
								(popupData?.AccountRole === 'ADMIN' ||
									popupData?.AccountRole === 'TOPADMIN') &&
								!isLoading
									? true
									: false
							}
							onClick={async () => {
								if (!popupData) return
								await onRoleChange(popupData.id, 'ADMIN')
							}}
						>
							三役に任命
						</button>
						<button
							className="btn btn-error"
							disabled={
								session.user.id === popupData?.id && !isLoading ? true : false
							}
							onClick={async () => {
								if (!popupData) return
								setIsDeletePopupOpen(true)
								setError(undefined)
							}}
						>
							削除
						</button>
						<button
							className="btn btn-outline"
							onClick={() => setIsPopupOpen(false)}
						>
							閉じる
						</button>
					</div>
					{error && (
						<p className="text-error text-center">
							エラーコード{error.status}:{error.response}
						</p>
					)}
				</div>
			</Popup>
			<Pagination
				currentPage={currentPage}
				totalPages={pageMax}
				onPageChange={handlePageChange}
			/>
			<div className="flex flex-row justify-center mt-2">
				<button
					className="btn btn-outline"
					onClick={() => router.push('/admin')}
				>
					戻る
				</button>
			</div>
			<Popup
				id={`delete-user-popup-${popupData?.id}`}
				ref={deletePopupRef}
				title="削除確認"
				open={isdeletePopupOpen}
				onClose={() => setIsDeletePopupOpen(false)}
			>
				<div className="flex flex-col space-y-2 text-sm items-center">
					<div className="text-error font-bold">本当に削除しますか?</div>
					<div>この操作は取り消せません</div>
					<div className="flex flex-row justify-center gap-x-2">
						<button
							className="btn btn-error"
							onClick={async () => {
								if (!popupData) return
								await onDelete(popupData.id)
							}}
						>
							はい
						</button>
						<button
							className="btn btn-outline"
							onClick={() => setIsDeletePopupOpen(false)}
						>
							いいえ
						</button>
					</div>
					{error && (
						<p className="text-error text-center">
							エラーコード{error.status}:{error.response}
						</p>
					)}
				</div>
			</Popup>
			<Popup
				id={`delete-user-success-popup-${popupData?.id}`}
				ref={successPopupRef}
				title="削除完了"
				open={isSuccessPopupOpen}
				onClose={() => setIsSuccessPopupOpen(false)}
			>
				<div className="flex flex-col space-y-2 text-sm items-center">
					<div>削除が完了しました</div>
					<button
						className="btn btn-primary"
						onClick={() => setIsSuccessPopupOpen(false)}
					>
						閉じる
					</button>
				</div>
			</Popup>
		</div>
	)
}

export default AdminUserPage
