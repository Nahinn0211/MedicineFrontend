import { BaseEntity } from "./BaseEntity";
import { PatientProfile } from "./PatientProfile";

export interface Order extends BaseEntity{
    orderCode?: string;
    patientId?: number;
    totalPrice?: number;
    paymentMethod?: PaymentMethod;
    status?: OrderStatus;
    voucherCode?: string;
    discountAmount?: number;
    note?: string;
    patient?: PatientProfile;
    paymentStatus?: PaymentStatus;
}