import axios from 'axios';
import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';
import { API_BASE_URL } from '@/config/apiConfig';

export const USER_DEFAULTS = {
  id: 0,
  fullName: '',
  phone: '',
  address: '',
  email: '',
  password: '',
  enabled: true,
  locked: false,
  countLock: 0,
  avatar: null,
  createdAt: null,
  updatedAt: null
};

// Hàm chuẩn hóa dữ liệu người dùng
export const normalizeUserData = (user) => {
  const normalizedUser = { ...user };

  // Chuyển đổi chuỗi ngày thành đối tượng Date nếu cần
  if (normalizedUser.createdAt && typeof normalizedUser.createdAt === 'string') {
    normalizedUser.createdAt = new Date(normalizedUser.createdAt);
  }

  if (normalizedUser.updatedAt && typeof normalizedUser.updatedAt === 'string') {
    normalizedUser.updatedAt = new Date(normalizedUser.updatedAt);
  }

  return normalizedUser;
};

// Hàm kiểm tra tính hợp lệ của dữ liệu người dùng
export const validateUserData = (data, isEditMode = false) => {
  const errors = [];

  if (!data.fullName || data.fullName.trim() === '') {
    errors.push('Vui lòng nhập họ tên');
  }

  if (!data.email || data.email.trim() === '') {
    errors.push('Vui lòng nhập email');
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push('Email không hợp lệ');
  }

  if (!isEditMode && (!data.password || data.password.trim() === '')) {
    errors.push('Vui lòng nhập mật khẩu');
  } else if (!isEditMode && data.password && data.password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (data.phone && !/^\d{10,11}$/.test(data.phone)) {
    errors.push('Số điện thoại không hợp lệ');
  }

  return errors;
};

// Hàm format ngày tháng
export const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Hàm xử lý URL avatar
export const getAvatarUrl = (avatar) => {
  if (!avatar) return null;

  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  return `${API_BASE_URL}/uploads/users/${avatar}`;
};

export const UserService = {
  // Get all users
  async getUsers() {
    return await sendGet(`${API_BASE_URL}/users`);
  },

  // Get user by ID
  async getUserById(id) {
    return await sendGet(`${API_BASE_URL}/users/${id}`);
  },

  // Create or update user (JSON data)
  async saveUser(data) {
    return await sendPost(`${API_BASE_URL}/users`, data);
  },

  // Create or update user with avatar (multipart form data)
  async saveUserWithAvatar(formData) {
    // Sửa lỗi với roleIds, đảm bảo mỗi phần tử được thêm với cú pháp "roleIds[]"
    const fixedFormData = new FormData();

    // Lấy ra các phần tử từ formData ban đầu
    for (let [key, value] of formData.entries()) {
      if (key === 'roleIds') {
        // Đổi tên key để backend hiểu đây là một mảng
        fixedFormData.append('roleIds[]', value);
      } else {
        fixedFormData.append(key, value);
      }
    }

    return await axios.post(`${API_BASE_URL}/users/save`, fixedFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete multiple users
  async deleteUsers(ids) {
    return await axios.delete(`${API_BASE_URL}/users`, {
      data: ids
    });
  },

  // Find user by email
  async findByEmail(email) {
    return await sendGet(`${API_BASE_URL}/users/by-email?email=${encodeURIComponent(email)}`);
  },

  // Search users by different criteria
  async searchUsers(params) {
    return await sendGet(`${API_BASE_URL}/users/search`, { params });
  },

  // Get users by enabled status
  async getUsersByEnabled(enabled) {
    return await sendGet(`${API_BASE_URL}/users/by-enabled?enabled=${enabled}`);
  },

  // Get users by locked status
  async getUsersByLocked(locked) {
    return await sendGet(`${API_BASE_URL}/users/by-locked?locked=${locked}`);
  },

  // Change user password
  async changePassword(userId, oldPassword, newPassword) {
    return await sendPut(`${API_BASE_URL}/users/change-password/${userId}`, null, {
      params: {
        oldPassword,
        newPassword
      }
    });
  },

  // Get user profiles (doctors, patients, etc.)
  async getUserProfiles() {
    return await sendGet(`${API_BASE_URL}/users/listUserProfiles`);
  },

  // Get all doctors
  async getAllUsersRoleDoctor() {
    return await sendGet(`${API_BASE_URL}/users/listUserDoctor`);
  },

  // Get all patients
  async getAllUsersRoleUser() {
    return await sendGet(`${API_BASE_URL}/users/listUserByUser`);
  },

  /*-----------------------------------------------------------------*/
  // Phần này ở phía user anh đã tạo rồi ở phía admin không khởi tạo nữa
  // // Login user
  // async login(credentials) {
  //   return await sendPost(`${API_BASE_URL}/auth/login`, credentials);
  // },

  // // Register new user
  // async registerUser(data) {
  //   try {
  //     // Prepare user data according to API requirements
  //     const payload = {
  //       fullName: data.fullName || '',
  //       email: data.email || '',
  //       password: data.password || '',
  //       phone: data.phone || '',
  //       address: data.address || '',
  //       enabled: data.enabled !== undefined ? data.enabled : true,
  //       locked: data.locked !== undefined ? data.locked : false,
  //       countLock: data.countLock || 0
  //     };

  //     // Call register API
  //     const response = await sendPost(`${API_BASE_URL}/auth/register`, payload);

  //     // Save token if provided
  //     if (response.data && response.data.token) {
  //       localStorage.setItem('token', response.data.token);
  //     }

  //     return response;
  //   } catch (error) {
  //     console.error('Registration error:', error);
  //     throw error;
  //   }
  // }
};