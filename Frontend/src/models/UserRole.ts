import { BaseEntity } from "./BaseEntity";
import { Role } from "./Role";
import { User } from "./User";

export interface UserRole extends BaseEntity{
    userId?: number;
    roleId?: number;
    user?: User;
    role?: Role;
}