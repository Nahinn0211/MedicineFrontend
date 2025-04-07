import axios, { AxiosInstance } from 'axios';
import { Service } from "@models/Service";
import { DoctorProfile } from "@models/DoctorProfile";

export class ServiceService {
    private apiClient: AxiosInstance;

    constructor() {
        this.apiClient = axios.create({
            baseURL: 'http://localhost:8080/api'
        });
    }

    async getAllServices(): Promise<Service[]> {
        try {
            const response = await this.apiClient.get<Service[]>('/services');
            return response.data;
        } catch (error) {
            console.error('Error fetching services list', error);
            return [];
        }
    }

    async getServiceById(id: number): Promise<Service | null> {
        try {
            const response = await this.apiClient.get<Service>(`/services/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching service with ID ${id}`, error);
            return null;
        }
    }

    async getDoctorsByServiceId(id: number): Promise<DoctorProfile[]> {
        try {
            const response = await this.apiClient.get<DoctorProfile[]>(`/doctor-services/service/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching doctors for service with ID ${id}`, error);
            return [];
        }
    }
}

export const serviceService = new ServiceService();