// src/services/admin/DiscountService.js
import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';

export const DiscountService = {
  // Lấy tất cả giảm giá
  async getDiscounts() {
    return await sendGet("http://localhost:8080/api/discounts");
  },

  // Lấy giảm giá theo ID
  async getDiscountById(id) {
    return await sendGet(`http://localhost:8080/api/discounts/${id}`);
  },

  // Thêm mới hoặc cập nhật giảm giá
  async saveDiscount(data) {
    // Đảm bảo dữ liệu đúng định dạng khi gửi lên
    const payload = {
      id: data.id,
      code: data.code,
      name: data.name,
      medicineId: data.medicineId,
      discountPercentage: data.discountPercentage,
      startDate: data.startDate,
      endDate: data.endDate
    };
    
    const response = await sendPost("http://localhost:8080/api/discounts/save", payload);
    return response.data;
  },

  // Xóa một hoặc nhiều giảm giá
  async deleteDiscounts(ids) {
    const response = await sendPost("http://localhost:8080/api/discounts/delete", ids);
    return response.data;
  },

  // Tìm kiếm giảm giá theo mã
  async findByCode(code) {
    return await sendGet(`http://localhost:8080/api/discounts/search/code/${code}`);
  },

  // Tìm kiếm giảm giá theo ID thuốc
  async findByMedicineId(medicineId) {
    return await sendGet(`http://localhost:8080/api/discounts/search/medicine/${medicineId}`);
  },

  // Tìm kiếm giảm giá với các tham số khác nhau
  async searchDiscounts(params) {
    return await sendGet("http://localhost:8080/api/discounts/search", { params });
  }
};