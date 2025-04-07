import { BaseEntity } from '@models/BaseEntity';
import { Consultation } from './Consultation';
import { DoctorProfile } from './DoctorProfile';
import { PatientProfile } from './PatientProfile';

export interface Appointment extends BaseEntity{
    patientId?: number;
    doctorId?: number;
    serviceId?: number;
    appointmentDate?: Date;
    appointmentTime?: string;
    consultation?: Consultation;
    patient?: PatientProfile;
    doctor?: DoctorProfile;
}