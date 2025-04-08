<!-- src/views/admin/users/UserList.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import CreateUser from './Create.vue';
import { UserService } from '@admin/stores/admin/User';
import { UserRoleService } from '@admin/stores/admin/UserRole';
import { RoleService } from '@admin/stores/admin/Role';

const confirm = useConfirm();
const toast = useToast();
const users = ref([]);
const selectedUsers = ref([]);
const isLoading = ref(false);
const userRoles = ref({});
const roles = ref([]);

// Trạng thái tìm kiếm
const searchQuery = ref('');
const searchType = ref('fullName');
const searchTypes = [
  { label: 'Tên', value: 'fullName' },
  { label: 'Email', value: 'email' },
  { label: 'SĐT', value: 'phone' },
  { label: 'Địa chỉ', value: 'address' }
];

// Trạng thái form
const form = ref({
  visible: false,
  data: {
    id: 0,
    fullName: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    enabled: true,
    locked: false,
    countLock: 0,
    avatar: null,
    createdAt: null,
    updatedAt: null
  }
});

// Format ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Define as a function constant
const translateRole = (role) => {
  const translations = {
    'PATIENT': 'Người dùng',
    'DOCTOR': 'Bác sĩ',
    'ADMIN': 'Quản trị viên'
  };
  return translations[role] || role;
};

// Add these functions to your script setup
const hasRoles = (userId) => {
  return userRoles.value[userId] && userRoles.value[userId].length > 0;
};

const getUserRoles = (userId) => {
  return userRoles.value[userId] || [];
};

const getRoleBadgeClass = (role) => {
  // Different styling for different roles
  switch (role) {
    case 'PATIENT':
      return 'bg-blue-100 text-blue-800';
    case 'DOCTOR':
      return 'bg-green-100 text-green-800';
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Xử lý URL avatar
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;

  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  return `http://localhost:8080/uploads/users/${avatar}`;
};

// Hàm lấy danh sách vai trò
const fetchRoles = async () => {
  try {
    const response = await RoleService.getRoles();
    roles.value = response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vai trò:', error);
  }
};

// Hàm lấy vai trò của người dùng
const fetchUserRoles = async () => {
  for (const user of users.value) {
    try {
      const response = await UserRoleService.getUserRolesByUserId(user.id);
      userRoles.value[user.id] = response.data.map(userRole => {
        const role = roles.value.find(r => r.id === userRole.roleId);
        return role ? role.name : `Vai trò #${userRole.roleId}`;
      });
    } catch (error) {
      console.error(`Lỗi khi lấy vai trò cho người dùng ${user.id}:`, error);
      userRoles.value[user.id] = [];
    }
  }
};

// Hàm lấy danh sách người dùng
const fetchUsers = async () => {
  try {
    isLoading.value = true;
    const response = await UserService.getUsers();

    if (Array.isArray(response.data)) {
      // Lưu dữ liệu gốc để sử dụng cho tìm kiếm
      originalUsers.value = [...response.data];
      users.value = [...response.data];
      await fetchUserRoles();
    } else {
      console.error('Dữ liệu người dùng không phải là mảng:', response.data);
      originalUsers.value = [];
      users.value = [];
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Dữ liệu người dùng không đúng định dạng',
        life: 3000
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu người dùng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách người dùng',
      life: 3000
    });
  } finally {
    isLoading.value = false;
  }
};

// Biến lưu trữ dữ liệu gốc của người dùng
const originalUsers = ref([]);

// Hàm tìm kiếm người dùng
const searchUsers = () => {
  if (!searchQuery.value.trim()) {
    // Nếu không có từ khóa tìm kiếm, hiển thị lại toàn bộ danh sách
    users.value = [...originalUsers.value];
    return;
  }

  // Tìm kiếm dựa trên từ khóa và loại tìm kiếm
  const keyword = searchQuery.value.toLowerCase().trim();

  users.value = originalUsers.value.filter(user => {
    const fieldValue = user[searchType.value];
    if (!fieldValue) return false;

    return fieldValue.toString().toLowerCase().includes(keyword);
  });
};

// Hàm xử lý khi nhấn Enter trong thanh tìm kiếm
const handleSearchKeyUp = (event) => {
  if (event.key === 'Enter') {
    searchUsers();
  }
};

// Hàm xử lý khi xóa nội dung tìm kiếm
const handleClearSearch = () => {
  searchQuery.value = '';
  // Khôi phục danh sách gốc
  users.value = [...originalUsers.value];
};

// Gọi API khi component được tạo
onMounted(() => {
  fetchRoles();
  fetchUsers();
});

// Mở form thêm hoặc sửa người dùng
const openForm = async (data = null) => {
  if (data && data.id) {
    try {
      // Nếu có id, gọi API lấy chi tiết người dùng để edit
      const response = await UserService.getUserById(data.id);
      form.value = {
        visible: true,
        data: { ...response.data, password: '' } // Đặt password thành rỗng khi edit
      };
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải thông tin người dùng',
        life: 3000
      });
    }
  } else {
    form.value = {
      visible: true,
      data: {
        id: 0,
        fullName: '',
        phone: '',
        address: '',
        email: '',
        password: '',
        enabled: true,
        locked: false,
        countLock: 0,
        avatar: null,
        createdAt: null,
        updatedAt: null
      }
    };
  }
};

// Hàm xóa người dùng
// Hàm xóa người dùng đơn lẻ
const deleteUser = (id) => {
  confirm.require({
    message: 'Bạn có chắc chắn muốn xóa người dùng này không?',
    header: 'Xác nhận',
    icon: 'pi pi-info-circle',
    acceptLabel: 'Đồng ý',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        // Gọi API xóa người dùng với mảng chứa một ID
        await UserService.deleteUsers([id]);

        // Thông báo thành công
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa người dùng',
          life: 3000
        });

        fetchUsers();
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xóa người dùng',
          life: 3000
        });
      }
    }
  });
};

// Hàm xóa nhiều người dùng được chọn
// Hàm xóa nhiều người dùng được chọn
const deleteSelectedUsers = () => {
  if (selectedUsers.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Chưa chọn người dùng để xóa',
      life: 3000
    });
    return;
  }

  confirm.require({
    message: 'Bạn có chắc chắn muốn xóa các người dùng đã chọn không?',
    header: 'Xác nhận',
    icon: 'pi pi-info-circle',
    acceptLabel: 'Đồng ý',
    rejectLabel: 'Hủy',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        // Lấy danh sách id từ các người dùng đã chọn
        const userIds = selectedUsers.value.map(user => user.id);

        // Xóa tất cả người dùng đã chọn với một lần gọi API
        await UserService.deleteUsers(userIds);

        // Thông báo thành công
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Đã xóa ${selectedUsers.value.length} người dùng`,
          life: 3000
        });

        fetchUsers();
        selectedUsers.value = [];
      } catch (error) {
        console.error('Lỗi khi xóa nhiều người dùng:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xóa các người dùng đã chọn',
          life: 3000
        });
      }
    }
  });
};

// Chuyển đổi trạng thái kích hoạt của người dùng
const toggleUserStatus = async (user) => {
  try {
    const updatedUser = { ...user, enabled: !user.enabled };
    await UserService.saveUser(updatedUser);

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: updatedUser.enabled
        ? 'Đã kích hoạt người dùng'
        : 'Đã vô hiệu hóa người dùng',
      life: 3000
    });

    fetchUsers();
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể thay đổi trạng thái người dùng',
      life: 3000
    });
  }
};

// Chuyển đổi trạng thái khóa của người dùng
const toggleUserLock = async (user) => {
  try {
    const updatedUser = { ...user, locked: !user.locked };
    await UserService.saveUser(updatedUser);

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: updatedUser.locked
        ? 'Đã khóa người dùng'
        : 'Đã mở khóa người dùng',
      life: 3000
    });

    fetchUsers();
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái khóa của người dùng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể thay đổi trạng thái khóa của người dùng',
      life: 3000
    });
  }
};
</script>

<template>
  <div class="card">
    <Toast />
    <ConfirmDialog />

    <!-- Thêm thanh tìm kiếm -->
    <div class="search-container mb-4">
      <div class="p-inputgroup flex-1">
        <span class="p-inputgroup-addon">
          <i class="pi pi-search"></i>
        </span>
        <Dropdown v-model="searchType" :options="searchTypes" optionLabel="label" optionValue="value"
          class="w-40 mr-3 ml-3" placeholder="Tìm theo" />
        <InputText v-model="searchQuery" placeholder="Nhập từ khóa tìm kiếm..." @keyup="handleSearchKeyUp"
          class="flex-1 mr-3" style="width: 60%;" />
        <Button icon="pi pi-times" @click="handleClearSearch" v-if="searchQuery" class="p-button-secondary mr-3" />
        <Button label="Tìm kiếm" icon="pi pi-search" @click="searchUsers" />
      </div>
    </div>

    <DataTable v-model:selection="selectedUsers" :value="users" dataKey="id" :paginator="true" :rows="10"
      :loading="isLoading" showCurrentPageReport
      currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} bản ghi"
      :rowsPerPageOptions="[5, 10, 20, 50]" responsiveLayout="scroll">

      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-semibold text-xl">Danh sách tài khoản</span>
          <div class="flex gap-2">
            <Button v-if="selectedUsers.length > 0" label="Xóa các mục đã chọn" icon="pi pi-trash" severity="danger"
              @click="deleteSelectedUsers" />
            <Button label="Thêm dịch vụ" icon="pi pi-plus" @click="openForm()" />
          </div>
        </div>
      </template>
      <!-- Cột chọn nhiều dòng -->
      <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>

      <!-- Cột ID -->
      <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>

      <!-- Cột họ tên và avatar -->
      <Column field="fullName" header="Họ tên" sortable style="min-width: 14rem">
        <template #body="{ data }">
          <div class="flex items-center">
            <img :src="getAvatarUrl(data.avatar) || 'https://placehold.co/100x100/EEE/999?text=No+Avatar'"
              :alt="data.fullName" class="w-10 h-10 mr-2 object-cover rounded-full"
              @error="$event.target.src = 'https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'" />
            <span class="font-semibold">{{ data.fullName }}</span>
          </div>
        </template>
      </Column>

      <!-- Cột thông tin liên hệ -->
      <Column header="Thông tin liên hệ" style="min-width: 14rem">
        <template #body="{ data }">
          <div class="flex flex-col">
            <div><i class="pi pi-envelope mr-2"></i>{{ data.email }}</div>
            <div><i class="pi pi-phone mr-2"></i>{{ data.phone }}</div>
            <div v-if="data.address"><i class="pi pi-map-marker mr-2"></i>{{ data.address }}</div>
          </div>
        </template>
      </Column>

      <!-- Cột vai trò -->
      <template>
        <Column header="Vai trò" style="min-width: 12rem">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <template v-if="hasRoles(data.id)">
                <span v-for="(role, index) in getUserRoles(data.id)" :key="index" class="px-2 py-1 text-xs rounded-full"
                  :class="getRoleBadgeClass(role)">
                  {{ translateRole(role) }}
                </span>
              </template>
              <span v-else class="text-gray-500">
                Không có vai trò
              </span>
            </div>
          </template>
        </Column>
      </template>

      <!-- Cột trạng thái -->
      <Column header="Trạng thái" style="min-width: 10rem">
        <template #body="{ data }">
          <div class="flex flex-col gap-1">
            <div>
              <Tag :severity="data.enabled ? 'success' : 'danger'"
                :value="data.enabled ? 'Đã kích hoạt' : 'Vô hiệu hóa'" />
            </div>
            <div>
              <Tag :severity="data.locked ? 'danger' : 'success'" :value="data.locked ? 'Đã khóa' : 'Hoạt động'" />
            </div>
          </div>
        </template>
      </Column>

      <!-- Cột thời gian -->
      <Column header="Thời gian" style="min-width: 14rem">
        <template #body="{ data }">
          <div class="flex flex-col">
            <div><span class="font-semibold">Tạo:</span> {{ formatDate(data.createdAt) }}</div>
            <div><span class="font-semibold">Cập nhật:</span> {{ formatDate(data.updatedAt) }}</div>
          </div>
        </template>
      </Column>

      <!-- Cột tác vụ -->
      <Column header="Tác vụ" :exportable="false" style="min-width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined @click="openForm(data)" />
            <Button :icon="data.enabled ? 'pi pi-times' : 'pi pi-check'"
              :severity="data.enabled ? 'warning' : 'success'" rounded outlined @click="toggleUserStatus(data)"
              :title="data.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'" />
            <Button :icon="data.locked ? 'pi pi-unlock' : 'pi pi-lock'" :severity="data.locked ? 'success' : 'warning'"
              rounded outlined @click="toggleUserLock(data)" :title="data.locked ? 'Mở khóa' : 'Khóa'" />
            <Button icon="pi pi-trash" rounded outlined severity="danger" @click="deleteUser(data.id)" />
          </div>
        </template>
      </Column>

      <!-- Template khi không có dữ liệu -->
      <template #empty>
        <div class="text-center py-4">
          <i class="pi pi-search text-gray-400 text-3xl mb-2"></i>
          <p>Không tìm thấy người dùng nào.</p>
        </div>
      </template>

      <!-- Template loading -->
      <template #loading>
        <div class="text-center py-4">
          <i class="pi pi-spin pi-spinner text-primary text-3xl mb-2"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      </template>
    </DataTable>

    <CreateUser v-model:modelValue="form.visible" :data="form.data" @refreshList="fetchUsers" />
  </div>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-container {
  margin-bottom: 1rem;
}

:deep(.p-inputgroup .p-dropdown) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

:deep(.p-inputgroup .p-dropdown .p-dropdown-label) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

:deep(.p-datatable .p-datatable-header) {
  background: transparent;
  border: none;
  padding: 0 0 1rem 0;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #343a40;
  font-weight: 600;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f1f5f9;
}
</style>