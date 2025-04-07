import { BaseEntity } from "./BaseEntity";
import { Category } from "./Category";
import { Medicine } from "./Medicine";

export interface MedicineCategory extends BaseEntity{
    medicineId?: number;
    categoryId?: number;
    medicine?: Medicine;
    category?: Category;
}