import { Appointment } from '@models/Appoinment';
import { BaseService } from './BaseService';
import axios from 'axios';
export class AppointmentService extends BaseService {
    constructor() {
        super('appointments');
    }

    getHeaders() {
        const token = localStorage.getItem('token');

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getAppointmentByServiceID(id: number): Promise<Appointment | null> {
        return this.handleRequest(
            () => this.apiClient.get<Appointment>(`service-bookings/${id}`, { headers: this.getHeaders() }).then(response => response.data),
            `Error fetching appointment with service ${id}`
        );
    }

    // Thêm hàm này vào file service tương ứng, ví dụ AppointmentService.js
    async checkDoctorAvailability(doctorId, date, timeSlot) {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/appointments/check-availability?doctorId=${doctorId}&date=${date}&timeSlot=${timeSlot}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi kiểm tra lịch bác sĩ:', error);
            throw error;
        }
    }

    async getDoctorBookedSlots(doctorId, date) {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/appointments/booked-slots`, {
                    params: { 
                        doctorId, 
                        date: date
                    },
                    headers: this.getHeaders() 
                }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy các khung giờ đã đặt:', error);
            throw error;
        }
    }
}

export const appoinmentService = new AppointmentService();