import { BaseService } from './BaseService';
import { Medicine } from "@models/Medicine";
import { Discount } from '@models/Discount';
import { Review } from '@models/Review';

export class MedicineService extends BaseService {
   constructor() {
       super('');
   }

   async getAllMedicines(): Promise<Medicine[] | null> {
       return this.handleRequest(
           () => this.apiClient.get<Medicine[]>('medicines').then(response => response.data),
           'Error fetching medicines list'
       ) || [];
   }

   async getMedicineById(id: number): Promise<Medicine | null> {
       return this.handleRequest(
           () => this.apiClient.get<Medicine>(`medicines/${id}`).then(response => response.data),
           `Error fetching medicine with ID ${id}`
       );
   }

   async getDiscountsByMedicineId(medicineId: number): Promise<Discount[] | null> {
       return this.handleRequest(
           () => this.apiClient.get<Discount[]>(`discounts/search/medicine/${medicineId}`).then(response => response.data),
           `Error fetching discounts for medicine ${medicineId}`
       ) || [];
   }

   async getReviewMedicineById(medicineId: number): Promise<Review[] | null> {
       return this.handleRequest(
           () => this.apiClient.get<Review[]>(`reviews/by-medicine/${medicineId}`).then(response => response.data),
           `Error fetching reviews for medicine ${medicineId}`
       ) || [];
    }
}

export const medicineService = new MedicineService();