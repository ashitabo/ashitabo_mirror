'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next-nprogress-bar'
import { Booking } from '@/features/booking/types'
import { authBookingAction } from './actions'
import { ErrorType } from '@/utils/types/responseTypes'
import BookingDetailBox from '@/components/ui/molecules/BookingDetailBox'
import PasswordInputField from '@/components/ui/molecules/PasswordInputField'
import DetailNotFoundPage from '@/features/booking/components/DetailNotFound'

const passschema = yup.object({
	password: yup.string().required('パスワードを入力してください'),
})

const EditAuthPage = ({
	handleSetAuth,
	bookingDetail,
}: {
	handleSetAuth: (isAuth: boolean) => void
	bookingDetail: Booking
}) => {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState<boolean>(false) // Changed initial state to false
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const [error, setError] = useState<ErrorType>()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		mode: 'onBlur',
		resolver: yupResolver(passschema),
	})
	const handleClickShowPassword = () => setShowPassword((show) => !show)
	const handleMouseDownPassword = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault()
	}

	const onSubmit = async (data: { password: string }) => {
		setIsLoading(true) // Set loading true only during submission
		try {
			const response = await authBookingAction({
				bookingId: bookingDetail.id,
				password: data.password,
			})
			if (response.status === 200) {
				handleSetAuth(true)
				router.push(`/booking/${bookingDetail.id}/edit`)
			} else {
				setError(response)
			}
		} catch (e) {
			setError({
				status: 500,
				response:
					'このエラーが出た際はわたべに問い合わせてください。' + String(e),
			})
		}
		setIsLoading(false)
	}

	useEffect(() => {
		// setIsLoading(false) // Removed as isLoading is now initially false
		handleSetAuth(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // handleSetAuth might need to be in dependency array if it changes, but typically it doesn't for setters from parent.

	if (!bookingDetail) {
		return <DetailNotFoundPage />
	}

	return (
		<div className="flex justify-center flex-col">
			<div className="flex justify-center">
				<BookingDetailBox
					props={{
						bookingDate: bookingDetail.bookingDate,
						bookingTime: bookingDetail.bookingTime,
						registName: bookingDetail.registName,
						name: bookingDetail.name,
					}}
				/>
			</div>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col items-center mt-4"
			>
				<p className="text-lg text-center">
					予約編集用のパスワードを入力してください。
				</p>
				<div className="form-control w-full max-w-xs my-2">
					<label className="label" htmlFor="password">
						<span className="label-text">パスワード</span>
					</label>
					<PasswordInputField
						register={register('password')}
						showPassword={showPassword}
						handleClickShowPassword={handleClickShowPassword}
						handleMouseDownPassword={handleMouseDownPassword}
						errorMessage={errors.password?.message}
					/>
				</div>
				<div className="flex justify-center mt-4 space-x-4">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={isLoading}
					>
						ログイン
					</button>
					<button
						type="button"
						className="btn btn-outline"
						onClick={() => router.push(`/booking/${bookingDetail.id}`)}
					>
						予約詳細に戻る
					</button>
				</div>
			</form>
			{error && (
				<p className="text-sm text-error text-center">
					エラーコード{error.status}:{error.response}
				</p>
			)}
		</div>
	)
}

export default EditAuthPage
