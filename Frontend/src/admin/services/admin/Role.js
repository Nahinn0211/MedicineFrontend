 import axios from "axios";

export const RoleService = {
  // Lấy tất cả vai trò
  async getRoles() {
    return await axios.get("http://localhost:8080/api/roles");
  },

  // Lấy vai trò theo ID
  async getRoleById(id) {
    return await axios.get(`http://localhost:8080/api/roles/${id}`);
  },

  // Thêm mới hoặc cập nhật vai trò
  async saveRole(data) {
    // Đảm bảo dữ liệu đúng định dạng khi gửi lên
    const payload = {
      id: data.id,
      name: data.name
    };
    
    const response = await axios.post("http://localhost:8080/api/roles/save", payload);
    return response.data;
  },

  // Xóa một hoặc nhiều vai trò
  async deleteRoles(ids) {
    const response = await axios.post("http://localhost:8080/api/roles/delete", ids);
    return response.data;
  },

  // Tìm kiếm vai trò theo tên
  async findByName(name) {
    return await axios.get(`http://localhost:8080/api/roles/by-name/${encodeURIComponent(name)}`);
  }
};