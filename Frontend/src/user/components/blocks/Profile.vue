<template>
    <div class="profile-container">
        <div class="profile-wrapper">
            <!-- Header section với avatar và thông tin chính -->
            <div class="profile-header">
                <div class="avatar-section">
                    <div class="avatar-container" @click="triggerFileInput">
                        <img :src="user.avatar || '/default-avatar.png'" alt="User Avatar" class="profile-avatar" />
                        <div class="avatar-overlay">
                            <span class="upload-icon"><i class="fas fa-camera"></i></span>
                        </div>
                        <input type="file" ref="avatarInput" class="hidden" accept="image/*"
                            @change="handleAvatarChange" />
                    </div>
                </div>
                <div class="user-info">
                    <h2 class="user-name">{{ user.fullName }}</h2>
                    <p class="user-email">
                        <i class="fas fa-envelope"></i> {{ user.email }}
                    </p>
                    <div class="user-status" :class="{ 'active': isUserActive }">
                        <span class="status-indicator"></span>
                        {{ isUserActive ? 'Đang hoạt động' : 'Không hoạt động' }}
                    </div>
                </div>
            </div>

            <!-- Main content section -->
            <div class="profile-content">
                <!-- Notification banner -->
                <transition name="slide-fade">
                    <div v-if="notification.show" class="notification-banner" :class="notification.type">
                        <div class="notification-icon">
                            <i :class="getNotificationIcon()"></i>
                        </div>
                        <div class="notification-message">{{ notification.message }}</div>
                        <button class="notification-close" @click="hideNotification">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </transition>

                <div class="personal-info">
                    <h3 class="section-title">
                        <i class="fas fa-user-circle"></i> Thông tin cá nhân
                    </h3>

                    <div class="info-grid">
                        <div class="info-card">
                            <span class="info-label">
                                <i class="fas fa-phone"></i> Số điện thoại
                            </span>
                            <span class="info-value">{{ user.phone || 'Chưa cập nhật' }}</span>
                        </div>

                        <div class="info-card">
                            <span class="info-label">
                                <i class="fas fa-map-marker-alt"></i> Địa chỉ
                            </span>
                            <span class="info-value">{{ user.address || 'Chưa cập nhật' }}</span>
                        </div>

                        <div class="info-card">
                            <span class="info-label">
                                <i class="fas fa-tint"></i> Nhóm máu
                            </span>
                            <span class="info-value">{{ patientProfile.bloodType || 'Chưa rõ' }}</span>
                        </div>

                        <div class="info-card">
                            <span class="info-label">
                                <i class="fas fa-file-medical"></i> Tiền sử bệnh
                            </span>
                            <span class="info-value">{{ patientProfile.medicalHistory || 'Không có' }}</span>
                        </div>

                        <div class="info-card">
                            <span class="info-label">
                                <i class="fas fa-allergies"></i> Dị ứng
                            </span>
                            <span class="info-value">{{ patientProfile.allergies || 'Không có' }}</span>
                        </div>

                        <div class="info-card balance-card">
                            <span class="info-label">
                                <i class="fas fa-wallet"></i> Số dư tài khoản
                            </span>
                            <span class="info-value balance">{{ formatCurrency(patientProfile.accountBalance) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Profile actions -->
                <div class="profile-actions">
                    <button class="action-button primary" @click="openModal('edit')">
                        <i class="fas fa-user"></i> Cập nhật thông tin
                    </button>
                    <button class="action-button secondary" @click="openModal('password')">
                        <i class="fas fa-lock"></i> Đổi mật khẩu
                    </button>
                    <button class="action-button highlight" @click="openModal('topup')">
                        <i class="fab fa-paypal"></i> Nạp tiền PayPal
                    </button>
                </div>
            </div>

            <!-- Modals -->
            <transition name="modal">
                <div class="modal-overlay" v-if="modalType" @click.self="closeModal">
                    <div class="modal-container" :class="modalType">
                        <div class="modal-content">
                            <button class="modal-close" @click="closeModal">
                                <i class="fas fa-times"></i>
                            </button>

                            <!-- Edit Info Modal -->
                            <template v-if="modalType === 'edit'">
                                <h3 class="modal-title">
                                    <i class="fas fa-user-edit"></i> Cập nhật thông tin
                                </h3>

                                <div v-if="modalMessage.edit" class="modal-message" :class="modalMessage.type">
                                    <i :class="getModalMessageIcon()"></i>
                                    <span>{{ modalMessage.edit }}</span>
                                </div>

                                <form @submit.prevent="saveInfo" class="modal-form">
                                    <div class="form-group">
                                        <label for="fullName">Họ và tên</label>
                                        <input id="fullName" v-model="editUser.fullName" placeholder="Nhập họ và tên"
                                            required />
                                        <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
                                    </div>

                                    <div class="form-group">
                                        <label for="phone">Số điện thoại</label>
                                        <input id="phone" v-model="editUser.phone" placeholder="Nhập số điện thoại"
                                            type="tel" @input="validatePhone" />
                                        <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                                    </div>

                                    <div class="form-group">
                                        <label for="address">Địa chỉ</label>
                                        <input id="address" v-model="editUser.address" placeholder="Nhập địa chỉ" />
                                    </div>

                                    <div class="form-group">
                                        <label for="bloodType">Nhóm máu</label>
                                        <select id="bloodType" v-model="editUser.bloodType" class="form-control">
                                            <option value="">Chọn nhóm máu</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="medicalHistory">Tiền sử bệnh</label>
                                        <textarea id="medicalHistory" v-model="editUser.medicalHistory"
                                            placeholder="Nhập tiền sử bệnh (nếu có)" rows="3"></textarea>
                                    </div>

                                    <div class="form-group">
                                        <label for="allergies">Dị ứng</label>
                                        <textarea id="allergies" v-model="editUser.allergies"
                                            placeholder="Nhập thông tin dị ứng (nếu có)" rows="3"></textarea>
                                    </div>

                                    <div class="modal-actions">
                                        <button type="submit" class="btn-primary" :disabled="isSubmitting">
                                            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                                            {{ isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi' }}
                                        </button>
                                        <button type="button" class="btn-secondary" @click="closeModal">
                                            Đóng
                                        </button>
                                    </div>
                                </form>
                            </template>

                            <!-- Change Password Modal -->
                            <template v-else-if="modalType === 'password'">
                                <h3 class="modal-title">
                                    <i class="fas fa-lock"></i> Đổi mật khẩu
                                </h3>

                                <div v-if="modalMessage.password" class="modal-message" :class="modalMessage.type">
                                    <i :class="getModalMessageIcon()"></i>
                                    <span>{{ modalMessage.password }}</span>
                                </div>

                                <form @submit.prevent="changePassword" class="modal-form">
                                    <div class="form-group">
                                        <label for="oldPassword">Mật khẩu cũ</label>
                                        <div class="password-input">
                                            <input id="oldPassword" v-model="passwordData.oldPassword"
                                                :type="showPassword.old ? 'text' : 'password'"
                                                placeholder="Nhập mật khẩu cũ" required />
                                            <button type="button" class="toggle-password"
                                                @click="togglePassword('old')">
                                                <i :class="showPassword.old ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="newPassword">Mật khẩu mới</label>
                                        <div class="password-input">
                                            <input id="newPassword" v-model="passwordData.newPassword"
                                                :type="showPassword.new ? 'text' : 'password'"
                                                placeholder="Nhập mật khẩu mới" required minlength="8"
                                                @input="validatePassword" />
                                            <button type="button" class="toggle-password"
                                                @click="togglePassword('new')">
                                                <i :class="showPassword.new ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                            </button>
                                        </div>

                                        <div v-if="passwordData.newPassword" class="password-strength">
                                            <div class="strength-meter">
                                                <div class="strength-value"
                                                    :style="{ width: `${passwordStrength.score * 25}%` }"
                                                    :class="passwordStrength.class"></div>
                                            </div>
                                            <span class="strength-text" :class="passwordStrength.class">
                                                {{ passwordStrength.text }}
                                            </span>
                                        </div>

                                        <ul v-if="passwordData.newPassword" class="password-requirements">
                                            <li :class="{ valid: passwordCriteria.length }">
                                                <i
                                                    :class="passwordCriteria.length ? 'fas fa-check' : 'fas fa-times'"></i>
                                                Ít nhất 8 ký tự
                                            </li>
                                            <li :class="{ valid: passwordCriteria.uppercase }">
                                                <i
                                                    :class="passwordCriteria.uppercase ? 'fas fa-check' : 'fas fa-times'"></i>
                                                Ít nhất một chữ cái in hoa
                                            </li>
                                            <li :class="{ valid: passwordCriteria.number }">
                                                <i
                                                    :class="passwordCriteria.number ? 'fas fa-check' : 'fas fa-times'"></i>
                                                Ít nhất một số
                                            </li>
                                            <li :class="{ valid: passwordCriteria.special }">
                                                <i
                                                    :class="passwordCriteria.special ? 'fas fa-check' : 'fas fa-times'"></i>
                                                Ít nhất một ký tự đặc biệt
                                            </li>
                                        </ul>

                                    </div>

                                    <div class="form-group">
                                        <label for="confirmPassword">Xác nhận mật khẩu</label>
                                        <div class="password-input">
                                            <input id="confirmPassword" v-model="passwordData.confirmPassword"
                                                :type="showPassword.confirm ? 'text' : 'password'"
                                                placeholder="Nhập lại mật khẩu mới" required
                                                @input="validatePasswordMatch" />
                                            <button type="button" class="toggle-password"
                                                @click="togglePassword('confirm')">
                                                <i
                                                    :class="showPassword.confirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                            </button>
                                        </div>
                                        <span v-if="errors.confirmPassword" class="error-message">
                                            {{ errors.confirmPassword }}
                                        </span>
                                    </div>

                                    <div class="modal-actions">
                                        <button type="submit" class="btn-primary"
                                            :disabled="isSubmitting || !isPasswordValid">
                                            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                                            {{ isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
                                        </button>
                                        <button type="button" class="btn-secondary" @click="closeModal">Đóng</button>
                                    </div>
                                </form>
                            </template>

                            <!-- Top Up Modal -->
                            <template v-else-if="modalType === 'topup'">
                                <h3 class="modal-title">
                                    <i class="fab fa-paypal"></i> Nạp tiền PayPal
                                </h3>

                                <div v-if="modalMessage.topup" class="modal-message" :class="modalMessage.type">
                                    <i :class="getModalMessageIcon()"></i>
                                    <span>{{ modalMessage.topup }}</span>
                                </div>

                                <form @submit.prevent="topup" class="modal-form">
                                    <div class="form-group">
                                        <label for="topupAmount">Số tiền nạp</label>
                                        <div class="money-input">
                                            <span class="currency-prefix">VND</span>
                                            <input id="topupAmount" v-model.number="topupAmount" type="number"
                                                placeholder="Nhập số tiền cần nạp" min="10000" step="10000" required
                                                @input="formatTopupAmount" />
                                        </div>
                                        <small class="hint">Tối thiểu 10,000 VND</small>

                                        <div class="quick-amounts">
                                            <button type="button" v-for="amount in quickAmounts" :key="amount"
                                                class="quick-amount-btn" @click="setQuickAmount(amount)">
                                                {{ formatCurrency(amount) }}
                                            </button>
                                        </div>
                                    </div>

                                    <div class="payment-methods">
                                        <h4 class="payment-title">Phương thức thanh toán</h4>
                                        <div class="payment-options">
                                            <div v-for="(method, index) in paymentMethods" :key="index"
                                                class="payment-option"
                                                :class="{ active: selectedPaymentMethod === method.id }"
                                                @click="selectPaymentMethod(method.id)">
                                                <div class="payment-option-icon">
                                                    <i :class="method.icon"></i>
                                                </div>
                                                <div class="payment-option-details">
                                                    <div class="payment-option-name">{{ method.name }}</div>
                                                    <div class="payment-option-description">{{ method.description }}
                                                    </div>
                                                </div>
                                                <div class="payment-option-check">
                                                    <i class="fas fa-check-circle"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="paypal-button-container" class="paypal-button-container"></div>

                                    <div class="modal-actions">
                                        <button type="submit" class="btn-primary"
                                            :disabled="isSubmitting || !isValidTopup">
                                            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                                            {{ isSubmitting ? 'Đang xử lý...' : 'Tiến hành thanh toán' }}
                                        </button>
                                        <button type="button" class="btn-secondary" @click="closeModal">Đóng</button>
                                    </div>
                                </form>
                            </template>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { authService } from '@user/services/AuthService'
import { useAuthStore } from '@user/stores/auth/useAuthStore'
import { ref, reactive, onMounted, computed } from 'vue'
import { loadScript } from '@paypal/paypal-js';
const authStore = useAuthStore()

const user = ref({
    id: null,
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
})

const editUser = reactive({
    fullName: '',
    phone: '',
    address: '',
    bloodType: '',
    medicalHistory: '',
    allergies: ''
})

const patientProfile = ref({
    bloodType: '',
    medicalHistory: '',
    allergies: '',
    accountBalance: 0
})

// Thêm các trạng thái mới
const isUserActive = ref(true)
const notification = ref({
    show: false,
    type: 'info',
    message: ''
})

const modalType = ref(null)
const passwordData = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const topupAmount = ref(null)

// Các trạng thái và phương thức cho modal
const showPassword = ref({
    old: false,
    new: false,
    confirm: false
})

const modalMessage = ref({
    edit: '',
    password: '',
    topup: ''
})

const errors = ref({
    fullName: '',
    phone: '',
    confirmPassword: ''
})

const passwordStrength = reactive({
    score: 0,
    class: '',
    text: ''
});

const passwordCriteria = reactive({
    length: false,
    uppercase: false,
    number: false,
    special: false
});

const isSubmitting = ref(false)
const isPasswordValid = ref(false)
const isValidTopup = ref(false)
const paypal = ref(null)

const quickAmounts = ref([50000, 100000, 200000, 500000])
const paymentMethods = ref([
    {
        id: 'paypal',
        name: 'PayPal',
        icon: 'fab fa-paypal',
        description: 'Thanh toán nhanh chóng'
    },
])
const selectedPaymentMethod = ref(null)

// Phương thức toggle hiển thị mật khẩu
function togglePassword(type) {
    showPassword.value[type] = !showPassword.value[type]
}

// Phương thức validate điện thoại
function validatePhone() {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    errors.value.phone = phoneRegex.test(editUser.phone) ? '' : 'Số điện thoại không hợp lệ'
}


function validatePassword() {
    const newPassword = passwordData.value.newPassword;

    // Initialize criteria
    const passwordCriteria = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };

    // Calculate the score based on valid criteria
    const validCriterias = Object.values(passwordCriteria).filter(Boolean).length;

    // Create password strength object
    const passwordStrength = {
        score: validCriterias,
        class: validCriterias <= 1 ? 'weak' : (validCriterias <= 3 ? 'medium' : 'strong'),
        text: validCriterias <= 1 ? 'Yếu' : (validCriterias <= 3 ? 'Trung bình' : 'Mạnh')
    };

    // Set password validity
    isPasswordValid.value = passwordCriteria.length && passwordCriteria.uppercase && passwordCriteria.number && passwordCriteria.special;

    // Return both passwordStrength and passwordCriteria
    return {
        passwordCriteria,
        passwordStrength
    };
}


// Validate khớp mật khẩu
function validatePasswordMatch() {
    errors.value.confirmPassword =
        passwordData.value.newPassword === passwordData.value.confirmPassword
            ? ''
            : 'Mật khẩu không khớp'
}

// Các phương thức cho phần nạp tiền
function formatTopupAmount() {
    // Đảm bảo số tiền là bội số của 10,000
    if (topupAmount.value) {
        topupAmount.value = Math.floor(topupAmount.value / 10000) * 10000
    }
    isValidTopup.value = topupAmount.value && topupAmount.value >= 10000
}

function setQuickAmount(amount) {
    topupAmount.value = amount
    formatTopupAmount()
}

function selectPaymentMethod(methodId) {
    selectedPaymentMethod.value = methodId
}

// Các phương thức hỗ trợ thông báo
function showNotification(message, type = 'info') {
    notification.value = {
        show: true,
        type,
        message
    }
}

function hideNotification() {
    notification.value.show = false
}

function getNotificationIcon() {
    const iconMap = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    }
    return iconMap[notification.value.type] || iconMap['info']
}

// Các phương thức modal
function openModal(type) {
    modalType.value = type

    if (type === 'edit') {
        editUser.fullName = user.value.fullName
        editUser.phone = user.value.phone
        editUser.address = user.value.address
        editUser.bloodType = patientProfile.value.bloodType || ''
        editUser.medicalHistory = patientProfile.value.medicalHistory || ''
        editUser.allergies = patientProfile.value.allergies || ''
    } else if (type === 'password') {
        // Existing password modal logic
        passwordData.value = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
        showPassword.value = {
            old: false,
            new: false,
            confirm: false
        }
    } else if (type === 'topup') {
        topupAmount.value = null
        selectedPaymentMethod.value = null
    }
}

function closeModal() {
    modalType.value = null
    resetForms()
}

function resetForms() {
    // Reset các form
    editUser.fullName = ''
    editUser.phone = ''
    editUser.address = ''

    passwordData.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    topupAmount.value = null
    selectedPaymentMethod.value = null

    // Reset errors
    errors.value = {
        fullName: '',
        phone: '',
        confirmPassword: ''
    }
}

// Các phương thức xử lý nghiệp vụ được giữ nguyên...
async function loadData() {
    const userId = authStore.user.id;
    if (!userId) {
        showNotification('Không tìm thấy thông tin người dùng', 'error')
        return
    }

    try {
        const [userData, profileData] = await Promise.all([
            authService.getDataUser(userId),
            authService.getDataPatient(userId)
        ])

        user.value = userData;
        patientProfile.value = profileData;
    } catch (error) {
        showNotification('Lỗi tải dữ liệu người dùng', 'error')
        console.error(error)
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0)
}
async function saveInfo() {
    try {
        const userData = await authService.getDataUser(authStore.user.id);
        const updatedUserData = {
            ...user.value,
            id: authStore.user.id,
            fullName: editUser.fullName,
            phone: editUser.phone,
            email: userData.email,
            address: editUser.address
        }
        const updatedProfileData = {
            bloodType: editUser.bloodType,
            medicalHistory: editUser.medicalHistory,
            allergies: editUser.allergies
        }
        const patientData = await authService.getDataPatient(authStore.user.id);
        if (patientData) {
            updatedProfileData.id = patientData.id,
                updatedProfileData.userId = authStore.user.id
        }
        const [updatedUser, updatedProfile] = await Promise.all([
            authService.updateUserProfile(updatedUserData),
            authService.updatePatientProfile(updatedProfileData)
        ])
        user.value = updatedUser
        patientProfile.value = {
            ...patientProfile.value,
            ...updatedProfile
        }

        showNotification('Thông tin đã được cập nhật!', 'success')
        closeModal()
    } catch (error) {
        showNotification('Cập nhật thông tin thất bại', 'error')
        console.error(error)
    }
}

async function changePassword() {
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        showNotification('Mật khẩu mới và xác nhận mật khẩu không khớp', 'error');
        return;
    }

    // Call validatePassword and get the returned object
    const { passwordStrength, passwordCriteria } = validatePassword();

    // Proceed with password change if valid
    if (isPasswordValid.value) {
        try {
            passwordData.id = authStore.user.id;
            await authService.changePassword(passwordData.value);
            showNotification('Đổi mật khẩu thành công!', 'success');
            closeModal();
        } catch (error) {
            showNotification('Đổi mật khẩu thất bại', 'error');
            console.error(error);
        }
    } else {
        showNotification('Mật khẩu không đủ mạnh', 'error');
    }
}


const topup = async () => {
    if (!topupAmount.value || topupAmount.value < 10000) {
        showNotification('Please enter a valid top-up amount (minimum 10,000 VND).', 'error');
        return;
    }

    if (selectedPaymentMethod.value === 'paypal') {
        initPayPalTopup();
    }
};
const initPayPalTopup = () => {
    if (!paypal.value) {
        alert('Cannot initialize PayPal. Please try again later.');
        return;
    }

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = '';
    }

    try {
        paypal.value.Buttons({
            createOrder: (data, actions) => {
                const totalAmountInUSD = topupAmount.value / 23000; // Adjust the conversion rate to USD
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: totalAmountInUSD.toFixed(2), // Amount in USD
                            },
                        },
                    ],
                });
            },
            onApprove: async (data, actions) => {
                try {
                    // Capture the payment
                    await actions.order.capture();

                    // Top-up the user's balance after PayPal payment success
                    const patientData = await authService.getDataPatient(authStore.user.id);
                    const newBalance = patientData.accountBalance + topupAmount.value;
                    const updatedBalance = await authService.updateBalance(patientData.id, newBalance);
                    patientProfile.value.accountBalance = updatedBalance;

                    showNotification('Nạp tiền thành công!', 'success');
                    closeModal(); // Close the top-up modal
                } catch (error) {
                    showNotification('Error processing payment. Please try again.', 'error');
                    console.error('Error in PayPal approval:', error);
                }
            },
            onCancel: () => {
                showNotification('PayPal payment cancelled.', 'info');
            },
            onError: (err) => {
                showNotification('An error occurred during PayPal payment. Please try again.', 'error');
                console.error('PayPal error:', err);
            },
        }).render('#paypal-button-container');
    } catch (error) {
        console.error('Error rendering PayPal button:', error);
        alert('Unable to render PayPal button. Please try again later.');
    }
};

onMounted(async () => {
    await loadData();
    try {
        paypal.value = await loadScript({
            clientId: 'ASn-24p2EOa4SW4egAbp2d4mmubSL54sScc77I9jnrZ2zCXnXt4I-VR9gqqbjjeTAAlwWxmeozH9g0mu', // Ensure the correct PayPal client ID
            currency: 'USD'
        });
    } catch (error) {
        console.error('Error loading PayPal script:', error);
    }
});



// Phơi các phương thức và trạng thái cần sử dụng trong template
defineExpose({
    loadData,
    openModal,
    closeModal,
    saveInfo,
    changePassword,
    topup,
    formatCurrency,
    showNotification,
    hideNotification,

    // Các phương thức khác để sử dụng trong template
    togglePassword,
    validatePhone,
    validatePassword,
    validatePasswordMatch,
    formatTopupAmount,
    setQuickAmount,
    selectPaymentMethod
})
</script>

<style scoped>
:root {
    /* Modern Color Palette */
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --accent-color: #9b59b6;
    --background-main: #f4f6f7;
    --background-card: #ffffff;
    --text-primary: #2c3e50;
    --text-secondary: #7f8c8d;
    --border-color: #e0e6ed;

    /* Typography */
    --font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    /* Shadows and Transitions */
    --shadow-subtle: 0 4px 10px rgba(0, 0, 0, 0.08);
    --shadow-hover: 0 10px 25px rgba(0, 0, 0, 0.12);
    --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-main);
    background-color: var(--background-main);
    color: var(--text-primary);
    line-height: 1.6;
}

select,
textarea {
    width: 100%;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: border-color 0.3s ease;
}

/* Focus styles */
select:focus,
textarea:focus {
    border-color: #007bff;
    outline: none;
}

/* Placeholder styling */
textarea::placeholder {
    color: #aaa;
    font-style: italic;
}

/* Padding adjustments for better readability */
textarea {
    resize: vertical;
}

.profile-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, var(--background-main) 0%, #e9ecef 100%);
}

.profile-wrapper {
    width: 100%;
    max-width: 1100px;
    background-color: var(--background-card);
    border-radius: 20px;
    box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.05),
        0 10px 20px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    border: 1px solid var(--border-color);
    transition: var(--transition-smooth);
}

.profile-wrapper:hover {
    box-shadow:
        0 25px 50px rgba(0, 0, 0, 0.08),
        0 15px 30px rgba(0, 0, 0, 0.06);
}

.profile-header {
    display: flex;
    align-items: center;
    padding: 2.5rem;
    background: linear-gradient(145deg, #f9fafa 0%, #f0f4f5 100%);
    border-bottom: 1px solid var(--border-color);
}

.avatar-container {
    position: relative;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 2.5rem;
    box-shadow: var(--shadow-subtle);
    border: 4px solid var(--background-card);
    transition: var(--transition-smooth);
    cursor: pointer;
}

.avatar-container:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-hover);
}

.profile-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.avatar-container:hover .profile-avatar {
    transform: scale(1.1);
}

.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    transition: background-color 0.3s ease;
}

.avatar-container:hover .avatar-overlay {
    background-color: rgba(0, 0, 0, 0.5);
}

.upload-icon {
    opacity: 0;
    font-size: 32px;
    transition: opacity 0.3s ease;
}

.avatar-container:hover .upload-icon {
    opacity: 1;
}

.user-info {
    flex-grow: 1;
}

.user-name {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    letter-spacing: -0.05em;
}

.user-email {
    color: var(--text-secondary);
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.user-status {
    display: flex;
    align-items: center;
    color: var(--text-secondary);
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 0.5rem;
    background-color: var(--text-secondary);
}

.user-status.active .status-indicator {
    background-color: var(--secondary-color);
}

.profile-content {
    padding: 2.5rem;
}

/* Modal Specific Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-container {
    background-color: var(--background-card);
    border-radius: 20px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow:
        0 25px 50px rgba(0, 0, 0, 0.1),
        0 15px 30px rgba(0, 0, 0, 0.07);
    border: 1px solid var(--border-color);
    position: relative;
}

.modal-content {
    padding: 2.5rem;
}

.modal-close {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.3s ease, transform 0.3s ease;
}

.modal-close:hover {
    color: var(--primary-color);
    transform: rotate(90deg);
}

.modal-title {
    font-size: 1.8rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.modal-title i {
    color: var(--primary-color);
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.form-group label {
    font-weight: 600;
    color: var(--text-primary);
    margin-left: 0.5rem;
}

.form-group input {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 1rem;
    transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.password-input {
    position: relative;
}

.toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.3s ease;
}

.toggle-password:hover {
    color: var(--primary-color);
}

.modal-message {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
}

.modal-message.success {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--secondary-color);
}

.modal-message.error {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
}

.modal-message.warning {
    background-color: rgba(241, 196, 15, 0.1);
    color: #f39c12;
}

.modal-message.info {
    background-color: rgba(52, 152, 219, 0.1);
    color: var(--primary-color);
}

.modal-message i {
    font-size: 1.2rem;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
    flex: 1;
    padding: 1rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    transition:
        background-color 0.3s ease,
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.btn-primary {
    background-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
    background-color: #2980b9;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.btn-primary:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
}

.btn-secondary {
    background-color: var(--background-main);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background-color: var(--border-color);
    transform: translateY(-3px);
}

.error-message {
    color: #e74c3c;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.password-strength {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.75rem;
}

.strength-meter {
    width: 150px;
    height: 6px;
    background-color: var(--border-color);
    border-radius: 10px;
    overflow: hidden;
}

.strength-value {
    height: 100%;
    transition: width 0.3s ease;
}

.strength-value.weak {
    background-color: #e74c3c;
}

.strength-value.medium {
    background-color: #f39c12;
}

.strength-value.strong {
    background-color: var(--secondary-color);
}

.strength-text {
    font-size: 0.9rem;
}

.strength-text.weak {
    color: #e74c3c;
}

.strength-text.medium {
    color: #f39c12;
}

.strength-text.strong {
    color: var(--secondary-color);
}

.password-requirements {
    list-style-type: none;
    margin-top: 1rem;
}

.password-requirements li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.password-requirements li i {
    font-size: 0.7rem;
    width: 15px;
    text-align: center;
}

.password-requirements li.valid {
    color: var(--secondary-color);
}

.password-requirements li.valid i {
    color: var(--secondary-color);
}

/* Payment Methods Styles */
.payment-methods {
    margin-top: 2rem;
}

.payment-title {
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.payment-options {
    display: grid;
    gap: 1rem;
}

.payment-option {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.payment-option:hover {
    border-color: var(--primary-color);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.1);
}

.payment-option.active {
    border-color: var(--primary-color);
    background-color: rgba(52, 152, 219, 0.05);
}

.payment-option-icon {
    font-size: 2rem;
    color: var(--text-secondary);
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.payment-option-details {
    flex-grow: 1;
}

.payment-option-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
}

.payment-option-description {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.payment-option-check {
    color: var(--border-color);
    font-size: 1.5rem;
}

.payment-option.active .payment-option-check {
    color: var(--primary-color);
}

/* Money Input Styles */
.money-input {
    position: relative;
}

.currency-prefix {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    font-weight: 500;
}

.money-input input {
    padding-left: 3.5rem;
}

.quick-amounts {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
}

.quick-amount-btn {
    background-color: var(--background-main);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    transition:
        background-color 0.3s ease,
        border-color 0.3s ease;
}

.quick-amount-btn:hover {
    background-color: var(--border-color);
}

/* Modal Animations */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* Scrollbar for Modal */
.modal-container::-webkit-scrollbar {
    width: 8px;
}

.modal-container::-webkit-scrollbar-track {
    background: var(--background-main);
}

.modal-container::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 10px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-secondary);
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.75rem;
}

.section-title i {
    margin-right: 0.75rem;
    font-size: 1.2rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.info-card {
    background-color: var(--background-main);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-subtle);
    border: 1px solid transparent;
    transition: var(--transition-smooth);
}

.info-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
    border-color: var(--border-color);
}

.info-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-value {
    font-size: 1.1rem;
    color: var(--text-primary);
    font-weight: 500;
}

.balance-card .info-value {
    color: var(--secondary-color);
    font-weight: 700;
}

.profile-actions {
    display: flex;
    gap: 1.5rem;
    margin-top: 2.5rem;
}

.action-button {
    flex: 1;
    padding: 1.2rem;
    border: none;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: var(--shadow-subtle);
}

.action-button i {
    margin-right: 0.75rem;
}

.action-button.primary {
    background-color: var(--primary-color);
}

.action-button.secondary {
    background-color: var(--background-main);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.action-button.highlight {
    background-color: var(--secondary-color);
}

.action-button:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
}

/* Responsive Design */
@media screen and (max-width: 768px) {
    .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 2rem;
    }

    .avatar-container {
        margin-right: 0;
        margin-bottom: 1.5rem;
        width: 140px;
        height: 140px;
    }

    .profile-actions {
        flex-direction: column;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }
}

/* Notification Styles */
.notification-banner {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    box-shadow: var(--shadow-hover);
    max-width: 90%;
    width: 400px;
}



.notification-banner.success {
    background-color: #2ecc71;
    color: white;
}

.notification-banner.error {
    background-color: #e74c3c;
    color: white;
}

.notification-banner.warning {
    background-color: #f39c12;
    color: white;
}

.notification-banner.info {
    background-color: var(--primary-color);
    color: white;
}

.notification-icon {
    margin-right: 1rem;
    font-size: 1.5rem;
}

.notification-message {
    flex-grow: 1;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.2rem;
}
</style>