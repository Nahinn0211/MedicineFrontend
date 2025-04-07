import { BaseService } from './BaseService';
import { DoctorProfile } from "@models/DoctorProfile";

export class DoctorService extends BaseService {
    constructor() {
        super('doctor-profiles');
    }

    async getAllDoctors(): Promise<DoctorProfile[] | null> {
        return this.handleRequest(
            () => this.apiClient.get<DoctorProfile[]>('').then(response => response.data),
            'Error fetching doctors list'
        ) || [];
    }

    async getDoctorById(id: number): Promise<DoctorProfile | null> {
        return this.handleRequest(
            () => this.apiClient.get<DoctorProfile>(`/${id}`).then(response => response.data),
            `Error fetching doctor with ID ${id}`
        );
    }
}

export const doctorService = new DoctorService();