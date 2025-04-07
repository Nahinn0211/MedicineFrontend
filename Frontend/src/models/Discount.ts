import { BaseEntity } from "./BaseEntity";
import { Medicine } from "./Medicine";

export interface Discount extends BaseEntity{
    name?: string;
    medicineId?: number;
    discountPercentage?: number;
    startDate?: Date;
    endDate?: Date;
    medicine?: Medicine;
}