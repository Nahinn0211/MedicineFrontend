import axios from "axios";

export const Medicines = {
  async getMedicines() {
    return await axios.get("http://localhost:8080/api/medicines");
  },

  async insertMedicine(data) {
     const payload = {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      brandId: data.brandId,
      origin: data.origin
    };
    
     const response = await axios.post("http://localhost:8080/api/medicines/save", payload);
    
     return response.data;
  },

  async getMedicineById(id) {
    return await axios.get(`http://localhost:8080/api/medicines/${id}`);
  },

  async deleteMedicines(ids) {
    const response = await axios.post("http://localhost:8080/api/medicines/delete", ids);
    return response.data;
  },
  
  async searchMedicinesByName(name) {
    return await axios.get(`http://localhost:8080/api/medicines/by-name?name=${encodeURIComponent(name)}`);
  },
  
  async getMedicineByCode(code) {
    return await axios.get(`http://localhost:8080/api/medicines/by-code?code=${encodeURIComponent(code)}`);
  },
  
  async searchMedicines(params) {
    return await axios.get("http://localhost:8080/api/medicines/search", { params });
  }
};