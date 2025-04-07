<template>
    <section class="section service gray-bg">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-7 text-center">
                    <div class="section-title">
                        <h2>Dịch vụ y tế chúng tôi cung cấp</h2>
                        <div class="divider mx-auto my-4"></div>
                        <p>Chúng tôi cam kết mang đến các dịch vụ chăm sóc sức khỏe chất lượng cao với đội ngũ chuyên gia hàng đầu.</p>
                    </div>
                </div>
            </div>

            <!-- Loading indicator -->
            <div v-if="serviceStore.loading" class="row justify-content-center">
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </div>

            <!-- Error message -->
            <div v-else-if="serviceStore.error" class="row justify-content-center">
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        {{ serviceStore.error }}
                    </div>
                </div>
            </div>

            <!-- No data message -->
            <div v-else-if="serviceStore.services.length === 0" class="row justify-content-center">
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        Không có thông tin dịch vụ nào.
                    </div>
                </div>
            </div>

            <!-- Service List -->
            <div v-else class="row">
                <div v-for="service in serviceStore.serviceList" :key="service.id"
                    class="col-lg-4 col-md-6 col-sm-6">
                    <div class="service-item mb-4">
                        <div class="service-img">
                            <img :src="service.image" 
                                 :alt="service.name" 
                                 class="img-fluid rounded">
                        </div>
                        <div class="content mt-4">
                            <h4 class="mb-3 service-title">{{ service.name }}</h4>
                            <p class="mb-4">{{ service.description || 'Chưa có mô tả chi tiết.' }}</p>
                            <router-link :to="`/service/${service.id}`" class="read-more">
                                Xem chi tiết <i class="icofont-simple-right ml-2"></i>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { userServiceStore } from '@user/stores/ServiceStore';

// Khởi tạo store
const serviceStore = userServiceStore();

// Lấy danh sách dịch vụ khi component được mount
onMounted(async () => {
    await serviceStore.fetchServices();
});
</script>

<style scoped>
.service {
    padding: 80px 0;
}

.section-title h2 {
    color: #223a66;
    font-weight: 700;
}

.divider {
    width: 40px;
    height: 5px;
    background: #e12454;
}

.service-item {
    background: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    height: 100%;
}

.service-item:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-5px);
}

.service-img {
    height: 200px;
    overflow: hidden;
    position: relative;
}

.service-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.service-item:hover .service-img img {
    transform: scale(1.05);
}

.service-title {
    color: #223a66;
    font-size: 22px;
    font-weight: 600;
}

.content {
    text-align: center;
}

.content p {
    margin-bottom: 20px;
    color: #6F8BA4;
    height: 60px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.read-more {
    color: #e12454;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    display: inline-block;
    padding: 8px 20px;
    border: 1px solid #e12454;
    border-radius: 30px;
}

.read-more:hover {
    color: #fff;
    background-color: #e12454;
}
</style>