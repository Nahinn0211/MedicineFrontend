<template>
    <section :class="`medicine-${type}`">
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
                    <div v-if="!isLoggedIn" class="login-notice-bar">
                        <i class="icofont-info-circle"></i>
                        <span>Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng hoặc danh sách yêu thích.</span>
                        <button @click="router.push('/auth/login')" class="btn-login-small">Đăng nhập</button>
                    </div>
                    <div class="section-title text-center mb-5">
                        <h1>{{ title }}</h1>
                    </div>

                    <!-- Loading indicator -->
                    <div v-if="isLoading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Đang tải...</span>
                        </div>
                    </div>

                    <!-- Error message -->
                    <div v-else-if="error" class="alert alert-danger text-center">
                        {{ error }}
                    </div>

                    <!-- No data message -->
                    <div v-else-if="!hasMedicines" class="alert alert-info text-center">
                        Không có sản phẩm {{ type === 'news' ? 'mới' : 'bán chạy' }} nào.
                    </div>

                    <!-- Medicine Slider -->
                    <div v-else class="medicine-slider">
                        <div class="slider-header d-flex justify-content-between align-items-center mb-4">
                            <!-- Categories -->
                            <div class="categories">
                                <button v-for="(category, index) in categoryStore.categories" :key="index"
                                    @click="filterByCategory(category.id.toString())" class="category-btn me-2"
                                    :class="{ active: selectedCategory === category.id.toString() }">
                                    {{ category.name }}
                                </button>
                            </div>

                            <!-- Controls -->
                            <div class="slider-controls">
                                <button class="control-btn prev" @click="slidePrev">
                                    <i class="icofont-arrow-left"></i>
                                </button>
                                <button class="control-btn next" @click="slideNext">
                                    <i class="icofont-arrow-right"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Slider Track -->
                        <div class="slider-container">
                            <div class="slider-track" :style="{ transform: `translateX(${-currentSlide * 280}px)` }">
                                <!-- Medicine Items -->
                                <div v-for="(medicine, index) in filteredMedicines"
                                    :key="medicine.id || index" class="medicine-item">
                                    <div class="medicine-image">
                                        <img v-if="medicine.mainImageUrl" :src="medicine.mainImageUrl"
                                            :alt="medicine.name">
                                    </div>
                                    <div class="medicine-info">
                                        <div class="medicine-category text-center"
                                            v-if="medicine.categoryNames">
                                            {{ medicine.categoryNames }}
                                        </div>
                                        <div class="product-category text-center" v-if="medicine.brandName">
                                            {{ medicine.brandName }}
                                        </div>
                                        <h3 class="product-title text-center">
                                            <router-link :to="`/Medicine/${medicine.id}`">
                                                {{ medicine.name }}
                                            </router-link>
                                        </h3>

                                        <div class="product-price">
                                            <template v-if="medicine.hasDiscount && medicine.originalPrice">
                                                <div class="text-center w-100">
                                                    <span class="original-price">
                                                        {{ formatCurrency(medicine.originalPrice) }}
                                                    </span>
                                                    <span class="current-price">
                                                        {{ formatCurrency(medicine.discountedPrice) }}
                                                    </span>
                                                </div>
                                            </template>

                                            <!-- Trường hợp không có giảm giá nhưng có thông tin giá -->
                                            <template v-else-if="medicine.originalPrice">
                                                <span class="current-price">
                                                    {{ formatCurrency(medicine.originalPrice) }}
                                                </span>
                                            </template>

                                            <!-- Fallback cuối cùng khi không có thông tin giá -->
                                            <template v-else>
                                                <span class="current-price">Chưa có thông tin giá</span>
                                            </template>
                                        </div>

                                        <div class="product-actions-list">
                                            <button class="btn-add-cart" @click="addToCart(medicine)"
                                                :disabled="!isLoggedIn || medicine.outOfStock">
                                                {{ medicine.outOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng' }}
                                            </button>
                                            <button class="btn-add-wishlist" @click="addToWishlist(medicine)"
                                                :class="{ 'in-wishlist': isLoggedIn && medicine.inWishlist }">
                                                <i :class="isLoggedIn && medicine.inWishlist ? 'icofont-heart' : 'icofont-heart-alt'"></i>
                                                {{ isLoggedIn && medicine.inWishlist ? 'Đã yêu thích' : 'Thêm vào yêu thích' }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination Dots -->
                        <div class="slider-pagination">
                            <span v-for="(_, index) in paginationDots" :key="index" class="dot"
                                :class="{ active: Math.floor(currentSlide / slidesToShow) === index }"
                                @click="goToPage(index)">
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { authService } from '@user/services/AuthService';
import { useAuthStore } from '@user/stores/auth/useAuthStore';
import { useCartStore } from '@user/stores/CartStore';
import { useCategoryStore } from '@user/stores/CategoryStore';
import { useHomeStore } from '@user/stores/HomeStore';
import { useWishlistStore } from '@user/stores/WishListStore';
import { ref, computed, onMounted, watch, defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    type: {
        type: String,
        required: true,
        validator: (value: string) => ['news', 'bestselling'].includes(value)
    },
    title: {
        type: String,
        required: true
    }
});

const categoryStore = useCategoryStore();
const homeStore = useHomeStore();
const wishlistStore = useWishlistStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const notification = ref({
    show: false,
    message: '',
    type: 'success',
    timeout: null as NodeJS.Timeout | null
});

const selectedCategory = ref("All");
const currentSlide = ref(0);
const slidesToShow = ref(3);

// Computed properties for active data
const rawMedicines = computed(() => {
    return props.type === 'news'
        ? homeStore.newestMedicines
        : homeStore.bestSellingMedicines;
});

const isLoading = computed(() => homeStore.isLoading);
const error = computed(() => homeStore.error);
const hasMedicines = computed(() => rawMedicines.value.length > 0);

// Chuẩn hóa dữ liệu ngay khi nhận từ store
const normalizedMedicines = computed(() => {
    return rawMedicines.value.map(item => {
        // Lấy dữ liệu medicine một cách an toàn
        const medicineData = item.medicine || {};
        
        // Lấy attribute đầu tiên nếu có
        const attribute = medicineData.attributes && medicineData.attributes.length > 0 
            ? medicineData.attributes[0] 
            : null;
        
        // Lấy thông tin giảm giá
        const discountInfo = item.discount && item.discount.length > 0 
            ? item.discount[0] 
            : null;
        const medias = medicineData.medias || [];
        const mainImage = medias.find(m => m.mainImage === true);
        const imageUrl = mainImage?.mediaUrl || (medias.length > 0 ? medias[0].mediaUrl : null);
        const originalPrice = attribute?.priceOut || 0;
        const discountPercentage = discountInfo?.discountPercentage || 0;
        const discountedPrice = originalPrice * (1 - discountPercentage / 100);
        const quantity = attribute?.stock || 0;
        const inWishlist = attribute 
            ? wishlistStore.isInWishlist(medicineData.id, attribute.id)
            : false;
        const categories = medicineData.categories || [];
        const categoryNames = categories.map(c => c.name).join(', ');
        const brandName = medicineData.brand?.name || '';
            
        return {
            id: medicineData.id,
            name: medicineData.name || 'Sản phẩm không tên',
            mainImageUrl: imageUrl,
            categoryNames: categoryNames,
            brandName: brandName,
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            hasDiscount: discountPercentage > 0,
            outOfStock: quantity <= 0,
            inWishlist: inWishlist,
            attributeId: attribute?.id,
            categories: categories,
            rawData: item
        };
    });
});

const filteredMedicines = computed(() => {
    if (selectedCategory.value === "All") {
        return normalizedMedicines.value;
    } else {
        return normalizedMedicines.value.filter(med => {
            return med.categories && med.categories.some(
                category => category.id.toString() === selectedCategory.value
            );
        });
    }
});

const maxSlide = computed(() => {
    return Math.max(0, filteredMedicines.value.length - slidesToShow.value);
});

const paginationDots = computed(() => {
    return Array(Math.ceil(filteredMedicines.value.length / slidesToShow.value)).fill(0);
});

const isLoggedIn = computed(() => {
    return authStore.isAuthenticated && !!authStore.user;
});

// Format and calculation methods
function formatCurrency(price: number): string {
    if (price === undefined || price === null) {
        return '0đ';
    }
    return price.toLocaleString('vi-VN') + 'đ';
}

// Notification system
function showNotification(message: string, type = 'success', duration = 3000): void {
    if (notification.value.timeout) {
        clearTimeout(notification.value.timeout);
    }

    notification.value.show = true;
    notification.value.message = message;
    notification.value.type = type;

    notification.value.timeout = setTimeout(() => {
        notification.value.show = false;
    }, duration);
}

function getNotificationIcon(type: string): string {
    switch (type) {
        case 'success': return 'icofont-check-circled';
        case 'error': return 'icofont-close-circled';
        case 'warning': return 'icofont-warning';
        case 'info': return 'icofont-info-circle';
        default: return 'icofont-info-circle';
    }
}

// Interaction methods
function filterByCategory(categoryId: string): void {
    selectedCategory.value = categoryId;
    resetSlide();
}

async function addToCart(item: any): Promise<void> {
    if (!item.name || item.outOfStock) {
        showNotification(item.outOfStock 
            ? `Sản phẩm ${item.name} đã hết hàng` 
            : "Sản phẩm không đủ thông tin để thêm vào giỏ hàng", 
            item.outOfStock ? "warning" : "error");
        return;
    }

    if (!isLoggedIn.value) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?')) {
            router.push('/auth/login');
        }
        return;
    }

    cartStore.syncWithAuthStore();

    let patientId = null;
    try {
        patientId = await authService.getDataPatient(authStore.$state.user.id);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bệnh nhân:', error);
    }
    const rawData = item.rawData;
    const medicineData = rawData.medicine;

    const added = cartStore.addToCart(medicineData, 1, patientId);

    if (added) {
        showNotification(`Đã thêm ${item.name} vào giỏ hàng`, "success");
    } else {
        showNotification("Không thể thêm sản phẩm vào giỏ hàng", "error");
    }
}

async function addToWishlist(item: any): Promise<void> {
    if (!item.name) {
        showNotification("Không thể thêm sản phẩm vào danh sách yêu thích", "error");
        return;
    }

    if (!isLoggedIn.value) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích. Đăng nhập ngay?')) {
            router.push('/auth/login');
        }
        return;
    }

    wishlistStore.syncWithAuthStore();
    
    let patientId = null;
    try {
        patientId = await authService.getDataPatient(authStore.$state.user.id);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bệnh nhân:', error);
    }

    const rawData = item.rawData;
    const medicineData = rawData.medicine;

    if (item.inWishlist) {
        const removed = wishlistStore.removeFromWishlist(item.id, item.attributeId);
        if (removed) {
            showNotification(`Đã xóa ${item.name} khỏi danh sách yêu thích`, "info");
        }
    } else {
        const added = wishlistStore.addToWishlist(medicineData, patientId);
        if (added) {
            showNotification(`Đã thêm ${item.name} vào danh sách yêu thích`, "success");
        } else {
            showNotification("Không thể thêm sản phẩm vào danh sách yêu thích", "error");
        }
    }
}

// Slider controls
function slideNext(): void {
    if (currentSlide.value < maxSlide.value) {
        currentSlide.value++;
    } else {
        currentSlide.value = 0;
    }
}

function slidePrev(): void {
    if (currentSlide.value > 0) {
        currentSlide.value--;
    } else {
        currentSlide.value = maxSlide.value;
    }
}

function goToPage(pageIndex: number): void {
    currentSlide.value = Math.min(pageIndex * slidesToShow.value, maxSlide.value);
}

function resetSlide(): void {
    currentSlide.value = 0;
}

// Lifecycle hooks
onMounted(async () => {
    try {
        await Promise.all([
            categoryStore.fetchCategories(),
            props.type === 'news'
                ? homeStore.fetchNewestMedicines()
                : homeStore.fetchBestSellingMedicines()
        ]);

        if (isLoggedIn.value) {
            wishlistStore.syncWithAuthStore();
            cartStore.syncWithAuthStore();
        }
        
        // Log dữ liệu để debug
        if (rawMedicines.value.length > 0) {
            const normalizedItem = normalizedMedicines.value[0];
        }
    } catch (error: any) {
        showNotification(`Không thể tải dữ liệu sản phẩm ${props.type === 'news' ? 'mới' : 'bán chạy'}`, "error");
    }
});

watch(() => authStore.isAuthenticated, (newValue) => {
    if (newValue) {
        cartStore.syncWithAuthStore();
        wishlistStore.syncWithAuthStore();
    }
});
</script>

<style scoped>
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

/* CSS chung */
.btn-add-wishlist.in-wishlist {
    background-color: #ffebee;
    color: #e12454;
    border-color: #e12454;
}

.login-notice-bar {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    padding: 10px 15px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.login-notice-bar i {
    color: #17a2b8;
    margin-right: 10px;
}

.btn-login-small {
    background-color: #5280e2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
}

.btn-add-cart:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.medicine-news,
.medicine-bestselling {
    padding: 80px 0;
    background: #f9f9f9;
}

.section-title {
    margin-bottom: 40px;
}

.section-title h1 {
    color: #223a66;
    font-weight: 700;
    position: relative;
    padding-bottom: 15px;
    font-size: 30px;
}

.section-title h1:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: #e12454;
}

/* Slider container và controls */
.slider-header {
    margin-bottom: 30px;
}

.category-btn {
    padding: 8px 16px;
    margin-right: 10px;
    background: #f0f0f0;
    border: none;
    border-radius: 20px;
    color: #6F8BA4;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 20px;
}

.category-btn.active {
    background: #e12454;
    color: white;
    box-shadow: 0 4px 8px rgba(225, 36, 84, 0.2);
}

.category-btn:hover:not(.active) {
    background: #e9e9e9;
}

.slider-controls {
    display: flex;
}

.control-btn {
    background: #223a66;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 0 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
    background: #e12454;
    transform: translateY(-2px);
}

/* Slider track và items */
.slider-container {
    overflow: hidden;
    margin-bottom: 30px;
    padding: 10px 5px;
}

.slider-track {
    display: flex;
    transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.medicine-item {
    min-width: 250px;
    margin-right: 30px;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.medicine-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.medicine-image {
    height: 180px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f8f8;
}

.medicine-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.medicine-item:hover .medicine-image img {
    transform: scale(1.05);
}

/* Medicine info */
.medicine-info {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.medicine-category,
.product-category {
    color: #e12454;
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.product-title {
    margin: 0 0 15px;
    font-size: 18px;
    line-height: 1.4;
}

.product-title a {
    color: #223a66;
    text-decoration: none;
    transition: color 0.3s;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-title a:hover {
    color: #e12454;
}

.product-price {
    text-align: center;
    margin-bottom: 15px;
    font-size: 20px;
}

.original-price {
    text-decoration: line-through;
    color: #6F8BA4;
    margin-right: 10px;
    font-size: 14px;
}

.current-price {
    color: #e12454;
    font-weight: 700;
    font-size: 18px;
}

/* Product actions */
.product-actions-list {
    margin-top: auto;
}

.btn-add-cart {
    width: 100%;
    padding: 10px 15px;
    background: #223a66;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 10px;
}

.btn-add-cart:hover {
    background: #e12454;
}

.btn-add-wishlist {
    width: 100%;
    padding: 8px 15px;
    background: transparent;
    color: #223a66;
    border: 1px solid #223a66;
    border-radius: 5px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-add-wishlist i {
    margin-right: 5px;
    font-size: 14px;
}

.btn-add-wishlist:hover {
    background: #f0f0f0;
    color: #e12454;
    border-color: #e12454;
}

/* Pagination dots */
.slider-pagination {
    text-align: center;
    margin-top: 25px;
}

.dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    background: #dadada;
    border-radius: 50%;
    margin: 0 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot.active {
    background: #e12454;
    transform: scale(1.2);
}

@media (max-width: 992px) {
    .categories {
        display: flex;
        overflow-x: auto;
        white-space: nowrap;
        padding-bottom: 15px;
        -webkit-overflow-scrolling: touch;
    }

    .category-btn {
        flex-shrink: 0;
    }

    .medicine-item {
        min-width: 220px;
    }

    .notification-container {
        max-width: 250px;
    }
}

@media (max-width: 768px) {
    .slider-header {
        flex-direction: column;
        gap: 15px;
    }

    .categories {
        width: 100%;
        justify-content: flex-start;
    }

    .slider-controls {
        justify-content: center;
    }

    .medicine-item {
        min-width: 200px;
        margin-right: 20px;
    }

    .medicine-image {
        height: 150px;
    }

    .notification-container {
        max-width: 220px;
        top: 10px;
        right: 10px;
    }
}

@media (max-width: 576px) {
    .medicine-item {
        min-width: 180px;
        margin-right: 15px;
    }

    .btn-add-wishlist {
        font-size: 12px;
    }

    .product-title {
        font-size: 16px;
    }

    .notification-container {
        width: calc(100% - 40px);
        max-width: none;
        top: 10px;
        right: 20px;
        left: 20px;
    }
}
</style>