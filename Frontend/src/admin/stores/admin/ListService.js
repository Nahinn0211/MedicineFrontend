import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';
  
export const ListService = {
  // Lấy danh sách tất cả dịch vụ
  async getServices() {
    return await sendGet("http://localhost:8080/api/services");
  },

  // Lấy thông tin dịch vụ theo ID
  async getServicesById(id) {  
    return await sendGet(`http://localhost:8080/api/services/${id}`);
  },

  async saveServices(formData) {
    return await sendPost("http://localhost:8080/api/services/save", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa một dịch vụ
  async deleteService(id) {
    return await sendDelete(`http://localhost:8080/api/services/${id}`);
  },
  
  // Xóa nhiều dịch vụ
  async deleteServices(ids) {
    return await sendDelete("http://localhost:8080/api/services", { data: ids });
  },
  
  
  // Gán bác sĩ cho dịch vụ
  async assignDoctorsToService(serviceId, doctorIds) {
    return await sendPost(`http://localhost:8080/api/services/${serviceId}/doctors`, doctorIds);
  },
  
  // Tìm dịch vụ theo tên
  async searchServicesByName(name) {
    return await sendGet(`http://localhost:8080/api/services/by-name?name=${name}`);
  }
};