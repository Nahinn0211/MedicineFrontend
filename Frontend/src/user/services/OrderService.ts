import axios from 'axios';

export class OrderService {
    // Get authorization headers from localStorage
    getHeaders() {
        const token = localStorage.getItem('token');

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Lưu đơn hàng với trạng thái PENDING
    async createOrder(orderData) {
        try {
            // Đảm bảo trạng thái ban đầu là PENDING
            orderData.status = 'PENDING';
            if (orderData.paymentMethod === 'CASH') {
                orderData.paymentStatus = 'PENDING';
            }else{
                orderData.paymentStatus = 'COMPLETED';
            }

            const response = await axios.post(
                'http://localhost:8080/api/orders/save',
                orderData,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            throw error;
        }
    }


    async createOrderDetails(orderDetailItems) {
        try {
            const promises = orderDetailItems.map(item => {
                return axios.post(
                    'http://localhost:8080/api/order-details/save', 
                    item,
                    { headers: this.getHeaders() }
                );
            });

            const responses = await Promise.all(promises);


            return responses.map(response => response.data);
        } catch (error) {
            console.error('Lỗi khi tạo chi tiết đơn hàng:', error);
            throw error;
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/orders/update-status/${orderId}?status=${status}`,
                null, // body là null vì không có body data
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            throw error;
        }
    }

    // Get order history for the current user
    async getOrderHistory(userId) {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/orders/by-patient/${userId}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
            throw error;
        }
    }

    // Get order details by order ID
    async getOrderDetails(orderId) {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/order-details/by-order/${orderId}`,
                { headers: this.getHeaders() }
            );
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            throw error;
        }
    }

    async getOrder(orderId) {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/orders/${orderId}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin đơn hàng:', error);
            throw error;
        }
    }

    async cancelOrder(orderId, reason) {
        try {
            const response = await axios.post(
                `http://localhost:8080/api/orders/cancel`, 
                null, 
                { 
                    params: { orderId, reason },
                    headers: this.getHeaders() 
                }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            throw error;
        }
    }
}

export const orderService = new OrderService();