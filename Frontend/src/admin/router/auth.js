const routes = {
  path: '/auth',
  redirect: '/auth/login',
  component: () => import('@admin/layout/AuthLayout.vue'),
  children: [
    {
      path: '/auth/login',
      name: 'Login',
      component: () => import('@admin/views/auth/Login.vue')
    },
    {
      path: '/oauth2/redirect',
      name: 'OAuth2Redirect',
      component: () => import('@admin/views/auth/Login.vue')
    }
  ]
}

export default routes