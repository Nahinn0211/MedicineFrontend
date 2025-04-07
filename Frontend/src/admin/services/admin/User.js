// src/services/admin/UserService.js
import axios from "axios";

export const UserService = {
  // Lấy tất cả người dùng
  async getUsers() {
    return await axios.get("http://localhost:8080/api/users");
  },

  // Lấy người dùng theo ID
  async getUserById(id) {
    return await axios.get(`http://localhost:8080/api/users/${id}`);
  },

  // Thêm mới hoặc cập nhật người dùng (không có file)
  async saveUser(data) {
    return await axios.post("http://localhost:8080/api/users", data);
  },

  // Thêm mới hoặc cập nhật người dùng (có file avatar)
  async saveUserWithAvatar(formData) {
    return await axios.post("http://localhost:8080/api/users/save", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  async getUserProfiles() {
    return await axios.get("http://localhost:8080/api/users/listUserProfiles");
  },
// Lấy tất cả bác sĩ
async getAllUsersRoleDoctor() {
  return await axios.get("http://localhost:8080/api/users/listUserDoctor");
},

// Lấy tất cả bệnh nhân
async getAllUsersRoleUser() {
  return await axios.get("http://localhost:8080/api/users/listUserByUser");
},
  // Xóa người dùng
  async deleteUser(id) {
    return await axios.delete(`http://localhost:8080/api/users/${id}`);
  },

  // Xóa nhiều người dùng
  async deleteUsers(ids) {
    return await axios.post("http://localhost:8080/api/users/delete-multiple", ids);
  },

  // Tìm người dùng theo email
  async findByEmail(email) {
    return await axios.get(`http://localhost:8080/api/users/by-email?email=${encodeURIComponent(email)}`);
  },

  // Tìm kiếm người dùng
  async searchUsers(params) {
    return await axios.get("http://localhost:8080/api/users/search", { params });
  },

  // Lấy người dùng theo trạng thái kích hoạt
  async getUsersByEnabled(enabled) {
    return await axios.get(`http://localhost:8080/api/users/by-enabled?enabled=${enabled}`);
  },

  // Lấy người dùng theo trạng thái khóa
  async getUsersByLocked(locked) {
    return await axios.get(`http://localhost:8080/api/users/by-locked?locked=${locked}`);
  }
};