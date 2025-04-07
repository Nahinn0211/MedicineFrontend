<template>
    <section class="section doctor-single">
        <div class="container">
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                </div>
            </div>

            <div v-else-if="error" class="alert alert-danger">
                {{ error }}
            </div>

            <div v-else-if="doctor" class="row">
                <div class="col-lg-4 col-md-6">
                    <div class="doctor-img-block">
                        <img :src="doctor.user?.avatar || '@/assets/images/team/1.jpg'" alt="Doctor avatar"
                            class="img-fluid w-100">

                        <div class="info-block mt-4">
                            <h4 class="mb-0">{{ doctor.user?.fullName || 'Không có thông tin' }}</h4>
                            <p>{{ doctor.specialization || 'Chưa có chuyên khoa' }}</p>

                            <ul class="list-inline mt-4 doctor-social-links">
                                <li class="list-inline-item"><a href="#!"><i class="icofont-facebook"></i></a></li>
                                <li class="list-inline-item"><a href="#!"><i class="icofont-twitter"></i></a></li>
                                <li class="list-inline-item"><a href="#!"><i class="icofont-skype"></i></a></li>
                                <li class="list-inline-item"><a href="#!"><i class="icofont-linkedin"></i></a></li>
                                <li class="list-inline-item"><a href="#!"><i class="icofont-pinterest"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="col-lg-8 col-md-6">
                    <div class="doctor-details mt-4 mt-lg-0">
                        <h2 class="text-md">Thông tin bác sĩ</h2>
                        <div class="divider my-4"></div>
                        <p><strong>Kinh nghiệm:</strong> {{ doctor.experience || 'Chưa cập nhật thông tin kinh nghiệm' }}</p>
                        <p><strong>Nơi làm việc:</strong> {{ doctor.workplace || 'Chưa cập nhật nơi làm việc' }}</p>
                        <p><strong>Email:</strong> {{ doctor.user?.email || 'Chưa cập nhật email' }}</p>
                        <p><strong>Số điện thoại:</strong> {{ doctor.user?.phone || 'Chưa cập nhật số điện thoại' }}</p>
                        <p><strong>Địa chỉ:</strong> {{ doctor.user?.address || 'Chưa cập nhật địa chỉ' }}</p>

                        <!-- Thay đổi ở đây: Nút đặt lịch làm hàm xử lý logic đặt lịch -->
                        <button @click="handleBooking" class="btn btn-main-2 btn-round-full mt-3">
                            Đặt lịch hẹn<i class="icofont-simple-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="alert alert-info">
                Không tìm thấy thông tin bác sĩ
            </div>
        </div>
    </section>

    <section v-if="doctor" class="section doctor-qualification gray-bg">
        <div class="container">
            <div class="row">
                <div class="col-lg-6">
                    <div class="section-title">
                        <h3>Bằng cấp & Chứng chỉ</h3>
                        <div class="divider my-4"></div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-12">
                    <div class="edu-block mb-5">
                        <p>Thông tin bằng cấp và chứng chỉ của bác sĩ sẽ được cập nhật sau.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section v-if="doctor" class="section doctor-skills">
        <div class="container">
            <div class="row">
                <div class="col-lg-4">
                    <h3>Kỹ năng chuyên môn</h3>
                    <div class="divider my-4"></div>
                    <p>{{ doctor.experience || 'Thông tin kỹ năng chuyên môn của bác sĩ sẽ được cập nhật sau.' }}</p>
                </div>
                <div class="col-lg-4">
                    <div class="skill-list">
                        <h5 class="mb-4">Lĩnh vực chuyên môn</h5>
                        <ul class="list-unstyled department-service">
                            <li><i class="icofont-check mr-2"></i>{{ doctor.specialization || 'Đang cập nhật' }}</li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-4" id="appointment">
                    <div class="sidebar-widget gray-bg p-4">
                        <h5 class="mb-4">Đặt lịch hẹn</h5>

                        <ul class="list-unstyled lh-35">
                            <li class="d-flex justify-content-between align-items-center">
                                <span>Thứ 2 - Thứ 6</span>
                                <span>8:00 - 17:00</span>
                            </li>
                            <li class="d-flex justify-content-between align-items-center">
                                <span>Thứ 7</span>
                                <span>9:00 - 16:00</span>
                            </li>
                            <li class="d-flex justify-content-between align-items-center">
                                <span>Chủ nhật</span>
                                <span>Nghỉ</span>
                            </li>
                        </ul>

                        <div class="sidebar-contatct-info mt-4">
                            <p class="mb-0">Cần trợ giúp khẩn cấp?</p>
                            <h3 class="text-color-2">{{ doctor.user?.phone || 'Chưa có thông tin liên hệ' }}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Modal chọn dịch vụ -->
    <div v-if="showServiceModal" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">Chọn dịch vụ</h3>
                <button @click="showServiceModal = false" class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <p class="text-center mb-4">Vui lòng chọn dịch vụ để tiếp tục đặt lịch với bác sĩ {{ doctor?.user?.fullName }}</p>
                
                <div v-if="isLoadingServices" class="text-center py-3">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                </div>
                
                <div v-else-if="doctorServices.length === 0" class="alert alert-info">
                    Bác sĩ hiện không có dịch vụ nào. Vui lòng chọn bác sĩ khác.
                </div>
                
                <div v-else class="services-grid">
                    <div v-for="service in doctorServices" :key="service.id" 
                         class="service-card" @click="selectService(service)">
                        <div class="service-card-image">
                            <img :src="service.image || '@/assets/images/service-default.jpg'" :alt="service.name">
                        </div>
                        <div class="service-card-content">
                            <h4>{{ service.name }}</h4>
                            <p class="service-price">{{ formatPrice(service.price) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DoctorProfile } from '@models/DoctorProfile';
import { useDoctorStore } from '@user/stores/DoctorStore';
import { userServiceStore } from '@user/stores/ServiceStore';

const route = useRoute();
const router = useRouter();
const doctorStore = useDoctorStore();
const serviceStore = userServiceStore();

const doctor = ref<DoctorProfile | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showServiceModal = ref(false);
const doctorServices = ref<any[]>([]); // Danh sách dịch vụ của bác sĩ
const isLoadingServices = ref(false);

// Format giá tiền
const formatPrice = (price: number) => {
    if (price === undefined) return 'Liên hệ để biết giá';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

// Hàm để lấy thông tin bác sĩ
const fetchDoctorDetails = async (id: number) => {
    try {
        if (isNaN(id)) {
            error.value = 'ID bác sĩ không hợp lệ';
            return;
        }

        isLoading.value = true;
        error.value = null;

        console.log('Đang lấy thông tin bác sĩ với ID:', id);

        // Sử dụng fetchDoctorById từ doctorStore
        const doctorData = await doctorStore.fetchDoctorById(id);

        if (doctorData) {
            doctor.value = doctorData;
            console.log('Đã lấy thông tin bác sĩ:', doctorData);
        } else {
            error.value = 'Không tìm thấy thông tin bác sĩ';
        }
    } catch (err: any) {
        error.value = err.message || 'Đã xảy ra lỗi khi tải thông tin bác sĩ';
        console.error('Error loading doctor details:', err);
    } finally {
        isLoading.value = false;
    }
};

// Hàm lấy danh sách dịch vụ mà bác sĩ cung cấp
// Hàm lấy danh sách dịch vụ mà bác sĩ cung cấp
const fetchDoctorServices = async (doctorId: number) => {
    try {
        isLoadingServices.value = true;
        doctorServices.value = []; // Reset mảng
        
        // Gọi API để cập nhật danh sách dịch vụ trong store
        await serviceStore.fetchServices();
        
        // Lấy danh sách dịch vụ từ store
        const allServices = serviceStore.services;
        
        if (Array.isArray(allServices)) {
            // Lọc dịch vụ theo doctorId
            doctorServices.value = allServices.filter(service => 
                service.doctorProfile && service.doctorProfile.id === doctorId
            );
            
            console.log('Dịch vụ của bác sĩ:', doctorServices.value);
        } else {
            console.error('services is not an array:', allServices);
        }
    } catch (error) {
        console.error('Lỗi khi tải dịch vụ của bác sĩ:', error);
    } finally {
        isLoadingServices.value = false;
    }
};

// Xử lý khi nhấn nút Đặt lịch hẹn
const handleBooking = async () => {
    if (!doctor.value) return;
    
    // Lấy danh sách dịch vụ của bác sĩ
    await fetchDoctorServices(doctor.value.id);
    
    if (doctorServices.value.length === 0) {
        // Nếu bác sĩ không có dịch vụ nào
        alert('Bác sĩ này hiện không cung cấp dịch vụ nào. Vui lòng chọn bác sĩ khác.');
        return;
    } else if (doctorServices.value.length === 1) {
        // Nếu chỉ có 1 dịch vụ, chuyển thẳng đến trang đặt lịch
        router.push({
            path: `/service/${doctorServices.value[0].id}`,
            query: { doctorId: doctor.value.id.toString() }
        });
    } else {
        // Nếu có nhiều dịch vụ, hiển thị modal để chọn
        showServiceModal.value = true;
    }
};

// Xử lý khi người dùng chọn dịch vụ từ modal
const selectService = (service: any) => {
    showServiceModal.value = false;
    if (doctor.value) {
        router.push({
            path: `/service/${service.id}`,
            query: { doctorId: doctor.value.id.toString() }
        });
    }
};

// Gọi lấy thông tin ban đầu
onMounted(() => {
    const doctorId = Number(route.params.id);
    fetchDoctorDetails(doctorId);
});

// Theo dõi thay đổi của route.params.id
watch(() => route.params.id, (newId) => {
    const doctorId = Number(newId);
    fetchDoctorDetails(doctorId);
}, { immediate: false });
</script>

<style scoped>
/* Thiết lập chung */
:root {
  --primary-color: #223a66;
  --secondary-color: #0078D7;
  --accent-color: #00B294;
  --light-color: #f9f9f9;
  --dark-color: #333;
  --text-color: #555;
  --border-color: #e5e5e5;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --border-radius: 8px;
  --box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Container và layout */
.doctor-single {
  padding: 80px 0;
  background-color: #f8fbff;
}

.container {
  max-width: 1140px;
  padding: 0 15px;
  margin: 0 auto;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

/* Phần hình ảnh bác sĩ */
.doctor-img-block {
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  background-color: white;
}

.doctor-img-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.doctor-img-block img {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.doctor-img-block:hover img {
  transform: scale(1.03);
}

.info-block {
  padding: 20px;
  text-align: center;
  border-top: 3px solid var(--secondary-color);
  background: linear-gradient(to bottom, rgba(240, 246, 255, 0.8), white);
}

.info-block h4 {
  font-size: 22px;
  color: var(--primary-color);
  margin-bottom: 8px;
  font-weight: 600;
}

.info-block p {
  color: var(--secondary-color);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}

/* Social links */
.doctor-social-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 15px;
}

.doctor-social-links li {
  list-style: none;
}

.doctor-social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #f0f6ff;
  border-radius: 50%;
  color: var(--secondary-color);
  transition: var(--transition);
}

.doctor-social-links a:hover {
  background-color: var(--secondary-color);
  color: white;
  transform: translateY(-3px);
}

/* Phần thông tin chi tiết */
.doctor-details {
  padding: 30px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  height: 100%;
  border: 1px solid rgba(0, 120, 215, 0.1);
  transition: var(--transition);
}

.doctor-details:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.doctor-details h2 {
  font-size: 26px;
  color: var(--primary-color);
  margin-bottom: 5px;
  font-weight: 600;
  position: relative;
}

.divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, var(--secondary-color), var(--accent-color));
  margin: 20px 0;
  border-radius: 3px;
}

.doctor-details p {
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 16px;
  line-height: 1.6;
}

.doctor-details p strong {
  color: var(--primary-color);
  margin-right: 5px;
  font-weight: 600;
}

/* Button styles */
.btn-main-2 {
  padding: 12px 25px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(0, 120, 215, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-main-2:hover {
  background: linear-gradient(45deg, #1a94ff, var(--secondary-color));
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 120, 215, 0.4);
}

.btn-main-2:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 120, 215, 0.3);
}

.btn-main-2 i {
  transition: transform 0.3s ease;
}

.btn-main-2:hover i {
  transform: translateX(5px);
}

/* Section Qualification */
.doctor-qualification {
  padding: 70px 0;
  background-color: #f0f6ff;
}

.section-title h3 {
  font-size: 32px;
  color: var(--primary-color);
  margin-bottom: 10px;
  font-weight: 700;
  position: relative;
}

.edu-block {
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  background: white;
  transition: var(--transition);
  border-left: 4px solid var(--secondary-color);
}

.edu-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Section Skills */
.doctor-skills {
  padding: 70px 0;
  background-color: white;
}

.doctor-skills h3 {
  font-size: 28px;
  color: var(--primary-color);
  font-weight: 600;
}

.skill-list h5 {
  font-size: 20px;
  color: var(--primary-color);
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.skill-list h5::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: var(--secondary-color);
}

.department-service li {
  margin-bottom: 12px;
  position: relative;
  padding-left: 28px;
  color: var(--text-color);
  font-size: 16px;
  line-height: 1.6;
}

.department-service li i {
  position: absolute;
  left: 0;
  top: 4px;
  color: var(--accent-color);
}

/* Sidebar widget */
.sidebar-widget {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: var(--transition);
  border: 1px solid rgba(0, 120, 215, 0.1);
}

.sidebar-widget:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.sidebar-widget h5 {
  font-size: 18px;
  color: var(--primary-color);
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
}

.sidebar-widget h5::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: var(--secondary-color);
}

.sidebar-widget ul li {
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color);
  color: var(--text-color);
}

.sidebar-widget ul li:last-child {
  border-bottom: none;
}

.sidebar-contatct-info {
  background-color: rgba(0, 178, 148, 0.1);
  padding: 15px;
  border-radius: var(--border-radius);
  text-align: center;
}

.sidebar-contatct-info p {
  margin-bottom: 5px;
  color: var(--text-color);
}

.sidebar-contatct-info h3 {
  font-size: 22px;
  color: var(--accent-color);
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(0, 120, 215, 0.1);
}

@keyframes slideIn {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(to right, #f0f6ff, white);
}

.modal-title {
  margin: 0;
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--text-color);
  transition: var(--transition);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  color: var(--danger-color);
  background-color: rgba(220, 53, 69, 0.1);
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.service-card {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: var(--transition);
  background-color: white;
  border: 1px solid rgba(0, 120, 215, 0.1);
  position: relative;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, var(--secondary-color), var(--accent-color));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.service-card:hover::before {
  transform: scaleX(1);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.service-card-image {
  height: 170px;
  overflow: hidden;
  position: relative;
}

.service-card-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.4));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.service-card:hover .service-card-image::after {
  opacity: 1;
}

.service-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.service-card:hover .service-card-image img {
  transform: scale(1.08);
}

.service-card-content {
  padding: 20px;
  background: linear-gradient(to bottom, white, #f8fbff);
}

.service-card-content h4 {
  margin: 0 0 12px;
  font-size: 18px;
  color: var(--primary-color);
  font-weight: 600;
  transition: var(--transition);
  line-height: 1.4;
}

.service-card:hover .service-card-content h4 {
  color: var(--secondary-color);
}

.service-price {
  font-weight: 700;
  color: var(--secondary-color);
  margin: 0;
  font-size: 17px;
  display: flex;
  align-items: center;
}

.service-price::before {
  content: 'Giá: ';
  font-weight: 400;
  color: var(--text-color);
  margin-right: 5px;
  font-size: 15px;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .doctor-single,
  .doctor-qualification,
  .doctor-skills {
    padding: 50px 0;
  }
  
  .doctor-details {
    margin-top: 30px;
  }
  
  .section-title h3,
  .doctor-skills h3 {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .doctor-img-block,
  .doctor-details,
  .edu-block,
  .sidebar-widget {
    margin-bottom: 30px;
  }
  
  .services-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .modal-container {
    width: 95%;
    max-height: 85vh;
  }
}

@media (max-width: 576px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .doctor-social-links {
    justify-content: center;
  }
  
  .btn-main-2 {
    width: 100%;
  }
}

/* Animation for loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin .75s linear infinite;
}

.text-primary {
  color: var(--secondary-color) !important;
}

/* Alert styles */
.alert {
  padding: 20px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  border-left: 4px solid transparent;
}

.alert-danger {
  background-color: rgba(220, 53, 69, 0.1);
  color: var(--danger-color);
  border-left-color: var(--danger-color);
}

.alert-info {
  background-color: rgba(0, 120, 215, 0.1);
  color: var(--secondary-color);
  border-left-color: var(--secondary-color);
}
</style>