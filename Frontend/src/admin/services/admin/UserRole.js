// src/services/admin/UserRoleService.js
import axios from "axios";

export const UserRoleService = {
  // Lấy tất cả liên kết vai trò người dùng
  async getUserRoles() {
    return await axios.get("http://localhost:8080/api/user-roles");
  },

  // Lấy liên kết vai trò người dùng theo ID
  async getUserRoleById(id) {
    return await axios.get(`http://localhost:8080/api/user-roles/${id}`);
  },

  // Thêm mới hoặc cập nhật liên kết vai trò người dùng
  async saveUserRole(data) {
    return await axios.post("http://localhost:8080/api/user-roles/save", data);
  },

  // Xóa liên kết vai trò người dùng
  async deleteUserRole(id) {
    return await axios.delete(`http://localhost:8080/api/user-roles/${id}`);
  },

  // Lấy liên kết vai trò người dùng theo ID người dùng
  async getUserRolesByUserId(userId) {
    return await axios.get(`http://localhost:8080/api/user-roles/by-user/${userId}`);
  },

  // Lấy liên kết vai trò người dùng theo ID vai trò
  async getUserRolesByRoleId(roleId) {
    return await axios.get(`http://localhost:8080/api/user-roles/by-role/${roleId}`);
  }
};