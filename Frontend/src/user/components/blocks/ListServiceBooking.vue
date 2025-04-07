<template>
    <!-- Notification System -->
    <transition name="notification-fade">
        <div v-if="notification.show" class="notification" :class="notification.type">
            <div class="notification-icon">
            <svg v-if="notification.type === 'success'" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <svg v-else-if="notification.type === 'error'" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <svg v-else-if="notification.type === 'warning'" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            </div>
            <div class="notification-content">{{ notification.message }}</div>
            <button @click="hideNotification" class="notification-close">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            </button>
        </div>
    </transition>
    <div class="bookings-dashboard">
        <!-- Header Section -->
        <header class="dashboard-header">
            <h1>Lịch Đặt Của Tôi</h1>
            <div class="header-divider"></div>
            <p>Quản lý và theo dõi các dịch vụ tư vấn đã đặt</p>
        </header>

        <!-- Filters Section -->
        <div class="filter-bar">
            <div class="filter-item">
                <label for="status-filter">Trạng Thái:</label>
                <div class="select-wrapper">
                    <select v-model="selectedStatus" id="status-filter">
                        <option value="">Tất Cả</option>
                        <option value="PENDING">Chờ Xác Nhận</option>
                        <option value="CONFIRMED">Đã Xác Nhận</option>
                        <option value="COMPLETED">Hoàn Thành</option>
                        <option value="CANCELLED">Đã Hủy</option>
                    </select>
                    <div class="select-arrow"></div>
                </div>
            </div>

            <div class="filter-item">
                <label for="time-filter">Khoảng Thời Gian:</label>
                <div class="select-wrapper">
                    <select v-model="selectedTimeFrame" id="time-filter">
                        <option value="all">Tất Cả</option>
                        <option value="thisMonth">Tháng Này</option>
                        <option value="lastMonth">Tháng Trước</option>
                        <option value="last3Months">3 Tháng Qua</option>
                    </select>
                    <div class="select-arrow"></div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
            </div>
            <p>Đang tải danh sách lịch đặt...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBookings.length === 0" class="empty-state">
            <div class="empty-icon">
                <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" stroke-width="1" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </div>
            <h3>Bạn chưa có lịch đặt nào</h3>
            <p>Đặt lịch tư vấn với các bác sĩ chuyên khoa ngay hôm nay</p>
            <router-link to="/services" class="btn-primary">
                Đặt Dịch Vụ Ngay
            </router-link>
        </div>

        <!-- Bookings List -->
        <div v-else class="bookings-list">
            <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card"
                :class="getStatusClass(booking.status)">
                <!-- Card Header with Status & Date -->
                <div class="card-header">
                    <div class="status-badge" :class="getStatusClass(getConsultationStatus(booking))">
                        {{ getStatusLabel(getConsultationStatus(booking)) }}
                    </div>
                    <div class="appointment-date">
                        {{ formatBookingDate(booking.appointment.appointmentDate) }}
                    </div>
                </div>

                <!-- Card Body with Service & Doctor Info -->
                <div class="card-body">
                    <div class="service-overview">
                        <div class="service-image-wrapper">
                            <img :src="booking.service.image || defaultServiceImage" :alt="booking.service.name"
                                class="service-image">
                        </div>
                        <div class="service-info">
                            <h3 class="service-name">{{ booking.service.name }}</h3>
                            <div class="doctor-brief">
                                <div class="doctor-avatar-container">
                                    <img :src="booking.doctor.user?.avatar || defaultAvatarImage"
                                        :alt="booking.doctor.user?.fullName" class="doctor-avatar">
                                </div>
                                <span class="doctor-name">BS. {{ booking.doctor.user?.fullName }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="appointment-details">
                        <div class="detail-item">
                            <div class="detail-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2"
                                    fill="none">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Giờ tư vấn:</span>
                                <span class="detail-value">{{ booking.appointment.appointmentTime }}</span>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2"
                                    fill="none">
                                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                    <path d="M7 15h0M12 15h0"></path>
                                    <path d="M17 15h0"></path>
                                </svg>
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Phí dịch vụ:</span>
                                <span class="detail-value highlight">{{ formatPrice(booking.totalPrice) }}</span>
                            </div>
                        </div>

                        <div class="detail-item">
                            <div class="detail-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2"
                                    fill="none">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Thanh toán:</span>
                                <span class="detail-value">{{ getPaymentMethodLabel(booking.paymentMethod) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Footer with Actions -->
                <div v-if="canCancel(booking)" class="card-footer">
                    <div class="action-buttons">
                        <button @click="cancelBooking(booking.id)" class="btn-cancel">Hủy Lịch</button>
                        <button v-if="canStartConsultation(booking)" @click="startConsultation(booking)"
                            class="btn-consult">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2"
                                fill="none">
                                <path d="M23 7l-7 5 7 5V7z"></path>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                            Bắt Đầu Tư Vấn
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1" class="page-btn prev">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Trước
            </button>

            <div class="page-indicator">
                <span>Trang {{ currentPage }} / {{ totalPages }}</span>
            </div>

            <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn next">
                Sau
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
// Giữ nguyên toàn bộ JavaScript
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@user/stores/auth/useAuthStore';
import { serviceBookingService } from '@user/services/ServiceBookingService';
import { appoinmentService } from '@user/services/AppointmentService';
import { consultationService } from '@user/services/ConsultationService';
import { useRouter } from 'vue-router';

// Default image paths
const defaultServiceImage = '@/assets/images/default-service.jpg';
const defaultAvatarImage = '@/assets/images/default-avatar.jpg';

// Store initialization
const authStore = useAuthStore();

// State management
const bookings = ref([]);
const loading = ref(true);
const selectedStatus = ref('');
const selectedTimeFrame = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const error = ref(null);
const notification = ref({
  show: false,
  message: '',
  type: 'success', // 'success', 'error', 'warning', 'info'
  duration: 3000
});

let notificationTimeout = null;

const router = useRouter();

// Hàm hiển thị thông báo
const showNotification = (message, type = 'success', duration = 3000) => {
  // Xóa timeout cũ nếu có
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  
  // Hiển thị thông báo mới
  notification.value = {
    show: true,
    message,
    type,
    duration
  };
  
  // Tự động ẩn sau một khoảng thời gian
  if (duration > 0) {
    notificationTimeout = setTimeout(() => {
      hideNotification();
    }, duration);
  }
};

// Hàm ẩn thông báo
const hideNotification = () => {
  notification.value.show = false;
};

// Fetch bookings with detailed information
const fetchBookings = async () => {
    try {
        loading.value = true;
        error.value = null;

        // Get patient data from auth store
        const patientData = authStore.getPatientData;

        if (!patientData) {
            throw new Error('Không tìm thấy thông tin bệnh nhân');
        }

        // 1. Fetch user bookings từ service booking API
        const bookingsResponse = await serviceBookingService.getUserBookings(patientData.id);
        
        // 2. Fetch thông tin appointment cho mỗi booking
        const bookingsWithDetails = await Promise.all(bookingsResponse.map(async (booking) => {
            try {
                // Chỉ cần gọi 1 API để lấy thông tin appointment
                const appointmentDetail = await appoinmentService.getAppointmentByServiceID(booking.id);
                
                // Kết hợp dữ liệu
                return {
                    ...booking,
                    appointment: appointmentDetail || {
                        appointmentDate: null,
                        appointmentTime: null
                    }
                };
            } catch (detailError) {
                console.error(`Lỗi khi lấy thông tin lịch hẹn cho booking ${booking.id}:`, detailError);
                return {
                    ...booking,
                    appointment: {
                        appointmentDate: null,
                        appointmentTime: null
                    }
                };
            }
        }));
        return bookingsWithDetails;
    } catch (fetchError) {
        console.error('Lỗi khi tải danh sách đặt lịch:', fetchError);
        error.value = 'Không thể tải danh sách đặt lịch. Vui lòng thử lại sau.';
        return [];
    } finally {
        loading.value = false;
    }
};

const canStartConsultation = (booking) => {
    // Chỉ cho phép tham gia nếu booking đã được xác nhận và chưa hoàn thành
    if (booking.status === 'COMPLETED') {
        const now = new Date();
        const appointmentDateTime = new Date(booking.appointment.appointmentDate + 'T' + booking.appointment.appointmentTime);
        
        // Cho phép tham gia từ 30 phút trước giờ hẹn
        const consultationStartTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
        
        // Cho phép tham gia đến 60 phút sau giờ hẹn
        const consultationEndTime = new Date(appointmentDateTime.getTime() + 60 * 60000);
        
        // Kiểm tra thời gian hiện tại có nằm trong khoảng cho phép không
        return now >= consultationStartTime && 
               now <= consultationEndTime && 
               now.toDateString() === appointmentDateTime.toDateString();
    }
    return false;
};

const startConsultation = async (booking) => {
  try {
    // Kiểm tra nếu đã có thông tin consultation trong appointment
    if (booking.appointment && booking.appointment.consultation) {
      const consultationData = booking.appointment.consultation;
      
      // Navigate to consultation page with consultation code
      router.push({
        name: 'ConsultationCall',
        params: {
          consultationCode: consultationData.consultationCode || ''
        },
        query: {
          appointmentId: booking.appointment.id,
          consultationId: consultationData.id
        }
      });
    } else {
      // Fallback: gọi API nếu không có dữ liệu sẵn
      const consultationData = await consultationService.getAppointmentByServiceId(booking.appointment.id);
      if (consultationData) {
        router.push({
          name: 'ConsultationCall',
          params: {
            consultationCode: consultationData.consultationCode || ''
          },
          query: {
            appointmentId: booking.appointment.id,
            consultationId: consultationData.id
          }
        });
      } else {
        showNotification('Không tìm thấy thông tin tư vấn. Vui lòng liên hệ hỗ trợ.', 'error');
      }
    }
  } catch (error) {
    console.error('Lỗi khi bắt đầu tư vấn:', error);
    showNotification('Không thể bắt đầu tư vấn. Vui lòng thử lại.', 'error');
  }
};

// Computed property for filtered and paginated bookings
const filteredBookings = computed(() => {
    let filtered = bookings.value;

    // Filter by status
    if (selectedStatus.value) {
        filtered = filtered.filter(
            booking => booking.status === selectedStatus.value
        );
    }

    // Filter by time frame
    if (selectedTimeFrame.value !== 'all') {
        const now = new Date();
        filtered = filtered.filter(booking => {
            // Đảm bảo booking.appointment tồn tại và có appointmentDate
            if (!booking.appointment || !booking.appointment.appointmentDate) {
                return false;
            }
            
            const bookingDate = new Date(booking.appointment.appointmentDate);
            
            // Kiểm tra nếu ngày không hợp lệ
            if (isNaN(bookingDate.getTime())) {
                return false;
            }

            switch (selectedTimeFrame.value) {
                case 'thisMonth':
                    return bookingDate.getMonth() === now.getMonth()
                        && bookingDate.getFullYear() === now.getFullYear();
                case 'lastMonth':
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                    return bookingDate.getMonth() === lastMonth.getMonth()
                        && bookingDate.getFullYear() === lastMonth.getFullYear();
                case 'last3Months':
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(now.getMonth() - 3);
                    return bookingDate >= threeMonthsAgo;
                default:
                    return true;
            }
        });
    }

    // Paginate
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filtered.slice(start, end);
});

// Computed total pages
const totalPages = computed(() =>
    Math.ceil(bookings.value.length / itemsPerPage.value)
);

// Pagination methods
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

// Utility methods
const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const getStatusLabel = (status) => {
    const statusLabels = {
        'PENDING': 'Chờ Xác Nhận',
        'IN_PROGRESS': 'Đang Tư Vấn',
        'COMPLETED': 'Hoàn Thành',
        'CANCELLED': 'Đã Hủy'
    };
    return statusLabels[status] || status;
};

const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
};

// Hàm lấy trạng thái của consultation
const getConsultationStatus = (booking) => {
    if (booking.appointment && booking.appointment.consultation) {
        return booking.appointment.consultation.status;
    }
    // Fallback về trạng thái của booking nếu không có consultation
    return booking.status;
};

const getPaymentMethodLabel = (method) => {
    const methodLabels = {
        'BALANCEACCOUNT': 'Ví THAPV',
        'PAYPAL': 'PayPal'
    };
    return methodLabels[method] || method;
};

const canCancel = (booking) => {
    return (booking.status === 'COMPLETED') && 
           (booking.appointment && 
            booking.appointment.consultation && 
            booking.appointment.consultation.status != 'COMPLETED');
};

const cancelBooking = async (bookingId) => {
  try {
    loading.value = true;
    const result = await serviceBookingService.cancelServiceBooking(bookingId);
    
    if (result) {
      showNotification('Hủy lịch thành công', 'success');
    }
    
    // Tải lại danh sách bookings
    bookings.value = await fetchBookings();
    
  } catch (error) {
    console.error('Lỗi khi hủy lịch:', error);
    showNotification('Không thể hủy lịch. Vui lòng thử lại sau.', 'error');
  } finally {
    loading.value = false;
  }
};

// Initialization on mount
onMounted(async () => {
    try {
        // Ensure patient data is loaded
        if (!authStore.getPatientData) {
            await authStore.fetchPatientData(authStore.getUserInfo.id);
        }

        // Fetch bookings
        bookings.value = await fetchBookings();
    } catch (mountError) {
        console.error('Lỗi khi khởi tạo trang:', mountError);
        error.value = 'Không thể tải trang. Vui lòng thử lại sau.';
    }
});

// Watch for changes in auth store's patient data
watch(() => authStore.getPatientData, async (newPatientData) => {
    if (newPatientData) {
        bookings.value = await fetchBookings();
    }
});
</script>
<style scoped>
/* === CSS Variables: Color Scheme, Typography, Shadows === */
:root {
    /* Main Colors */
    --color-primary: #3b82f6;
    --color-primary-dark: #2563eb;
    --color-primary-light: #93c5fd;
    --color-primary-50: rgba(59, 130, 246, 0.05);
    --color-primary-100: rgba(59, 130, 246, 0.1);

    /* Secondary Colors */
    --color-secondary: #10b981;
    --color-secondary-dark: #059669;
    --color-secondary-light: #6ee7b7;

    /* Status Colors */
    --color-pending: #f59e0b;
    --color-confirmed: #10b981;
    --color-completed: #3b82f6;
    --color-cancelled: #ef4444;

    /* Neutrals */
    --color-text: #1e293b;
    --color-text-light: #64748b;
    --color-text-lighter: #94a3b8;

    --color-background: #f8fafc;
    --color-background-alt: #f1f5f9;
    --color-white: #ffffff;

    --color-border: #e2e8f0;
    --color-border-light: #f1f5f9;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.5);

    /* Borders */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;

    /* Typography */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* === Base Styles === */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html,
body {
    font-family: var(--font-sans);
    background-color: var(--color-background);
    color: var(--color-text);
    line-height: 1.6;
}

a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
}

a:hover {
    color: var(--color-primary-dark);
}

button {
    cursor: pointer;
    font-family: inherit;
}

/* === Dashboard Layout === */
.bookings-dashboard {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

@media (max-width: 768px) {
    .bookings-dashboard {
        padding: 1rem;
    }
}

/* === Header Section === */
.dashboard-header {
    text-align: center;
    margin-bottom: 2.5rem;
    position: relative;
}

.dashboard-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: 0.75rem;
    letter-spacing: -0.025em;
}

.header-divider {
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
    margin: 1rem auto;
    border-radius: var(--radius-full);
}

.dashboard-header p {
    color: var(--color-text-light);
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto;
}

/* === Filter Bar === */
.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
    background-color: var(--color-white);
    padding: 1.25rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.filter-item {
    flex: 1;
    min-width: 200px;
}

.filter-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--color-text-light);
    font-size: 0.875rem;
}

.select-wrapper {
    position: relative;
}

.select-wrapper select {
    appearance: none;
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    color: var(--color-text);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.select-wrapper select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: var(--shadow-focus);
}

.select-arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--color-text-light);
    pointer-events: none;
}

/* === Loading State === */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.loading-spinner {
    margin-bottom: 1.5rem;
}
/* Notification System */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  min-width: 300px;
  max-width: 450px;
  padding: 1rem;
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  border-left: 4px solid;
}

.notification.success {
  border-left-color: var(--color-confirmed);
}

.notification.error {
  border-left-color: var(--color-cancelled);
}

.notification.warning {
  border-left-color: var(--color-pending);
}

.notification.info {
  border-left-color: var(--color-primary);
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.notification.success .notification-icon {
  color: var(--color-confirmed);
}

.notification.error .notification-icon {
  color: var(--color-cancelled);
}

.notification.warning .notification-icon {
  color: var(--color-pending);
}

.notification.info .notification-icon {
  color: var(--color-primary);
}

.notification-content {
  flex: 1;
  font-size: 0.95rem;
  color: var(--color-text);
}

.notification-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 0.75rem;
  background: transparent;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  opacity: 0.7;
  transition: var(--transition-fast);
}

.notification-close:hover {
  opacity: 1;
}

/* Animation for notification */
.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.notification-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.spinner-ring {
    display: inline-block;
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-primary-light);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-state p {
    color: var(--color-text-light);
    font-size: 1.125rem;
}

/* === Empty State === */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 4rem 2rem;
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background-color: var(--color-primary-50);
    border-radius: var(--radius-full);
    margin-bottom: 1.5rem;
}

.empty-icon svg {
    color: var(--color-primary);
}

.empty-state h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: var(--color-text);
}

.empty-state p {
    color: var(--color-text-light);
    margin-bottom: 1.5rem;
    max-width: 400px;
}

.btn-primary {
    display: inline-block;
    background: linear-gradient(to right, var(--color-primary), var(--color-primary-dark));
    color: var(--color-white);
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    border: none;
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    color: var(--color-white);
}

.btn-primary:active {
    transform: translateY(0);
}

/* === Bookings List === */
.bookings-list {
    display: grid;
    gap: 1.5rem;
}

/* === Booking Card === */
.booking-card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    border-left: 5px solid transparent;
}

.booking-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
}

/* Card Status Colors */
.booking-card.status-pending {
    border-left-color: var(--color-pending);
}

.booking-card.status-confirmed {
    border-left-color: var(--color-confirmed);
}

.booking-card.status-completed {
    border-left-color: var(--color-completed);
}

.booking-card.status-cancelled {
    border-left-color: var(--color-cancelled);
}

/* Card Header */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background-color: var(--color-background-alt);
    border-bottom: 1px solid var(--color-border-light);
}

.status-badge {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: var(--radius-full);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.status-badge.status-pending {
    background-color: rgba(245, 158, 11, 0.1);
    color: var(--color-pending);
}

.status-badge.status-confirmed {
    background-color: rgba(16, 185, 129, 0.1);
    color: var(--color-confirmed);
}

.status-badge.status-completed {
    background-color: rgba(59, 130, 246, 0.1);
    color: var(--color-completed);
}

.status-badge.status-cancelled {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--color-cancelled);
}

.appointment-date {
    font-size: 0.875rem;
    color: var(--color-text-light);
}

/* Card Body */
.card-body {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

@media (max-width: 768px) {
    .card-body {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}

/* Service Overview */
.service-overview {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.service-image-wrapper {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
}

.service-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.service-info {
    flex: 1;
}

.service-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-primary-dark);
    margin-bottom: 0.5rem;
}

.doctor-brief {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.doctor-avatar-container {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 2px solid var(--color-primary-light);
}

.doctor-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.doctor-name {
    font-size: 0.875rem;
    color: var(--color-text-light);
}

/* Appointment Details */
.appointment-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.detail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: var(--color-primary-50);
    border-radius: var(--radius-full);
    color: var(--color-primary);
    flex-shrink: 0;
}

.detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.detail-label {
    font-size: 0.75rem;
    color: var(--color-text-lighter);
    margin-bottom: 0.125rem;
}

.detail-value {
    font-weight: 500;
    color: var(--color-text);
}

.detail-value.highlight {
    color: var(--color-primary-dark);
    font-weight: 600;
}

/* Card Footer */
.card-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--color-border-light);
    background-color: var(--color-background-alt);
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.btn-cancel {
    padding: 0.5rem 1rem;
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 0.875rem;
    transition: all var(--transition-fast);
}

.btn-cancel:hover {
    background-color: var(--color-background);
    border-color: var(--color-text-light);
}

.btn-consult {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #5ab2f3;
    color: var(--color-white);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 0.875rem;
    transition: all var(--transition-fast);
}

.btn-consult:hover {
    background-color: #5ab2f3;
    transform: translateY(-2px);
}

.btn-consult svg {
    width: 16px;
    height: 16px;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
    padding: 1rem;
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.page-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--color-background);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: all var(--transition-fast);
}

.page-btn:not(:disabled):hover {
    background-color: var(--color-primary-50);
    border-color: var(--color-primary);
    color: var(--color-primary);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-indicator {
    margin: 0 1rem;
    color: var(--color-text-light);
    font-size: 0.875rem;
}

/* Focus Styles for Accessibility */
button:focus-visible,
a:focus-visible,
select:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
}

/* Media Queries */
@media (max-width: 576px) {
    .dashboard-header h1 {
        font-size: 1.75rem;
    }

    .service-overview {
        flex-direction: column;
        align-items: flex-start;
    }

    .service-image-wrapper {
        width: 100%;
        height: 160px;
        margin-bottom: 1rem;
    }

    .action-buttons {
        flex-direction: column;
        gap: 0.5rem;
    }

    .btn-cancel,
    .btn-consult {
        width: 100%;
        justify-content: center;
    }
}
</style>