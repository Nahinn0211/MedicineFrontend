import { Medicine } from '@models/Medicine';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080/api'

export const HomeService = {
    async getBestSellingMedicine(): Promise<Medicine[]> {
        try {
            const response = await axios.get(`/medicines/best-selling`);
            return response.data;
        } catch (error) {
            console.error('Error fetching list best selling medicine', error);
            return [];
        }
    },

    async getNewestMedicine(): Promise<Medicine[]> {
        try {
            const response = await axios.get(`/medicines/newest`);
            return response.data;
        } catch (error) {
            console.error('Error fetching list newest medicine', error);
            return [];
        }
    },
}