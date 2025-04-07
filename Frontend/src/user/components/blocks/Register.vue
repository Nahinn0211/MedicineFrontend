<template>
  <div class="registration-container">
    <div class="registration-wrapper">
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

      <div class="registration-box">
        <div class="registration-header">
          <h1>Đăng Ký Tài Khoản</h1>
          <p>Hệ Thống Quản Lý Y Tế THAPV Pharmacity</p>
        </div>

        <form @submit.prevent="handleRegister" class="registration-form">
          <!-- Họ và Tên -->
          <div class="form-group">
            <label for="fullName">Họ và Tên</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <i class="icon-user"></i>
              </div>
              <input type="text" id="fullName" v-model="userRegistration.fullName" required
                placeholder="Nhập họ và tên đầy đủ" @focus="clearNotification">
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Địa Chỉ Email</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <i class="icon-email"></i>
              </div>
              <input type="email" id="email" v-model="userRegistration.email" required placeholder="Nhập địa chỉ email"
                @focus="clearNotification" autocomplete="email">
            </div>
          </div>

          <!-- Mật Khẩu -->
          <div class="form-group">
            <label for="password">Mật Khẩu</label>
            <div class="password-wrapper">
              <div class="input-icon">
                <i class="icon-lock"></i>
              </div>
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="userRegistration.password"
                required placeholder="Tạo mật khẩu" @focus="clearNotification" autocomplete="new-password">
              <button type="button" @click="togglePasswordVisibility" class="password-toggle"
                aria-label="Toggle password visibility" tabindex="-1">
                <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Xác Nhận Mật Khẩu -->
          <div class="form-group">
            <label for="confirmPassword">Xác Nhận Mật Khẩu</label>
            <div class="password-wrapper">
              <div class="input-icon">
                <i class="icon-lock"></i>
              </div>
              <input :type="showPassword ? 'text' : 'password'" id="confirmPassword"
                v-model="userRegistration.confirmPassword" required placeholder="Nhập lại mật khẩu"
                @focus="clearNotification" autocomplete="new-password">
            </div>
          </div>

          <!-- Nút Đăng Ký -->
          <button type="submit" class="registration-button" :disabled="isLoading">
            <span v-if="!isLoading">Đăng Ký</span>
            <span v-else class="spinner"></span>
          </button>

          <!-- Chuyển Đăng Nhập -->
          <div class="login-redirect">
            <p>Đã có tài khoản?</p>
            <router-link to="/login" class="login-link">
              Đăng Nhập Ngay
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@user/stores/auth/useAuthStore'

const authStore = useAuthStore()
const router = useRouter()

const userRegistration = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const notification = reactive({
  show: false,
  type: 'error' as 'success' | 'error' | 'warning' | 'info',
  message: '',
  isExiting: false,
  timer: null as ReturnType<typeof setTimeout> | null
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

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
  // Clear any existing timer
  if (notification.timer) {
    clearTimeout(notification.timer)
  }

  notification.show = true
  notification.type = type
  notification.message = message
  notification.isExiting = false

  // Auto-close after 5 seconds
  notification.timer = setTimeout(() => {
    closeNotification()
  }, 5000)
}

const clearNotification = () => {
  if (notification.show) {
    closeNotification()
  }
}

const closeNotification = () => {
  // Clear any existing timer
  if (notification.timer) {
    clearTimeout(notification.timer)
  }

  notification.isExiting = true

  // Wait for exit animation before hiding
  setTimeout(() => {
    notification.show = false
    notification.isExiting = false
  }, 300)
}

const handleRegister = async () => {
  const registrationResult = await authStore.register({
    fullName: userRegistration.fullName,
    email: userRegistration.email,
    password: userRegistration.password
  });

  if (registrationResult) {
    showNotification('success', 'Đăng ký thành công');
    router.push('/login');
  } else {
    showNotification('error', authStore.error || 'Đăng ký không thành công');
  }
}
</script>
<style scoped>
/* Registration Component Full CSS */

/* Base Container and Layout */
.registration-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%);
  padding: 1rem;
  position: relative;
}

.registration-wrapper {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Registration Box */
.registration-box {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08), 0 5px 15px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Registration Header */
.registration-header {
  background-color: #3b82f6;
  color: white;
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  position: relative;
}

.registration-header h1 {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff;
}

.registration-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

/* Registration Form */
.registration-form {
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

/* Registration Button */
.registration-button {
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

.registration-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.registration-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Login Redirect Section */
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
  .registration-wrapper {
    width: 95%;
    max-width: none;
  }

  .registration-box {
    border-radius: 12px;
  }

  .registration-header {
    padding: 1.5rem 1rem 1rem;
  }

  .registration-form {
    padding: 1.5rem;
  }

  .notification {
    width: calc(100% - 20px);
    right: 10px;
    max-width: none;
  }

  .registration-header h1 {
    font-size: 1.5rem;
  }

  .registration-header p {
    font-size: 0.9rem;
  }
}
</style>