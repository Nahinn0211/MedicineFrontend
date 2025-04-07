// Brands.js service
import axios from "axios";

export const Brands = {
  async getBrands() {
    return await axios.get("http://localhost:8080/api/brands");
  },
  
  async getBrandById(id) {
    return await axios.get(`http://localhost:8080/api/brands/${id}`);
  },
  
  async updateBrands(formData) {
     const response = await axios.post("http://localhost:8080/api/brands/save", formData);
    return response.data;
  },
  
  async insertBrands(formData) {
    return this.updateBrands(formData);
  },
  
  async deleteBrands(ids) {
    return await axios.delete("http://localhost:8080/api/brands/delete-multiple", { data: ids });
  },
};