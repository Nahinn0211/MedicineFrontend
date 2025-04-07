import { ServiceBooking } from '@models/ServiceBooking';
import axios from 'axios';

interface ServiceBookingData {
  serviceId: number;
  patientId: number;
  doctorId: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  appointmentDate: string;
  appointmentTime: string;
}

export class ServiceBookingService {
    getHeaders() {
        const token = localStorage.getItem('token');

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async saveServiceBooking(bookingData: ServiceBookingData): Promise<ServiceBooking | null> {
        try {
            const response = await axios.post(
                'http://localhost:8080/api/service-bookings/save',
                bookingData,  // Truyền trực tiếp object gốc
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi đặt dịch vụ:', error);
            throw error;
        }
    }

    async getUserBookings(id: number): Promise<ServiceBooking[] | null> {
        try {
            const response = await axios.get<ServiceBooking[]>(
                `http://localhost:8080/api/service-bookings/by-patient/${id}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách dịch vụ đã đặt:', error);
            throw error;
        }
    }

    async cancelServiceBooking(id: number): Promise<string> {
        try {
            const response = await axios.post(
                `http://localhost:8080/api/service-bookings/cancel/${id}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi hủy dịch vụ đã đặt:', error);
            throw error;
        }
    }
}

export const serviceBookingService = new ServiceBookingService();