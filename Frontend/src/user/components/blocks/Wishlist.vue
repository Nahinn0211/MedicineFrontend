<template>
    <div class="wishlist-page">
        <div class="container">
            <!-- Notification system -->
            <div class="notification-container" v-if="notification.show">
                <div class="notification" :class="notification.type">
                    <i :class="getNotificationIcon(notification.type)"></i>
                    <span>{{ notification.message }}</span>
                </div>
            </div>
            
            <!-- Breadcrumb Navigation -->
            <div class="breadcrumb">
                <a href="/" class="breadcrumb-link">Trang chủ</a>
                <span class="divider">/</span>
                <span class="current">Danh sách yêu thích</span>
            </div>

            <div class="wishlist-content">
                <h1 class="page-title">Danh sách yêu thích của tôi</h1>

                <!-- Loading indicator -->
                <div v-if="wishlistStore.isLoading" class="loading-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Đang tải...</span>
                    </div>
                    <p>Đang tải danh sách yêu thích...</p>
                </div>

                <!-- Empty state -->
                <div v-else-if="!wishlistStore.wishlistItems.length" class="empty-wishlist">
                    <div class="empty-icon">
                        <i class="icofont-heart"></i>
                    </div>
                    <h2>Danh sách yêu thích của bạn đang trống</h2>
                    <p>Thêm các sản phẩm bạn thích vào danh sách yêu thích. Xem lại chúng bất cứ lúc nào và dễ dàng thêm vào giỏ hàng.</p>
                    <button class="btn-continue-shopping" @click="goToShop">Tiếp tục mua sắm</button>
                </div>

                <!-- Wishlist items -->
                <div v-else class="wishlist-items">
                    <!-- Header -->
                    <div class="wishlist-header">
                        <div class="col-product">Sản phẩm</div>
                        <div class="col-price">Giá</div>
                        <div class="col-actions">Thao tác</div>
                    </div>

                    <!-- Items list -->
                    <div class="wishlist-item" v-for="item in wishlistStore.wishlistItems" :key="`${item.medicineId}_${item.attributeId}`">
                        <div class="col-product">
                            <div class="product-image">
                                <img :src="item.imageUrl || '/assets/images/product-placeholder.jpg'" :alt="item.name">
                            </div>
                            <div class="product-info">
                                <h3 class="product-title">
                                    <a href="#" @click.prevent="viewProductDetail(item.medicineId)">{{ item.name }}</a>
                                </h3>
                                <div class="product-meta" v-if="item.brandName">
                                    <div class="product-brand">
                                        <span>Thương hiệu:</span> {{ item.brandName }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-price">
                            <div class="product-price">
                                <span class="current-price">{{ formatCurrency(item.price) }}</span>
                            </div>
                        </div>

                        <div class="col-actions">
                            <button class="btn-add-to-cart" @click="addToCart(item)">
                                <i class="icofont-cart"></i> Thêm vào giỏ hàng
                            </button>
                            <button class="btn-remove-item" @click="removeItem(item.medicineId, item.attributeId)">
                                <i class="icofont-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Action buttons (visible when items exist) -->
                <div v-if="wishlistStore.wishlistItems.length" class="wishlist-actions">
                    <button class="btn-clear-wishlist" @click="confirmClearWishlist">
                        Xóa tất cả
                    </button>
                    <button class="btn-add-all-to-cart" @click="confirmAddAllToCart">
                        Thêm tất cả vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <div class="modal" v-if="showConfirmModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Xác nhận</h2>
                    <button class="close-modal" @click="showConfirmModal = false">
                        <i class="icofont-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>{{ confirmMessage }}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" @click="showConfirmModal = false">Hủy bỏ</button>
                    <button class="btn-confirm" @click="confirmAction">Xác nhận</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useWishlistStore } from '@user/stores/WishListStore';
import { useCartStore } from '@user/stores/CartStore';
import { useAuthStore } from '@user/stores/auth/useAuthStore';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();

// Stores
const wishlistStore = useWishlistStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

// State
const showConfirmModal = ref(false);
const confirmMessage = ref('');
const pendingAction = ref(null);

// Notification system
const notification = ref({
    show: false,
    message: '',
    type: 'success', // success, error, warning, info
    timeout: null
});

const showNotification = (message, type = 'success', duration = 3000) => {
    // Clear existing timeout if there is one
    if (notification.value.timeout) {
        clearTimeout(notification.value.timeout);
    }

    // Update notification
    notification.value.show = true;
    notification.value.message = message;
    notification.value.type = type;

    // Auto hide after duration
    notification.value.timeout = setTimeout(() => {
        notification.value.show = false;
    }, duration);
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'success': return 'icofont-check-circled';
        case 'error': return 'icofont-close-circled';
        case 'warning': return 'icofont-warning';
        case 'info': return 'icofont-info-circle';
        default: return 'icofont-info-circle';
    }
};

// Computed
const isLoggedIn = computed(() => {
    return authStore.isAuthenticated && !!authStore.user;
});

// Utility functions
const formatCurrency = (price) => {
    if (!price) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
};

// Action handlers
const removeItem = (medicineId, attributeId) => {
    confirmMessage.value = "Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích không?";
    showConfirmModal.value = true;
    pendingAction.value = async () => {
        try {
            const removed = await wishlistStore.removeFromWishlist(medicineId, attributeId);
            if (removed) {
                showNotification("Đã xóa sản phẩm khỏi danh sách yêu thích", "success");
            } else {
                showNotification("Không thể xóa sản phẩm khỏi danh sách yêu thích", "error");
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            showNotification("Đã xảy ra lỗi khi xóa sản phẩm", "error");
        }
    };
};

const confirmClearWishlist = () => {
    confirmMessage.value = "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích không?";
    showConfirmModal.value = true;
    pendingAction.value = async () => {
        try {
            await wishlistStore.clearWishlistAndRemoveCookie();
            showNotification("Đã xóa tất cả sản phẩm khỏi danh sách yêu thích", "success");
        } catch (error) {
            console.error("Lỗi khi xóa tất cả sản phẩm:", error);
            showNotification("Đã xảy ra lỗi khi xóa tất cả sản phẩm", "error");
        }
    };
};

const confirmAddAllToCart = () => {
    if (!wishlistStore.wishlistItems.length) {
        showNotification("Không có sản phẩm nào trong danh sách yêu thích", "warning");
        return;
    }
    
    confirmMessage.value = "Thêm tất cả sản phẩm vào giỏ hàng? Sau khi thêm, danh sách yêu thích sẽ trống.";
    showConfirmModal.value = true;
    pendingAction.value = () => addAllToCart();
};

const confirmAction = async () => {
    if (pendingAction.value) {
        await pendingAction.value();
        pendingAction.value = null;
    }
    showConfirmModal.value = false;
};

const addToCart = async (item) => {
    if (!isLoggedIn.value) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?')) {
            router.push('/auth/login');
        }
        return;
    }

    try {
        await cartStore.syncWithAuthStore();
        
        // Sử dụng rawData để đảm bảo chuyển đúng cấu trúc dữ liệu
        const added = await cartStore.addToCart(
            item.rawData, 
            1, 
            item.patientId
        );

        if (added) {
            // Xóa sản phẩm khỏi danh sách yêu thích sau khi thêm thành công
            const removed = await wishlistStore.removeFromWishlist(item.medicineId, item.attributeId);
            
            if (removed) {
                showNotification(`Đã thêm ${item.name} vào giỏ hàng và xóa khỏi danh sách yêu thích`, "success");
            } else {
                showNotification(`Đã thêm ${item.name} vào giỏ hàng nhưng không thể xóa khỏi danh sách yêu thích`, "warning");
            }
        } else {
            showNotification(`Không thể thêm ${item.name} vào giỏ hàng`, "error");
        }
    } catch (error) {
        console.error(`Lỗi khi xử lý sản phẩm ${item.name}:`, error);
        showNotification(`Đã xảy ra lỗi khi thêm ${item.name} vào giỏ hàng`, "error");
    }
};

const addAllToCart = async () => {
    if (!isLoggedIn.value) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?')) {
            router.push('/auth/login');
        }
        return;
    }

    if (!wishlistStore.wishlistItems.length) {
        showNotification("Không có sản phẩm nào trong danh sách yêu thích", "warning");
        return;
    }

    try {
        await cartStore.syncWithAuthStore();

        // Lưu trữ tạm thời số lượng sản phẩm trước khi thêm
        const totalItems = wishlistStore.wishlistItems.length;
        let successCount = 0;

        // Thêm từng sản phẩm vào giỏ hàng
        for (const item of wishlistStore.wishlistItems) {
            const added = await cartStore.addToCart(
                item.rawData,
                1,
                item.patientId
            );
            
            if (added) {
                successCount++;
            }
        }

        // Xóa tất cả sản phẩm khỏi danh sách yêu thích sau khi thêm vào giỏ hàng
        if (successCount > 0) {
            await wishlistStore.clearWishlistAndRemoveCookie();
            showNotification(`Đã thêm ${successCount}/${totalItems} sản phẩm vào giỏ hàng và xóa danh sách yêu thích`, "success");
        } else {
            showNotification("Không thể thêm sản phẩm nào vào giỏ hàng", "error");
        }
    } catch (error) {
        console.error("Lỗi khi thêm tất cả sản phẩm vào giỏ hàng:", error);
        showNotification("Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng", "error");
    }
};

const viewProductDetail = (medicineId) => {
    router.push(`/Medicine/${medicineId}`);
};

const goToShop = () => {
    router.push('/');
};

onMounted(async () => {
    // Đảm bảo dữ liệu wishlist được tải
    if (isLoggedIn.value) {
        try {
            await wishlistStore.syncWithAuthStore();
        } catch (error) {
            console.error("Lỗi khi đồng bộ danh sách yêu thích:", error);
            showNotification("Không thể tải danh sách yêu thích", "error");
        }
    }
});
</script>


<style scoped>
/* Breadcrumb styles */
.breadcrumb {
    display: flex;
    align-items: center;
    padding: 20px 0;
    margin-bottom: 20px;
    font-size: 14px;
}

.breadcrumb-link {
    color: #5280e2;
    text-decoration: none;
    transition: color 0.3s;
}

.breadcrumb-link:hover {
    color: #355db9;
    text-decoration: underline;
}

.breadcrumb .divider {
    margin: 0 10px;
    color: #888;
}

.breadcrumb .current {
    color: #333;
    font-weight: 500;
}

/* Page title */
.page-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 30px;
    color: #333;
}

/* Loading container */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.loading-container .spinner-border {
    width: 3rem;
    height: 3rem;
    margin-bottom: 15px;
}

/* Empty wishlist */
.empty-wishlist {
    text-align: center;
    padding: 60px 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 40px;
}

.empty-icon {
    font-size: 64px;
    color: #ccc;
    margin-bottom: 20px;
}

.empty-wishlist h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 15px;
    color: #333;
}

.empty-wishlist p {
    font-size: 16px;
    color: #666;
    max-width: 500px;
    margin: 0 auto 30px;
}

.btn-continue-shopping {
    background-color: #5280e2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-continue-shopping:hover {
    background-color: #355db9;
}

/* Wishlist items */
.wishlist-header {
    display: flex;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 8px 8px 0 0;
    font-weight: 600;
    color: #333;
}

.wishlist-item {
    display: flex;
    padding: 20px 15px;
    border-bottom: 1px solid #eee;
    align-items: center;
}

.wishlist-item:last-child {
    border-bottom: none;
    margin-bottom: 20px;
}

.col-product {
    flex: 3;
    display: flex;
    align-items: center;
}

.col-price {
    flex: 1;
}

.col-stock {
    flex: 1;
}

.col-actions {
    flex: 1;
    display: flex;
    gap: 10px;
}

/* Product in wishlist */
.product-image {
    position: relative;
    width: 80px;
    height: 80px;
    margin-right: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f8f8;
}

.product-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.product-info {
    flex: 1;
}

.product-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 8px;
}

.product-title a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s;
}

.product-title a:hover {
    color: #5280e2;
}

.product-meta {
    font-size: 12px;
    color: #777;
}

.product-meta>div {
    margin-bottom: 4px;
}

.product-meta span {
    font-weight: 500;
    color: #555;
}

/* Price styles */
.product-price {
    display: flex;
    align-items: center;
    gap: 8px;
}

.current-price {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.original-price {
    font-size: 14px;
    color: #888;
    text-decoration: line-through;
}

/* Action buttons */
.btn-add-to-cart,
.btn-remove-item {
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s;
}

.btn-add-to-cart {
    background-color: #5280e2;
    color: white;
    flex: 1;
}

.btn-add-to-cart:hover:not(:disabled) {
    background-color: #355db9;
}

.btn-add-to-cart:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
}

.btn-remove-item {
    background-color: #f5f5f5;
    color: #777;
}

.btn-remove-item:hover {
    background-color: #ffebee;
    color: #f44336;
}

/* Wishlist actions */
.wishlist-actions {
    display: flex;
    justify-content: space-between;
    margin: 20px 0 40px;
}

.btn-clear-wishlist,
.btn-add-all-to-cart {
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-clear-wishlist {
    background-color: #f5f5f5;
    color: #333;
}

.btn-clear-wishlist:hover {
    background-color: #ffebee;
    color: #f44336;
}

.btn-add-all-to-cart {
    background-color: #5280e2;
    color: white;
}

.btn-add-all-to-cart:hover:not(:disabled) {
    background-color: #355db9;
}

.btn-add-all-to-cart:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
}

/* Confirmation modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    width: 90%;
    max-width: 400px;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.close-modal {
    background: none;
    border: none;
    font-size: 20px;
    color: #777;
    cursor: pointer;
}

.close-modal:hover {
    color: #f44336;
}

.modal-body {
    padding: 20px;
}

.modal-body p {
    font-size: 14px;
    line-height: 1.6;
    color: #555;
    margin: 0;
}

.modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn-cancel,
.btn-confirm {
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-cancel {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
}

.btn-cancel:hover {
    background-color: #e0e0e0;
}

.btn-confirm {
    background-color: #f44336;
    color: white;
    border: none;
}

.btn-confirm:hover {
    background-color: #e53935;
}

/* Responsive styles */
@media (max-width: 992px) {
    .wishlist-header,
    .wishlist-item {
        padding: 15px 10px;
    }

    .col-actions {
        flex-direction: column;
        gap: 5px;
    }

    .btn-add-to-cart,
    .btn-remove-item {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .wishlist-header {
        display: none;
        /* Hide header on mobile */
    }

    .wishlist-item {
        flex-direction: column;
        padding: 20px;
    }

    .col-product {
        width: 100%;
        margin-bottom: 15px;
    }

    .col-price,
    .col-stock {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .col-price::before {
        content: "Giá:";
        font-weight: 500;
    }

    .col-actions {
        width: 100%;
        flex-direction: row;
    }

    .product-title {
        font-size: 18px;
    }
}

@media (max-width: 576px) {
    .wishlist-actions {
        flex-direction: column;
        gap: 10px;
    }

    .btn-clear-wishlist,
    .btn-add-all-to-cart {
        width: 100%;
    }
}

/* Animation styles */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.wishlist-item {
    animation: fadeIn 0.3s ease-out;
}

/* Empty state icon pulse animation */
@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

.empty-icon {
    animation: pulse 2s infinite;
}
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 300px;
}

.notification {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 10px;
    animation: slide-in 0.3s ease-out forwards;
    color: white;
}

.notification i {
    margin-right: 12px;
    font-size: 18px;
}

.notification.success {
    background-color: #4caf50;
}

.notification.error {
    background-color: #f44336;
}

.notification.warning {
    background-color: #ff9800;
}

.notification.info {
    background-color: #2196f3;
}

@keyframes slide-in {
    0% {
        transform: translateX(100%);
        opacity: 0;
    }

    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Responsive cho thông báo */
@media (max-width: 576px) {
    .notification-container {
        width: calc(100% - 40px);
        max-width: none;
        top: 10px;
        right: 20px;
        left: 20px;
    }
}
</style>