import axios from "axios";

export const Appointments = {
  getHeaders() {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },
  // Lấy danh sách tất cả hồ sơ bệnh nhân
  async getAppointmentsByIdDoctor() {
    return await axios.get("http://localhost:8080/api/appointments/doctor/me",
      {
        headers: this.getHeaders(),
      }
    );
  },

  async getConsultationById(id) {
    return await axios.get(`http://localhost:8080/api/consultations/by-appointment/${id}`,
      {
        headers: this.getHeaders(),
      }
    );
  }
};