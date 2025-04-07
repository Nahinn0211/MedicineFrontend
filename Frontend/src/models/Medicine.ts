import { Attribute } from "./Attribute";
import { BaseEntity } from "./BaseEntity";
import { Brand } from "./Brand";
import { Category } from "./Category";
import { MedicineCategory } from "./MedicineCategory";
import { MedicineMedia } from "./MedicineMedia";

export interface Medicine extends BaseEntity{
    code?: string;
    name?: string;
    description?: string;
    attributes?: Attribute[];
    categories?: Category[];
    medias?: MedicineMedia[];
    brandId?: number;
    brand?: Brand;
    origin?: string;
}