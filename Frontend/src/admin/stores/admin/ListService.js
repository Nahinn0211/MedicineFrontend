import { sendDelete, sendGet, sendPost } from '@admin/services/axios';
import { API_BASE_URL } from '@/config/apiConfig';

const SERVICES_ENDPOINT = `${API_BASE_URL}/services`;

export const ListService = {
  // Lấy danh sách tất cả dịch vụ
  async getServices() {
    return await sendGet(SERVICES_ENDPOINT);
  },

  // Lấy thông tin dịch vụ theo ID
  async getServicesById(id) {
    return await sendGet(`${SERVICES_ENDPOINT}/${id}`);
  },

  // Lưu dịch vụ (không bao gồm liên kết bác sĩ)
  async saveServices(formData) {
    return await sendPost(`${SERVICES_ENDPOINT}/save`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Lưu dịch vụ và liên kết với nhiều bác sĩ
  async saveServiceWithDoctors(formData) {
    return await sendDelete(`${SERVICES_ENDPOINT}/save-with-doctors`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa một hoặc nhiều dịch vụ
  async deleteServices(ids) {
     const idsArray = Array.isArray(ids) ? ids : [ids];
    
     return await sendDelete(SERVICES_ENDPOINT, {
      data: idsArray
    });
  },

  // Lấy danh sách ID bác sĩ theo dịch vụ
  async getDoctorIdsByServiceId(serviceId) {
    return await sendGet(`${SERVICES_ENDPOINT}/${serviceId}/doctors`);
  },

  // Tìm dịch vụ theo tên
  async searchServicesByName(name) {
    return await sendGet(`${SERVICES_ENDPOINT}/by-name?name=${name}`);
  }
};