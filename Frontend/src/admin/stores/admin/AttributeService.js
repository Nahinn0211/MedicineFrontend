// AttributeService.js
import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';

export const Attributes = {
  async getAttributes() {
    return await sendGet("http://localhost:8080/api/attributes");
  },

  async getAttributeById(id) {
    return await sendGet(`http://localhost:8080/api/attributes/${id}`);
  },

  async updateAttribute(attributeData) {
    const response = await sendPost("http://localhost:8080/api/attributes/save", attributeData);
    return response.data;
  },

  async insertAttribute(attributeData) {
    return this.updateAttribute(attributeData);
  },

  async deleteAttribute(id) {
    return await sendDelete(`http://localhost:8080/api/attributes/${id}`);
  },

  async deleteMultipleAttributes(ids) {
    return await sendDelete("http://localhost:8080/api/attributes/delete-multiple", { data: ids });
  },
};