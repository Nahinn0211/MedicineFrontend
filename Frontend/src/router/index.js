import { createRouter, createWebHistory } from 'vue-router';
import adminRoutes from '@admin/router/index.js';
import userRoutes from '@user/router/index.js';
import { authService } from '@user/services/AuthService';

const routes = [
    ...userRoutes,
    {
        path: '/admin',
        component: () => import('@admin/layout/AppLayout.vue'),
        children: adminRoutes[0].children,
        meta: { requiresAuth: true, roles: ['ADMIN', 'DOCTOR'] }
    },
    {
        path: '/unauthorized',
        name: 'Unauthorized',
        component: () => import('@user/views/Unauthorized.vue'), // Create this view
        meta: { requiresAuth: false }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!authService.isAuthenticated) {
            console.log('Not authenticated, redirecting to login');
            next('/login');
            return;
        }

        const role = localStorage.getItem('role');
        const requiredRoles = to.meta.roles;

        if (requiredRoles && requiredRoles.length > 0) {
            const normalizedUserRole = role ? role.toUpperCase() : '';
            const normalizedRequiredRoles = requiredRoles.map(role => role.toUpperCase());
            if (!normalizedRequiredRoles.includes(normalizedUserRole)) {
                console.warn('Unauthorized access attempt');
                next({
                    path: '/unauthorized',
                    query: { 
                        redirect: to.fullPath,
                        reason: 'insufficient_permissions'
                    }
                });
                return;
            }
        }
    }
    next();
});

export default router;