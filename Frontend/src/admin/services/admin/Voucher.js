// src/services/admin/VoucherService.js
import axios from "axios";

export const VoucherService = {
  // Lấy tất cả voucher
  async getVouchers() {
    return await axios.get("http://localhost:8080/api/vouchers");
  },

  // Lấy voucher theo ID
  async getVoucherById(id) {
    return await axios.get(`http://localhost:8080/api/vouchers/${id}`);
  },

  // Thêm mới hoặc cập nhật voucher
  async saveVoucher(data) {
    // Đảm bảo dữ liệu đúng định dạng khi gửi lên
    const payload = {
      id: data.id,
      code: data.code,
      voucherPercentage: data.voucherPercentage,
      stock: data.stock,
      startDate: data.startDate,
      endDate: data.endDate
    };
    
    const response = await axios.post("http://localhost:8080/api/vouchers/save", payload);
    return response.data;
  },

  // Xóa một hoặc nhiều voucher
  async deleteVouchers(ids) {
    const response = await axios.post("http://localhost:8080/api/vouchers/delete", ids);
    return response.data;
  },

  // Tìm kiếm voucher theo mã
  async findByCode(code) {
    return await axios.get(`http://localhost:8080/api/vouchers/by-code?code=${encodeURIComponent(code)}`);
  }
};