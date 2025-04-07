import { Appointment } from "./Appoinment";
import { BaseEntity } from "./BaseEntity";
import { ChatMessage } from "./ChatMessage";
import { DoctorProfile } from "./DoctorProfile";
import { PatientProfile } from "./PatientProfile";

export interface Consultation extends BaseEntity{
    patientId?: number;
    doctorId?: number;
    appointmentId?: number;
    appointment?: Appointment;
    consultationCode?: string;
    consultationLink?: string;
    status?: ConsultationStatus;
    startedAt?: Date;
    endedAt?: Date;
    sessionToken?: string;
    rtcSessionId?: string;
    isVideoEnabled?: boolean;
    chatMessages?: ChatMessage[];
    patient?: PatientProfile;
    doctor?: DoctorProfile;
}