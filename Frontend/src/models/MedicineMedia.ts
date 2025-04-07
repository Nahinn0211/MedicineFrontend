import { BaseEntity } from "./BaseEntity";
import { Medicine } from "./Medicine";

export interface MedicineMedia extends BaseEntity{
    medicineId?: number;
    mediaUrl?: string;
    mainImage?: boolean;
    medicine?: Medicine
}