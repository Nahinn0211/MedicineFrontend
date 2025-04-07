import axios from "axios";

export const MedicineMediaService = {
  // Lấy tất cả media của thuốc
  async getMedicineMedias() {
    return await axios.get("http://localhost:8080/api/medicine-media");
  },

  // Lấy media theo ID
  async getMedicineMediaById(id) {
    return await axios.get(`http://localhost:8080/api/medicine-media/${id}`);
  },

  // Lưu hoặc cập nhật media thuốc (hỗ trợ upload file)
  async saveOrUpdateMedicineMedia(formData) {
    return await axios.post("http://localhost:8080/api/medicine-media/save", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  async deleteAllMediaByMedicineId(medicineId) {
    return await axios.delete(`http://localhost:8080/api/medicine-media/by-medicine/${medicineId}`);
  },
// Lấy tất cả media của một thuốc
async getAllMedicineMedia(medicineId) {
  return await axios.get(`http://localhost:8080/api/medicine-media/${medicineId}`);
},
  // Xóa media theo ID
  async deleteMedicineMedia(id) {
    return await axios.delete(`http://localhost:8080/api/medicine-media/${id}`);
  },

  // Lấy media theo ID thuốc
  async getMedicineMediaByMedicineId(medicineId) {
    return await axios.get(`http://localhost:8080/api/medicine-media/by-medicine/${medicineId}`);
  },

  // Lấy ảnh chính của thuốc
  async getMainImageByMedicineId(medicineId) {
    return await axios.get(`http://localhost:8080/api/medicine-media/main-image/${medicineId}`);
  }
};