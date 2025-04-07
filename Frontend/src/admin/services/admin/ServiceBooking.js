import axios from "axios";

export const ServiceBookingService = {
  getHeaders() {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },
  // Lấy danh sách tất cả các đặt lịch
  async getServiceBookings() {
    return await axios.get("http://localhost:8080/api/service-bookings");
  },

   async getUserServiceBookings() {
    return await axios.get(
      "http://localhost:8080/api/service-bookings/getUserServiceBookings",
      {
        headers: this.getHeaders(),
      }
    );
  },
   
  async getServiceBookingById(id) {
    return await axios.get(`http://localhost:8080/api/service-bookings/${id}`);
  },

  // Tạo mới một đặt lịch
  async createServiceBooking(bookingData) {
    return await axios.post(
      "http://localhost:8080/api/service-bookings/save",
      bookingData
    );
  },

  // Cập nhật một đặt lịch
  async updateServiceBooking(bookingData) {
    return await axios.post(
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
    return await axios.get(
      `http://localhost:8080/api/service-bookings/by-service/${serviceId}`
    );
  },

  // Lấy đặt lịch theo ID bệnh nhân
  async getServiceBookingsByPatientId(patientId) {
    return await axios.get(
      `http://localhost:8080/api/service-bookings/by-patient/${patientId}`
    );
  },

  // Lấy đặt lịch theo trạng thái
  async getServiceBookingsByStatus(status) {
    return await axios.get(
      `http://localhost:8080/api/service-bookings/by-status/${status}`
    );
  },
};
