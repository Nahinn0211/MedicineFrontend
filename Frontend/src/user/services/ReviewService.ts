import { Review } from '@models/Review';
import { BaseService } from './BaseService';
import axios from 'axios';
export class ReviewService extends BaseService {
    constructor() {
        super('reviews');
    }

    getHeaders() {
        const token = localStorage.getItem('token');

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async createReview(reviewData: Review): Promise<Review | null> {
        try {
            console.log(reviewData);
            const response = await axios.post(
                'http://localhost:8080/api/reviews/save',
                reviewData,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi đánh giá sản phẩm:', error);

            throw error;
        }
    }

    async getReviewByMedicineAndUser(userId: number, medicineId: number): Promise<Review[] | null> {
        try {
            const response = await axios.get<Review[]>(
                `http://localhost:8080/api/reviews/by-medicine/${medicineId}/and-user/${userId}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy đánh giá sản phẩm:', error);
        }
    }
}

export const reviewService = new ReviewService();