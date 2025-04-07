import { Voucher } from '@models/Voucher';
import { BaseService } from './BaseService';
export class VoucherService extends BaseService {
    constructor() {
        super('vouchers');
    }

    async getVoucherByCode(code: string): Promise<Voucher | null> {
        return this.handleRequest(
            () => this.apiClient.get<Voucher>(`by-code/${code}`).then(response => response.data),
            `Error fetching voucher with code ${code}`
        );
    }
}

export const voucherService = new VoucherService();