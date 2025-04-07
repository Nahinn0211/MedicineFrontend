import { BaseEntity } from "./BaseEntity";

export interface Voucher extends BaseEntity{
    code?: string;
    voucherPercentage?: number;
    stock?: number;
    startDate?: Date;
    endDate?: Date;
    minimumOrderValue?: number;
}