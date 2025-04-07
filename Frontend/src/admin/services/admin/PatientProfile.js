import axios from "axios";

export const PatientProfileService = {
  // Lấy danh sách tất cả hồ sơ bệnh nhân
  async getAllProfiles() {
    return await axios.get("http://localhost:8080/api/patient-profiles");
  },
  
  // Lấy chi tiết hồ sơ bệnh nhân theo ID
  async getProfileById(id) {
    return await axios.get(`http://localhost:8080/api/patient-profiles/${id}`);
  },
  
  // Lưu hoặc cập nhật hồ sơ bệnh nhân
  async saveOrUpdateProfile(profileData) {
    return await axios.post("http://localhost:8080/api/patient-profiles/save", profileData);
  },
  
  // Nạp tiền vào tài khoản bệnh nhân
  async depositMoney(patientProfileId, amount) {
    return await axios.post(`http://localhost:8080/api/patient-profiles/${patientProfileId}/deposit`, { amount });
  }
};