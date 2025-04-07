<template>
    <div class="telemedicine-connection">
        <!-- Error Overlay -->
        <div v-if="connectionError" class="error-overlay">
            <div class="error-dialog">
                <h3>Lỗi Kết Nối</h3>
                <p>{{ connectionError }}</p>
                <button @click="reconnect" class="btn-reconnect">Thử Lại</button>
            </div>
        </div>

        <!-- Media Permission Overlay -->
        <div v-if="!permissionsGranted && !permissionsDenied" class="permission-overlay">
            <div class="permission-dialog">
                <div class="permission-icon">
                    <i class="icofont-video-cam"></i>
                    <i class="icofont-microphone"></i>
                </div>
                <h3>Quyền truy cập thiết bị</h3>
                <p>Để bắt đầu cuộc gọi video với bác sĩ, chúng tôi cần quyền truy cập vào camera và microphone của bạn.
                </p>
                <button class="btn-grant-permission" @click="requestMediaPermissions">
                    Cho phép truy cập
                </button>
            </div>
        </div>

        <!-- Permission Denied Message -->
        <div v-if="permissionsDenied" class="permission-overlay">
            <div class="permission-dialog error">
                <div class="permission-icon denied">
                    <i class="icofont-close-circled"></i>
                </div>
                <h3>Quyền truy cập bị từ chối</h3>
                <p>Bạn đã từ chối quyền truy cập camera hoặc microphone. Vui lòng cho phép truy cập trong cài đặt trình
                    duyệt để tiếp tục.</p>
                <div class="permission-actions">
                    <button class="btn-retry" @click="requestMediaPermissions">
                        Thử lại
                    </button>
                    <button class="btn-audio-only" @click="startAudioOnly">
                        Chỉ dùng âm thanh
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div v-if="permissionsGranted" class="container-fluid p-0">
            <div class="row no-gutters">
                <!-- Video Call Section -->
                <div class="col-lg-8 video-section">
                    <div class="video-container">
                        <div class="status-bar">
                            <div class="call-info">
                                <h5>Dr. {{ doctorName }}</h5>
                                <span class="call-timer">{{ callDuration }}</span>
                            </div>
                            <div class="call-controls">
                                <button class="control-btn mic" :class="{ 'disabled': !micActive }" @click="toggleMic">
                                    <i class="icofont-microphone"></i>
                                </button>
                                <button class="control-btn video" :class="{ 'disabled': !videoActive }"
                                    @click="toggleVideo">
                                    <i class="icofont-video"></i>
                                </button>
                                <button class="control-btn screen" @click="toggleScreenShare">
                                    <i class="icofont-screen"></i>
                                </button>
                                <button class="control-btn end-call" @click="endCall">
                                    <i class="icofont-ui-call"></i>
                                </button>
                            </div>
                        </div>

                        <div class="main-video-stream">
                            <div v-if="doctorConnected" class="doctor-stream">
                                <div ref="doctorVideo" class="video-element"></div>
                            </div>
                            <div v-else class="connecting-state">
                                <div class="spinner"></div>
                                <p>{{ connectionStatus }}</p>
                            </div>
                        </div>

                        <div class="self-view">
                            <video ref="selfVideo" class="video-element" autoplay muted playsinline></video>
                        </div>
                    </div>
                </div>

                <!-- Chat Section -->
                <div class="col-lg-4 chat-section">
                    <div class="chat-container">
                        <div class="chat-header">
                            <h4>Cuộc trò chuyện</h4>
                            <div class="toggle-info" @click="showInfo = !showInfo">
                                <i class="icofont-info-circle"></i>
                            </div>
                        </div>

                        <div v-if="showInfo" class="info-panel">
                            <div class="doctor-profile">
                                <img :src="doctorAvatar" alt="Doctor avatar" class="avatar">
                                <h5>{{ doctorName }}</h5>
                                <p>{{ doctorSpecialty }}</p>
                                <div class="appointment-info">
                                    <p><strong>Ngày khám:</strong> {{ appointmentDate }}</p>
                                    <p><strong>Thời gian:</strong> {{ appointmentTime }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="messages-container">
                            <div v-for="(message, index) in messages" :key="index"
                                :class="['message', message.sender === 'doctor' ? 'doctor-message' : 'patient-message']">
                                <div class="avatar-container">
                                    <img :src="message.sender === 'doctor' ? doctorAvatar : userData.avatar"
                                        :alt="message.sender === 'doctor' ? 'Doctor avatar' : 'Patient avatar'"
                                        class="message-avatar" />
                                </div>
                                <div class="message-content">
                                    <p>{{ message.text }}</p>
                                    <span class="message-time">{{ message.time }}</span>
                                </div>
                            </div>

                            <div class="typing-indicator" v-if="isTyping">
                                <div class="avatar-container">
                                    <img :src="doctorAvatar" alt="Doctor avatar" class="message-avatar" />
                                </div>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                        <div class="message-input">
                            <textarea v-model="newMessage" placeholder="Nhập tin nhắn của bạn..."
                                @keyup.enter.prevent="sendMessage"></textarea>
                            <button class="send-btn" @click="sendMessage">
                                <i class="icofont-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { consultationService } from '@user/services/ConsultationService';
import { authService } from '@user/services/AuthService';
import { useAuthStore } from '@user/stores/auth/useAuthStore';

const route = useRoute()
// Props definition
const consultationCode = route.params.consultationCode

// Router
const router = useRouter();
const authStore = useAuthStore();

// Reactive state
const connectionError = ref(null);
const connectionStatus = ref('Đang kết nối...');
const permissionsGranted = ref(false);
const permissionsDenied = ref(false);
const localStream = ref(null);

// Consultation details
const consultationDetails = ref(null);
const doctorName = ref('');
const doctorAvatar = ref('');
const doctorSpecialty = ref('');
const appointmentDate = ref('');
const appointmentTime = ref('');

// Call states
const doctorConnected = ref(false);
const callDuration = ref('00:00');
const micActive = ref(true);
const videoActive = ref(true);
const isTyping = ref(false);
const showInfo = ref(false);

// Video elements
const doctorVideo = ref(null);
const selfVideo = ref(null);

// Chat functionality
const messages = ref([]);
const newMessage = ref('');
const userData = ref(null);

// WebRTC related
const peerConnection = ref(null);
let timerInterval = null;

// WebSocket
let stompClient = null;

// Initialize WebRTC connection
const initializeWebRTC = async () => {
    try {
        const configuration = { 
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        // Tạo mới peer connection nếu chưa có
        if (peerConnection.value === null) {
            peerConnection.value = new RTCPeerConnection(configuration);
            console.log('Đã khởi tạo peer connection mới');
        }
        
        // Thêm các track từ localStream vào peer connection
        if (localStream.value) {
            localStream.value.getTracks().forEach(track => {
                peerConnection.value.addTrack(track, localStream.value);
                console.log(`Đã thêm track ${track.kind}`);
            });
        } else {
            console.warn('Không có local stream để thêm vào peer connection');
        }
        
        // Xử lý các sự kiện ICE
        peerConnection.value.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('Tìm thấy ICE candidate mới:', event.candidate);
                // Gửi ICE candidate qua WebSocket
                consultationService.sendWebRTCMessage({
                    consultationId: consultationDetails.value.id,
                    type: 'ICE_CANDIDATE',
                    candidate: event.candidate
                });
            }
        };
        
        // Xử lý trạng thái ICE connection
        peerConnection.value.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', peerConnection.value.iceConnectionState);
            
            if (peerConnection.value.iceConnectionState === 'connected' || 
                peerConnection.value.iceConnectionState === 'completed') {
                doctorConnected.value = true;
                connectionStatus.value = 'Đã kết nối';
            } else if (peerConnection.value.iceConnectionState === 'failed' || 
                      peerConnection.value.iceConnectionState === 'disconnected') {
                doctorConnected.value = false;
                connectionStatus.value = 'Kết nối bị ngắt, đang thử lại...';
                // Thử kết nối lại sau 3 giây
                setTimeout(() => {
                    if (!doctorConnected.value) {
                        initializeWebRTC();
                    }
                }, 3000);
            }
        };
        
        // Xử lý track từ xa khi nhận được
        peerConnection.value.ontrack = (event) => {
            console.log('Đã nhận được remote tracks:', event.streams);
            if (doctorVideo.value && event.streams && event.streams[0]) {
                doctorVideo.value.srcObject = event.streams[0];
                doctorConnected.value = true;
                connectionStatus.value = 'Đã kết nối với bác sĩ';
            }
        };
        
        console.log('WebRTC đã được khởi tạo thành công');
        return true;
    } catch (error) {
        console.error('Lỗi khởi tạo WebRTC:', error);
        handleConnectionError(error);
        return false;
    }
};

// Xử lý offer từ bác sĩ
const handleWebRTCOffer = async (message) => {
    try {
        console.log('Nhận được offer từ bác sĩ:', message);
        
        // Khởi tạo WebRTC nếu chưa có
        if (!peerConnection.value) {
            const success = await initializeWebRTC();
            if (!success) return;
        }
        
        // Kiểm tra xem offer có hợp lệ không
        if (!message.sdp) {
            console.error('Offer không hợp lệ:', message);
            return;
        }
        
        // Thiết lập remote description từ offer
        await peerConnection.value.setRemoteDescription(new RTCSessionDescription(message.sdp));
        console.log('Đã thiết lập remote description từ offer');
        
        // Tạo answer
        const answer = await peerConnection.value.createAnswer();
        await peerConnection.value.setLocalDescription(answer);
        console.log('Đã tạo và thiết lập answer');
        
        // Gửi answer cho bác sĩ
        consultationService.sendWebRTCMessage({
            consultationId: consultationDetails.value.id,
            type: 'ANSWER',
            sdp: peerConnection.value.localDescription
        });
        console.log('Đã gửi answer cho bác sĩ');
        
    } catch (error) {
        console.error('Lỗi xử lý offer:', error);
        handleConnectionError(error);
    }
};

// Xử lý answer từ bác sĩ
const handleWebRTCAnswer = async (message) => {
    try {
        console.log('Nhận được answer từ bác sĩ:', message);
        
        if (!peerConnection.value) {
            console.error('Không có peer connection để xử lý answer');
            return;
        }
        
        if (!message.sdp) {
            console.error('Answer không hợp lệ:', message);
            return;
        }
        
        // Thiết lập remote description từ answer
        await peerConnection.value.setRemoteDescription(new RTCSessionDescription(message.sdp));
        console.log('Đã thiết lập remote description từ answer');
    } catch (error) {
        console.error('Lỗi xử lý answer:', error);
        handleConnectionError(error);
    }
};

// Xử lý ICE candidate từ bác sĩ
const handleICECandidate = async (message) => {
    try {
        console.log('Nhận được ICE candidate từ bác sĩ:', message);
        
        if (!peerConnection.value) {
            console.error('Không có peer connection để xử lý ICE candidate');
            return;
        }
        
        if (!message.candidate) {
            console.error('ICE candidate không hợp lệ:', message);
            return;
        }
        
        // Thêm ICE candidate
        await peerConnection.value.addIceCandidate(new RTCIceCandidate(message.candidate));
        console.log('Đã thêm ICE candidate');
    } catch (error) {
        console.error('Lỗi xử lý ICE candidate:', error);
    }
};

// Initialize consultation
const initializeConsultation = async () => {
    try {
        userData.value = await authService.getDataUser(authService.state.user.id);
        console.log('Đã lấy thông tin người dùng:', userData.value);
        
        // Fetch consultation details
        consultationDetails.value = await consultationService.getConsultationByCode(consultationCode);
        console.log('Đã lấy thông tin cuộc tư vấn:', consultationDetails.value);

        if (!consultationDetails.value) {
            throw new Error('Không tìm thấy thông tin cuộc tư vấn');
        }

        // Update doctor info
        updateDoctorInfo(consultationDetails.value);

        // Setup WebSocket connection
        setupWebSocketConnection();

        // Start consultation session
        await startConsultationSession();
    } catch (error) {
        handleConnectionError(error);
    }
};

// Update doctor information
const updateDoctorInfo = (details) => {
    doctorName.value = details.doctorName || 'Bác sĩ';
    doctorAvatar.value = details.doctorAvatar || '@/assets/images/default-doctor.jpg';
    doctorSpecialty.value = details.doctorSpecialty || 'Chuyên khoa';
    appointmentDate.value = details.appointmentDate || 'Chưa xác định';
    appointmentTime.value = details.appointmentTime || 'Chưa xác định';
    console.log('Đã cập nhật thông tin bác sĩ');
};

// Setup WebSocket connection
const setupWebSocketConnection = () => {
    console.log('Đang thiết lập kết nối WebSocket...');
    stompClient = consultationService.setupWebSocketConnection(
        consultationCode,
        handleWebSocketMessage
    );
};

// Start consultation session
const startConsultationSession = async () => {
    try {
        const patientData = authStore.getPatientData;
        console.log('Đang bắt đầu phiên tư vấn với patientId:', patientData.id);
        
        await consultationService.startConsultationSession({
            consultationId: consultationDetails.value.id,
            initiatorId: patientData.id,
            initiatorType: 'PATIENT',
        });
        console.log('Đã bắt đầu phiên tư vấn thành công');
    } catch (error) {
        console.error('Lỗi khi bắt đầu phiên tư vấn:', error);
        handleConnectionError(error);
    }
};

// Handle WebSocket messages
const handleWebSocketMessage = (message) => {
    console.log('WebSocket message received:', message);
    
    // Đảm bảo message là đối tượng và có type
    if (!message || typeof message !== 'object' || !message.type) {
        console.error('Invalid WebSocket message format:', message);
        return;
    }
    
    switch (message.type) {
        case 'CHAT':
            handleChatMessage(message);
            break;
        case 'SESSION_STARTED':
            connectionStatus.value = 'Phiên khám đã bắt đầu';
            startTimer();
            // Không khởi tạo WebRTC ở đây, chờ offer từ bác sĩ
            break;
        case 'SESSION_ENDED':
            connectionStatus.value = 'Phiên khám đã kết thúc';
            endCall(false); // false để không hiện confirm dialog
            break;
        case 'VIDEO_ENABLED':
            handleVideoToggle(true);
            break;
        case 'VIDEO_DISABLED':
            handleVideoToggle(false);
            break;
        case 'OFFER':
            handleWebRTCOffer(message);
            break;
        case 'ANSWER':
            handleWebRTCAnswer(message);
            break;
        case 'ICE_CANDIDATE':
            handleICECandidate(message);
            break;
        case 'TYPING':
            isTyping.value = true;
            // Tự động tắt typing indicator sau 3 giây
            setTimeout(() => {
                isTyping.value = false;
            }, 3000);
            break;
        case 'CLIENT_CONNECTED':
            if (message.senderType === 'DOCTOR') {
                connectionStatus.value = 'Bác sĩ đã tham gia phiên khám';
            }
            break;
        default:
            console.warn('Unhandled WebSocket message type:', message.type);
    }
};

// Request media permissions
const requestMediaPermissions = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        });

        localStream.value = stream;
        console.log('Đã lấy được stream từ camera và microphone');

        // Display local video
        if (selfVideo.value) {
            selfVideo.value.srcObject = stream;
            await selfVideo.value.play();
            console.log('Đã hiển thị local video');
        }

        // Update state
        permissionsGranted.value = true;
        permissionsDenied.value = false;

        // Notify server about media stream
        const user = authService.getUserInfo();
        consultationService.sendChatMessage({
            consultationId: consultationDetails.value.id,
            senderId: user.id,
            senderType: 'PATIENT',
            content: 'Đã kết nối camera',
            messageType: 'TEXT',
            timestamp: new Date()
        });
        console.log('Đã gửi thông báo kết nối camera thành công');

    } catch (error) {
        console.error('Media permission error:', error);
        permissionsDenied.value = true;
    }
};

// Start audio-only mode
const startAudioOnly = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        localStream.value = stream;
        permissionsGranted.value = true;
        permissionsDenied.value = false;
        videoActive.value = false;
        console.log('Đã kết nối chế độ chỉ âm thanh');

        // Notify server
        const user = authService.getUserInfo();
        consultationService.sendChatMessage({
            consultationId: consultationDetails.value.id,
            senderId: user.id,
            senderType: 'PATIENT',
            content: 'Chuyển sang chế độ âm thanh',
            messageType: 'TEXT',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Audio-only mode error:', error);
        permissionsDenied.value = true;
    }
};

// Send chat message
const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    try {
        const user = authService.getUserInfo();
        
        // Thông báo đang nhập tin nhắn
        consultationService.sendWebRTCMessage({
            consultationId: consultationDetails.value.id,
            type: 'TYPING'
        });
        
        // Gửi tin nhắn
        await consultationService.sendChatMessage({
            consultationId: consultationDetails.value.id,
            senderId: user.id,
            senderType: 'PATIENT',
            content: newMessage.value,
            messageType: 'TEXT',
            timestamp: new Date()
        });

        // Add to local messages
        messages.value.push({
            sender: 'patient',
            text: newMessage.value,
            time: getCurrentTime()
        });

        newMessage.value = '';
    } catch (error) {
        console.error('Send message error:', error);
    }
};

// Handle incoming chat message
const handleChatMessage = (message) => {
    messages.value.push({
        sender: message.senderType === 'DOCTOR' ? 'doctor' : 'patient',
        text: message.content,
        time: getCurrentTime()
    });
    
    // Tự động cuộn xuống tin nhắn mới nhất
    setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 100);
};

// Toggle microphone
const toggleMic = () => {
    if (localStream.value) {
        const audioTracks = localStream.value.getAudioTracks();
        if (audioTracks.length > 0) {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            micActive.value = audioTracks[0].enabled;
            console.log('Trạng thái microphone:', micActive.value ? 'bật' : 'tắt');

            // Notify server
            consultationService.sendWebRTCMessage({
                consultationId: consultationDetails.value.id,
                type: micActive.value ? 'AUDIO_ENABLED' : 'AUDIO_DISABLED'
            });
        }
    }
};

// Toggle video
const toggleVideo = () => {
    if (localStream.value) {
        const videoTracks = localStream.value.getVideoTracks();
        if (videoTracks.length > 0) {
            videoTracks[0].enabled = !videoTracks[0].enabled;
            videoActive.value = videoTracks[0].enabled;
            console.log('Trạng thái video:', videoActive.value ? 'bật' : 'tắt');

            // Notify server
            consultationService.toggleVideoStream(
                consultationDetails.value.id,
                authService.getUserInfo().id,
                videoActive.value
            );
        }
    }
};

// Handle video toggle
const handleVideoToggle = (isEnabled) => {
    videoActive.value = isEnabled;
    console.log('Nhận trạng thái video từ server:', isEnabled);
};

// Screen sharing
const toggleScreenShare = async () => {
    try {
        // Nếu đang chia sẻ màn hình, quay lại camera
        if (localStream.value && localStream.value._isScreenShare) {
            await requestMediaPermissions();
            localStream.value._isScreenShare = false;
            console.log('Đã dừng chia sẻ màn hình, quay lại camera');
            return;
        }
        
        // Bắt đầu chia sẻ màn hình
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always'
            },
            audio: false
        });

        // Thay thế video track trong peer connection
        if (peerConnection.value) {
            const senders = peerConnection.value.getSenders();
            const videoSender = senders.find(sender => 
                sender.track && sender.track.kind === 'video'
            );
            
            if (videoSender) {
                const screenTrack = screenStream.getVideoTracks()[0];
                await videoSender.replaceTrack(screenTrack);
                console.log('Đã thay thế video track trong peer connection');
            }
        }

        // Thay thế video track trong local stream
        if (localStream.value) {
            const videoTracks = localStream.value.getVideoTracks();
            if (videoTracks.length > 0) {
                const oldTrack = videoTracks[0];
                oldTrack.stop();
                localStream.value.removeTrack(oldTrack);
            }

            const screenTrack = screenStream.getVideoTracks()[0];
            localStream.value.addTrack(screenTrack);
            localStream.value._isScreenShare = true;

            // Update video element
            if (selfVideo.value) {
                selfVideo.value.srcObject = localStream.value;
            }

            // Notify server
            consultationService.sendChatMessage({
                consultationId: consultationDetails.value.id,
                senderId: authService.getUserInfo().id,
                senderType: 'PATIENT',
                content: 'Đang chia sẻ màn hình',
                messageType: 'TEXT',
                timestamp: new Date()
            });

            // Listen for screen share end
            screenTrack.onended = () => {
                // Restore camera stream
                requestMediaPermissions();
                localStream.value._isScreenShare = false;
                console.log('Chia sẻ màn hình đã kết thúc');
            };
        }
    } catch (error) {
        console.error('Screen share error:', error);
        alert('Không thể chia sẻ màn hình');
    }
};

// End call
const endCall = async (showConfirm = true) => {
    try {
        // Confirm end call
        if (showConfirm && !confirm('Bạn có chắc muốn kết thúc cuộc gọi?')) return;

        // End consultation session
        const user = authService.getUserInfo();
        await consultationService.endConsultationSession({
            consultationId: consultationDetails.value.id,
            terminatorId: user.id,
            terminatorType: 'PATIENT',
            terminationReason: 'Kết thúc bình thường'
        });
        console.log('Đã kết thúc phiên tư vấn');

        // Cleanup resources
        cleanupResources();

        // Navigate to summary or home
        router.push({
            name: 'ConsultationSummary',
            params: {
                consultationCode: consultationCode
            }
        });
    } catch (error) {
        console.error('End call error:', error);
    }
};

// Cleanup resources
const cleanupResources = () => {
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Close peer connection
    if (peerConnection.value) {
        peerConnection.value.close();
        peerConnection.value = null;
    }
    
    // Stop media tracks
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop());
        localStream.value = null;
    }

    // Close WebSocket connection
    if (stompClient) {
        consultationService.closeWebSocketConnection();
        stompClient = null;
    }

    // Reset video elements
    if (selfVideo.value) {
        selfVideo.value.srcObject = null;
    }
    if (doctorVideo.value) {
        doctorVideo.value.srcObject = null;
    }
    
    console.log('Đã dọn dẹp tài nguyên');
};

// Start call timer
const startTimer = () => {
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        callDuration.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
};

// Utility: Get current time
const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// Handle connection error
const handleConnectionError = (error) => {
    connectionError.value = error.message || 'Lỗi kết nối';
    console.error('Consultation connection error:', error);
};

// Reconnect
const reconnect = () => {
    connectionError.value = null;
    initializeConsultation();
};

// Lifecycle hooks
onMounted(() => {
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ video call');
        return;
    }

    // Initialize consultation
    initializeConsultation();
});

onUnmounted(() => {
    // Cleanup resources
    cleanupResources();
});
</script>

<style scoped>
/* === CSS Variables: Color Scheme, Typography, Shadows === */
:root {
  /* Main Colors */
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #60a5fa;
  --color-secondary: #e11d48;
  --color-secondary-dark: #be123c;
  
  /* Accent Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Neutrals */
  --color-text: #0f172a;
  --color-text-light: #64748b;
  --color-text-lighter: #94a3b8;
  --color-placeholder: #cbd5e1;
  
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-variant: #f1f5f9;
  --color-divider: #e2e8f0;
  
  --color-video-bg: #0f172a;
  --color-video-controls-bg: rgba(15, 23, 42, 0.7);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Z-index layers */
  --z-overlay: 1000;
  --z-popup: 100;
  --z-controls: 10;
}

/* === Base styles === */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  line-height: 1.5;
  background-color: var(--color-background);
}

/* === Telemedicine Connection === */
.telemedicine-connection {
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  overflow: hidden;
  background-color: var(--color-background);
}

/* === Video Section === */
.video-section {
  flex: 2;
  position: relative;
  height: 100vh;
}

.chat-section {
  flex: 1;
  height: 100vh;
  border-left: 1px solid var(--color-divider);
  min-width: 320px;
  max-width: 420px;
}

.video-container {
  height: 100%;
  width: 100%;
  background-color: var(--color-video-bg);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* === Status Bar === */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--color-video-controls-bg);
  color: var(--color-surface);
  z-index: var(--z-controls);
}

.call-info {
  display: flex;
  flex-direction: column;
}

.call-info h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.call-timer {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.call-controls {
  display: flex;
  gap: 0.75rem;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.15);
  color: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.control-btn:active {
  transform: translateY(0);
}

.control-btn.disabled {
  background-color: var(--color-error);
}

.control-btn.end-call {
  background-color: var(--color-secondary);
}

.control-btn.end-call:hover {
  background-color: var(--color-secondary-dark);
}

/* === Main Video Stream === */
.main-video-stream {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a202c;
  overflow: hidden;
}

.doctor-stream {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* === Self View === */
.self-view {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 180px;
  height: 120px;
  background-color: #2d3748;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 5;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
}

.self-view:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
  border-color: rgba(255, 255, 255, 0.2);
}

/* === Connecting State === */
.connecting-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-surface);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-surface);
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.connecting-state p {
  font-size: 1rem;
  font-weight: 500;
}

/* === Chat Container === */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-surface);
}

/* === Chat Header === */
.chat-header {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  background-color: var(--color-surface-variant);
}

.chat-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
}

.toggle-info {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  color: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.toggle-info:hover {
  background-color: var(--color-primary-light);
  color: var(--color-surface);
  transform: translateY(-2px);
}

/* === Doctor Info Panel === */
.info-panel {
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-divider);
  overflow-y: auto;
}

.doctor-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--color-primary-light);
  box-shadow: var(--shadow-md);
  margin-bottom: 1rem;
}

.doctor-profile h5 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.doctor-profile p {
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
}

.appointment-info {
  width: 100%;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: left;
}

.appointment-info p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.appointment-info p:last-child {
  margin-bottom: 0;
}

.appointment-info strong {
  color: var(--color-text);
}

/* === Messages Container === */
.messages-container {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--color-surface);
}

/* === Message Styles === */
.message {
  display: flex;
  max-width: 85%;
  gap: 0.5rem;
  align-items: flex-start;
}

.doctor-message {
  align-self: flex-start;
}

.patient-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar-container {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.message-avatar {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-surface-variant);
}

.doctor-message .message-avatar {
  border-color: var(--color-primary-light);
}

.patient-message .message-avatar {
  border-color: var(--color-info);
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  position: relative;
}

.doctor-message .message-content {
  background-color: var(--color-surface-variant);
  border-top-left-radius: 0;
}

.patient-message .message-content {
  background-color: var(--color-primary-light);
  color: var(--color-surface);
  border-top-right-radius: 0;
}

.message-content p {
  margin: 0;
  word-break: break-word;
}

.message-time {
  display: block;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  opacity: 0.7;
}

.patient-message .message-time {
  text-align: right;
}

/* === Typing Indicator === */
.typing-indicator {
  display: flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-light);
  display: inline-block;
  animation: pulse 1.5s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.typing-indicator span:nth-child(4) {
  animation-delay: 0.6s;
}

@keyframes pulse {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* === Message Input === */
.message-input {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-divider);
}

.message-input textarea {
  flex: 1;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-full);
  padding: 0.75rem 1.25rem;
  resize: none;
  height: 48px;
  max-height: 120px;
  outline: none;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  color: var(--color-text);
  transition: all var(--transition-fast);
  background-color: var(--color-surface-variant);
}

.message-input textarea::placeholder {
  color: var(--color-placeholder);
}

.message-input textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  background-color: var(--color-surface);
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  border: none;
  background-color: var(--color-primary);
  color: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.send-btn:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.send-btn:active {
  transform: translateY(0);
}

/* === Permission Overlay === */
.permission-overlay, .error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(5px);
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.permission-dialog, .error-dialog {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-xl);
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.permission-dialog.error {
  border-top: 5px solid var(--color-error);
}

.permission-icon {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.permission-icon i {
  font-size: 3rem;
  color: var(--color-primary);
}

.permission-icon.denied i {
  color: var(--color-error);
}

.permission-dialog h3, .error-dialog h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.permission-dialog p, .error-dialog p {
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.btn-grant-permission, .btn-reconnect {
  background-color: var(--color-primary);
  color: var(--color-surface);
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  font-size: 1rem;
}

.btn-grant-permission:hover, .btn-reconnect:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.permission-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-retry {
  background-color: var(--color-surface-variant);
  color: var(--color-text);
  border: 1px solid var(--color-divider);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-retry:hover {
  background-color: var(--color-divider);
}

.btn-audio-only {
  background-color: var(--color-primary);
  color: var(--color-surface);
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-full);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-audio-only:hover {
  background-color: var(--color-primary-dark);
}

/* === Media Queries === */
@media (max-width: 992px) {
  .telemedicine-connection {
    flex-direction: column;
  }
  
  .video-section, .chat-section {
    flex: none;
    height: 50vh;
    max-width: 100%;
  }
  
  .chat-section {
    border-left: none;
    border-top: 1px solid var(--color-divider);
  }
  
  .self-view {
    width: 120px;
    height: 80px;
    bottom: 1rem;
    right: 1rem;
  }
}

@media (max-width: 768px) {
  .status-bar {
    padding: 0.75rem 1rem;
  }
  
  .control-btn {
    width: 36px;
    height: 36px;
  }
  
  .permission-dialog, .error-dialog {
    padding: 1.5rem;
  }
  
  .permission-icon i {
    font-size: 2.5rem;
  }
  
  .permission-dialog h3, .error-dialog h3 {
    font-size: 1.25rem;
  }
  
  .message {
    max-width: 95%;
  }
}

@media (max-width: 576px) {
  .permission-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .message-input textarea {
    height: 42px;
    padding: 0.5rem 1rem;
  }
  
  .send-btn {
    width: 42px;
    height: 42px;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
}

/* === Accessibility === */
button:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>