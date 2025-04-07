import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';

export const Categories = {
  // Lấy toàn bộ danh mục
  async getCategories() {
    return await sendGet("http://localhost:8080/api/categories");
  },

  // Lấy danh mục theo ID
  async getCategoryById(id) {
    return await sendGet(`http://localhost:8080/api/categories/${id}`);
  },

  // Lưu danh mục (thêm mới hoặc cập nhật)
  async saveCategory(categoryData) {
    return await sendPost("http://localhost:8080/api/categories/save", categoryData);
  },

  // Xóa nhiều danh mục
  async deleteCategories(ids) {
    return await sendDelete("http://localhost:8080/api/categories/delete-multiple", { data: ids });
  },

  // Tìm kiếm danh mục theo tên chính xác
  async searchCategoryByName(name) {
    return await sendGet(`http://localhost:8080/api/categories/search/name`, {
      params: { name }
    });
  },

  // Tìm kiếm danh mục có chứa từ khóa
  async searchCategoriesByNameContaining(namePattern) {
    return await sendGet(`http://localhost:8080/api/categories/search/name-containing`, {
      params: { namePattern }
    });
  },

  // Lấy danh mục con của một danh mục cha
  async getCategoriesByParentId(parentId) {
    return await sendGet(`http://localhost:8080/api/categories/parent/${parentId}`);
  }
};