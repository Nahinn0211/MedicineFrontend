<template>
    <header>
        <nav class="navbar navbar-expand-lg navigation" id="navbar">
            <div class="container">
                <router-link to="/">
                    <a class="navbar-brand">
                        <img src="../../../assets/user/images/logo.png" alt="Logo" class="img-fluid">
                    </a>
                </router-link>
                <button class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#navbarmain"
                    aria-controls="navbarmain" aria-expanded="false" aria-label="Mở menu">
                    <span class="icofont-navigation-menu"></span>
                </button>

                <div class="" id="navbarmain">
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item active">
                            <router-link to="/Home"><a class="nav-link" href="">Trang chủ</a></router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/Shop"><a class="nav-link" href="">Cửa hàng</a></router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/ListService"><a class="nav-link" href="">Dịch vụ</a></router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/ListDoctor"><a class="nav-link" href="">Bác sĩ</a></router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/About"><a class="nav-link" href="">Về chúng tôi</a></router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/Contact"><a class="nav-link" href="">Liên hệ</a></router-link>
                        </li>

                        <!-- Phần đăng nhập/đăng ký hoặc menu người dùng -->
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link to="/login" class="nav-link">Đăng nhập</router-link>
                        </li>
                        <li v-if="!isAuthenticated" class="nav-item">
                            <router-link to="/register" class="nav-link">Đăng ký</router-link>
                        </li>

                        <!-- Menu người dùng khi đã đăng nhập -->
                        <li v-if="isAuthenticated" class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" 
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                               <img :src="userData?.avatar" class="user-avatar rounded-circle" alt="User Avatar" width="40px">
                            </a>
                            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                                <li class="nav-item">
                                    <router-link to="/cart" class="dropdown-item">
                                        <i class="icofont-shopping-cart"></i> Giỏ hàng
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/list-order" class="dropdown-item">
                                        <i class="icofont-list"></i> Đơn hàng
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/Wishlist" class="dropdown-item">
                                        <i class="icofont-heart"></i> Yêu thích
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/ListServiceBookings" class="dropdown-item">
                                        <i class="icofont-medical-sign"></i> Tư vấn
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/Profile" class="dropdown-item">
                                        <i class="icofont-user"></i> Thông tin cá nhân
                                    </router-link>
                                </li>
                                <div class="dropdown-divider"></div>
                                <button @click="handleLogout" class="dropdown-item text-danger">
                                    <i class="icofont-logout"></i> Đăng xuất
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth/useAuthStore'
import { useRouter } from 'vue-router'
import { authService } from '@user/services/AuthService'

// Khởi tạo store và router
const authStore = useAuthStore()
const router = useRouter()
const userData = ref(null);
// Đảm bảo khởi tạo auth khi component mount
onMounted(async () => {
  await authStore.initializeAuth();
  userData.value = await authService.getDataUser(authService.state.user.id);
})

// Trạng thái đăng nhập - đảm bảo computed property được cập nhật khi state thay đổi
const isAuthenticated = computed(() => authStore.getAuthStatus)

// Xử lý đăng xuất
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>