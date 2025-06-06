<script setup>
import { useLayout } from '@admin/layout/composables/layout';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import AppBreadCrumb from './AppBreadcrumb.vue';
import AppConfig from './AppConfig.vue';
import AppProfileSidebar from './AppProfileSidebar.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import { useAppStore } from '@admin/stores/app';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { setLayoutConfig } from '@admin/services/localStorage';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const router = useRouter();
const outsideClickListener = ref(null);

const appStore = useAppStore();
const toast = useToast();
appStore.$subscribe((mutation, state) => {
  const mutationToast = mutation.payload?.toast;
  if (mutationToast) {
    toast.add({
      severity: state.toast.severity,
      summary: state.toast.summary,
      detail: state.toast.detail,
      life: state.toast.life
    });
  }
  if (state.apiStatusCode === 401) router.push({ name: 'Login' });
});

function bindOutsideClickListener() {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive = false;
        layoutState.overlaySubmenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
        layoutState.configSidebarVisible = false;
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
}

function unbindOutsideClickListener() {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value);
    outsideClickListener.value = null;
  }
}

function isOutsideClicked(event) {
  const sidebarEl = document.querySelector('.layout-sidebar');
  const topbarButtonEl = document.querySelector('.topbar-menubutton');

  return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || topbarButtonEl?.isSameNode(event.target) || topbarButtonEl?.contains(event.target));
}

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

watch(layoutConfig, (newLayoutConfig)=> {
  setLayoutConfig(newLayoutConfig);
})

onBeforeUnmount(() => {
  unbindOutsideClickListener();
});

const containerClass = computed(() => {
  return {
    'layout-light': !layoutConfig.darkTheme,
    'layout-dark': layoutConfig.darkTheme,
    'layout-colorscheme-menu': layoutConfig.menuTheme === 'colorScheme',
    'layout-primarycolor-menu': layoutConfig.menuTheme === 'primaryColor',
    'layout-transparent-menu': layoutConfig.menuTheme === 'transparent',
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-slim': layoutConfig.menuMode === 'slim',
    'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
    'layout-horizontal': layoutConfig.menuMode === 'horizontal',
    'layout-reveal': layoutConfig.menuMode === 'reveal',
    'layout-drawer': layoutConfig.menuMode === 'drawer',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.staticMenuMobileActive,
    'layout-sidebar-active': layoutState.sidebarActive,
    'layout-sidebar-anchored': layoutState.anchored
  };
});
</script>

<template>
  <div :class="['layout-container', { ...containerClass }]">
    <AppSidebar />

    <div class="layout-content-wrapper">
      <AppTopbar />
      <AppBreadCrumb class="content-breadcrumb"></AppBreadCrumb>
      <div class="layout-content">
        <router-view></router-view>
      </div>
    </div>

    <AppProfileSidebar />
    <AppConfig />

    <Toast></Toast>
    <div class="layout-mask"></div>
  </div>
</template>
