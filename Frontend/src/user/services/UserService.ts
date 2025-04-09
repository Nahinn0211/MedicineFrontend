import { User } from '@models/User';
import { BaseService } from './BaseService';

export class UserService extends BaseService {
    constructor() {
        super('users');
    }

    async getAllUsers(): Promise<User[] | null> {
        return this.handleRequest(
            () => this.apiClient.get<User[]>('').then(response => response.data),
            'Error fetching users list'
        ) || [];
    }

    async getUserById(id: number): Promise<User | null> {
        return this.handleRequest(
            () => this.apiClient.get<User>(`/${id}`).then(response => response.data),
            `Error fetching user with ID ${id}`
        );
    }

    async uploadUserImage(id: number, image: File): Promise<User | null> {
        const formData = new FormData();
        formData.append('file', image);
        const token = localStorage.getItem('token');
        return this.handleRequest(
            () => this.apiClient.post<User>(
                `/${id}/upload`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }   
                }
            ).then(response => response.data),
            `Error uploading image for user with ID ${id}`
        );
    }
}

export const userService = new UserService();