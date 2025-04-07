import { BaseService } from './BaseService';
import { Category } from "@models/Category";

export class CategoryService extends BaseService {
    constructor() {
        super('categories');
    }

    async getAllCategories(): Promise<Category[] | null> {
        const result = await this.handleRequest(
            () => this.apiClient.get<Category[]>('').then(response => {
                return response.data;
            }),
            'Error fetching categories list'
        ) || [];
        return result;
    }

    async getCategoryById(id: number): Promise<Category | null> {
        return this.handleRequest(
            () => this.apiClient.get<Category>(`/${id}`).then(response => response.data),
            `Error fetching category with ID ${id}`
        );
    }
}

export const categoryService = new CategoryService();