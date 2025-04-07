import axios from "axios";

export const Categories = {
  // Lấy toàn bộ danh mục
  async getCategories() {
    return await axios.get("http://localhost:8080/api/categories");
  },

  // Lấy danh mục theo ID
  async getCategoryById(id) {
    return await axios.get(`http://localhost:8080/api/categories/${id}`);
  },

  // Lưu danh mục (thêm mới hoặc cập nhật)
  async saveCategory(categoryData) {
    return await axios.post("http://localhost:8080/api/categories/save", categoryData);
  },

  // Xóa nhiều danh mục
  async deleteCategories(ids) {
    return await axios.delete("http://localhost:8080/api/categories/delete-multiple", { data: ids });
  },

  // Tìm kiếm danh mục theo tên chính xác
  async searchCategoryByName(name) {
    return await axios.get(`http://localhost:8080/api/categories/search/name`, {
      params: { name }
    });
  },

  // Tìm kiếm danh mục có chứa từ khóa
  async searchCategoriesByNameContaining(namePattern) {
    return await axios.get(`http://localhost:8080/api/categories/search/name-containing`, {
      params: { namePattern }
    });
  },

  // Lấy danh mục con của một danh mục cha
  async getCategoriesByParentId(parentId) {
    return await axios.get(`http://localhost:8080/api/categories/parent/${parentId}`);
  }
};