// AttributeService.js
import axios from "axios";

export const Attributes = {
  async getAttributes() {
    return await axios.get("http://localhost:8080/api/attributes");
  },

  async getAttributeById(id) {
    return await axios.get(`http://localhost:8080/api/attributes/${id}`);
  },

  async updateAttribute(attributeData) {
    const response = await axios.post("http://localhost:8080/api/attributes/save", attributeData);
    return response.data;
  },

  async insertAttribute(attributeData) {
    return this.updateAttribute(attributeData);
  },

  async deleteAttribute(id) {
    return await axios.delete(`http://localhost:8080/api/attributes/${id}`);
  },

  async deleteMultipleAttributes(ids) {
    return await axios.delete("http://localhost:8080/api/attributes/delete-multiple", { data: ids });
  },
};