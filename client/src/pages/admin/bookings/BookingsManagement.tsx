import { useState } from 'react';
import type { Booking } from '../../../types';
import { Card } from '../../Card';
interface BookingsManagementProps {
	bookings: Booking[];
}
export function BookingsManagement({ bookings }: BookingsManagementProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const filteredBookings = bookings.filter((booking: Booking) => {
		const matchesSearch =
			booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			booking.passengerPhone.includes(searchTerm) ||
			booking.id.includes(searchTerm);

		const matchesStatus =
			statusFilter === 'all' || booking.status === statusFilter;

		return matchesSearch && matchesStatus;
	});
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3>Kelola Pemesanan</h3>
			</div>

			{/* Filters */}
			<Card>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<input
							type="text"
							placeholder="Cari nama, HP, atau kode booking..."
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
				</div>
			</Card>

			{/* Bookings List */}
			{filteredBookings.length === 0 ? (
				<Card>
					<p className="text-center text-gray-600 py-8">
						Tidak ada pemesanan ditemukan
					</p>
				</Card>
			) : (
				<div className="space-y-4">
					{filteredBookings.map((booking) => (
							<div className="space-y-4">
								{/* Header */}
								<div className="flex items-start justify-between pb-4 border-b-2 border-gray-100">
									<div>
										<p className="text-sm text-gray-600">Kode Booking</p>
										<p className="text-gray-900">{booking.id.split(':')[1]}</p>
									<span
										className={`px-4 py-2 rounded-full
											${
					{booking.status === 'paid' ? 'Lunas' : ''}
					{booking.status === 'pending' ? 'Pending' : ''}
					{booking.status === 'cancelled' ? 'Batal' : ''}
								{/* Details */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-3">
										<div className="flex items-center gap-3">
											<div>
												<p className="text-sm text-gray-600">Nama Penumpang</p>
												<p className="text-gray-900">{booking.passengerName}</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div>
												<p className="text-sm text-gray-600">Tanggal & Jam</p>
												<p className="text-gray-900">
													{formatDate(booking.date)} - {booking.departureTime}
												</p>
										<div>
											<p className="text-sm text-gray-600">Rute</p>
											<p className="text-gray-900">
												{booking.origin}  {booking.destination}
											</p>
										</div>
								{/* Footer */}
								<div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
									<div>
										<p className="text-sm text-gray-600">Total Pembayaran</p>
										<p className="text-primary">
											Rp {booking.totalPrice.toLocaleString('id-ID')}
									<div className="text-right">
										<p className="text-sm text-gray-600">Penumpang</p>
										<p className="text-gray-900">{booking.passengers} orang</p>
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
