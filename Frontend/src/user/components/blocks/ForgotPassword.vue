<template>
    <div class="forgot-password-container">
        <div class="forgot-password-wrapper">
            <!-- Notification Component -->
            <div v-if="notification.show" class="notification" :class="[
                `notification-${notification.type}`,
                { 'notification-enter': notification.show, 'notification-exit': notification.isExiting }
            ]">
                <div class="notification-content">
                    <div class="notification-icon">
                        <i :class="getNotificationIcon(notification.type)"></i>
                    </div>
                    <div class="notification-text">
                        {{ notification.message }}
                    </div>
                    <button class="notification-close" @click="closeNotification" aria-label="Close notification">
                        <i class="icon-x"></i>
                    </button>
                </div>
            </div>

            <div class="forgot-password-box">
                <div class="forgot-password-header">
                    <h1>Quên Mật Khẩu</h1>
                    <p>Khôi phục quyền truy cập tài khoản</p>
                </div>

                <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
                    <div class="form-group">
                        <label for="email">Địa Chỉ Email</label>
                        <div class="input-wrapper">
                            <div class="input-icon">
                                <i class="icon-email"></i>
                            </div>
                            <input type="email" id="email" v-model="email" required placeholder="Nhập email đăng ký"
                                @focus="clearNotification" autocomplete="email">
                        </div>
                    </div>

                    <!-- Verification Code Section (initially hidden) -->
                    <template v-if="stage === 'verification'">
                        <div class="form-group">
                            <label for="verificationCode">Mã Xác Nhận</label>
                            <div class="input-wrapper">
                                <div class="input-icon">
                                    <i class="icon-lock"></i>
                                </div>
                                <input type="text" id="verificationCode" v-model="verificationCode" required
                                    placeholder="Nhập mã xác nhận" @focus="clearNotification">
                            </div>
                            <div class="code-timer">
                                Mã xác nhận còn hiệu lực: {{ remainingTime }}s
                                <button type="button" class="resend-code" @click="resendVerificationCode"
                                    :disabled="cooldownActive">
                                    Gửi lại mã
                                </button>
                            </div>
                        </div>
                    </template>

                    <!-- New Password Section (initially hidden) -->
                    <template v-if="stage === 'reset'">
                        <div class="form-group">
                            <label for="newPassword">Mật Khẩu Mới</label>
                            <div class="password-wrapper">
                                <div class="input-icon">
                                    <i class="icon-lock"></i>
                                </div>
                                <input :type="showPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword"
                                    required placeholder="Nhập mật khẩu mới" @focus="clearNotification"
                                    autocomplete="new-password">
                                <button type="button" @click="togglePasswordVisibility" class="password-toggle"
                                    aria-label="Toggle password visibility">
                                    <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Xác Nhận Mật Khẩu</label>
                            <div class="password-wrapper">
                                <div class="input-icon">
                                    <i class="icon-lock"></i>
                                </div>
                                <input :type="showPassword ? 'text' : 'password'" id="confirmPassword"
                                    v-model="confirmPassword" required placeholder="Nhập lại mật khẩu mới"
                                    @focus="clearNotification" autocomplete="new-password">
                            </div>
                        </div>
                    </template>

                    <button type="submit" :disabled="isLoading" class="forgot-password-button">
                        <span v-if="!isLoading">
                            {{ buttonText }}
                        </span>
                        <span v-else class="spinner"></span>
                    </button>

                    <div class="login-redirect">
                        <p>Quay lại</p>
                        <router-link to="/login" class="login-link">
                            Đăng Nhập
                        </router-link>
                    </div>
                </form>
            </div>

            <div class="page-footer">
                <p>&copy; 2024 Hệ Thống Y Tế THAPV Pharmacity. Bảo Lưu Mọi Quyền.</p>
                <div class="footer-links">
                    <a href="#">Điều Khoản Sử Dụng</a>
                    <a href="#">Chính Sách Bảo Mật</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@user/stores/auth/useAuthStore'
import { authService } from '@user/services/AuthService'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// State variables
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const stage = ref<'email' | 'verification' | 'reset'>('email')
const isLoading = ref(false)
const showPassword = ref(false)
const remainingTime = ref(60)
const cooldownActive = ref(false)
const resetToken = ref<string | null>(null)

// Notification state
const notification = ref({
    show: false,
    type: 'error' as 'success' | 'error' | 'warning' | 'info',
    message: '',
    isExiting: false,
    timer: null as ReturnType<typeof setTimeout> | null
})

// Check and validate reset token on component mount
onMounted(async () => {
    const tokenFromUrl = route.query.token as string | undefined

    if (tokenFromUrl) {
        try {
            if (tokenFromUrl != null) {
                resetToken.value = tokenFromUrl
                stage.value = 'reset'
            } else {
                showNotification('error', 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch (error) {
            showNotification('error', 'Không thể xác thực liên kết đặt lại mật khẩu')
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        }
    }
})

// Computed button text based on current stage
const buttonText = computed(() => {
    switch (stage.value) {
        case 'email': return 'Gửi Mã Xác Nhận'
        case 'verification': return 'Xác Nhận Mã'
        case 'reset': return 'Đặt Lại Mật Khẩu'
        default: return 'Tiếp Tục'
    }
})

// Notification methods
const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'success': return 'icon-check-circle'
        case 'error': return 'icon-alert-circle'
        case 'warning': return 'icon-alert-triangle'
        case 'info': return 'icon-info'
        default: return 'icon-info'
    }
}

const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    if (notification.value.timer) {
        clearTimeout(notification.value.timer)
    }

    notification.value = {
        show: true,
        type,
        message,
        isExiting: false,
        timer: setTimeout(() => {
            closeNotification()
        }, 5000)
    }
}

const clearNotification = () => {
    if (notification.value.show) {
        closeNotification()
    }
}

const closeNotification = () => {
    if (notification.value.timer) {
        clearTimeout(notification.value.timer)
    }

    notification.value.isExiting = true

    setTimeout(() => {
        notification.value.show = false
        notification.value.isExiting = false
    }, 300)
}

// Password visibility toggle method
const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

// Main forgot password handler
const handleForgotPassword = async () => {
    isLoading.value = true
    clearNotification()

    try {
        switch (stage.value) {
            case 'email':
                // Send verification code
                const emailSent = await sendVerificationCode()
                if (emailSent) {
                    stage.value = 'reset'
                }
                break

            case 'reset':
                // Reset password
                if (newPassword.value !== confirmPassword.value) {
                    showNotification('error', 'Mật khẩu xác nhận không khớp')
                    return
                }

                const passwordReset = await resetPassword()
                if (passwordReset) {
                    showNotification('success', 'Đặt lại mật khẩu thành công')
                    setTimeout(() => {
                        router.push('/login')
                    }, 1500)
                }
                break
        }
    } catch (error) {
        showNotification('error', error.message || 'Đã xảy ra lỗi')
    } finally {
        isLoading.value = false
    }
}

// Methods for sending verification, verifying code, and resetting password
const sendVerificationCode = async (): Promise<boolean> => {
    try {
        const result = await authService.forgotPassword(email.value)
        if (result.success) {
            showNotification('success', 'Mã xác nhận đã được gửi tới email')
            return true
        }
        return false
    } catch (error) {
        showNotification('error', 'Không thể gửi mã xác nhận')
        return false
    }
}

const resetPassword = async (): Promise<boolean> => {
    try {
        // Use different method based on whether we have a token from URL
        let result
        result = await authService.resetPassword({
            token: resetToken.value,
            newPassword: newPassword.value
        })
        console.log(result);

        return result.success
    } catch (error) {
        showNotification('error', 'Không thể đặt lại mật khẩu')
        return false
    }
}

// Resend verification code method
const resendVerificationCode = async () => {
    if (cooldownActive.value) return

    try {
        isLoading.value = true
        const result = await authService.forgotPassword(email.value)
        if (result.success) {
            showNotification('success', 'Mã xác nhận mới đã được gửi')
        } else {
            showNotification('error', 'Không thể gửi lại mã. Vui lòng thử lại.')
        }
    } catch (error) {
        showNotification('error', 'Không thể gửi lại mã. Vui lòng thử lại.')
    } finally {
        isLoading.value = false
    }
}
</script>
<style scoped>
/* Forgot Password Component Full CSS */

/* Base Container and Layout */
.forgot-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%);
    padding: 1rem;
    position: relative;
}

.forgot-password-wrapper {
    width: 100%;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Forgot Password Box */
.forgot-password-box {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s ease;
}

/* Forgot Password Header */
.forgot-password-header {
    background-color: #3b82f6;
    color: white;
    text-align: center;
    padding: 2rem 1.5rem 1.5rem;
    position: relative;
}

.forgot-password-header h1 {
    font-size: 1.75rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #fff;
}

.forgot-password-header p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
}

/* Forgot Password Form */
.forgot-password-form {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

/* Form Groups */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    color: #4a5568;
    font-weight: 600;
    font-size: 0.9rem;
}

/* Input Wrappers */
.input-wrapper,
.password-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #718096;
}

.form-group input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Password Toggle */
.password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    z-index: 10;
}

.password-toggle i {
    font-size: 1.2rem;
}

/* Code Timer */
.code-timer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    color: #718096;
    font-size: 0.9rem;
}

.resend-code {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 0.9rem;
    transition: color 0.3s ease;
}

.resend-code:hover {
    color: #2563eb;
}

.resend-code:disabled {
    color: #cbd5e0;
    cursor: not-allowed;
}

/* Forgot Password Button */
.forgot-password-button {
    width: 100%;
    padding: 0.85rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    font-size: 1rem;
}

.forgot-password-button:hover {
    background-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.forgot-password-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Login Redirect */
.login-redirect {
    margin-top: 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.login-redirect p {
    color: #718096;
    font-size: 0.9rem;
}

.login-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.login-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

/* Page Footer */
.page-footer {
    text-align: center;
    color: #718096;
    font-size: 0.8rem;
    padding: 1rem;
}

.page-footer p {
    margin-bottom: 0.5rem;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.footer-links a {
    color: #718096;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-links a:hover {
    color: #3b82f6;
    text-decoration: underline;
}

/* Spinner Animation */
.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Notification Styles */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    width: 300px;
    max-width: calc(100% - 40px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
}

.notification-enter {
    opacity: 1;
    transform: translateX(0);
}

.notification-exit {
    opacity: 0;
    transform: translateX(100%);
}

.notification-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
}

.notification-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.notification-text {
    flex-grow: 1;
    font-size: 0.9rem;
}

.notification-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem;
}

/* Notification Color Variations */
.notification-success {
    background-color: #d1f7e3;
    color: #2b7a0b;
    border-left: 4px solid #2b7a0b;
}

.notification-error {
    background-color: #fde8e8;
    color: #c72c2c;
    border-left: 4px solid #c72c2c;
}

.notification-warning {
    background-color: #fff4e5;
    color: #ca8a04;
    border-left: 4px solid #ca8a04;
}

.notification-info {
    background-color: #e6f3ff;
    color: #2563eb;
    border-left: 4px solid #2563eb;
}

/* Responsive Adjustments */
@media screen and (max-width: 480px) {
    .forgot-password-wrapper {
        width: 95%;
        max-width: none;
    }

    .forgot-password-box {
        border-radius: 12px;
    }

    .forgot-password-header {
        padding: 1.5rem 1rem 1rem;
    }

    .forgot-password-form {
        padding: 1.5rem;
    }

    .notification {
        width: calc(100% - 20px);
        right: 10px;
        max-width: none;
    }

    .forgot-password-header h1 {
        font-size: 1.5rem;
    }

    .forgot-password-header p {
        font-size: 0.9rem;
    }

    .code-timer {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>