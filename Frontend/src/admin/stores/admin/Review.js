import { sendDelete, sendGet, sendPost } from '@admin/services/axios';
import { API_BASE_URL } from '@/config/apiConfig';

const REVIEWS_ENDPOINT = `${API_BASE_URL}/reviews`;

export const ReviewService = {
  // Lấy danh sách tất cả đánh giá
  async getReviews() {
    return await sendGet(REVIEWS_ENDPOINT);
  },

  // Lấy thông tin đánh giá theo ID
  async getReviewById(id) {
    return await sendGet(`${REVIEWS_ENDPOINT}/${id}`);
  },

  // Lưu đánh giá
  async saveReview(reviewData) {
    return await sendPost(`${REVIEWS_ENDPOINT}/save`, reviewData);
  },

  // Xóa đánh giá
  async deleteReviews(ids) {
    // Đảm bảo ids luôn là một mảng
    const idsArray = Array.isArray(ids) ? ids : [ids];
    
    return await sendDelete(REVIEWS_ENDPOINT, idsArray);
  },

  // Lấy đánh giá theo người dùng
  async getReviewsByUserId(userId) {
    return await sendGet(`${REVIEWS_ENDPOINT}/by-user/${userId}`);
  },

  // Lấy đánh giá theo bác sĩ
  async getReviewsByDoctorId(doctorId) {
    return await sendGet(`${REVIEWS_ENDPOINT}/by-doctor/${doctorId}`);
  },

  // Lấy đánh giá theo thuốc
  async getReviewsByMedicineId(medicineId) {
    return await sendGet(`${REVIEWS_ENDPOINT}/by-medicine/${medicineId}`);
  },

  // Tìm kiếm đánh giá theo điểm đánh giá
  async getReviewsByRating(rating) {
    return await sendGet(`${REVIEWS_ENDPOINT}/by-rating/${rating}`);
  }
};

export default ReviewService;