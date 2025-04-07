import { BaseService } from './BaseService';
import { Brand } from "@models/Brand";

export class BrandService extends BaseService {
    constructor() {
        super('brands');
    }

    async getAllBrands(): Promise<Brand[] | null> {
        return this.handleRequest(
            () => this.apiClient.get<Brand[]>('').then(response => response.data),
            'Error fetching brands list'
        ) || [];
    }

    async getBrandById(id: number): Promise<Brand | null> {
        return this.handleRequest(
            () => this.apiClient.get<Brand>(`/${id}`).then(response => response.data),
            `Error fetching brand with ID ${id}`
        );
    }
}

export const brandService = new BrandService();