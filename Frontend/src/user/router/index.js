import Home from '../views/Home.vue';
import Shop from '../views/Shop.vue';
import Medicine from '../views/Medicine.vue';
import Service from '../views/Service.vue';
import ServiceDetail from '../views/ServiceDetail.vue';
import DoctorDetail from '../views/DoctorDetail.vue';
import Wishlist from '../views/Wishlist.vue';
import Cart from '../views/Cart.vue';
import Contact from '../views/Contact.vue';
import About from '../views/About.vue';
import ListDoctor from '../views/ListDoctor.vue';
import ListOrder from '../views/ListOrder.vue';
import OrderDetail from '../views/OrderDetail.vue';
import Checkout from '../views/Checkout.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import Profile from '../views/Profile.vue';
import ListServiceBooking from '../views/ListServiceBooking.vue';
import ConsultationCallView from '../views/ConsultationCallView.vue';
import OrderResultPage from '../views/OrderResultPage.vue';


const userRoutes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Trang Chủ', requiresAuth: false }
  },
  {
    path: '/Home',
    name: 'HomePage',
    component: Home,
    meta: { title: 'Trang Chủ', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Đăng nhập', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: 'Đăng ký', requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    props: true,
    meta: { title: 'Quên mật khẩu', requiresAuth: false }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: Shop,
    meta: {
      title: 'Cửa Hàng',
      requiresAuth: false
    }
  },
  {
    path: '/Medicine/:id',
    name: 'Medicine',
    component: Medicine,
    props: true,
    meta: {
      title: 'Chi Tiết Thuốc',
      requiresAuth: false
    }
  },
  {
    path: '/ListService',
    name: 'ListService',
    component: Service,
    meta: {
      title: 'Danh sách dịch vụ',
      requiresAuth: false
    }
  },
  {
    path: '/ListServiceBookings',
    name: 'ListServiceBookings',
    component: ListServiceBooking,
    meta: {
      title: 'Danh sách dịch vụ đã đặt',
      requiresAuth: false
    }
  },
  {
    path: '/order-result',
    name: 'OrderResult',
    component: OrderResultPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/service/:id',
    name: 'Service',
    component: ServiceDetail,
    props: true,
    meta: {
      title: 'Dịch Vụ',
      requiresAuth: false
    }
  },
  {
    path: '/ListDoctor',
    name: 'ListDoctor',
    component: ListDoctor,
    meta: {
      title: 'Danh sách bác sĩ',
      requiresAuth: false
    }
  },
  {
    path: '/doctor/:id',
    name: 'Doctor',
    component: DoctorDetail,
    props: true,
    meta: {
      title: 'Thông tin bác sĩ',
      requiresAuth: false
    }
  },
  {
    path: '/Wishlist',
    name: 'Wishlist',
    component: Wishlist,
    meta: {
      title: 'Danh sách yêu thích',
      requiresAuth: false
    }
  },
  {
    path: '/Cart',
    name: 'Cart',
    component: Cart,
    meta: {
      title: 'Danh sách giỏ hàng',
      requiresAuth: false
    }
  },
  {
    path: '/Profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: 'Thông tin cá nhân',
      requiresAuth: false
    }
  },
  {
    path: '/consultation/call/:consultationCode',
    name: 'ConsultationCall',
    component: ConsultationCallView,
    meta: {
      title: 'Tư vấn trực tuyến',
      requiresAuth: true
    },
  },
  {
    path: '/list-order',
    name: 'ListOrder',
    component: ListOrder,
    meta: {
      title: 'Danh sách đơn hàng',
      requiresAuth: false
    }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: OrderDetail,
    meta: {
      title: 'Chi tiet đơn hàng',
      requiresAuth: false
    }
  },
  {
    path: '/Checkout',
    name: 'Checkout',
    component: Checkout,
    meta: {
      title: 'Danh sách đơn hàng hàng',
      requiresAuth: false
    }
  },
  {
    path: '/About',
    name: 'About',
    component: About,
    meta: {
      title: 'Về chúng tôi',
      requiresAuth: false
    }
  },
  {
    path: '/Contact',
    name: 'Contact',
    component: Contact,
    meta: {
      title: 'Liên hệ',
      requiresAuth: false
    }
  }
];

export default userRoutes;
