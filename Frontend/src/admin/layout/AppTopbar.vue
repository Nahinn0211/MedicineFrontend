<script setup>
import { ref, onMounted } from 'vue';
import { useLayout } from '@admin/layout/composables/layout';
import AppBreadcrumb from './AppBreadcrumb.vue';
import { authService } from '@user/services/AuthService'
import { useAuthStore } from '@user/stores/auth/useAuthStore'

const { toggleMenu, layoutState, toggleConfigSidebar } = useLayout();
const userData = ref(null);
const authStore = useAuthStore()
const image = ref('');

function showProfileSidebar() {
    layoutState.profileSidebarVisible = !layoutState.profileSidebarVisible;
}
onMounted(async () => {
  await authStore.initializeAuth();
  userData.value = await authService.getDataUser(authService.state.user.id);
})
</script>

<template>
    <div class="layout-topbar">
        <div class="topbar-start">
            <Button type="button" class="topbar-menubutton p-trigger" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </Button>

            <AppBreadcrumb class="topbar-breadcrumb"></AppBreadcrumb>
        </div>

        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="topbar-search">
                    <IconField>
                        <InputIcon class="pi pi-search" />
                        <InputText type="text" placeholder="Search" class="w-48 sm:w-full" />
                    </IconField>
                </li>
                <!-- <li>
                    <Button icon="pi pi-palette" rounded @click="toggleConfigSidebar"></Button>
                </li> -->
                <li class="topbar-profile">
                    <Button type="button" class="topbar-sidebarbutton" @click="showProfileSidebar">
                        <img :src="userData?.avatar" alt="Profile" />
                    </Button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
