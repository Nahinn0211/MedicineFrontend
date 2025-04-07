import { createApp } from 'vue';
import UserApp from '@/user/App.vue';
import { createPinia } from 'pinia';
import router from '@/router/index';
import '@/assets/user/css/style.css';

import '@/assets/user/plugins/jquery/jquery.js';
import '@/assets/user/plugins/bootstrap/bootstrap.min.css';
import '@/assets/user/plugins/bootstrap/bootstrap.min.js';
import '@/assets/user/plugins/google-map/gmap.js';
import '@/assets/user/plugins/icofont/icofont.css';
import '@/assets/user/plugins/icofont/icofont.min.css';
import '@/assets/user/plugins/slick-carousel/slick/slick.css';
import '@/assets/user/plugins/slick-carousel/slick/slick-theme.css';
import '@/assets/user/plugins/slick-carousel/slick/slick.min.js';
import '@/assets/user/plugins/shuffle/shuffle.min.js';



const app = createApp(UserApp);
const pinia = createPinia();

app.use(pinia);
import { useAuthStore } from './stores/auth/useAuthStore';
const authStore = useAuthStore();
authStore.initializeAuth().catch(e => console.error('Error initializing auth:', e));

app.use(router);

app.mount('#user-app');
import('../assets/user/js/script.js').catch(e => console.error('Error loading script:', e));
