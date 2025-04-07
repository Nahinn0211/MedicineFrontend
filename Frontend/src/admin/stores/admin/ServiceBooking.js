import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';

export const ServiceBookingService = {
   
  async getServiceBookings() {
    return await sendGet("http://localhost:8080/api/service-bookings");
  },

   async getUserServiceBookings() {
    return await sendGet(
      "http://localhost:8080/api/service-bookings/getUserServiceBookings"
    );
  },
   
  async getServiceBookingById(id) {
    return await sendGet(`http://localhost:8080/api/service-bookings/${id}`);
  },

  // Tạo mới một đặt lịch
  async createServiceBooking(bookingData) {
    return await sendPost(
      "http://localhost:8080/api/service-bookings/save",
      bookingData
    );
  },

  // Cập nhật một đặt lịch
  async updateServiceBooking(bookingData) {
    return await sendPost(
      "http://localhost:8080/api/service-bookings/save",
      bookingData
    );
  },

  // Xóa một hoặc nhiều đặt lịch
  async deleteServiceBookings(ids) {
    if (Array.isArray(ids)) {
      // Nếu là mảng IDs (xóa nhiều)
      return await axios.delete(
        "http://localhost:8080/api/service-bookings/delete-multiple",
        { data: ids }
      );
    } else {
      // Nếu là ID đơn (xóa một)
      return await axios.delete(
        `http://localhost:8080/api/service-bookings/${ids}`
      );
    }
  },

  // Lấy đặt lịch theo ID dịch vụ
  async getServiceBookingsByServiceId(serviceId) {
    return await sendGet(
      `http://localhost:8080/api/service-bookings/by-service/${serviceId}`
    );
  },

  // Lấy đặt lịch theo ID bệnh nhân
  async getServiceBookingsByPatientId(patientId) {
    return await sendGet(
      `http://localhost:8080/api/service-bookings/by-patient/${patientId}`
    );
  },

  // Lấy đặt lịch theo trạng thái
  async getServiceBookingsByStatus(status) {
    return await sendGet(
      `http://localhost:8080/api/service-bookings/by-status/${status}`
    );
  },
};
