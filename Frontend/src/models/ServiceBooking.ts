import { BaseEntity } from "./BaseEntity";
import { DoctorProfile } from "./DoctorProfile";
import { PatientProfile } from "./PatientProfile";
import { Service } from "./Service";

export interface ServiceBooking extends BaseEntity{
    serviceid?: number;
    patientid?: number;
    doctorid?: number;
    totalPrice?: number;
    paymentMethod?: PaymentMethod;
    status?: BookingStatus;
    service?: Service;
    patient?: PatientProfile;
    doctor?: DoctorProfile;
}