import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';
import { API_BASE_URL } from '@/config/apiConfig';

export const PatientProfileService = {
  // Lấy danh sách tất cả hồ sơ bệnh nhân
  async getPatientProfiles() {
    return await sendGet(`${API_BASE_URL}/patient-profiles`);
  },
  
  // Lấy chi tiết hồ sơ bệnh nhân theo ID
  async getPatientProfileById(id) {
    return await sendGet(`${API_BASE_URL}/patient-profiles/${id}`);
  },
  
  // Lấy hồ sơ bệnh nhân theo user ID
  async getPatientProfileByUserId(userId) {
    return await sendGet(`${API_BASE_URL}/patient-profiles/by-user/${userId}`);
  },
  
  // Lưu hoặc cập nhật hồ sơ bệnh nhân
  async savePatientProfile(profileData) {
    return await sendPost(`${API_BASE_URL}/patient-profiles/save`, profileData);
  },
  
  // Xóa hồ sơ bệnh nhân theo ID
  async deletePatientProfiles(ids) {
    return await sendDelete(`${API_BASE_URL}/patient-profiles`, { data: ids });
  },
  
  // Nạp tiền vào tài khoản bệnh nhân
  async updateAccountBalance(patientProfileId, balance) {
    return await sendPut(`${API_BASE_URL}/patient-profiles/update/balance/${patientProfileId}`, balance.toString());
  },
  
  // Lấy tổng số bệnh nhân
  async getTotalPatients() {
    return await sendGet(`${API_BASE_URL}/patient-profiles/total`);
  }
};