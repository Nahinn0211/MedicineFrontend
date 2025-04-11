import AppLayout from '@admin/layout/AppLayout.vue';

const adminRoutes = [
  {
    path: '/admin',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'e-commerce',
        meta: {
          breadcrumb: ['Dashboard']
        },
        component: () => import('@admin/views/dashboards/Ecommerce.vue')
      },
      {
        path: 'doctor/profile',
        name: 'admin-doctor-profile',
        meta: {
          breadcrumb: ['Profile']
        },
        component: () => import('@admin/views/doctor/Index.vue')
      },
      
      {
        path: 'doctor/appointment',
        name: 'admin-doctor-appointment',
        meta: {
          breadcrumb: ['Appointment']
        },
        component: () => import('@admin/views/doctor/appointment.vue')
      },
      {
        path: 'order',
        name: 'admin-order',
        meta: {
          breadcrumb: ['Quản lý đơn hàng']
        },
        component: () => import('@admin/views/admin/order/Index.vue')
      },
      {
        path: 'reviews',
        name: 'admin-reviews',
        meta: {
          breadcrumb: ['Đánh giá']
        },
        component: () => import('@admin/views/admin/reviews/Index.vue')
      },
      {
        path: 'dashboard-banking',
        name: 'dashboard-banking',
        meta: {
          breadcrumb: ['Banking Dashboard']
        },
        component: () => import('@admin/views/dashboards/Banking.vue')
      },
      {
        path: 'customers',
        name: 'admin-customer',
        meta: {
          breadcrumb: ['Users'],
          permission: 'admin.users.index'
        },
        component: () => import('@admin/views/admin/user/Index.vue')
      },
      {
        path: 'roles',
        name: 'admin-roles',
        meta: {
          breadcrumb: ['Roles'],
          permission: 'admin.roles.index'
        },
        component: () => import('@admin/views/admin/role/Index.vue')
      },
      {
        path: 'listmedications',
        name: 'admin-listmedications',
        meta: {
          breadcrumb: ['Danh sách thuốc'],
        },
        component: () => import('@admin/views/admin/medications/Index.vue')
      },
      {
        path: 'doctorprofiles',
        name: 'admin-doctorprofiles',
        meta: {
          breadcrumb: ['Quản Lý Hồ Sơ Bác Sĩ'],
        },
        component: () => import('@admin/views/admin/doctorprofiles/Index.vue')
      },
      
      {
        path: 'brands',
        name: 'admin-brands',
        meta: {
          breadcrumb: ['Quản lý Thương hiệu'],
        },
        component: () => import('@admin/views/admin/brands/Index.vue')
      },
      {
        path: 'categories',
        name: 'admin-categories',
        meta: {
          breadcrumb: ['Quản lý danh mục'],
        },
        component: () => import('@admin/views/admin/categories/Index.vue')
      },
      
      {
        path: 'listservice',
        name: 'admin-listservice',
        meta: {
          breadcrumb: ['List of service'],
        },
        component: () => import('@admin/views/admin/listservice/Index.vue')
      },
       
      
      
      {
        path: 'role',
        name: 'admin-role',
        meta: {
          breadcrumb: ['Quản lý vai trò'],
        },
        component: () => import('@admin/views/admin/role/Index.vue')
      },
      {
        path: 'user',
        name: 'admin-user',
        meta: {
          breadcrumb: ['Setting user'],
        },
        component: () => import('@admin/views/admin/user/Index.vue')
      },
      {
        path: 'customers',
        name: 'admin-customer',
        meta: {
          breadcrumb: ['Users'],
          permission: 'admin.users.index'
        },
        component: () => import('@admin/views/admin/user/Index.vue')
      },
      {
        path: 'roles',
        name: 'admin-roles',
        meta: {
          breadcrumb: ['Roles'],
          permission: 'admin.roles.index'
        },
        component: () => import('@admin/views/admin/role/Index.vue')
      },
      {
        path: 'listmedications',
        name: 'admin-listmedications',
        meta: {
          breadcrumb: ['List of medications'],
        },
        component: () => import('@admin/views/admin/medications/Index.vue')
      },
       
      {
        path: 'patientprofiles',
        name: 'admin-patientprofiles',
        meta: {
          breadcrumb: ['Quản lý hồ sơ bệnh nhân'],
        },
        component: () => import('@admin/views/admin/patientprofiles/Index.vue')
      },
      
       
      {
        path: 'appointment',
        name: 'admin-appointment',
        meta: {
          breadcrumb: ['Danh sách lịch hẹn'],
        },
        component: () => import('@admin/views/admin/appointment/Index.vue')
      },
      {
        path: 'listservice',
        name: 'admin-listservice',
        meta: {
          breadcrumb: ['Danh sách dịch vụ'],
        },
        component: () => import('@admin/views/admin/listservice/Index.vue')
      },
      {
        path: 'servicebookings',
        name: 'admin-servicebookings',
        meta: {
          breadcrumb: ['Danh sách đặt lịch dịch vụ'],
        },
        component: () => import('@admin/views/admin/servicebookings/Index.vue')
      },
      {
        path: 'vouchers',
        name: 'admin-vouchers',
        meta: {
          breadcrumb: ['Quản lý voucher'],
        },
        component: () => import('@admin/views/admin/vouchers/Index.vue')
      },
      {
        path: 'discounts',
        name: 'admin-discounts',
        meta: {
          breadcrumb: ['Quản lý giảm giá'],
        },
        component: () => import('@admin/views/admin/discounts/Index.vue')
      },
      
      {
        path: 'user',
        name: 'admin-user',
        meta: {
          breadcrumb: ['Danh sách tài khoản'],
        },
        component: () => import('@admin/views/admin/user/Index.vue')
      }
    ]
  }
];

export default adminRoutes;