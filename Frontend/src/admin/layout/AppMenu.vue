<script setup>
import { ref, computed } from "vue";
import AppSubMenu from "./AppSubMenu.vue";

const getUserRole = () => {
  const token = localStorage.getItem("token"); // Lấy token từ localStorage
  if (!token) return null;

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Giả sử JWT
    return decodedToken.role; // Trả về role từ token
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};

const role = ref(getUserRole()); // Lấy role hiện tại

const menuItems = computed(() => {
  const allMenu = [
    {
      label: "Hồ sơ bác sĩ",
      icon: "pi pi-fw pi-compass",
      items: [
        {
          label: "Hồ sơ bác sĩ",
          icon: "pi pi-fw pi-list",
          to: "/admin/doctor/profile",
        },
      ],
    },
    {
      label: "Thuốc",
      icon: "pi pi-fw pi-compass",
      items: [
        {
          label: "Danh sách thuốc",
          icon: "pi pi-fw pi-list",
          to: "/admin/listmedications",
        },
      ],
    },
    {
      label: "Bác sĩ",
      icon: "pi pi-fw pi-compass",
      items: [
        {
          label: "Danh sách bác sĩ",
          icon: "pi pi-fw pi-list",
          to: "/admin/doctorprofiles",
        },
      ],
    },
    {
      label: "Dịch vụ",
      icon: "pi pi-fw pi-compass",
      items: [
        {
          label: "Tư vấn",
          icon: "pi pi-fw pi-list",
          to: "/admin/consultations",
        },
        {
          label: "Danh sách dịch vụ",
          icon: "pi pi-fw pi-list",
          to: "/admin/listservice",
        },
        {
          label: "Đặt lịch dịch vụ",
          icon: "pi pi-fw pi-list",
          to: "/admin/servicebookings",
        },
      ],
    },
    {
      label: "Cài đặt giao diện người dùng",
      icon: "pi pi-fw pi-compass",
      items: [
        {
          label: "Thuộc tính",
          icon: "pi pi-fw pi-list",
          to: "/admin/attributes",
        },
        {
          label: "Thương hiệu",
          icon: "pi pi-fw pi-list",
          to: "/admin/brands",
        },
        {
          label: "Danh mục",
          icon: "pi pi-fw pi-list",
          to: "/admin/categories",
        },
      ],
    },
    {
      label: "Ưu đãi",
      icon: "pi pi-fw pi-compass",
      items: [
        {
          label: "Phiếu giảm giá",
          icon: "pi pi-fw pi-list",
          to: "/admin/vouchers",
        },
        {
          label: "Giảm giá",
          icon: "pi pi-fw pi-list",
          to: "/admin/discounts",
        },
      ],
    },
    {
      label: "Cài đặt",
      icon: "pi pi-fw pi-compass",
      items: [
        {
          label: "Vai trò",
          icon: "pi pi-fw pi-list",
          to: "/admin/role",
        },
        {
          label: "Người dùng",
          icon: "pi pi-fw pi-list",
          to: "/admin/user",
        },
      ],
    },
  ];

  if (role.value === "DOCTOR") {
    return allMenu.filter((menu) => menu.label === "Hồ sơ bác sĩ");
  } else if (role.value === "ADMIN") {
    return allMenu.filter((menu) => menu.label !== "Hồ sơ bác sĩ");
  } else {
    return [];
  }
});
</script>

<template>
  <AppSubMenu :model="menuItems" />
</template>

<style lang="scss" scoped></style>
