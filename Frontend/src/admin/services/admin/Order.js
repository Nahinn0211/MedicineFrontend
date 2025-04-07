import axios from "axios";

export const OrderService = {
  async getOrders() {
    return await axios.get("http://localhost:8080/api/orders");
  },

  async getOrderById(id) {
    return await axios.get(`http://localhost:8080/api/orders/${id}`);
  },

  async saveOrder(data) {
    const payload = {
      id: data.id,
      orderCode: data.orderCode,
      patientId: data.patientId,
      totalPrice: data.totalPrice,
      paymentMethod: data.paymentMethod,
      status: data.status,
      voucherCode: data.voucherCode,
      discountAmount: data.discountAmount,
      note: data.note
    };
    
    const response = await axios.post("http://localhost:8080/api/orders/save", payload);
    return response.data;
  },

  async deleteOrders(ids) {
    const response = await axios.post("http://localhost:8080/api/orders/delete", ids);
    return response.data;
  },

  async findByOrderCode(orderCode) {
    return await axios.get(`http://localhost:8080/api/orders/by-order-code/${encodeURIComponent(orderCode)}`);
  }
};