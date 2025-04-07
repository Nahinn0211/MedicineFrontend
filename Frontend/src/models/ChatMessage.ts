import { BaseEntity } from "./BaseEntity";
import { Consultation } from "./Consultation";
import { User } from "./User";

export interface ChatMessage extends BaseEntity{
    consultationId?: number;
    senderId?: number;
    senderType?: SenderType;
    content?: string;
    sentAt?: Date;
    readAt?: Date; 
    messageType?: MessageType;
    sender?: User;
    consultation?: Consultation;
}