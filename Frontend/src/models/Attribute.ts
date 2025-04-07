import { BaseEntity } from "./BaseEntity";
import { Medicine } from "./Medicine";

export interface Attribute extends BaseEntity{
    medicineId?: number;
    name?: string;
    priceIn?: number;
    priceOut?: number;
    stock?: number;
    expiryDate?: Date;
    medicine?: Medicine;
}