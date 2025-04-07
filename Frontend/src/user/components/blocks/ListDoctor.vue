<template>
    <section class="section doctors">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-6 text-center">
                    <div class="section-title">
                        <h2>Bác sĩ</h2>
                        <div class="divider mx-auto my-4"></div>
                    </div>
                </div>
            </div>

            <!-- Hiển thị trạng thái tải -->
            <div v-if="doctorStore.isLoading" class="row justify-content-center">
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            </div>

            <!-- Hiển thị lỗi -->
            <div v-else-if="doctorStore.error" class="row justify-content-center">
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        {{ doctorStore.error }}
                    </div>
                </div>
            </div>

            <!-- Không có dữ liệu -->
            <div v-else-if="!doctorStore.hasDoctors" class="row justify-content-center">
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        Không có thông tin bác sĩ nào.
                    </div>
                </div>
            </div>

            <template v-else>
                <!-- Bộ lọc chuyên khoa -->
                <div class="col-12 text-center mb-5">
                    <div class="btn-group btn-group-toggle flex-wrap" data-toggle="buttons">
                        <label v-for="specialization in doctorStore.specializations" :key="specialization.id"
                            class="btn" :class="{ active: doctorStore.selectedSpecialization === specialization.id }"
                            @click="filterDoctors(specialization.id)">
                            <input type="radio" name="shuffle-filter" :value="specialization.id"
                                :checked="doctorStore.selectedSpecialization === specialization.id" />
                            {{ specialization.name }}
                        </label>
                    </div>
                </div>

                <!-- Danh sách bác sĩ -->
                <div class="row shuffle-wrapper portfolio-gallery">
                    <div v-for="doctor in doctorStore.filteredDoctors" :key="doctor.id"
                        class="col-lg-3 col-sm-6 col-md-6 mb-4 shuffle-item"
                        :data-groups="[`&quot;${doctor.specialization?.toLowerCase() || 'unknown'}&quot;`]">
                        <div class="position-relative doctor-inner-box">
                            <div class="doctor-profile">
                                <div class="doctor-img">
                                    <img :src="doctor.user?.avatar || defaultDoctorImage"
                                        :alt="`${doctor.user?.fullName} - ${doctor.specialization}`"
                                        class="img-fluid w-100">
                                </div>
                            </div>
                            <div class="content mt-3">
                                <h4 class="mb-0">
                                    <router-link :to="`/doctor/${doctor.id}`">{{ doctor.user?.fullName }}</router-link>
                                </h4>
                                <p>{{ doctor.specialization || 'Chưa có chuyên khoa' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </section>

    <section class="section cta-page">
        <div class="container">
            <div class="row">
                <div class="col-lg-7">
                    <div class="cta-content">
                        <div class="divider mb-4"></div>
                        <h2 class="mb-5 text-lg">Chúng tôi rất vui được cung cấp cho bạn <span class="title-color">cơ hội chăm sóc sức khỏe tốt nhất</span></h2>
                        <router-link to="/appointment" class="btn btn-main-2 btn-round-full">
                            Đặt lịch hẹn<i class="icofont-simple-right ml-2"></i>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDoctorStore } from '@user/stores/DoctorStore';

// Khởi tạo store
const doctorStore = useDoctorStore();

// Đường dẫn ảnh mặc định nếu bác sĩ không có ảnh
const defaultDoctorImage = ref('/src/assets/images/team/default-doctor.jpg');

// Lấy danh sách bác sĩ khi component được mount
onMounted(async () => {
    try {
        await doctorStore.fetchAllDoctors();
        console.log(doctorStore.filteredDoctors);
    } catch (error) {
        console.error("Lỗi khi tải danh sách bác sĩ:", error);
    }
});

// Lọc bác sĩ theo chuyên khoa
const filterDoctors = (specialization: string) => {
    doctorStore.setSelectedSpecialization(specialization);
};
</script>

<style scoped>
.doctors {
    padding: 80px 0;
    background: #f9f9f9;
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

.btn-group {
    margin-bottom: 30px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
}

.btn-group .btn {
    padding: 8px 15px;
    margin: 3px;
    background: #f0f0f0;
    border: none;
    border-radius: 30px;
    color: #6F8BA4;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-group .btn.active {
    background: #e12454;
    color: white;
}

.doctor-inner-box {
    margin-bottom: 30px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.doctor-inner-box:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-5px);
}

.doctor-img {
    position: relative;
    overflow: hidden;
}

.doctor-img img {
    height: 280px;
    width: 100%;
    object-fit: cover;
    transition: all .4s ease;
}

.doctor-inner-box:hover .doctor-img img {
    transform: scale(1.05);
}

.content {
    padding: 20px;
    text-align: center;
}

.content h4 {
    color: #223a66;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 5px;
}

.content h4 a {
    color: #223a66;
    text-decoration: none;
    transition: all 0.3s ease;
}

.content h4 a:hover {
    color: #e12454;
}

.content p {
    color: #e12454;
    font-size: 14px;
    margin-bottom: 0;
}

.cta-page {
    background: url('@/assets/images/bg/banner.jpg') no-repeat;
    background-size: cover;
    position: relative;
    padding: 80px 0;
}

.cta-page::before {
    position: absolute;
    content: '';
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(34, 58, 102, 0.95);
}

.cta-content {
    position: relative;
}

.cta-content h2 {
    color: white;
    font-size: 2rem;
}

.title-color {
    color: #e12454;
}

.btn-main-2 {
    background: #e12454;
    color: white;
    border-color: #e12454;
    padding: 12px 30px;
    border-radius: 30px;
    font-weight: 600;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
}

.btn-main-2:hover {
    background: white;
    color: #e12454;
    border-color: white;
}

.btn-round-full {
    border-radius: 100px;
}

/* Responsive styles */
@media (max-width: 768px) {
    .btn-group .btn {
        padding: 6px 12px;
        font-size: 14px;
    }

    .doctor-img img {
        height: 220px;
    }

    .content h4 {
        font-size: 18px;
    }
}
</style>