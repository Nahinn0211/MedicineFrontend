import { BaseEntity } from "./BaseEntity";
import { Medicine } from "./Medicine";

export interface Brand extends BaseEntity {
    name: string;
    image: string;
    medicines?: Medicine[];
}