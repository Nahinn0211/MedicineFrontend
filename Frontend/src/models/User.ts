import { BaseEntity } from "./BaseEntity";

export interface User extends BaseEntity {
    fullName?: string;
    phone?: string;
    address?: string;
    email?: string;
    lastLogin?: Date;
    countLock?: number;
    password?: string;
    enabled?: boolean;
    locked?: boolean;
    avatar?: string;
    roles?: string[];
}