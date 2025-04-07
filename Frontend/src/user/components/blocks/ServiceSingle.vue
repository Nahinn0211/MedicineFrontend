<template>
	<section class="section department-single">
		<div class="container">
			<!-- Loading indicator -->
			<div v-if="loading" class="row justify-content-center">
				<div class="col-12 text-center py-5">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Đang tải...</span>
					</div>
				</div>
			</div>

			<!-- Error message -->
			<div v-else-if="error" class="row justify-content-center">
				<div class="col-12">
					<div class="alert alert-danger text-center">
						{{ error }}
					</div>
				</div>
			</div>

			<template v-else-if="service">
				<div class="row">
					<div class="col-lg-12">
						<div class="department-img">
							<img :src="service.image || '@/assets/user/images/service/bg-1.jpg'" :alt="service.name"
								class="img-fluid">
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-lg-8">
						<div class="department-content mt-5">
							<h3 class="text-md">{{ service.name }}</h3>
							<div class="divider my-4"></div>

							<!-- Giá tiền -->
							<div class="price-info mb-4">
								<span class="price-label">Giá dịch vụ:</span>
								<span class="price-value">{{ formatPrice(service.price) }}</span>
							</div>

							<!-- Mô tả dịch vụ -->
							<p>{{ service.description || 'Chưa có thông tin chi tiết về dịch vụ này.' }}</p>

							<!-- Chi tiết dịch vụ -->
							<h3 class="mt-5 mb-4">Chi tiết dịch vụ</h3>
							<div class="divider my-4"></div>
							<ul class="list-unstyled department-service">
								<li><i class="icofont-check mr-2"></i>Dịch vụ chuyên nghiệp với đội ngũ y bác sĩ giàu
									kinh nghiệm</li>
								<li><i class="icofont-check mr-2"></i>Trang thiết bị y tế hiện đại, đạt tiêu chuẩn quốc
									tế</li>
								<li><i class="icofont-check mr-2"></i>Môi trường chăm sóc thân thiện, tận tâm</li>
								<li><i class="icofont-check mr-2"></i>Quy trình khép kín, bảo đảm an toàn và hiệu quả
								</li>
							</ul>

							<router-link to="/appointment" class="btn btn-main-2 btn-round-full mt-4">
								Đặt lịch hẹn<i class="icofont-simple-right ml-2"></i>
							</router-link>
						</div>
					</div>

					<div class="col-lg-4">
						<div class="sidebar-widget schedule-widget mt-5">
							<h5 class="mb-4">Thời gian phục vụ</h5>

							<ul class="list-unstyled">
								<li class="d-flex justify-content-between align-items-center">
									<span>Thứ Hai - Thứ Sáu</span>
									<span>8:00 - 17:00</span>
								</li>
								<li class="d-flex justify-content-between align-items-center">
									<span>Thứ Bảy</span>
									<span>8:00 - 12:00</span>
								</li>
								<li class="d-flex justify-content-between align-items-center">
									<span>Chủ Nhật</span>
									<span>Nghỉ</span>
								</li>
							</ul>

							<div class="sidebar-contatct-info mt-4">
								<p class="mb-0">Cần trợ giúp khẩn cấp?</p>
								<h3>+84 123 456 789</h3>
							</div>
						</div>
					</div>
				</div>
			</template>

			<div v-else class="row justify-content-center">
				<div class="col-12">
					<div class="alert alert-info text-center">
						Không tìm thấy thông tin dịch vụ.
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { userServiceStore } from '@user/stores/ServiceStore';
import { Service } from '@models/Service';

// Khởi tạo route và store
const route = useRoute();
const serviceStore = userServiceStore();

// State
const service = ref<Service | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const formatPrice = (price: number | undefined) => {
	if (price === undefined) return 'Liên hệ để biết giá';
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND'
	}).format(price);
};

onMounted(async () => {
	try {
		loading.value = true;
		const serviceId = Number(route.params.id);

		if (isNaN(serviceId)) {
			error.value = 'ID dịch vụ không hợp lệ';
			return;
		}

		// Lấy chi tiết dịch vụ
		const serviceData = await serviceStore.fetchServiceById(serviceId);

		if (serviceData) {
			service.value = serviceData;
		} else {
			error.value = 'Không tìm thấy thông tin dịch vụ';
		}
	} catch (err: any) {
		error.value = err.message || 'Đã xảy ra lỗi khi tải thông tin dịch vụ';
		console.error('Error loading service details:', err);
	} finally {
		loading.value = false;
	}
});
</script>

<style scoped>
.department-img {
	position: relative;
	overflow: hidden;
	border-radius: 8px;
	max-height: 400px;
}

.department-img img {
	width: 100%;
	height: 400px;
	object-fit: cover;
}

.department-content h3 {
	color: #223a66;
	font-weight: 700;
}

.lead {
	font-size: 1.2rem;
	line-height: 1.8;
	color: #6F8BA4;
}

.divider {
	width: 60px;
	height: 3px;
	background: #e12454;
}

.price-info {
	background: #f8f9fa;
	padding: 12px 20px;
	border-radius: 6px;
	margin-bottom: 20px;
	display: inline-block;
}

.price-label {
	font-weight: 600;
	color: #223a66;
	margin-right: 10px;
}

.price-value {
	font-weight: 700;
	color: #e12454;
	font-size: 1.2rem;
}

.department-service li {
	margin-bottom: 10px;
	color: #6F8BA4;
}

.department-service li i {
	color: #e12454;
}

.department-img {
	position: relative;
	overflow: hidden;
	border-radius: 8px;
	max-height: 400px;
}

.department-img img {
	width: 100%;
	height: 400px;
	object-fit: cover;
}

.department-content h3 {
	color: #223a66;
	font-weight: 700;
}

.lead {
	font-size: 1.2rem;
	line-height: 1.8;
	color: #6F8BA4;
}

.divider {
	width: 60px;
	height: 3px;
	background: #e12454;
}

.department-service li {
	margin-bottom: 10px;
	color: #6F8BA4;
}

.department-service li i {
	color: #e12454;
}

.btn-main-2 {
	background: #e12454;
	color: white;
	border-color: #e12454;
	padding: 12px 25px;
	border-radius: 30px;
	font-weight: 600;
	margin-top: 20px;
	display: inline-block;
	text-decoration: none;
	transition: all 0.3s ease;
}

.btn-main-2:hover {
	background: #223a66;
	border-color: #223a66;
	color: white;
}

.schedule-widget {
	background: #f9f9f9;
	padding: 25px;
	border-radius: 8px;
}

.schedule-widget ul li {
	padding: 10px 0;
	border-bottom: 1px solid #eeeeee;
}

.sidebar-contatct-info {
	margin-top: 20px;
}

.sidebar-contatct-info p {
	font-weight: 600;
}

.sidebar-contatct-info h3 {
	color: #e12454;
}

.doctor-thumb {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	object-fit: cover;
}

.doctor-item {
	padding: 10px;
	border-bottom: 1px solid #eeeeee;
}

.doctor-item:last-child {
	border-bottom: none;
}
</style>