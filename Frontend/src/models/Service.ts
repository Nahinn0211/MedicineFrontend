import { BaseEntity } from "./BaseEntity";

export interface Service extends BaseEntity{
    name?: string;
    price?: number;
    image?: string;
    description?: string;
}