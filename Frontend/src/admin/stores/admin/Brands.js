// Brands.js service
import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';

export const Brands = {
  async getBrands() {
    return await sendGet("http://localhost:8080/api/brands");
  },
  
  async getBrandById(id) {
    return await sendGet(`http://localhost:8080/api/brands/${id}`);
  },
  
  async updateBrands(formData) {
     const response = await sendPost("http://localhost:8080/api/brands/save", formData);
    return response.data;
  },
  
  async insertBrands(formData) {
    return this.updateBrands(formData);
  },
  
  async deleteBrands(ids) {
    return await sendDelete("http://localhost:8080/api/brands/delete-multiple", { data: ids });
  },
};