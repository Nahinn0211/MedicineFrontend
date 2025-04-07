import { BaseEntity } from "./BaseEntity";

export interface Category extends BaseEntity{
    name?: string;
    image?: string;
    parentId?: number;
    subCategories?: Category[];
}