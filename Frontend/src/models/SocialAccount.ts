import { BaseEntity } from "./BaseEntity";

export interface SocialAccount extends BaseEntity{
    userId?: number;
    provider?: SocialProvider;
    providerId?: number;
    providerEmail?: string;
    name?: string;
    avatarUrl?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
}