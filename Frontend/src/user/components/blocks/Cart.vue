<template>
    <section class="cart-section">
        <!-- Hệ thống thông báo -->
        <div class="notification-container" v-if="notification.show">
            <div class="notification" :class="notification.type">
                <i :class="getNotificationIcon(notification.type)"></i>
                <span>{{ notification.message }}</span>
            </div>
        </div>

        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="section-title mb-5">
                        <h2>Giỏ hàng của bạn</h2>
                        <p v-if="cartStore.cartItems.length > 0">Kiểm tra các mục trước khi thanh toán</p>
                        <p v-else>Giỏ hàng của bạn trống</p>
                    </div>

                    <div v-if="cartStore.cartItems.length > 0" class="cart-container">
                        <!-- Cart Items -->
                        <div class="cart-items">
                            <div v-for="item in cartStore.cartItems" :key="`${item.medicineId}-${item.attributeId}`"
                                class="cart-item">
                                <div class="item-image">
                                    <img :src="item.imageUrl || '/placeholder-medicine.png'" :alt="item.name">
                                </div>
                                <div class="item-details">
                                    <h4>{{ item.name }}</h4>
                                    <span class="item-category">{{ item.brandName || 'Không rõ' }}</span>
                                </div>
                                <div class="item-quantity">
                                    <button
                                        @click="updateQuantity(item.medicineId, item.attributeId, item.quantity - 1)"
                                        :disabled="item.quantity <= 1" class="quantity-btn">−</button>
                                    <span class="quantity">{{ item.quantity }}</span>
                                    <button
                                        @click="updateQuantity(item.medicineId, item.attributeId, item.quantity + 1)"
                                        class="quantity-btn">+</button>
                                </div>
                                <div class="item-price">
                                    <span class="price">{{ formatCurrency(item.price * item.quantity) }}</span>
                                    <span class="price-unit">{{ formatCurrency(item.price) }} / sản phẩm</span>
                                </div>
                                <button @click="removeItem(item.medicineId, item.attributeId)" class="remove-btn">
                                    <i class="icofont-trash"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Cart Summary -->
                        <div class="cart-summary">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div class="summary-row">
                                <span>Tổng phụ</span>
                                <span>{{ formatCurrency(cartStore.getTotalPrice()) }}</span>
                            </div>
                            <div class="summary-row">
                                <span>Vận chuyển</span>
                                <span>{{ formatCurrency(shippingCost) }}</span>
                            </div>
                            <div class="summary-row">
                                <span>Thuế</span>
                                <span>{{ formatCurrency(calculateTax()) }}</span>
                            </div>

                            <!-- Voucher discount -->
                            <div v-if="cartStore.voucherDiscount > 0" class="summary-row discount">
                                <span>Giảm giá (Mã: {{ cartStore.userCart.voucher?.code }})</span>
                                <span>-{{ formatCurrency(cartStore.voucherDiscount) }}</span>
                            </div>

                            <div class="summary-row total">
                                <span>Tổng cộng</span>
                                <span>{{ formatCurrency(calculateTotal()) }}</span>
                            </div>

                            <!-- Voucher Input Form -->
                            <div class="promo-container">
                                <input type="text" v-model="promoCode" placeholder="Mã giảm giá"
                                    :disabled="cartStore.isApplyingVoucher || cartStore.userCart.voucher">
                                <button @click="applyPromo" class="promo-btn"
                                    :disabled="cartStore.isApplyingVoucher || cartStore.userCart.voucher">
                                    {{ cartStore.isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng' }}
                                </button>
                            </div>

                            <!-- Applied voucher info -->
                            <div v-if="cartStore.userCart.voucher" class="applied-voucher">
                                <span>Đã áp dụng mã giảm giá: {{ cartStore.userCart.voucher.code }}</span>
                                <button @click="removeVoucher" class="remove-voucher-btn">Xóa</button>
                            </div>

                            <!-- Voucher error message -->
                            <div v-if="cartStore.voucherError" class="voucher-error">
                                {{ cartStore.voucherError }}
                            </div>

                            <button @click="proceedToCheckout" class="checkout-btn">
                                Tiến hành thanh toán
                            </button>
                            <button @click="continueShopping" class="continue-btn">
                                Tiếp tục mua hàng
                            </button>
                        </div>
                    </div>

                    <!-- Empty Cart -->
                    <div v-else class="empty-cart">
                        <div class="empty-cart-icon">
                            <i class="icofont-cart"></i>
                        </div>
                        <h3>Giỏ hàng của bạn trống</h3>
                        <p>Có vẻ như bạn chưa thêm bất kỳ loại thuốc nào vào giỏ hàng.</p>
                        <button @click="continueShopping" class="continue-btn">
                            Bắt đầu mua sắm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '@user/stores/CartStore';
import { useRouter } from 'vue-router';

// Stores
const cartStore = useCartStore();
const router = useRouter();
// Constants
const shippingCost = 20000; // 20,000 VND shipping cost
const taxRate = 0.1; // 10% tax rate

// Promo code state
const promoCode = ref('');

// Cấu trúc thông báo
const notification = ref({
    show: false,
    message: '',
    type: 'success', // success, error, warning, info
    timeout: null
});

// Hàm hiển thị thông báo
const showNotification = (message, type = 'success', duration = 3000) => {
    // Nếu đang có thông báo, xóa timeout cũ
    if (notification.value.timeout) {
        clearTimeout(notification.value.timeout);
    }

    // Cập nhật thông báo mới
    notification.value.show = true;
    notification.value.message = message;
    notification.value.type = type;

    // Tự động ẩn sau duration
    notification.value.timeout = setTimeout(() => {
        notification.value.show = false;
    }, duration);
};

// Lấy icon cho loại thông báo
const getNotificationIcon = (type) => {
    switch (type) {
        case 'success': return 'icofont-check-circled';
        case 'error': return 'icofont-close-circled';
        case 'warning': return 'icofont-warning';
        case 'info': return 'icofont-info-circle';
        default: return 'icofont-info-circle';
    }
};

// Utility functions
const formatCurrency = (price) => {
    if (!price) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
};

// Khởi tạo
onMounted(() => {
    // Đảm bảo giỏ hàng được đồng bộ với trạng thái đăng nhập
    cartStore.syncWithAuthStore();
});

// Cart calculations
const calculateTax = () => {
    return cartStore.getTotalPrice() * taxRate;
};

const calculateTotal = () => {
    let total = cartStore.getTotalPrice() + shippingCost + calculateTax();

    // Trừ giảm giá từ voucher (nếu có)
    if (cartStore.voucherDiscount > 0) {
        total -= cartStore.voucherDiscount;
    }

    return Math.max(0, total); // Đảm bảo tổng không âm
};

// Cart actions
const updateQuantity = (medicineId, attributeId, newQuantity) => {
    const success = cartStore.updateQuantity(medicineId, attributeId, newQuantity);

    if (success) {
        if (newQuantity <= 0) {
            showNotification("Đã xóa sản phẩm khỏi giỏ hàng", "info");
        } else {
            showNotification("Đã cập nhật số lượng sản phẩm", "success");
        }
    } else {
        showNotification("Không thể cập nhật số lượng", "error");
    }
};

const removeItem = (medicineId, attributeId) => {
    const success = cartStore.removeFromCart(medicineId, attributeId);

    if (success) {
        showNotification("Đã xóa sản phẩm khỏi giỏ hàng", "info");
    } else {
        showNotification("Không thể xóa sản phẩm", "error");
    }
};

const applyPromo = async () => {
    if (!promoCode.value) {
        showNotification("Vui lòng nhập mã giảm giá", "warning");
        return;
    }

    const result = await cartStore.applyVoucher(promoCode.value);

    if (result.success) {
        showNotification(result.message, "success");
        promoCode.value = '';
    } else {
        showNotification(result.message, "error");
    }
};

const removeVoucher = () => {
    cartStore.removeVoucher();
    showNotification("Đã xóa mã giảm giá", "info");
};

const proceedToCheckout = () => {
    // Kiểm tra giỏ hàng trống
    if (cartStore.cartItems.length === 0) {
        showNotification("Giỏ hàng của bạn trống", "warning");
        return;
    }

    // Format items to match the exact structure expected by checkout
    const formattedItems = cartStore.cartItems.map(item => ({
        medicineId: item.medicineId,
        attributeId: item.attributeId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        brandName: item.brandName || '',
        // Important: checkout expects "image" but cart uses "imageUrl"
        image: item.imageUrl
    }));

    // Create order details object
    const orderDetails = {
        items: formattedItems,
        voucher: cartStore.userCart.voucher,
        voucherDiscount: cartStore.voucherDiscount,
        shippingCost: shippingCost
    };

    // Log for debugging
    console.log('Saving order details to localStorage:', orderDetails);

    // Save to localStorage
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    // Navigate to checkout
    router.push('/checkout');
};

const continueShopping = () => {
    router.push('/Shop');
};
</script>


<style scoped>
/* Hệ thống thông báo */
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

/* Voucher styles */
.applied-voucher {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    padding: 8px 12px;
    background-color: #e8f5e9;
    border-radius: 4px;
    font-size: 14px;
    color: #2e7d32;
}

.remove-voucher-btn {
    background: none;
    border: none;
    color: #e12454;
    font-size: 12px;
    cursor: pointer;
}

.voucher-error {
    margin: 10px 0;
    padding: 8px 12px;
    background-color: #ffebee;
    border-radius: 4px;
    font-size: 14px;
    color: #c62828;
}

/* Existing cart styles */
.cart-section {
    padding: 80px 0;
    background: #f9f9f9;
}

.section-title h2 {
    color: #223a66;
    font-weight: 700;
    margin-bottom: 10px;
}

.cart-container {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
}

.cart-items {
    flex: 1 1 60%;
    min-width: 300px;
}

.cart-summary {
    flex: 1 1 30%;
    min-width: 300px;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 20px;
    margin-bottom: 15px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.item-image {
    width: 80px;
    height: 80px;
    border-radius: 5px;
    overflow: hidden;
    margin-right: 20px;
    background: #f0f0f0;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex: 1;
}

.item-details h4 {
    color: #223a66;
    margin-bottom: 5px;
}

.item-category {
    color: #e12454;
    font-size: 14px;
    display: block;
    margin-bottom: 5px;
}

.prescription-required {
    color: #f0ad4e;
    font-size: 14px;
    margin: 0;
}

.item-quantity {
    display: flex;
    align-items: center;
    margin: 0 20px;
}

.quantity-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #ddd;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.quantity-btn:hover {
    background: #e1e1e1;
}

.quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.quantity {
    margin: 0 10px;
    min-width: 20px;
    text-align: center;
}

.item-price {
    margin-right: 20px;
    text-align: right;
}

.price {
    display: block;
    font-weight: bold;
    color: #223a66;
    font-size: 16px;
}

.price-unit {
    font-size: 12px;
    color: #6F8BA4;
}

.remove-btn {
    background: none;
    border: none;
    color: #e12454;
    cursor: pointer;
    transition: all 0.3s ease;
}

.remove-btn:hover {
    color: #c11a4a;
}

.cart-summary h3 {
    color: #223a66;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    color: #6F8BA4;
}

.summary-row.total {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
    font-weight: bold;
    font-size: 18px;
    color: #223a66;
}

.summary-row.discount {
    color: #28a745;
}

.promo-container {
    display: flex;
    margin: 20px 0;
}

.promo-container input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px 0 0 5px;
    outline: none;
}

.promo-container input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.promo-btn {
    padding: 10px 15px;
    background: #223a66;
    color: white;
    border: none;
    border-radius: 0 5px 5px 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.promo-btn:hover:not(:disabled) {
    background: #1a2d50;
}

.promo-btn:disabled {
    background-color: #9eb1d5;
    cursor: not-allowed;
}

.checkout-btn {
    display: block;
    width: 100%;
    padding: 12px;
    margin-bottom: 10px;
    background: #e12454;
    color: white;
    border: none;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.checkout-btn:hover {
    background: #c11a4a;
}

.continue-btn {
    display: block;
    width: 100%;
    padding: 12px;
    background: transparent;
    color: #223a66;
    border: 1px solid #223a66;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.continue-btn:hover {
    background: #f0f0f0;
}

.empty-cart {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.empty-cart-icon {
    font-size: 80px;
    color: #ddd;
    margin-bottom: 20px;
}

.empty-cart h3 {
    color: #223a66;
    margin-bottom: 10px;
}

.empty-cart p {
    color: #6F8BA4;
    margin-bottom: 30px;
}

.empty-cart .continue-btn {
    display: inline-block;
    width: auto;
    padding: 12px 30px;
}
</style>