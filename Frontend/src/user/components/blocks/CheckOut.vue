<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@user/stores/CartStore.ts';
import { useAuthStore } from '@user/stores/auth/useAuthStore.ts';
import { authService } from '@user/services/AuthService.js';
import { loadScript } from '@paypal/paypal-js';
import { orderService } from '@user/services/OrderService.js';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const paypal = ref(null);

const currentStep = ref(1);
const orderDetails = ref(null);

const shippingCost = 20000; 
const taxRate = 0.1;
var balanceAccount = 0;
const patientData = ref(null);

const paymentMethods = [
    { id: 'balanceAccount', name: 'Tiền tài khoản', icon: 'icofont-credit-card' },
    { id: 'paypal', name: 'PayPal', icon: 'icofont-paypal' },
    { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: 'icofont-money' }
];

const selectedPaymentMethod = ref('cod');

const shippingInfo = ref({
    email: '',
    fullName: '',
    address: '',
    phone: ''
});

const paymentInfo = ref({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
});

const formatCurrency = (price) => {
    if (!price) return '0đ';
    return price.toLocaleString('vi-VN') + 'đ';
};

onMounted(async () => {
    const storedOrderDetails = localStorage.getItem('orderDetails');

    if (storedOrderDetails) {
        try {
            const parsedDetails = JSON.parse(storedOrderDetails);
            if (parsedDetails && parsedDetails.items && parsedDetails.items.length > 0) {
                orderDetails.value = parsedDetails;
                console.log('Parsed Order Details:', orderDetails.value);
            } else {
                router.push('/shop');
            }
        } catch (error) {
            console.error('Error parsing order details:', error);
            router.push('/shop');
        }

        localStorage.removeItem('orderDetails');
    } else {
        router.push('/shop');
    }
    if (authStore.isAuthenticated && authStore.user) {
        try {
            const userData = await authService.getDataUser(authStore.user.id);
            const patientDataResponse = await authService.getDataPatient(authStore.user.id);
            patientData.value = patientDataResponse;
            balanceAccount = patientDataResponse.accountBalance ?? 0;
            if (userData) {
                shippingInfo.value = {
                    email: userData.email || '',
                    fullName: `${userData.fullName}`.trim(),
                    address: userData.address || '',
                    phone: userData.phone || ''
                };
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    }

    try {
        paypal.value = await loadScript({
            clientId: 'ASn-24p2EOa4SW4egAbp2d4mmubSL54sScc77I9jnrZ2zCXnXt4I-VR9gqqbjjeTAAlwWxmeozH9g0mu',
            currency: 'USD'
        });
    } catch (error) {
        console.error('Lỗi khởi tạo PayPal:', error);
    }
});

const calculateSubtotal = () => {
    return orderDetails.value.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const calculateTax = () => {
    return calculateSubtotal() * taxRate;
};

const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = orderDetails.value.voucherDiscount || 0;
    const shippingCost = orderDetails.value.shippingCost || 20000;

    return subtotal + shippingCost + calculateTax() - discount;
};

const goToStep = (step) => {
    currentStep.value = step;
};

const isShippingFormValid = computed(() => {
    const { email, fullName, address, phone } = shippingInfo.value;
    return email && fullName && address && phone;
});

const isPaymentFormValid = computed(() => {
    if (selectedPaymentMethod.value !== 'credit') return true;

    const { cardName, cardNumber, expiry, cvv } = paymentInfo.value;
    return cardName && cardNumber && expiry && cvv;
});

const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPaymentMethod.value);
};

const handleCodPayment = async () => {
    try {
        const orderData = {
            patientId: patientData.value.id,
            totalPrice: calculateTotal(),
            paymentMethod: 'CASH',
            voucherCode: orderDetails.value.voucher?.code || '',
            discountAmount: orderDetails.value.voucherDiscount || 0,
            note: 'Đơn hàng thanh toán khi nhận hàng',
            status: 'PENDING',
            paymentStatus: 'PENDING'
        };

        const savedOrder = await orderService.createOrder(orderData);
        const orderDetailItems = orderDetails.value.items.map(item => ({
            orderId: savedOrder.id,
            medicineId: item.medicineId,
            attributeId: item.attributeId,
            quantity: item.quantity,
            unitPrice: item.price
        }));
        await orderService.createOrderDetails(orderDetailItems);
        cartStore.clearCartAndRemoveCookie();

        // Save order result to local storage for the result page
        localStorage.setItem('orderResult', JSON.stringify({ status: 'success' }));
        router.push('/order-result');

    } catch (error) {
        console.error('Lỗi khi đặt hàng COD:', error);
        try {
            const failedOrderData = {
                patientId: patientData.value.id,
                totalPrice: calculateTotal(),
                paymentMethod: 'CASH',
                voucherCode: orderDetails.value.voucher?.code || '',
                discountAmount: orderDetails.value.voucherDiscount || 0,
                note: 'Đơn hàng thanh toán khi nhận hàng (LỖI)',
                status: 'PENDING',
                paymentStatus: 'FAILED'
            };

            const savedFailedOrder = await orderService.createOrder(failedOrderData);
            const orderDetailItems = orderDetails.value.items.map(item => ({
                orderId: savedFailedOrder.id,
                medicineId: item.medicineId,
                attributeId: item.attributeId,
                quantity: item.quantity,
                unitPrice: item.price
            }));
            await orderService.createOrderDetails(orderDetailItems);
            
            // Save order result to local storage for the result page
            localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
            router.push('/order-result');
        } catch (secondaryError) {
            console.error('Lỗi thứ cấp khi lưu đơn hàng thất bại:', secondaryError);
            
            // Save order result to local storage for the result page
            localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
            router.push('/order-result');
        }
    }
};

const handleBalancePayment = async () => {
    try {
        if (balanceAccount < calculateTotal()) {
            // Tạo đơn hàng với trạng thái thanh toán thất bại
            const failedOrderData = {
                patientId: patientData.value.id,
                totalPrice: calculateTotal(),
                paymentMethod: 'BALANCEACCOUNT',
                voucherCode: orderDetails.value.voucher?.code || '',
                discountAmount: orderDetails.value.voucherDiscount || 0,
                note: 'Đơn hàng thanh toán bằng số dư tài khoản (Số dư không đủ)',
                status: 'PENDING',
                paymentStatus: 'FAILED'
            };

            const savedFailedOrder = await orderService.createOrder(failedOrderData);
            const orderDetailItems = orderDetails.value.items.map(item => ({
                orderId: savedFailedOrder.id,
                medicineId: item.medicineId,
                attributeId: item.attributeId,
                quantity: item.quantity,
                unitPrice: item.price
            }));
            await orderService.createOrderDetails(orderDetailItems);

            // Save order result to local storage for the result page
            localStorage.setItem('orderResult', JSON.stringify({ status: 'insufficient-balance' }));
            router.push('/order-result');
            return;
        }

        balanceAccount -= calculateTotal();

        await authService.updateBalance(patientData.value.id, balanceAccount);

        const orderData = {
            patientId: patientData.value.id,
            totalPrice: calculateTotal(),
            paymentMethod: 'BALANCEACCOUNT',
            voucherCode: orderDetails.value.voucher?.code || '',
            discountAmount: orderDetails.value.voucherDiscount || 0,
            note: 'Đơn hàng thanh toán bằng số dư tài khoản',
            status: 'COMPLETED',
            paymentStatus: 'COMPLETED'
        };
        const savedOrder = await orderService.createOrder(orderData);

        const orderDetailItems = orderDetails.value.items.map(item => ({
            orderId: savedOrder.id,
            medicineId: item.medicineId,
            attributeId: item.attributeId,
            quantity: item.quantity,
            unitPrice: item.price
        }));
        await orderService.createOrderDetails(orderDetailItems);

        cartStore.clearCartAndRemoveCookie();

        // Save order result to local storage for the result page
        localStorage.setItem('orderResult', JSON.stringify({ status: 'success' }));
        router.push('/order-result');
    } catch (error) {
        console.error('Lỗi khi thanh toán bằng số dư tài khoản:', error);
        
        try {
            const failedOrderData = {
                patientId: patientData.value.id,
                totalPrice: calculateTotal(),
                paymentMethod: 'BALANCEACCOUNT',
                voucherCode: orderDetails.value.voucher?.code || '',
                discountAmount: orderDetails.value.voucherDiscount || 0,
                note: 'Đơn hàng thanh toán bằng số dư tài khoản (LỖI)',
                status: 'PENDING',
                paymentStatus: 'FAILED'
            };

            const savedFailedOrder = await orderService.createOrder(failedOrderData);
            const orderDetailItems = orderDetails.value.items.map(item => ({
                orderId: savedFailedOrder.id,
                medicineId: item.medicineId,
                attributeId: item.attributeId,
                quantity: item.quantity,
                unitPrice: item.price
            }));
            await orderService.createOrderDetails(orderDetailItems);

            // Save order result to local storage for the result page
            localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
            router.push('/order-result');
        } catch (secondaryError) {
            console.error('Lỗi thứ cấp khi lưu đơn hàng thất bại:', secondaryError);
            
            // Save order result to local storage for the result page
            localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
            router.push('/order-result');
        }
    }
};

const initPayPalButton = () => {
    if (!paypal.value) return;

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = '';
    }

    paypal.value.Buttons({
        createOrder: (data, actions) => {
            const total = calculateTotal() / 23000;
            console.log('Creating PayPal order with amount:', total.toFixed(2), 'USD');

            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2)
                    }
                }],
            });
        },
        onApprove: async (data, actions) => {
            try {
                const details = await actions.order.capture();
                console.log('Payment completed - Full details:', details);

                const orderData = {
                    patientId: patientData.value.id,
                    totalPrice: calculateTotal(),
                    paymentMethod: 'PAYPAL',
                    voucherCode: orderDetails.value.voucher?.code || '',
                    discountAmount: orderDetails.value.voucherDiscount || 0,
                    note: 'Đơn hàng thanh toán qua PayPal',
                    status: 'COMPLETED',
                    paymentStatus: 'COMPLETED'
                };

                const savedOrder = await orderService.createOrder(orderData);

                const orderDetailItems = orderDetails.value.items.map(item => ({
                    orderId: savedOrder.id,
                    medicineId: item.medicineId,
                    attributeId: item.attributeId,
                    quantity: item.quantity,
                    unitPrice: item.price
                }));

                await orderService.createOrderDetails(orderDetailItems);

                await orderService.updateOrderStatus(savedOrder.id, 'COMPLETED');

                cartStore.clearCartAndRemoveCookie();

                // Save order result to local storage for the result page
                localStorage.setItem('orderResult', JSON.stringify({ status: 'success' }));
                router.push('/order-result');
            } catch (error) {
                console.error('Error processing payment:', error);
                
                try {
                    const failedOrderData = {
                        patientId: patientData.value.id,
                        totalPrice: calculateTotal(),
                        paymentMethod: 'PAYPAL',
                        voucherCode: orderDetails.value.voucher?.code || '',
                        discountAmount: orderDetails.value.voucherDiscount || 0,
                        note: 'Đơn hàng thanh toán qua PayPal (LỖI)',
                        status: 'PENDING',
                        paymentStatus: 'FAILED'
                    };

                    const savedFailedOrder = await orderService.createOrder(failedOrderData);

                    const orderDetailItems = orderDetails.value.items.map(item => ({
                        orderId: savedFailedOrder.id,
                        medicineId: item.medicineId,
                        attributeId: item.attributeId,
                        quantity: item.quantity,
                        unitPrice: item.price
                    }));

                    await orderService.createOrderDetails(orderDetailItems);

                    // Save order result to local storage for the result page
                    localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
                    router.push('/order-result');
                } catch (secondaryError) {
                    console.error('Lỗi thứ cấp khi lưu đơn hàng thất bại:', secondaryError);
                    
                    // Save order result to local storage for the result page
                    localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
                    router.push('/order-result');
                }
            }
        },
        onCancel: async (data) => {
            try {
                const canceledOrderData = {
                    patientId: patientData.value.id,
                    totalPrice: calculateTotal(),
                    paymentMethod: 'PAYPAL',
                    voucherCode: orderDetails.value.voucher?.code || '',
                    discountAmount: orderDetails.value.voucherDiscount || 0,
                    note: 'Đơn hàng thanh toán qua PayPal (Đã hủy)',
                    status: 'CANCELLED',
                    paymentStatus: 'FAILED'
                };

                const savedCanceledOrder = await orderService.createOrder(canceledOrderData);

                const orderDetailItems = orderDetails.value.items.map(item => ({
                    orderId: savedCanceledOrder.id,
                    medicineId: item.medicineId,
                    attributeId: item.attributeId,
                    quantity: item.quantity,
                    unitPrice: item.price
                }));

                await orderService.createOrderDetails(orderDetailItems);

                // Save order result to local storage for the result page
                localStorage.setItem('orderResult', JSON.stringify({ status: 'cancelled' }));
                router.push('/order-result');
            } catch (error) {
                console.error('Lỗi khi hủy đơn hàng:', error);
                
                // Save order result to local storage for the result page
                localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
                router.push('/order-result');
            }
        },
        onError: async (err) => {
            console.error('Lỗi PayPal:', err);
            
            try {
                const failedOrderData = {
                    patientId: patientData.value.id,
                    totalPrice: calculateTotal(),
                    paymentMethod: 'PAYPAL',
                    voucherCode: orderDetails.value.voucher?.code || '',
                    discountAmount: orderDetails.value.voucherDiscount || 0,
                    note: 'Đơn hàng thanh toán qua PayPal (Lỗi hệ thống)',
                    status: 'PENDING',
                    paymentStatus: 'FAILED'
                };

                const savedFailedOrder = await orderService.createOrder(failedOrderData);

                const orderDetailItems = orderDetails.value.items.map(item => ({
                    orderId: savedFailedOrder.id,
                    medicineId: item.medicineId,
                    attributeId: item.attributeId,
                    quantity: item.quantity,
                    unitPrice: item.price
                }));

                await orderService.createOrderDetails(orderDetailItems);

                // Save order result to local storage for the result page
                localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
                router.push('/order-result');
            } catch (secondaryError) {
                console.error('Lỗi thứ cấp khi lưu đơn hàng thất bại:', secondaryError);
                
                // Save order result to local storage for the result page
                localStorage.setItem('orderResult', JSON.stringify({ status: 'payment-failed' }));
                router.push('/order-result');
            }
        }
    }).render('#paypal-button-container');
};

// Hàm xử lý đặt hàng chung
const placeOrder = async () => {
    // Xác định phương thức thanh toán đã chọn
    const paymentMethod = selectedPaymentMethod.value;

    // Xử lý theo từng loại phương thức thanh toán
    if (paymentMethod === 'cod') {
        await handleCodPayment();
    }
    else if (paymentMethod === 'balanceAccount') {
        await handleBalancePayment();
    }
    // PayPal được xử lý riêng qua nút PayPal
};
</script>

<template>
    <section v-if="orderDetails" class="checkout-section">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="section-title mb-5">
                        <h2>Thanh Toán</h2>
                        <p>Hoàn tất đơn hàng của bạn</p>
                    </div>

                    <div class="checkout-container">
                        <!-- Bên phải - Tóm tắt đơn hàng -->
                        <div class="order-summary">
                            <h3>Tóm Tắt Đơn Hàng</h3>

                            <!-- Danh sách sản phẩm -->
                            <div class="summary-items">
                                <div v-for="item in orderDetails.items" :key="`${item.medicineId}-${item.attributeId}`"
                                    class="summary-item">
                                    <div class="item-image">
                                        <img :src="item.image" :alt="item.name">
                                    </div>
                                    <div class="item-details">
                                        <h4>{{ item.name }}</h4>
                                        <div class="item-info">
                                            <span class="item-brand">{{ item.brandName }}</span>
                                            <span class="item-quantity">SL: {{ item.quantity }}</span>
                                        </div>
                                        <div class="item-price">
                                            <span class="unit-price">{{ formatCurrency(item.price) }}/sản phẩm</span>
                                            <span class="total-price">{{ formatCurrency(item.price * item.quantity)
                                            }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tóm tắt thanh toán -->
                            <div class="summary-calculations">
                                <div class="summary-row">
                                    <span>Tổng phụ</span>
                                    <span>{{ formatCurrency(calculateSubtotal()) }}</span>
                                </div>

                                <!-- Hiển thị voucher nếu có -->
                                <div v-if="orderDetails.voucher" class="summary-row discount">
                                    <span>Giảm giá ({{ orderDetails.voucher.code }})</span>
                                    <span>-{{ formatCurrency(orderDetails.voucherDiscount) }}</span>
                                </div>

                                <div class="summary-row">
                                    <span>Vận chuyển</span>
                                    <span>{{ formatCurrency(orderDetails.shippingCost) }}</span>
                                </div>

                                <div class="summary-row">
                                    <span>Thuế</span>
                                    <span>{{ formatCurrency(calculateTax()) }}</span>
                                </div>

                                <div class="summary-row total">
                                    <span>Tổng cộng</span>
                                    <span>{{ formatCurrency(calculateTotal()) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Bên trái - Thông tin khách hàng -->
                        <div class="checkout-form-container">
                            <!-- Tiến trình thanh toán -->
                            <div class="checkout-steps">
                                <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
                                    <div class="step-number">1</div>
                                    <span class="step-name">Vận chuyển</span>
                                </div>
                                <div class="step-connector"></div>
                                <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
                                    <div class="step-number">2</div>
                                    <span class="step-name">Thanh toán</span>
                                </div>
                                <div class="step-connector"></div>
                                <div class="step" :class="{ active: currentStep >= 3 }">
                                    <div class="step-number">3</div>
                                    <span class="step-name">Xác nhận</span>
                                </div>
                            </div>

                            <!-- Bước 1: Thông tin vận chuyển -->
                            <div v-if="currentStep === 1" class="checkout-step-content">
                                <h3>Thông Tin Vận Chuyển</h3>

                                <div class="form-group">
                                    <label for="email">Địa chỉ Email</label>
                                    <input type="email" id="email" v-model="shippingInfo.email"
                                        placeholder="your@email.com">
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="fullName">Họ Tên</label>
                                        <input type="text" id="fullName" v-model="shippingInfo.fullName"
                                            placeholder="Nhập họ tên">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="address">Địa chỉ</label>
                                    <input type="text" id="address" v-model="shippingInfo.address"
                                        placeholder="Nhập địa chỉ">
                                </div>

                                <div class="form-group">
                                    <label for="phone">Số điện thoại</label>
                                    <input type="tel" id="phone" v-model="shippingInfo.phone"
                                        placeholder="Nhập số điện thoại">
                                </div>

                                <div class="form-action">
                                    <button @click="goToStep(2)" class="btn-next" :disabled="!isShippingFormValid">
                                        Tiếp tục đến Thanh toán
                                    </button>
                                </div>
                            </div>

                            <!-- Bước 2: Thông tin thanh toán -->
                            <div v-if="currentStep === 2" class="checkout-step-content">
                                <h3>Phương Thức Thanh Toán</h3>

                                <div class="payment-methods">
                                    <div v-for="(method, index) in paymentMethods" :key="index" class="payment-method"
                                        :class="{ active: selectedPaymentMethod === method.id }"
                                        @click="selectedPaymentMethod = method.id">
                                        <i :class="method.icon"></i>
                                        <span>{{ method.name }}</span>
                                    </div>
                                </div>

                                <div v-if="selectedPaymentMethod === 'paypal'" id="paypal-button-container"
                                    class="paypal-button-container"></div>

                                <!-- Thanh toán bằng số dư tài khoản -->
                                <div v-if="selectedPaymentMethod === 'balanceAccount'" class="balance-info">
                                    <p>Số dư hiện tại: <strong>{{ formatCurrency(balanceAccount) }}</strong></p>
                                    <p>Tổng thanh toán: <strong>{{ formatCurrency(calculateTotal()) }}</strong></p>
                                    <p v-if="balanceAccount < calculateTotal()" class="text-danger">
                                        Số dư không đủ để thanh toán
                                    </p>
                                </div>

                                <div class="form-action">
                                    <button @click="goToStep(1)" class="btn-back">
                                        Quay lại Vận chuyển
                                    </button>
                                    <button v-if="selectedPaymentMethod === 'paypal'" @click="initPayPalButton"
                                        class="btn-next">
                                        Thanh toán bằng PayPal
                                    </button>
                                    <button v-else @click="goToStep(3)" class="btn-next"
                                        :disabled="selectedPaymentMethod === 'balanceAccount' && balanceAccount < calculateTotal()">
                                        Tiếp tục
                                    </button>
                                </div>
                            </div>

                            <!-- Bước 3: Xác nhận đơn hàng -->
                            <div v-if="currentStep === 3" class="checkout-step-content">
                                <h3>Xác Nhận Đơn Hàng</h3>

                                <div class="review-section">
                                    <h4>Thông Tin Vận Chuyển</h4>
                                    <div class="review-info">
                                        <p><strong>{{ shippingInfo.fullName }}</strong></p>
                                        <p>{{ shippingInfo.address }}</p>
                                        <p>{{ shippingInfo.phone }}</p>
                                        <p>{{ shippingInfo.email }}</p>
                                    </div>
                                </div>

                                <div class="review-section">
                                    <h4>Phương Thức Thanh Toán</h4>
                                    <div class="review-info payment-review">
                                        <i :class="getSelectedPaymentMethod().icon"></i>
                                        <span>{{ getSelectedPaymentMethod().name }}</span>
                                    </div>
                                </div>

                                <div class="form-action">
                                    <button @click="goToStep(2)" class="btn-back">
                                        Quay lại Thanh toán
                                    </button>
                                    <button @click="placeOrder()" class="btn-place-order">
                                        Đặt hàng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<style scoped>
.checkout-section {
    padding: 80px 0;
    background: #f9f9f9;
}

.section-title h2 {
    color: #223a66;
    font-weight: 700;
    margin-bottom: 10px;
}

.checkout-container {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
}

.checkout-form-container {
    flex: 1 1 65%;
    min-width: 300px;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.order-summary {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.summary-items {
    margin-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
}

.summary-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
    border-bottom: none;
}

.item-image {
    width: 60px;
    height: 60px;
    margin-right: 15px;
    border-radius: 4px;
    overflow: hidden;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex-grow: 1;
}

.item-details h4 {
    margin: 0 0 5px 0;
    font-size: 16px;
    color: #333;
}

.item-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    color: #666;
    font-size: 14px;
}

.item-price {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}

.total-price {
    font-weight: bold;
    color: #e12454;
}

.summary-calculations .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.summary-calculations .summary-row:last-child {
    border-bottom: none;
}

.summary-row.total {
    font-weight: bold;
    font-size: 16px;
}

.summary-row.discount {
    color: #28a745;
}

/* Progress Steps */
.checkout-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
    position: relative;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6F8BA4;
    font-weight: bold;
    margin-bottom: 10px;
}

.step.active .step-number {
    background: #e12454;
    color: white;
}

.step.completed .step-number {
    background: #28a745;
    color: white;
}

.step-name {
    color: #6F8BA4;
    font-size: 14px;
}

.step.active .step-name,
.step.completed .step-name {
    color: #223a66;
    font-weight: 600;
}

.step-connector {
    flex: 1;
    height: 2px;
    background: #f0f0f0;
    margin: 0 15px;
    margin-top: -30px;
}

/* Form Styling */
.checkout-step-content {
    padding-top: 20px;
}

.checkout-step-content h3 {
    color: #223a66;
    font-size: 20px;
    margin-bottom: 25px;
    font-weight: 600;
}

.form-group {
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.form-row .form-group {
    flex: 1;
    margin-bottom: 0;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #6F8BA4;
    font-weight: 500;
}

input[type="text"],
input[type="email"],
input[type="tel"] {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    font-size: 15px;
    transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus {
    outline: none;
    border-color: #e12454;
}

.prescription-upload .upload-area {
    border: 2px dashed #e9ecef;
    border-radius: 5px;
    padding: 25px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 10px;
}

.prescription-upload .upload-area:hover {
    border-color: #e12454;
}

.prescription-upload i {
    font-size: 40px;
    color: #6F8BA4;
    margin-bottom: 10px;
}

.prescription-upload span {
    display: block;
    color: #6F8BA4;
}

.prescription-upload input[type="file"] {
    display: none;
}

.upload-note {
    font-size: 13px;
    color: #6F8BA4;
    font-style: italic;
}

/* Form Actions */
.form-action {
    margin-top: 30px;
    display: flex;
    gap: 15px;
    justify-content: flex-end;
}

.btn-next,
.btn-place-order {
    background-color: #e12454;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-next:hover,
.btn-place-order:hover {
    background-color: #c01f45;
}

.btn-back {
    background-color: transparent;
    color: #6F8BA4;
    border: 1px solid #e9ecef;
    padding: 12px 25px;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-back:hover {
    background-color: #f8f9fa;
}

.btn-next:disabled,
.btn-place-order:disabled {
    background-color: #f0f0f0;
    color: #999;
    cursor: not-allowed;
}

/* Payment Methods */
.payment-methods {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
}

.payment-method {
    flex: 1;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

.payment-method i {
    font-size: 24px;
    color: #6F8BA4;
}

.payment-method.active {
    border-color: #e12454;
    background-color: rgba(225, 36, 84, 0.05);
}

.payment-method.active i,
.payment-method.active span {
    color: #e12454;
}

.payment-message {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 5px;
    margin-bottom: 25px;
}

/* Review Order */
.review-section {
    margin-bottom: 30px;
}

.review-section h4 {
    color: #223a66;
    font-size: 16px;
    margin-bottom: 15px;
    font-weight: 600;
}

.review-info {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
}

.review-info p {
    margin: 5px 0;
    color: #6F8BA4;
}

.payment-review {
    display: flex;
    align-items: center;
    gap: 10px;
}

.payment-review i {
    font-size: 20px;
    color: #223a66;
}

.review-items {
    background-color: #f8f9fa;
    border-radius: 5px;
}

.review-item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #e9ecef;
}

.review-item:last-child {
    border-bottom: none;
}

.item-image {
    width: 60px;
    height: 60px;
    overflow: hidden;
    border-radius: 5px;
    margin-right: 15px;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex: 1;
}

.item-details h5 {
    margin: 0 0 5px 0;
    color: #223a66;
    font-weight: 500;
}

.item-quantity {
    color: #6F8BA4;
    font-size: 14px;
}

.item-price {
    font-weight: 600;
    color: #223a66;
}

/* Order Summary */
.order-summary h3 {
    color: #223a66;
    font-size: 20px;
    margin-bottom: 25px;
    font-weight: 600;
}

.summary-items {
    margin-bottom: 20px;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
}

.item-name {
    color: #223a66;
}

.item-qty {
    font-size: 14px;
    color: #6F8BA4;
}

.item-price {
    font-weight: 500;
    color: #223a66;
}

.summary-divider {
    height: 1px;
    background-color: #e9ecef;
    margin: 15px 0;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.summary-row:first-child {
    color: #6F8BA4;
}

.summary-row.total {
    font-weight: 700;
    font-size: 18px;
    color: #223a66;
    margin-top: 5px;
}

.summary-row.discount {
    color: #28a745;
}

.order-security {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.security-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #6F8BA4;
    font-size: 14px;
}

.security-badge i {
    color: #28a745;
}

/* Responsive design */
@media (max-width: 992px) {
    .checkout-container {
        flex-direction: column;
    }

    .order-summary {
        position: static;
        order: -1;
    }
}

@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .payment-methods {
        flex-direction: column;
    }
}
</style>