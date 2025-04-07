<template>
    <!-- Notification System -->
    <div v-if="notification.show" class="notification-container" :class="notification.type">
        <div class="notification-content">
            <div class="notification-icon">
                <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <svg v-else-if="notification.type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <svg v-else-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <svg v-else-if="notification.type === 'info'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            </div>
            <div class="notification-message">{{ notification.message }}</div>
            <button @click="hideNotification" class="notification-close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="notification-progress-bar"></div>
    </div>
    <div class="booking-wrapper">
        <!-- Header Section -->
        <div class="booking-header">
            <h1>Đặt Lịch Tư Vấn</h1>
            <p>Chọn dịch vụ, bác sĩ và lịch tư vấn phù hợp với nhu cầu của bạn</p>
        </div>

        <!-- Authentication Warning -->
        <div v-if="!authStore.isAuthenticated" class="auth-warning">
            <div class="warning-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
            <div class="warning-content">
                <p>Vui lòng <router-link to="/login" class="login-link">đăng nhập</router-link> để đặt lịch tư vấn</p>
            </div>
        </div>

        <!-- Booking Content -->
        <div v-else-if="service" class="booking-content">
            <!-- Service Information -->
            <section class="booking-section service-section">
                <div class="service-card">
                    <div class="service-image">
                        <img :src="service.image || defaultServiceImage" :alt="service.name">
                    </div>
                    <div class="service-details">
                        <h2 class="service-title">{{ service.name }}</h2>
                        <p class="service-description">{{ service.description || 'Chưa có thông tin chi tiết' }}</p>
                        <div class="service-price">
                            <span class="price-label">Giá dịch vụ:</span>
                            <span class="price-value">{{ formatPrice(service.price) }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Doctor Selection -->
            <section class="booking-section">
                <h3 class="section-title">Chọn Bác Sĩ</h3>
                <div class="doctor-grid">
                    <div v-for="doctor in doctors" :key="doctor.id" class="doctor-card"
                        :class="{ 'selected': selectedDoctor?.id === doctor.id }" @click="selectDoctor(doctor)">
                        <div class="doctor-avatar-container">
                            <img :src="doctor.user?.avatar || defaultAvatarImage" :alt="doctor.user?.fullName"
                                class="doctor-avatar">
                        </div>
                        <div class="doctor-info">
                            <h4 class="doctor-name">{{ doctor.user?.fullName }}</h4>
                            <p class="doctor-specialty">{{ doctor.specialization }}</p>
                            <p class="doctor-experience">{{ doctor.experience }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Schedule Selection -->
            <section v-if="selectedDoctor" class="booking-section">
                <h3 class="section-title">Chọn Lịch Tư Vấn</h3>
                <div class="schedule-container">
                    <div class="calendar-wrapper">
                        <DatePicker v-model="selectedDate" :min-date="new Date()" :attributes="dateAttributes"
                            @dayclick="handleDateSelect" />
                    </div>
                    <div v-if="selectedDate" class="time-slots-wrapper">
                        <h4 class="time-slots-title">Thời gian khả dụng</h4>
                        <div class="time-slots-grid">
                            <button v-for="slot in availableTimeSlots" :key="slot" :class="{
                                'selected': selectedTimeSlot === slot,
                                'unavailable': timeSlotStatus[slot] === 'unavailable'
                            }" @click="selectTimeSlot(slot)" :disabled="timeSlotStatus[slot] === 'unavailable'"
                                class="time-slot-button">
                                {{ slot }}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Payment Section -->
            <section v-if="selectedTimeSlot" class="booking-section payment-section">
                <h3 class="section-title">Thông Tin Thanh Toán</h3>

                <!-- Payment Summary -->
                <div class="payment-summary">
                    <div class="summary-row">
                        <span class="summary-label">Giá dịch vụ:</span>
                        <span class="summary-value">{{ formatPrice(service.price) }}</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row total">
                        <span class="total-label">Tổng cộng</span>
                        <span class="total-value">{{ formatPrice(service.price) }}</span>
                    </div>
                </div>

                <!-- Payment Methods -->
                <div class="payment-methods">
                    <div v-for="(method, index) in paymentMethods" :key="index" class="payment-method"
                        :class="{ 'selected': selectedPaymentMethod === method.id }"
                        @click="selectedPaymentMethod = method.id">
                        <div class="payment-icon">
                            <i :class="method.icon"></i>
                        </div>
                        <span class="payment-name">{{ method.name }}</span>
                    </div>
                </div>

                <!-- Balance Account Info -->
                <div v-if="selectedPaymentMethod === 'balanceAccount'" class="balance-info">
                    <div class="balance-row">
                        <span class="balance-label">Số dư hiện tại:</span>
                        <span class="balance-value">{{ formatCurrency(balanceAccount) }}</span>
                    </div>
                    <div class="balance-row">
                        <span class="balance-label">Tổng thanh toán:</span>
                        <span class="balance-value">{{ formatCurrency(service.price) }}</span>
                    </div>
                    <p v-if="balanceAccount < service.price" class="insufficient-balance">
                        Số dư không đủ để thanh toán
                    </p>
                </div>

                <!-- PayPal Button Container -->
                <div v-if="selectedPaymentMethod === 'paypal'" id="paypal-button-container"
                    class="paypal-button-container"></div>

                <!-- Booking Button -->
                <button v-if="selectedPaymentMethod === 'balanceAccount'" @click="processBooking" class="booking-button"
                    :disabled="!canProcessBooking || balanceAccount < service.price">
                    Đặt lịch và Thanh toán
                </button>

                <button v-if="selectedPaymentMethod === 'paypal'" @click="initPayPalButton"
                    class="booking-button paypal-booking-button" :disabled="!canProcessBooking">
                    Thanh toán bằng PayPal
                </button>
            </section>
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>Đang xử lý...</p>
        </div>

        <!-- Error Modal -->
        <div v-if="errorMessage" class="error-modal">
            <div class="error-content">
                <div class="error-header">
                    <h3>Thông Báo Lỗi</h3>
                </div>
                <div class="error-body">
                    <p>{{ errorMessage }}</p>
                </div>
                <div class="error-footer">
                    <button @click="clearError" class="error-close-button">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@user/stores/auth/useAuthStore';
import { userServiceStore } from '@user/stores/ServiceStore';
import { useDoctorStore } from '@user/stores/DoctorStore'; // Thêm import này
import { authService } from '@user/services/AuthService';
import { DatePicker } from 'v-calendar';
import { loadScript } from '@paypal/paypal-js';
import { serviceBookingService } from '@user/services/ServiceBookingService';
import { AppointmentService } from '@user/services/AppointmentService';
import 'v-calendar/dist/style.css';

// Default image paths
const defaultServiceImage = '@/assets/images/default-service.jpg';
const defaultAvatarImage = '@/assets/images/default-avatar.jpg';

// Store and route initialization
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const serviceStore = userServiceStore();
const doctorStore = useDoctorStore(); // Thêm doctorStore
const appointmentService = new AppointmentService();
// State management
const service = ref(null);
const doctors = ref([]);
const selectedDoctor = ref(null);
const preselectedDoctorId = ref(null); // Thêm biến này để lưu doctorId từ query
const selectedDate = ref(null);
const selectedTimeSlot = ref(null);
const balanceAccount = ref(0);
const dateAttributes = ref([]);
const paypal = ref(null);
const isLoading = ref(false);
const errorMessage = ref(null);
const timeSlotStatus = ref({});

// Notification management
const notification = ref({
    show: false,
    type: 'info', // 'success', 'error', 'warning', 'info'
    message: '',
    duration: 5000 // Mặc định 5 giây
});

let notificationTimeout = null;

const showNotification = (message, type = 'info', duration = 5000) => {
    // Xóa timeout cũ nếu có
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    // Cập nhật thông tin notification
    notification.value = {
        show: true,
        type,
        message,
        duration
    };

    // Thiết lập animation duration cho progress bar
    const progressBar = document.querySelector('.notification-progress-bar::after');
    if (progressBar) {
        progressBar.style.animationDuration = `${duration}ms`;
    }

    // Thiết lập timeout để ẩn notification sau khoảng thời gian
    if (duration > 0) {
        notificationTimeout = setTimeout(() => {
            hideNotification();
        }, duration);
    }
};

const hideNotification = () => {
    notification.value.show = false;
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
};

const showError = (message) => {
    showNotification(message, 'error');
    isLoading.value = false;
};

const clearError = () => {
    errorMessage.value = null;
};

// Available time slots (can be expanded or fetched from a configuration)
const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00'
];

// Currency formatting functions
const formatPrice = (price) => {
    if (price === undefined) return 'Liên hệ để biết giá';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const formatCurrency = (price) => {
    if (!price) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
};

const paymentMethods = [
    { id: 'balanceAccount', name: 'Ví THAPV', icon: 'icofont-credit-card' },
    { id: 'paypal', name: 'PayPal', icon: 'icofont-paypal' },
];
const selectedPaymentMethod = ref('balanceAccount');

// Thay thế hàm fetchDoctorAvailability hiện tại
const fetchDoctorAvailability = async (doctorId) => {
    const attributes = [];
    const today = new Date();

    // Tạo danh sách ngày khả dụng cho 30 ngày tới
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        // Skip Sundays và ngày lễ nếu cần
        if (currentDate.getDay() !== 0) {
            attributes.push({
                dates: currentDate,
                highlight: {
                    color: 'blue',
                    fillMode: 'light'
                }
            });
        }
    }

    return attributes;
};

// Cập nhật hàm selectDoctor
const selectDoctor = async (doctor) => {
    selectedDoctor.value = doctor;

    // Tải lịch khả dụng cho bác sĩ
    dateAttributes.value = await fetchDoctorAvailability(doctor.id);

    // Reset các lựa chọn khác
    selectedDate.value = null;
    selectedTimeSlot.value = null;
    timeSlotStatus.value = {};
};

// Cập nhật hàm handleDateSelect
const handleDateSelect = async (day) => {
    selectedDate.value = day.date;
    selectedTimeSlot.value = null;

    if (selectedDoctor.value) {
        // Tải lịch khả dụng cho ngày được chọn
        await fetchDoctorAvailabilityForDate(selectedDoctor.value.id, day.date);
    }
};

const fetchDoctorAvailabilityForDate = async (doctorId, date) => {
    try {
        const formattedDate = date.toISOString().split('T')[0];

        // Gọi API để lấy các khung giờ đã đặt của bác sĩ trong ngày
        const bookedSlots = await appointmentService.getDoctorBookedSlots(doctorId, formattedDate);

        // Cập nhật trạng thái các khung giờ
        const newTimeSlotStatus = {};
        availableTimeSlots.forEach(slot => {
            // Kiểm tra xem khung giờ đã được đặt chưa
            newTimeSlotStatus[slot] = bookedSlots.includes(slot) ? 'unavailable' : 'available';
        });

        timeSlotStatus.value = newTimeSlotStatus;
    } catch (error) {
        console.error('Lỗi khi tải lịch của bác sĩ cho ngày cụ thể:', error);
        showNotification('Không thể tải lịch bác sĩ. Vui lòng thử lại.', 'error');
    }
};

// Cập nhật hàm selectTimeSlot
const selectTimeSlot = (slot) => {
    // Chỉ cho phép chọn khung giờ còn trống
    if (timeSlotStatus.value[slot] === 'available') {
        selectedTimeSlot.value = slot;
    } else {
        showNotification('Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.', 'warning');
    }
};

// Hàm để tải thông tin bác sĩ cụ thể nếu có doctorId
const fetchDoctorIfNeeded = async () => {
    if (preselectedDoctorId.value) {
        try {
            isLoading.value = true;
            // Tải thông tin chi tiết của bác sĩ
            const doctorInfo = await doctorStore.fetchDoctorById(Number(preselectedDoctorId.value));

            if (doctorInfo) {
                // Kiểm tra xem bác sĩ có trong danh sách không
                const doctorExists = doctors.value.some(doc => doc.id === doctorInfo.id);

                if (!doctorExists) {
                    doctors.value = [doctorInfo, ...doctors.value];
                }

                // Tự động chọn bác sĩ
                selectedDoctor.value = doctorInfo;

                // Tạo lịch khả dụng cho bác sĩ
                dateAttributes.value = await fetchDoctorAvailability(doctorInfo.id);

                console.log('Đã tự động chọn bác sĩ:', doctorInfo);
            } else {
                showError('Không tìm thấy thông tin bác sĩ.');
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin bác sĩ:', error);
            showError('Không thể tải thông tin bác sĩ.');
        } finally {
            isLoading.value = false;
        }
    }
};

// Data initialization
onMounted(async () => {
    try {
        const serviceId = Number(route.params.id);

        if (isNaN(serviceId)) {
            console.error('ID dịch vụ không hợp lệ');
            showError('ID dịch vụ không hợp lệ');
            return;
        }

        // Kiểm tra xem có doctorId trong query không
        if (route.query.doctorId) {
            preselectedDoctorId.value = route.query.doctorId;
            console.log('Đã nhận doctorId từ query:', preselectedDoctorId.value);
        }

        // Fetch service by ID from API
        service.value = await serviceStore.fetchServiceById(serviceId);

        if (!service.value) {
            showError('Không thể tải thông tin dịch vụ');
            return;
        }

        // Extract doctors từ service data
        if (service.value.doctorProfile) {
            doctors.value = [service.value.doctorProfile];
        } else {
            doctors.value = [];
        }

        // Fetch balance account nếu đã đăng nhập
        if (authStore.isAuthenticated && authStore.user) {
            const patientData = await authService.getDataPatient(authStore.user.id);
            balanceAccount.value = patientData.accountBalance ?? 0;
        }

        // Nếu có doctorId được chỉ định, tải thông tin bác sĩ và tự động chọn
        if (preselectedDoctorId.value) {
            await fetchDoctorIfNeeded();
        } else if (doctors.value.length === 1) {
            // Nếu chỉ có 1 bác sĩ, tự động chọn
            await selectDoctor(doctors.value[0]);
        }

        // Initialize PayPal
        try {
            paypal.value = await loadScript({
                clientId: 'ASn-24p2EOa4SW4egAbp2d4mmubSL54sScc77I9jnrZ2zCXnXt4I-VR9gqqbjjeTAAlwWxmeozH9g0mu',
                currency: 'USD'
            });
        } catch (error) {
            console.error('Lỗi khởi tạo PayPal:', error);
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        showError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
        isLoading.value = false;
    }
});

// Booking process validation
const canProcessBooking = computed(() => {
    return selectedDoctor.value &&
        selectedDate.value &&
        selectedTimeSlot.value &&
        (selectedPaymentMethod.value === 'paypal' ||
            (selectedPaymentMethod.value === 'balanceAccount' && balanceAccount.value >= service.value.price)
        );
});

// Cập nhật hàm initPayPalButton
const initPayPalButton = () => {
    if (!paypal.value) {
        showNotification('Không thể khởi tạo PayPal. Vui lòng thử lại.', 'error');
        console.error('PayPal initialization failed');
        return;
    }

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = '';
    }

    try {
        paypal.value.Buttons({
            createOrder: (data, actions) => {
                const total = service.value.price / 23000; // Convert VND to USD
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total.toFixed(2)
                        }
                    }]
                });
            },
            onApprove: async (data, actions) => {
                try {
                    isLoading.value = true;
                    await actions.order.capture();

                    const patientData = await authService.getDataPatient(authStore.user.id);
                    const formattedDate = new Date(selectedDate.value).toISOString().split('T')[0];
                    const bookingData = {
                        serviceId: service.value.id,
                        patientId: patientData.id,
                        doctorId: selectedDoctor.value.id,
                        totalPrice: service.value.price,
                        paymentMethod: 'PAYPAL',
                        status: 'COMPLETED',
                        appointmentDate: formattedDate,
                        appointmentTime: selectedTimeSlot.value
                    };

                    const bookingResult = await serviceBookingService.saveServiceBooking(bookingData);

                    if (bookingResult) {
                        showNotification('Thanh toán PayPal thành công! Đang chuyển hướng...', 'success');
                        setTimeout(() => {
                            router.push('/ListServiceBookings');
                        }, 1500);
                    } else {
                        showNotification('Không thể lưu đặt lịch. Vui lòng thử lại.', 'error');
                        console.error('Booking save failed');
                    }
                } catch (error) {
                    showNotification('Đã có lỗi xảy ra trong quá trình thanh toán.', 'error');
                    console.error('Payment processing error:', error);
                } finally {
                    isLoading.value = false;
                }
            },
            onCancel: () => {
                showNotification('Bạn đã hủy thanh toán PayPal', 'info');
                console.log('PayPal payment cancelled');
            },
            onError: (err) => {
                showNotification('Đã có lỗi với thanh toán PayPal', 'error');
                console.error('PayPal payment error:', err);
            }
        }).render('#paypal-button-container');
    } catch (renderError) {
        showNotification('Không thể hiển thị nút thanh toán PayPal', 'error');
        console.error('PayPal button render error:', renderError);
    }
};

// Cập nhật hàm processBooking
const processBooking = async () => {
    if (!canProcessBooking.value) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'warning');
        return;
    }

    try {
        isLoading.value = true;
        
        // Kiểm tra lại lịch bác sĩ trước khi đặt
        const formattedDate = new Date(selectedDate.value).toISOString().split('T')[0];
        const isAvailable = await appointmentService.checkDoctorAvailability(
            selectedDoctor.value.id, 
            formattedDate, 
            selectedTimeSlot.value
        );
        
        if (!isAvailable) {
            showNotification('Khung giờ này vừa được đặt. Vui lòng chọn khung giờ khác.', 'error');
            await fetchDoctorAvailabilityForDate(selectedDoctor.value.id, selectedDate.value);
            isLoading.value = false;
            return;
        }
        
        const patientData = (await authService.getDataPatient(authStore.user.id));
        
        const bookingData = {
            serviceId: service.value.id,
            patientId: patientData.id,
            doctorId: selectedDoctor.value.id,
            totalPrice: service.value.price,
            paymentMethod: selectedPaymentMethod.value.toUpperCase(),
            status: 'PENDING',
            appointmentDate: formattedDate,
            appointmentTime: selectedTimeSlot.value
        };
        
        const bookingService = await serviceBookingService.saveServiceBooking(bookingData);
        if (bookingService != null) {
            try {
                const patientData = await authService.getDataPatient(authStore.user.id);
                const currentBalance = patientData.accountBalance || 0;
                const newBalance = Math.max(0, currentBalance - service.value.price);

                await authService.updateBalance(patientData.id, newBalance.toFixed(2));
                showNotification('Đặt lịch thành công! Đang chuyển hướng...', 'success');
                
                // Chuyển hướng sau một khoảng thời gian ngắn
                setTimeout(() => {
                    router.push('/ListServiceBookings');
                }, 1500);
            } catch (error) {
                console.error('Lỗi khi cập nhật số dư:', error);
                showNotification('Không thể cập nhật số dư. Vui lòng thử lại.', 'error');
            }
        }
    } catch (error) {
        console.error('Lỗi khi đặt lịch:', error);
        showNotification('Đã có lỗi xảy ra. Vui lòng thử lại.', 'error');
    } finally {
        isLoading.value = false;
    }
};
</script>
<style scope>
/* ==== Reset & Base Styles ==== */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    /* Color System - Professional Healthcare/Medical Palette */
    --color-primary: #0078D7;
    /* Xanh dương y tế chuyên nghiệp */
    --color-primary-dark: #005A9E;
    /* Xanh dương đậm cho hover */
    --color-primary-light: #DEECF9;
    /* Xanh dương nhạt cho highlights */
    --color-accent: #00B294;
    /* Xanh lá chuyên nghiệp cho tính năng thành công */
    --color-text: #323130;
    /* Đen nhạt cho text chính */
    --color-text-light: #605E5C;
    /* Xám đậm cho text phụ */
    --color-background: #F5F9FC;
    /* Nền xanh siêu nhạt */
    --color-white: #FFFFFF;
    /* Trắng */
    --color-border: #E1E1E1;
    /* Xám nhạt cho đường viền */
    --color-error: #D13438;
    /* Đỏ lỗi */
    --color-warning: #FFB900;
    /* Vàng cảnh báo */
    --color-success: #107C10;
    /* Xanh lá thành công */

    /* Spacing System - Nhất quán */
    --space-xs: 0.25rem;
    /* 4px */
    --space-sm: 0.5rem;
    /* 8px */
    --space-md: 1rem;
    /* 16px */
    --space-lg: 1.5rem;
    /* 24px */
    --space-xl: 2rem;
    /* 32px */
    --space-xxl: 3rem;
    /* 48px */

    /* Typography */
    --font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    --font-size-xs: 0.75rem;
    /* 12px */
    --font-size-sm: 0.875rem;
    /* 14px */
    --font-size-md: 1rem;
    /* 16px */
    --font-size-lg: 1.25rem;
    /* 20px */
    --font-size-xl: 1.5rem;
    /* 24px */
    --font-size-xxl: 2rem;
    /* 32px */

    /* Shadows - Tinh tế và hiện đại */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.07), 0 6px 10px rgba(0, 0, 0, 0.05);
    --shadow-focus: 0 0 0 3px rgba(0, 120, 215, 0.3);

    /* Borders */
    --border-radius-sm: 4px;
    --border-radius-md: 6px;
    --border-radius-lg: 8px;
    --border-radius-xl: 12px;

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);

    /* Z-index layers */
    --z-index-dropdown: 10;
    --z-index-sticky: 20;
    --z-index-fixed: 30;
    --z-index-modal-backdrop: 40;
    --z-index-modal: 50;
    --z-index-popover: 60;
    --z-index-tooltip: 70;
}

body {
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    line-height: 1.6;
    color: var(--color-text);
    background-color: #F0F4F8;
    /* Background color for entire page */
}

.time-slot-button.unavailable {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: var(--color-border);
    color: var(--color-text-lighter);
    cursor: not-allowed;
    opacity: 0.7;
    text-decoration: line-through;
}

.time-slot-button.unavailable:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: var(--color-border);
    transform: none;
    box-shadow: none;
}

/* Notification System */
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    z-index: var(--z-index-tooltip);
    box-shadow: var(--shadow-lg);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    background-color: var(--color-white);
    animation: slide-in 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
    border-left: 4px solid;
}

@keyframes slide-in {
    0% {
        transform: translateX(120%);
        opacity: 0;
    }

    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

.notification-container.success {
    border-left-color: var(--color-success);
}

.notification-container.error {
    border-left-color: var(--color-error);
}

.notification-container.warning {
    border-left-color: var(--color-warning);
}

.notification-container.info {
    border-left-color: var(--color-primary);
}

.notification-content {
    display: flex;
    align-items: center;
    padding: var(--space-md);
    position: relative;
}

.notification-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--space-md);
    border-radius: 50%;
}

.notification-container.success .notification-icon {
    color: var(--color-success);
    background-color: rgba(16, 124, 16, 0.1);
}

.notification-container.error .notification-icon {
    color: var(--color-error);
    background-color: rgba(209, 52, 56, 0.1);
}

.notification-container.warning .notification-icon {
    color: var(--color-warning);
    background-color: rgba(255, 185, 0, 0.1);
}

.notification-container.info .notification-icon {
    color: var(--color-primary);
    background-color: rgba(0, 120, 215, 0.1);
}

.notification-icon svg {
    width: 20px;
    height: 20px;
}

.notification-message {
    flex: 1;
    font-size: var(--font-size-md);
    color: var(--color-text);
    padding-right: var(--space-md);
}

.notification-close {
    background: transparent;
    border: none;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-light);
    opacity: 0.7;
    transition: var(--transition-normal);
}

.notification-close:hover {
    opacity: 1;
    transform: scale(1.1);
}

.notification-close svg {
    width: 16px;
    height: 16px;
}

.notification-progress-bar {
    height: 3px;
    background-color: rgba(0, 0, 0, 0.1);
    position: relative;
}

.notification-progress-bar::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    animation: progress-bar-animation 5s linear forwards;
}

.notification-container.success .notification-progress-bar::after {
    background-color: var(--color-success);
}

.notification-container.error .notification-progress-bar::after {
    background-color: var(--color-error);
}

.notification-container.warning .notification-progress-bar::after {
    background-color: var(--color-warning);
}

.notification-container.info .notification-progress-bar::after {
    background-color: var(--color-primary);
}

@keyframes progress-bar-animation {
    0% {
        width: 100%;
    }

    100% {
        width: 0%;
    }
}

/* Base Structure with improved proportions */
.booking-wrapper {
    max-width: 1024px;
    margin: var(--space-xl) auto var(--space-xxl);
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    min-height: 80vh;
    position: relative;
    border: 1px solid var(--color-border);
}

/* Header with modern gradient */
.booking-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: var(--color-white);
    padding: var(--space-xl) var(--space-lg);
    text-align: center;
    position: relative;
}

.booking-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, var(--color-accent), var(--color-primary-light));
    opacity: 0.6;
}

.booking-header h1 {
    font-size: var(--font-size-xxl);
    font-weight: 700;
    margin-bottom: var(--space-sm);
    letter-spacing: -0.01em;
    color: #fff;
}

.booking-header p {
    font-size: var(--font-size-md);
    max-width: 600px;
    margin: 0 auto;
    opacity: 0.9;
}

/* Authentication Warning - More polished */
.auth-warning {
    display: flex;
    align-items: center;
    background-color: rgba(255, 185, 0, 0.08);
    border-left: 4px solid var(--color-warning);
    padding: var(--space-lg);
    margin: var(--space-lg);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
}

.warning-icon {
    width: 42px;
    height: 42px;
    background-color: var(--color-warning);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--space-lg);
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(255, 185, 0, 0.3);
}

.warning-icon svg {
    width: 22px;
    height: 22px;
    color: white;
}

.warning-content p {
    margin: 0;
    font-weight: 500;
}

.login-link {
    color: var(--color-primary);
    font-weight: 600;
    text-decoration: none;
    position: relative;
    padding-bottom: 2px;
    transition: var(--transition-normal);
}

.login-link::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: var(--color-primary);
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.3s ease-out;
}

.login-link:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
}

/* Section Styles - More elegant */
.booking-section {
    padding: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
    position: relative;
}

.booking-section:last-child {
    border-bottom: none;
}

.section-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--space-lg);
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: var(--color-primary);
    border-radius: 3px;
}

/* Service Card with cleaner design */
.service-card {
    display: flex;
    gap: var(--space-lg);
    background-color: var(--color-background);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    transition: var(--transition-normal);
}

.service-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
}

.service-image {
    flex: 0 0 270px;
    height: 250px;
    position: relative;
    overflow: hidden;
}

.service-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
}

.service-card:hover .service-image img {
    transform: scale(1.05);
}

.service-details {
    flex: 1;
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
}

.service-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--space-md);
}

.service-description {
    color: var(--color-text-light);
    margin-bottom: var(--space-lg);
    line-height: 1.6;
    flex: 1;
}

.service-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-white);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
}

.price-label {
    font-weight: 500;
    color: var(--color-text-light);
}

.price-value {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-primary);
}

/* Doctor Selection with sophisticated cards */
.doctor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: var(--space-lg);
}

.doctor-card {
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: var(--transition-normal);
    cursor: pointer;
    border: 1px solid var(--color-border);
    height: 100%;
}

.doctor-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary-light);
}

.doctor-card.selected {
    border-color: var(--color-primary);
    background-color: rgba(0, 120, 215, 0.04);
    box-shadow: 0 0 0 2px var(--color-primary-light);
}

.doctor-avatar-container {
    padding: var(--space-lg) var(--space-lg) var(--space-sm);
    display: flex;
    justify-content: center;
}

.doctor-avatar {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--color-primary-light);
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.doctor-card.selected .doctor-avatar {
    border-color: var(--color-primary);
}

.doctor-card:hover .doctor-avatar {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.doctor-info {
    padding: var(--space-sm) var(--space-lg) var(--space-lg);
    text-align: center;
}

.doctor-name {
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: var(--space-xs);
}

.doctor-specialty {
    color: var(--color-text-light);
    font-size: var(--font-size-sm);
}

/* Schedule with cleaner calendar integration */
.schedule-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
}

.calendar-wrapper {
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    padding: var(--space-md);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
}

.time-slots-wrapper {
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    padding: var(--space-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
}

.time-slots-title {
    font-size: var(--font-size-md);
    font-weight: 600;
    margin-bottom: var(--space-md);
    color: var(--color-primary);
    position: relative;
    display: inline-block;
    padding-bottom: var(--space-xs);
}

.time-slots-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30px;
    height: 2px;
    background-color: var(--color-primary);
}

.time-slots-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
}

.time-slot-button {
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    background-color: var(--color-white);
    color: var(--color-text);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.time-slot-button:hover {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary);
    color: var(--color-primary-dark);
}

.time-slot-button.selected {
    background-color: var(--color-primary);
    color: var(--color-white);
    border-color: var(--color-primary);
    box-shadow: 0 2px 5px rgba(0, 120, 215, 0.3);
}

.time-slot-button.selected::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
}

/* Payment Section with enhanced widgets */
.payment-section {
    background-color: var(--color-background);
}

.payment-summary {
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) 0;
    color: var(--color-text-light);
}

.summary-divider {
    height: 1px;
    width: 100%;
    background-color: var(--color-border);
    margin: var(--space-sm) 0;
}

.summary-label,
.balance-label {
    font-weight: 500;
}

.summary-value,
.balance-value {
    font-weight: 600;
}

.summary-row.total {
    color: var(--color-text);
    font-weight: 600;
    padding-top: var(--space-sm);
}

.total-label {
    font-size: var(--font-size-md);
}

.total-value {
    font-size: var(--font-size-lg);
    color: var(--color-primary);
}

/* Payment Methods with improved cards */
.payment-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
}

.payment-method {
    background-color: var(--color-white);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-lg);
    text-align: center;
    cursor: pointer;
    transition: var(--transition-normal);
    position: relative;
}

.payment-method:hover {
    border-color: var(--color-primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.payment-method.selected {
    border-color: var(--color-primary);
    background-color: rgba(0, 120, 215, 0.04);
    box-shadow: 0 0 0 2px var(--color-primary-light);
}

.payment-method.selected::after {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 30px;
    height: 30px;
    background-color: var(--color-primary);
    border-radius: 50%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.payment-icon {
    font-size: 1.75rem;
    margin-bottom: var(--space-sm);
    color: var(--color-text-light);
    transition: var(--transition-normal);
}

.payment-method.selected .payment-icon {
    color: var(--color-primary);
    transform: scale(1.1);
}

.payment-name {
    font-weight: 500;
    transition: var(--transition-normal);
}

.payment-method.selected .payment-name {
    color: var(--color-primary);
}

/* Balance Info with enhanced styling */
.balance-info {
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
}

.balance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) 0;
}

.insufficient-balance {
    color: var(--color-error);
    text-align: center;
    margin-top: var(--space-md);
    font-weight: 500;
    padding: var(--space-md);
    background-color: rgba(209, 52, 56, 0.08);
    border-radius: var(--border-radius-md);
    border-left: 3px solid var(--color-error);
    display: flex;
    align-items: center;
    justify-content: center;
}

.insufficient-balance::before {
    content: "⚠️";
    margin-right: var(--space-sm);
    font-size: 1.1em;
}

/* Booking Button with improved interaction */
.booking-button {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    background-color: var(--color-primary);
    color: var(--color-white);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 5px rgba(0, 120, 215, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.025em;
    position: relative;
    overflow: hidden;
}

.booking-button:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 120, 215, 0.4);
}

.booking-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 120, 215, 0.3);
}

.booking-button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%, -50%);
    transform-origin: 50% 50%;
}

.booking-button:hover:not(:disabled)::after {
    animation: ripple 1s ease-out;
}

@keyframes ripple {
    0% {
        transform: scale(0, 0);
        opacity: 0.5;
    }

    100% {
        transform: scale(20, 20);
        opacity: 0;
    }
}

.booking-button:disabled {
    background-color: #A0A0A0;
    cursor: not-allowed;
    box-shadow: none;
    opacity: 0.7;
}

.paypal-booking-button {
    background-color: #003087;
}

.paypal-booking-button:hover:not(:disabled) {
    background-color: #001f52;
}

.paypal-button-container {
    margin: var(--space-md) 0;
    min-height: 45px;
}

/* Loading Overlay with cleaner animation */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(3px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: var(--z-index-modal);
    color: var(--color-white);
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    border-top-color: var(--color-white);
    animation: spin 0.8s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
    margin-bottom: var(--space-md);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.loading-overlay p {
    font-size: var(--font-size-md);
    font-weight: 500;
    margin-top: var(--space-sm);
    animation: pulse 1.5s infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

/* Error Modal with improved visuals */
.error-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-index-modal);
}

.error-content {
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    width: 90%;
    max-width: 450px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: center;
}

@keyframes modal-in {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.error-header {
    background: linear-gradient(135deg, var(--color-error) 0%, #E74856 100%);
    color: var(--color-white);
    padding: var(--space-md) var(--space-lg);
    text-align: center;
}

.error-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
}

.error-body {
    padding: var(--space-xl);
    text-align: center;
}

.error-footer {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--color-border);
    background-color: #F9F9F9;
}

.error-close-button {
    background-color: var(--color-primary);
    color: var(--color-white);
    border: none;
    border-radius: var(--border-radius-md);
    padding: var(--space-sm) var(--space-xl);
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.error-close-button:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.error-close-button:active {
    transform: translateY(0);
}

/* Custom styles for v-calendar with better integration */
:deep(.vc-container) {
    border: none;
    font-family: var(--font-family);
    box-shadow: none;
    --gray-900: var(--color-text);
    --gray-700: var(--color-text-light);
    --gray-400: var(--color-border);
    --blue-500: var(--color-primary);
    --blue-600: var(--color-primary-dark);
}

:deep(.vc-header) {
    padding-top: var(--space-md);
}

:deep(.vc-weeks) {
    padding-bottom: var(--space-md);
}

:deep(.vc-day) {
    transition: all 0.2s ease;
}

:deep(.vc-day:not(.on-min-date):not(.on-max-date).is-not-in-month) {
    opacity: 0.3;
}

:deep(.vc-day-content) {
    font-weight: 500;
    color: var(--color-text);
}

:deep(.vc-day:hover .vc-day-content:not(.is-disabled)) {
    background-color: rgba(0, 120, 215, 0.1);
    color: var(--color-primary);
}

:deep(.vc-highlight) {
    background-color: rgba(0, 120, 215, 0.1);
}

:deep(.vc-nav-popover-container) {
    color: var(--color-text);
    font-weight: 500;
}

:deep(.vc-nav-item:hover) {
    background-color: rgba(0, 120, 215, 0.1);
    color: var(--color-primary);
}

:deep(.vc-nav-item.is-active) {
    background-color: var(--color-primary);
    color: var(--color-white);
}

:deep(.vc-nav-item:hover) {
    background-color: rgba(0, 120, 215, 0.1);
}

:deep(.vc-highlight-content-solid) {
    background-color: var(--color-primary);
}

:deep(.vc-highlight-content-outline) {
    border: 1px solid var(--color-primary);
}
</style>