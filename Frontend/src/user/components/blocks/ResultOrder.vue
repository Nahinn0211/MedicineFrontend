<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const orderStatus = ref(null);
const countdown = ref(10);
const statusDetails = ref({
    icon: 'icofont-question-circle text-info',
    title: 'Trạng thái đơn hàng',
    message: 'Không thể xác định trạng thái đơn hàng.'
});

onMounted(() => {
    // Retrieve order result from local storage
    const result = localStorage.getItem('orderResult');
    if (result) {
        try {
            const parsedResult = JSON.parse(result);
            orderStatus.value = parsedResult;
            
            // Determine status details based on the order status
            switch (parsedResult.status) {
                case 'success':
                    statusDetails.value = {
                        icon: 'icofont-check-circled text-success',
                        title: 'Đặt hàng thành công',
                        message: 'Đơn hàng của bạn đã được xác nhận thành công.'
                    };
                    break;
                case 'insufficient-balance':
                    statusDetails.value = {
                        icon: 'icofont-warning-alt text-warning',
                        title: 'Thanh toán không thành công',
                        message: 'Số dư tài khoản không đủ để thanh toán.'
                    };
                    break;
                case 'payment-failed':
                    statusDetails.value = {
                        icon: 'icofont-error text-danger',
                        title: 'Thanh toán thất bại',
                        message: 'Đã có lỗi xảy ra trong quá trình thanh toán.'
                    };
                    break;
                case 'cancelled':
                    statusDetails.value = {
                        icon: 'icofont-close-circled text-secondary',
                        title: 'Đơn hàng đã hủy',
                        message: 'Bạn đã hủy quá trình thanh toán.'
                    };
                    break;
            }

            // Remove the order result from local storage
            localStorage.removeItem('orderResult');
        } catch (error) {
            console.error('Error parsing order result:', error);
        }
    } else {
        // If no result found, redirect to list order
        router.push('/list-order');
    }

    // Start countdown
    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
            router.push('/list-order');
        }
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
});

const navigateToOrderList = () => {
    router.push('/list-order');
};
</script>

<template>
    <div class="order-result-page">
        <div class="order-result-container">
            <div class="order-result-content">
                <div class="order-result-icon">
                    <i :class="statusDetails.icon"></i>
                </div>
                <h2 class="order-result-title">{{ statusDetails.title }}</h2>
                <p class="order-result-message">{{ statusDetails.message }}</p>
                <div class="order-result-countdown">
                    <p>Bạn sẽ được chuyển đến danh sách đơn hàng sau <span class="countdown-highlight">{{ countdown }}</span> giây.</p>
                </div>
                <div class="order-result-actions">
                    <button 
                        class="btn-navigate" 
                        @click="navigateToOrderList"
                    >
                        Chuyển ngay đến Danh sách đơn hàng
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.order-result-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%);
    padding: 20px;
}

.order-result-container {
    width: 100%;
    max-width: 500px;
    background: white;
    border-radius: 16px;
    box-shadow: 
        0 10px 25px rgba(0, 0, 0, 0.1),
        0 6px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.3s ease;
}

.order-result-content {
    padding: 40px 30px;
    text-align: center;
}

.order-result-icon i {
    font-size: 80px;
    margin-bottom: 20px;
    display: block;
    background: linear-gradient(135deg, rgba(225, 36, 84, 0.1), rgba(225, 36, 84, 0.2));
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    border-radius: 50%;
    transition: transform 0.3s ease;
}

.order-result-icon i:hover {
    transform: scale(1.05);
}

.order-result-title {
    font-size: 24px;
    font-weight: 700;
    color: #223a66;
    margin-bottom: 15px;
}

.order-result-message {
    font-size: 16px;
    color: #6F8BA4;
    margin-bottom: 25px;
    line-height: 1.6;
}

.order-result-countdown {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 25px;
}

.countdown-highlight {
    font-weight: bold;
    color: #e12454;
}

.order-result-actions {
    display: flex;
    justify-content: center;
}

.btn-navigate {
    background-color: #e12454;
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 50px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(225, 36, 84, 0.2);
}

.btn-navigate:hover {
    background-color: #c01f45;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(225, 36, 84, 0.3);
}

.text-success {
    color: #28a745;
}

.text-warning {
    color: #ffc107;
}

.text-danger {
    color: #dc3545;
}

.text-secondary {
    color: #6c757d;
}

.text-info {
    color: #17a2b8;
}

@media (max-width: 576px) {
    .order-result-container {
        margin: 0 15px;
        padding: 20px;
    }

    .order-result-icon i {
        font-size: 60px;
        width: 100px;
        height: 100px;
    }

    .order-result-title {
        font-size: 20px;
    }

    .order-result-message {
        font-size: 14px;
    }
}
</style>