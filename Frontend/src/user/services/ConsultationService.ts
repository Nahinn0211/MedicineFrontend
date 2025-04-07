import axios, { AxiosInstance } from 'axios';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client-web';
// Các interface định nghĩa
export interface ConsultationDetail {
    id: number;
    patientId: number;
    doctorId: number;
    consultationCode: string;
    doctorName?: string;
    doctorAvatar?: string;
    doctorSpecialty?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    startedAt?: Date;
    endedAt?: Date;
}

export interface ChatMessage {
    id?: number;
    consultationId: number;
    senderId: number;
    senderType: 'PATIENT' | 'DOCTOR' | 'SYSTEM';
    content: string;
    timestamp: Date;
    messageType?: 'TEXT' | 'VIDEO_START' | 'VIDEO_END' | 'AUDIO_TOGGLE' | 'JOIN' | 'LEAVE' | 'SYSTEM';
}

export interface WebRTCMessage {
    consultationId: number;
    type: 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE';
    sdp?: any;
    candidate?: any;
}

export interface WebSocketMessage {
    type: string;
    content: any;
    consultationCode?: string;
}

export class ConsultationService {
    private baseUrl = 'http://localhost:8080/api/consultations';
    private axiosInstance: AxiosInstance;
    private stompClient: any = null; // Sử dụng any vì Stomp.client có thể không tương thích với kiểu Client
    private subscriptions: { [key: string]: any } = {};
    private reconnectTimeout: number = 5000;
    private isConnecting: boolean = false;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: this.getHeaders()
        });
    }

    // Lấy headers với token
    private getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Lấy thông tin cuộc tham vấn theo mã code
    async getConsultationByCode(code: string): Promise<ConsultationDetail | null> {
        try {
            const response = await this.axiosInstance.get(`/code/${code}`);
            return response.data;
        } catch (error) {
            console.error('Không thể lấy thông tin cuộc tư vấn:', error);
            return null;
        }
    }

    async getAppointmentByServiceId(id: number) {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/consultations/by-appointment/${id}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi lấy cuộc tư vấn:', error);
            throw error;
        }
    }

    // Bắt đầu phiên tư vấn  
    async startConsultationSession(data: {
        consultationId: number,
        initiatorId: number,
        initiatorType: string
    }) {
        try {
            const response = await this.axiosInstance.post('/start-session', data);
            return response.data;
        } catch (error) {
            console.error('Lỗi bắt đầu phiên tư vấn:', error);
            throw error;
        }
    }

    // Kết thúc phiên tư vấn
    async endConsultationSession(data: {
        consultationId: number,
        terminatorId: number,
        terminatorType: string,
        terminationReason: string
    }) {
        try {
            const response = await this.axiosInstance.post('/end-session', data);
            return response.data;
        } catch (error) {
            console.error('Lỗi kết thúc phiên tư vấn:', error);
            throw error;
        }
    }

    // Gửi tin nhắn
    async sendChatMessage(message: ChatMessage) {
        try {
            const response = await this.axiosInstance.post('/chat', message);
            return response.data;
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
            throw error;
        }
    }

    // Điều khiển video  
    async toggleVideoStream(consultationId: number, userId: number, isEnabled: boolean) {
        try {
            await this.axiosInstance.post(`/${consultationId}/toggle-video`, null, {
                params: { userId, isEnabled }
            });
        } catch (error) {
            console.error('Lỗi điều khiển video:', error);
            throw error;
        }
    }

    // Lấy lịch sử tin nhắn
    async getChatHistory(consultationId: number, fromTime?: Date, limit = 50) {
        try {
            const response = await this.axiosInstance.post('/chat-history', {
                consultationId,
                fromTime,
                limit
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi lấy lịch sử tin nhắn:', error);
            throw error;
        }
    }

    // Thiết lập kết nối WebSocket
    setupWebSocketConnection(consultationCode: string, messageHandler: (message: any) => void): any {
        try {
            const socket = new SockJS('http://localhost:8080/ws-consultation');
            this.stompClient = Stomp.over(socket);

            this.stompClient.connect(
                {
                    headers: this.getHeaders(),
                },
                () => {
                    console.log('WebSocket connected successfully');

                    // Đăng ký nhận thông báo chung cho cuộc tư vấn
                    this.subscriptions['general'] = this.stompClient.subscribe(
                        `/topic/consultation/${consultationCode}`,
                        (message: any) => {
                            try {
                                const payload = JSON.parse(message.body);
                                console.log('Received general message:', payload);
                                messageHandler(payload);
                            } catch (error) {
                                console.error('Error parsing general message:', error);
                            }
                        }
                    );

                    // Đăng ký nhận tin nhắn chat
                    this.subscriptions['chat'] = this.stompClient.subscribe(
                        `/topic/consultation/${consultationCode}/chat`,
                        (message: any) => {
                            try {
                                const payload = JSON.parse(message.body);
                                payload.type = 'CHAT'; // Đảm bảo có trường type
                                console.log('Received chat message:', payload);
                                messageHandler(payload);
                            } catch (error) {
                                console.error('Error parsing chat message:', error);
                            }
                        }
                    );

                    // Đăng ký nhận tín hiệu WebRTC
                    this.subscriptions['webrtc'] = this.stompClient.subscribe(
                        `/topic/consultation/${consultationCode}/webrtc`,
                        (message: any) => {
                            try {
                                const payload = JSON.parse(message.body);
                                console.log('Received WebRTC message:', payload);
                                messageHandler(payload);
                            } catch (error) {
                                console.error('Error parsing WebRTC message:', error);
                            }
                        }
                    );

                    // Đánh dấu thành công và gửi thông báo đã kết nối
                    this.sendSystemMessage(consultationCode, 'CLIENT_CONNECTED');
                }, (error: any) => {
                    console.error('WebSocket connection error:', error);
                    this.handleReconnect(consultationCode, messageHandler);
                });

            // Xử lý khi kết nối bị mất
            socket.onclose = () => {
                console.log('WebSocket connection closed');
                this.handleReconnect(consultationCode, messageHandler);
            };

            return this.stompClient;
        } catch (error) {
            console.error('Error setting up WebSocket:', error);
            return null;
        }
    }

    // Xử lý kết nối lại nếu WebSocket bị ngắt
    private handleReconnect(consultationCode: string, messageHandler: (message: any) => void) {
        if (!this.isConnecting) {
            this.isConnecting = true;
            console.log(`Attempting to reconnect in ${this.reconnectTimeout / 1000} seconds...`);

            setTimeout(() => {
                this.isConnecting = false;
                this.setupWebSocketConnection(consultationCode, messageHandler);
            }, this.reconnectTimeout);
        }
    }

    // Gửi tin nhắn hệ thống
    private sendSystemMessage(consultationCode: string, messageType: string) {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send(
                `/app/consultation/${consultationCode}/system`,
                {},
                JSON.stringify({ type: messageType, timestamp: new Date() })
            );
        }
    }

    // Gửi tin nhắn tín hiệu WebRTC
    sendWebRTCMessage(message: WebRTCMessage) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.error('WebSocket not connected');
            return;
        }

        try {
            this.stompClient.send(
                `/app/consultation/${message.consultationId}/webrtc`,
                {},
                JSON.stringify(message)
            );
            console.log('WebRTC message sent:', message);
        } catch (error) {
            console.error('Error sending WebRTC message:', error);
        }
    }

    // Đóng kết nối WebSocket
    closeWebSocketConnection() {
        // Hủy đăng ký các kênh 
        Object.values(this.subscriptions).forEach(sub => {
            try {
                if (sub && typeof sub.unsubscribe === 'function') {
                    sub.unsubscribe();
                }
            } catch (error) {
                console.error('Error unsubscribing:', error);
            }
        });
        this.subscriptions = {};

        // Ngừng kết nối
        if (this.stompClient && this.stompClient.connected) {
            try {
                this.stompClient.disconnect();
                console.log('WebSocket disconnected successfully');
            } catch (error) {
                console.error('Error disconnecting WebSocket:', error);
            }
            this.stompClient = null;
        }
    }

    // Kiểm tra trạng thái kết nối
    isWebSocketConnected(): boolean {
        return this.stompClient !== null && this.stompClient.connected;
    }
}

export const consultationService = new ConsultationService();