// src/services/admin/DoctorProfileService.js
import axios from "axios";

export const DoctorProfileService = {
  // Lấy tất cả hồ sơ bác sĩ
  async getDoctorProfiles() {
    return await axios.get("http://localhost:8080/api/doctor-profiles");
  },

  // Lấy hồ sơ bác sĩ theo ID
  async getDoctorProfileById(id) {
    return await axios.get(`http://localhost:8080/api/doctor-profiles/${id}`);
  },

  // Thêm mới hoặc cập nhật hồ sơ bác sĩ
  async saveDoctorProfile(data) {
    // Đảm bảo dữ liệu đúng định dạng khi gửi lên
    const payload = {
      userId: data.userId,
      experience: data.experience,
      specialization: data.specialization,
      workplace: data.workplace,
      accountBalance: data.accountBalance
    };
    
    // Thêm ID vào payload chỉ khi là cập nhật (ID > 0)
    if (data.id) {
      payload.id = data.id;
    }
    
    const response = await axios.post("http://localhost:8080/api/doctor-profiles/save", payload);
    return response.data;
  },

  // Xóa hồ sơ bác sĩ
  async deleteDoctorProfile(id) {
    return await axios.delete(`http://localhost:8080/api/doctor-profiles/${id}`);
  },

  // Xóa nhiều hồ sơ bác sĩ
  async deleteDoctorProfiles(ids) {
    return await axios.post("http://localhost:8080/api/doctor-profiles/delete-multiple", ids);
  }
};