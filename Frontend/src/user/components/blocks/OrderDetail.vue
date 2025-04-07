<template>
    <div class="order-detail-container">
        <div class="container mx-auto px-4 py-8">
            <!-- Hệ thống thông báo nâng cao -->
            <div class="notifications-wrapper">
                <transition-group name="notification-fade" tag="div" class="notification-container">
                    <div v-for="notification in notifications" :key="notification.id" 
                        class="notification-item" 
                        :class="[notification.type, {'notification-with-progress': notification.showProgress}]">
                        
                        <div class="notification-icon">
                            <i :class="getNotificationIcon(notification.type)"></i>
                        </div>
                        
                        <div class="notification-content">
                            <div v-if="notification.title" class="notification-title">
                                {{ notification.title }}
                            </div>
                            <div class="notification-message">
                                {{ notification.message }}
                            </div>
                        </div>
                        
                        <button @click="removeNotification(notification.id)" class="notification-close">
                            <i class="icofont-close"></i>
                        </button>
                        
                        <div v-if="notification.showProgress" class="notification-progress-bar">
                            <div class="notification-progress" :style="{width: notification.progress + '%'}"></div>
                        </div>
                    </div>
                </transition-group>
            </div>

            <div class="max-w-4xl mx-auto">
                <!-- Tiêu đề -->
                <h1 class="text-3xl font-bold text-center text-primary mb-8">
                    Chi Tiết Đơn Hàng
                </h1>

                <!-- Trạng thái tải và lỗi -->
                <div v-if="loading" class="loading-container">
                    <div class="spinner"></div>
                    <p class="loading-text">Đang tải dữ liệu...</p>
                </div>

                <div v-else-if="error" class="error-alert" role="alert">
                    <i class="icofont-warning-alt mr-2"></i>
                    <span>{{ error }}</span>
                </div>

                <!-- Thông tin đơn hàng -->
                <div v-else-if="order" class="order-content">
                    <!-- Thông tin đơn hàng chính -->
                    <div class="order-header">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="order-code">
                                    <span class="label">Mã đơn:</span>
                                    <span class="value">#{{ order.orderCode }}</span>
                                </p>
                                <p class="order-date">
                                    <i class="icofont-calendar mr-1"></i> Ngày đặt: {{ formatDate(order.createdAt) }}
                                </p>
                            </div>

                            <div class="status-badge" :class="getStatusClass(order.status)">
                                <i :class="getStatusIcon(order.status)" class="mr-1"></i>
                                {{ getStatusLabel(order.status) }}
                            </div>
                        </div>

                        <!-- Timeline tiến trình đơn hàng -->
                        <div class="order-timeline">
                            <div class="timeline-step" :class="{ 'active': isStatusActive('PENDING', order.status) }">
                                <div class="timeline-icon">
                                    <i class="icofont-check-circled"></i>
                                </div>
                                <div class="timeline-text">Đặt hàng</div>
                            </div>
                            <div class="timeline-line"></div>
                            <div class="timeline-step"
                                :class="{ 'active': isStatusActive('PROCESSING', order.status) }">
                                <div class="timeline-icon">
                                    <i class="icofont-box"></i>
                                </div>
                                <div class="timeline-text">Xử lý</div>
                            </div>
                            <div class="timeline-line"></div>
                            <div class="timeline-step" :class="{ 'active': isStatusActive('SHIPPING', order.status) }">
                                <div class="timeline-icon">
                                    <i class="icofont-truck"></i>
                                </div>
                                <div class="timeline-text">Giao hàng</div>
                            </div>
                            <div class="timeline-line"></div>
                            <div class="timeline-step" :class="{ 'active': isStatusActive('COMPLETED', order.status) }">
                                <div class="timeline-icon">
                                    <i class="icofont-verification-check"></i>
                                </div>
                                <div class="timeline-text">Hoàn thành</div>
                            </div>
                        </div>
                    </div>

                    <!-- Danh sách sản phẩm -->
                    <div class="order-products">
                        <h2 class="section-title">
                            <i class="icofont-medicine mr-2"></i>Sản phẩm trong đơn
                        </h2>

                        <div class="product-list">
                            <div v-for="item in orderDetails" :key="item.id" class="product-item">
                                <!-- Hình ảnh sản phẩm -->
                                <div class="product-image">
                                    <!-- Sử dụng hình ảnh từ medicine.medias nếu có -->
                                    <img v-if="item.medicine?.medias && item.medicine.medias.find(m => m.mainImage === true)"
                                        :src="item.medicine.medias.find(m => m.mainImage === true).mediaUrl"
                                        :alt="item.medicine.name" />
                                    <div v-else class="placeholder-image">
                                        <i class="icofont-drug"></i>
                                    </div>
                                </div>

                                <!-- Thông tin sản phẩm -->
                                <div class="product-info">
                                    <h3 class="product-name">{{ item.medicine.name }}</h3>
                                    <div class="product-details">
                                        <p class="item-detail">
                                            <i class="icofont-pills mr-1"></i>
                                            <span class="label">Số lượng:</span>
                                            <span class="value">{{ item.quantity }}</span>
                                        </p>
                                        <p class="item-detail">
                                            <i class="icofont-ui-tag mr-1"></i>
                                            <span class="label">Quy cách:</span>
                                            <span class="value">{{ item.attribute.name }}</span>
                                        </p>
                                        <p class="item-detail">
                                            <i class="icofont-money mr-1"></i>
                                            <span class="label">Đơn giá:</span>
                                            <span class="value">{{ formatCurrency(item.unitPrice) }}</span>
                                        </p>
                                        <p class="item-detail">
                                            <i class="icofont-calculator-alt-2 mr-1"></i>
                                            <span class="label">Thành tiền:</span>
                                            <span class="value price">{{ formatCurrency(item.unitPrice * item.quantity)
                                            }}</span>
                                        </p>
                                    </div>
                                </div>

                                
<!-- Phần nâng cấp cho product-review-section -->
<div class="product-review-section">
    <div v-if="canReview && !item.reviewed" class="review-card">
        <h3 class="review-title">Đánh giá sản phẩm</h3>
        <div class="star-rating">
            <template v-for="star in 5" :key="star">
                <span @mouseover="hoveredRating = star" 
                    @mouseleave="hoveredRating = 0"
                    @click="setRating(item, star)" 
                    class="star" 
                    :class="{
                        'active': (item.rating || 0) >= star,
                        'hovered': hoveredRating >= star
                    }">
                    <i class="icofont-star"></i>
                </span>
            </template>
        </div>
        <textarea v-model="item.reviewText"
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm (tùy chọn)"
            class="review-textarea"></textarea>
        <button @click="submitReview(item)" 
            :disabled="!(item.rating > 0)"
            class="review-btn">
            <i class="icofont-paper-plane mr-1"></i> Gửi đánh giá
        </button>
    </div>
    <div v-else-if="item.reviewed" class="review-submitted-card">
        <div class="review-header">
            <div class="submitted-rating">
                <span class="stars">
                    <template v-for="star in 5" :key="star">
                        <span class="star" :class="{ 'active': item.rating >= star }">
                            <i class="icofont-star"></i>
                        </span>
                    </template>
                </span>
                <span class="review-date">
                    <i class="icofont-calendar mr-1"></i> Đã đánh giá vào {{ formatReviewDate(item.reviewedAt) }}
                </span>
            </div>
        </div>
        <p v-if="item.reviewText" class="submitted-review-text">
            <i class="icofont-quote-left quote-icon"></i>
            {{ item.reviewText }}
            <i class="icofont-quote-right quote-icon"></i>
        </p>
    </div>
    <div v-else class="review-not-available">
        <p class="review-message">
            <i class="icofont-info-circle mr-1"></i>
            Chỉ được đánh giá khi đơn hàng đã hoàn tất
        </p>
    </div>
</div>
                            </div>
                        </div>
                    </div>

                    <!-- Thông tin thanh toán -->
                    <div class="payment-summary">
                        <h2 class="section-title">
                            <i class="icofont-bill-alt mr-2"></i>Thông tin thanh toán
                        </h2>

                        <div class="summary-content">
                            <div class="summary-row">
                                <span class="summary-label">Tổng tiền hàng:</span>
                                <span class="summary-value">{{ formatCurrency(calculateSubtotal()) }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Thuế VAT (10%):</span>
                                <span class="summary-value">{{ formatCurrency(calculateTax()) }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Phí vận chuyển:</span>
                                <span class="summary-value">{{ formatCurrency(shippingCost) }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Giảm giá:</span>
                                <span class="summary-value discount">-{{ formatCurrency(order.discountAmount || 0)
                                    }}</span>
                            </div>
                            <div class="summary-row total">
                                <span class="summary-label">Tổng thanh toán:</span>
                                <span class="summary-value total-price">{{ formatCurrency(order.totalPrice ||
                                    calculateTotal()) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Địa chỉ giao hàng -->
                    <div class="shipping-info" v-if="order.address">
                        <h2 class="section-title">
                            <i class="icofont-location-pin mr-2"></i>Địa chỉ giao hàng
                        </h2>

                        <div class="address-content">
                            <p><span class="font-semibold">Người nhận:</span> {{ order.fullname || 'Không có thông tin'
                                }}</p>
                            <p><span class="font-semibold">Số điện thoại:</span> {{ order.phone || 'Không có thông tin'
                                }}</p>
                            <p><span class="font-semibold">Địa chỉ:</span> {{ order.address }}</p>
                        </div>
                    </div>

                    <!-- Các nút hành động -->
                    <div class="action-buttons">
                        <button v-if="canCancel" @click="openCancelOrderModal" class="btn btn-danger mr-2">
                            <i class="icofont-close-line mr-1"></i> Hủy đơn hàng
                        </button>
                        <button @click="goBack" class="btn btn-secondary mr-2">
                            <i class="icofont-history mr-1"></i> Quay lại lịch sử
                        </button>
                        <button @click="continueShopping" class="btn btn-primary">
                            <i class="icofont-shopping-cart mr-1"></i> Tiếp tục mua sắm
                        </button>
                    </div>

                    <!-- Modal hủy đơn hàng - Hiển thị đè lên nội dung -->
                    <div v-if="cancelOrderModal"
                        class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="modal-container">
                            <div class="modal-header">
                                <h2 class="modal-title">Xác Nhận Hủy Đơn Hàng</h2>
                                <button @click="closeCancelOrderModal" class="modal-close">
                                    <i class="icofont-close"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <p class="modal-message">Vui lòng cho biết lý do hủy đơn hàng:</p>
                                <textarea v-model="cancelReason" rows="4" class="modal-textarea"
                                    placeholder="Nhập lý do hủy đơn (bắt buộc)"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button @click="closeCancelOrderModal" class="btn btn-secondary">
                                    Hủy
                                </button>
                                <button @click="confirmCancelOrder" class="btn btn-danger"
                                    :disabled="!cancelReason.trim()">
                                    Xác Nhận Hủy Đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@user/services/OrderService'
import { useAuthStore } from '@user/stores/auth/useAuthStore'
import { authService } from '@user/services/AuthService'
import { reviewService } from '@user/services/ReviewService'

const route = useRoute()
const router = useRouter()
const orderDetails = ref([])
const order = ref(null)
const loading = ref(true)
const error = ref(null)
const authStore = useAuthStore()
const patientData = ref(null)
const userData = ref(null)
const shippingCost = 20000 // Phí vận chuyển 20,000 VND
const taxRate = 0.1 // Thuế suất 10%
const hoveredRating = ref(0)
const cancelOrderModal = ref(false);
const cancelReason = ref('');

// Hệ thống quản lý thông báo
const notifications = ref([]);
let notificationIdCounter = 0;

// Hàm hiển thị thông báo
const showNotification = (message, options = {}) => {
    const id = notificationIdCounter++;
    const type = options.type || 'info';
    const duration = options.duration || 5000;
    const showProgress = options.showProgress !== undefined ? options.showProgress : true;
    
    const notification = {
        id,
        message,
        type,
        title: options.title || null,
        showProgress,
        progress: 100,
        timeoutId: null
    };
    
    // Thêm thông báo vào mảng
    notifications.value.push(notification);
    
    // Nếu hiển thị thanh tiến trình, cập nhật tiến trình
    if (showProgress) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = duration - elapsedTime;
            notification.progress = (remainingTime / duration) * 100;
            
            if (remainingTime <= 0) {
                clearInterval(interval);
            }
        }, 16); // ~60fps
        
        // Lưu interval ID để xóa khi thông báo bị xóa
        notification._intervalId = interval;
    }
    
    // Tự động xóa thông báo sau khoảng thời gian
    if (duration > 0) {
        notification.timeoutId = setTimeout(() => {
            removeNotification(id);
        }, duration);
    }
    
    return id;
};

// Xóa thông báo
const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
        const notification = notifications.value[index];
        
        // Xóa các timer
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }
        if (notification._intervalId) {
            clearInterval(notification._intervalId);
        }
        
        // Xóa khỏi mảng
        notifications.value.splice(index, 1);
    }
};

// Lấy icon tương ứng với loại thông báo
const getNotificationIcon = (type) => {
    return {
        'success': 'icofont-check-circled',
        'error': 'icofont-warning-alt',
        'info': 'icofont-info-circle',
        'warning': 'icofont-exclamation-circle'
    }[type] || 'icofont-info-circle';
};

// Xóa tất cả thông báo khi component bị hủy
onBeforeUnmount(() => {
    notifications.value.forEach(notification => {
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }
        if (notification._intervalId) {
            clearInterval(notification._intervalId);
        }
    });
    notifications.value = [];
});

// Kiểm tra xem có thể đánh giá
const canReview = computed(() => {
    return order.value?.status === 'COMPLETED'
})

// Kiểm tra xem có thể hủy đơn
const canCancel = computed(() => {
    return order.value?.status === 'PENDING'
})

// Mở modal hủy đơn
const openCancelOrderModal = () => {
    cancelReason.value = ''
    cancelOrderModal.value = true
}

// Đóng modal hủy đơn
const closeCancelOrderModal = () => {
    cancelOrderModal.value = false
    cancelReason.value = ''
}

// Xác nhận hủy đơn
const confirmCancelOrder = async () => {
    try {
        if (!cancelReason.value.trim()) {
            showNotification('Vui lòng nhập lý do hủy đơn', { 
                type: 'warning',
                title: 'Thiếu thông tin'
            });
            return;
        }

        await orderService.cancelOrder(order.value.id, cancelReason.value);
        
        // Cập nhật trạng thái đơn hàng
        order.value.status = 'CANCELLED';
        
        // Đóng modal và thông báo
        closeCancelOrderModal();
        showNotification('Đã hủy đơn hàng thành công', { 
            type: 'success',
            title: 'Thành công' 
        });
        
        // Tải lại trang để cập nhật giao diện
        fetchOrderData();
    } catch (error) {
        console.error('Lỗi khi hủy đơn hàng:', error);
        showNotification('Không thể hủy đơn hàng. Vui lòng thử lại.', { 
            type: 'error',
            title: 'Lỗi hệ thống' 
        });
    }
};

const fetchOrderData = async () => {
    try {
        if (authStore.isAuthenticated && authStore.user) {
            const userDataResponse = await authService.getDataUser(authStore.user.id);
            userData.value = userDataResponse;

            const patientDataResponse = await authService.getDataPatient(authStore.user.id);
            patientData.value = patientDataResponse;

            const orderId = route.params.id;

            // Tải thông tin đơn hàng
            order.value = await orderService.getOrder(orderId);

            // Tải chi tiết đơn hàng (đã bao gồm thông tin thuốc và thuộc tính)
            orderDetails.value = await orderService.getOrderDetails(orderId);

            // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
            await checkExistingReviews();
        }
    } catch (err) {
        console.error("Lỗi khi tải dữ liệu đơn hàng:", err);
        error.value = "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.";
        showNotification('Không thể tải thông tin đơn hàng', { 
            type: 'error',
            title: 'Lỗi kết nối' 
        });
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await fetchOrderData();
});

// Kiểm tra đánh giá cho từng sản phẩm
const checkExistingReviews = async () => {
    if (!orderDetails.value || !patientData.value) return;

    // Thêm thông tin về đánh giá cho từng sản phẩm
    for (let item of orderDetails.value) {
        try {
            // Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
            const existingReview = await reviewService.getReviewByMedicineAndUser({
                medicineId: item.medicineId,
                patientId: patientData.value.id
            });

            // Cập nhật thông tin đánh giá vào orderDetails
            item.reviewed = !!existingReview;
            item.reviewData = existingReview || null;
            item.rating = existingReview ? existingReview.rating : 0;
            item.reviewText = existingReview ? existingReview.comment : '';
            item.reviewedAt = existingReview ? existingReview.createdAt : null;
        } catch (error) {
            console.error(`Lỗi khi kiểm tra đánh giá cho sản phẩm ${item.medicineId}:`, error);
        }
    }
};

// Function to set rating for a specific order item
const setRating = (item, rating) => {
    item.rating = rating
}

// Submit review for a specific product - Đã thay alert bằng thông báo tùy chỉnh
const submitReview = async (item) => {
    try {
        // Kiểm tra điều kiện đánh giá
        if (!canReview.value) {
            showNotification('Chỉ được đánh giá khi đơn hàng đã hoàn tất', { 
                type: 'warning',
                title: 'Không thể đánh giá'
            });
            return;
        }

        const reviewData = {
            medicineId: item.medicine.id,
            rating: item.rating,
            comment: item.reviewText || '',
            userId: userData.value.id,
        };
        
        const submittedReview = await reviewService.createReview(reviewData);
        item.reviewed = true;
        item.reviewedAt = new Date();
        item.reviewData = submittedReview;
        showNotification('Cảm ơn bạn đã đánh giá sản phẩm!', { 
            type: 'success',
            title: 'Đánh giá thành công' 
        });
    } catch (error) {
        console.error('Lỗi khi gửi đánh giá:', error);
        if (error.response) {
            showNotification(error.response.data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.', { 
                type: 'error',
                title: 'Lỗi đánh giá' 
            });
        } else if (error.request) {
            showNotification('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối internet.', { 
                type: 'error',
                title: 'Lỗi kết nối' 
            });
        } else {
            showNotification('Đã có lỗi không xác định. Vui lòng thử lại.', { 
                type: 'error',
                title: 'Lỗi hệ thống' 
            });
        }
    }
};

const formatReviewDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Tính tổng tiền sản phẩm
const calculateSubtotal = () => {
    if (!orderDetails.value) return 0;
    return orderDetails.value.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
}

// Tính thuế
const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * taxRate;
}

// Tính tổng thanh toán
const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = order.value?.discountAmount || 0;
    return subtotal + tax + shippingCost - discount;
}

// Kiểm tra trạng thái đơn hàng cho timeline
const isStatusActive = (status, currentStatus) => {
    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex <= currentIndex;
}

// Utility functions
const formatCurrency = (amount) => amount ? amount.toLocaleString('vi-VN') + 'đ' : '0đ'
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const getStatusClass = (status) => ({
    PENDING: 'status-pending',
    PROCESSING: 'status-processing',
    SHIPPING: 'status-shipping',
    COMPLETED: 'status-completed',
    CANCELLED: 'status-cancelled'
})[status] || 'status-default'

const getStatusLabel = (status) => ({
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    SHIPPING: 'Đang giao hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
})[status] || status

const getStatusIcon = (status) => ({
    PENDING: 'icofont-clock-time',
    PROCESSING: 'icofont-gear',
    SHIPPING: 'icofont-truck',
    COMPLETED: 'icofont-verification-check',
    CANCELLED: 'icofont-close'
})[status] || 'icofont-info-circle'

const goBack = () => router.push('/list-order')
const continueShopping = () => router.push('/shop')
</script>

<style scoped>
.order-detail-container {
    background-color: #f9f9f9;
    min-height: 100vh;
    padding: 20px 0;
    font-family: 'Roboto', sans-serif;
}

.text-primary {
    color: #223a66;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
}

.btn-danger {
    background-color: #e53e3e;
    color: white;
}

.btn-danger:hover {
    background-color: #c53030;
}

.btn-danger:disabled {
    background-color: #f5a9a9;
    cursor: not-allowed;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #223a66;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
}

.product-review-section {
    margin-top: 16px;
    padding: 16px;
    background-color: #f9f9fa;
    border-radius: 8px;
}

.star-rating {
    display: flex;
    margin-bottom: 16px;
}

.star {
    font-size: 24px;
    color: #e0e0e0;
    cursor: pointer;
    transition: color 0.2s;
}

.star.active,
.star.hovered {
    color: #ffc107;
}

.review-textarea {
    width: 100%;
    min-height: 100px;
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    resize: vertical;
}

.review-btn {
    background-color: #223a66;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.review-btn:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
}

.review-submitted-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.submitted-rating {
    display: flex;
    align-items: center;
    gap: 12px;
}

.submitted-rating .stars {
    display: flex;
}

.review-date {
    color: #6c757d;
    font-size: 0.875rem;
}

.submitted-review-text {
    color: #495057;
    font-style: italic;
    padding: 12px;
    background-color: #f1f3f5;
    border-radius: 8px;
}

.quote-icon {
    font-size: 12px;
    vertical-align: super;
    opacity: 0.6;
}

.loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 16px;
}

.error-alert {
    background-color: #fff5f5;
    color: #e53e3e;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.order-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.order-header,
.order-products,
.payment-summary,
.shipping-info {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 24px;
    overflow: hidden;
}

.order-code {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
}

.order-date {
    font-size: 14px;
    color: #666;
}

.label {
    color: #666;
    font-weight: 500;
}

.value {
    color: #333;
    font-weight: 600;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #223a66;
    border-bottom: 1px solid #eee;
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
}

.status-badge {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    line-height: 1;
}

.status-pending {
    background-color: #FEF3C7;
    color: #92400E;
}

.status-processing {
    background-color: #E0F2FE;
    color: #0369A1;
}

.status-shipping {
    background-color: #DBEAFE;
    color: #1E40AF;
}

.status-completed {
    background-color: #DCFCE7;
    color: #15803D;
}

.status-cancelled {
    background-color: #FEE2E2;
    color: #B91C1C;
}

.order-timeline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
    padding: 8px 0;
}

.timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 1;
}

.timeline-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #e9ecef;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
}

.timeline-step.active .timeline-icon {
    background-color: #223a66;
    color: white;
}

.timeline-text {
    font-size: 12px;
    font-weight: 500;
    color: #6c757d;
    transition: all 0.3s ease;
}

.timeline-step.active .timeline-text {
    color: #223a66;
    font-weight: 600;
}

.timeline-line {
    flex-grow: 1;
    height: 2px;
    background-color: #e9ecef;
    margin: 0 8px;
}

.product-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.product-item {
    display: flex;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
}

.product-item:last-child {
    border-bottom: none;
}

.product-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f8f9fa;
    flex-shrink: 0;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.placeholder-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #adb5bd;
    font-size: 24px;
}

.product-info {
    flex-grow: 1;
}

.product-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.product-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-detail {
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
}

.item-detail .label {
    margin-right: 4px;
}

.item-detail .price {
    color: #e12454;
}

.summary-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.summary-label {
    color: #666;
    font-weight: 500;
}

.summary-value {
    font-weight: 600;
    color: #333;
}

.summary-value.discount {
    color: #15803D;
}

.summary-row.total {
    border-top: 1px dashed #ddd;
    margin-top: 8px;
    padding-top: 16px;
}

.total-price {
    font-size: 20px;
    font-weight: 700;
    color: #e12454;
}

.address-content {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 8px;
}

.btn {
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    padding: 12px 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border: none;
}

.btn-primary {
    background-color: #223a66;
    color: white;
}

.btn-primary:hover {
    background-color: #1a2e52;
}

.btn-secondary {
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #ddd;
}

.btn-secondary:hover {
    background-color: #e9ecef;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
        gap: 12px;
    }

    .order-timeline {
        flex-wrap: wrap;
    }

    .timeline-step {
        min-width: 90px;
        margin-bottom: 16px;
    }

    .timeline-line {
        min-width: 40px;
    }

    .product-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .product-image {
        width: 100%;
        height: 200px;
    }
}

/* Hệ thống thông báo nâng cao */
.notifications-wrapper {
    position: fixed;
    top: 20px;
    left: 0;
    right: 0;
    z-index: 9999;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
}

.notification-container {
    width: 100%;
    max-width: 800px;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.notification-item.full-width {
    width: 100%;
}

.notification-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    padding: 16px;
    border-radius: 10px;
    background-color: white;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    pointer-events: auto;
    overflow: hidden;
    transition: all 0.3s ease;
}

.notification-with-progress {
    padding-bottom: 28px;
}

.notification-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 5px;
    height: 100%;
}

.notification-item.success::before { background-color: #10b981; }
.notification-item.error::before { background-color: #ef4444; }
.notification-item.warning::before { background-color: #f59e0b; }
.notification-item.info::before { background-color: #3b82f6; }

.notification-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    margin-right: 12px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-item.success .notification-icon { color: #10b981; }
.notification-item.error .notification-icon { color: #ef4444; }
.notification-item.warning .notification-icon { color: #f59e0b; }
.notification-item.info .notification-icon { color: #3b82f6; }

.notification-content {
    flex: 1;
    padding-right: 10px;
}

.notification-title {
    font-weight: 600;
    font-size: 15px;
    color: #1f2937;
    margin-bottom: 4px;
}

.notification-message {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.5;
}

.notification-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: #9ca3af;
    font-size: 16px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
    flex-shrink: 0;
}

.notification-close:hover {
    color: #4b5563;
}

.notification-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: #e5e7eb;
    overflow: hidden;
}

.notification-progress {
    height: 100%;
    transition: width 0.1s linear;
}

.notification-item.success .notification-progress { background-color: #10b981; }
.notification-item.error .notification-progress { background-color: #ef4444; }
.notification-item.warning .notification-progress { background-color: #f59e0b; }
.notification-item.info .notification-progress { background-color: #3b82f6; }

/* Hiệu ứng xuất hiện/biến mất cho thông báo */
.notification-fade-enter-active,
.notification-fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.notification-fade-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.notification-fade-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

/* Đáp ứng cho các thiết bị nhỏ */
@media (max-width: 480px) {
    .notifications-wrapper {
        padding: 0 10px;
    }
    
    .notification-container {
        padding: 0;
    }
    
    .notification-item {
        width: 100%;
    }
}

/* Modal styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-container {
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    width: 95%;
    max-width: 500px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: modalFadeIn 0.3s ease;
    position: relative;
    z-index: 10000;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.modal-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #6b7280;
    transition: color 0.2s;
}

.modal-close:hover {
    color: #ef4444;
}

.modal-body {
    padding: 24px;
}

.modal-message {
    font-size: 15px;
    color: #4b5563;
    margin-bottom: 16px;
}

.modal-textarea {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    resize: vertical;
    min-height: 120px;
    transition: border-color 0.2s;
}

.modal-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
}
</style>