<script setup>
  import { ref, onMounted } from 'vue';
  import { useConfirm } from 'primevue/useconfirm';
  import { useToast } from 'primevue/usetoast';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Toast from 'primevue/toast';
  import ConfirmDialog from 'primevue/confirmdialog';
  import CreatePatientProfile from './Create.vue';
  import { PatientProfileService } from '@admin/stores/admin/PatientProfile';
  import { UserService } from '@admin/stores/admin/User';
  
  // Composables
  const confirm = useConfirm();
  const toast = useToast();
  
  // Reactive state
  const patientProfiles = ref([]);
  const selectedPatientProfiles = ref([]);
  const isLoading = ref(false);
  const users = ref([]);
  const usersWithProfiles = ref(new Set()); // Lưu ID của các user đã có hồ sơ bệnh nhân
  
  // Form state
  const form = ref({
    visible: false,
    data: {
      id: 0,
      userId: 0,
      bloodType: '',
      medicalHistory: '',
      allergies: '',
      accountBalance: 0
    }
  });
  
  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value || 0);
  };
  
  // Fetch danh sách người dùng
  const fetchUsers = async () => {
    try {
      const response = await UserService.getUsers();
      if (Array.isArray(response.data)) {
        users.value = response.data.map(user => ({
          id: user.id,
          name: user.fullName,
          email: user.email,
          avatar: user.avatar
        }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
    }
  };
  
  // Fetch patient profiles
  const fetchPatientProfiles = async () => {
    try {
      isLoading.value = true;
      const response = await PatientProfileService.getPatientProfiles();
      
      // Xử lý dữ liệu từ API
      let profiles = [];
      if (Array.isArray(response)) {
        profiles = response;
      } else if (response && Array.isArray(response.data)) {
        profiles = response.data;
      } else if (response && typeof response === 'object') {
        // Kiểm tra nếu đối tượng có thuộc tính id (trường hợp API trả về một hồ sơ duy nhất)
        if (response.id !== undefined) {
          profiles = [response];
        } else if (Array.isArray(Object.values(response)[0])) {
          // Trường hợp API trả về đối tượng chứa mảng
          profiles = Object.values(response)[0];
        }
      }
      
      // Cập nhật state
      patientProfiles.value = profiles;
      
      // Cập nhật danh sách người dùng đã có hồ sơ
      usersWithProfiles.value = new Set(profiles.map(profile => profile.userId));
      
      console.log('Đã tải hồ sơ bệnh nhân:', profiles);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu hồ sơ bệnh nhân:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách hồ sơ bệnh nhân',
        life: 3000
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  // Open form for adding/editing patient profile
  const openForm = async (data = null) => {
    if (data && data.id) {
      try {
        // Chỉnh sửa hồ sơ hiện có
        const response = await PatientProfileService.getPatientProfileById(data.id);
        
        // Đảm bảo dữ liệu phù hợp với cấu trúc API trả về
        let profileData;
        
        if (response && typeof response === 'object') {
          // Trực tiếp sử dụng response nếu nó có cấu trúc đúng
          profileData = {
            id: response.id || 0,
            userId: response.userId || 0,
            bloodType: response.bloodType || '',
            medicalHistory: response.medicalHistory || '',
            allergies: response.allergies || '',
            accountBalance: response.accountBalance || 0
          };
        } else if (response && response.data && typeof response.data === 'object') {
          // Hoặc sử dụng response.data nếu có
          const data = response.data;
          profileData = {
            id: data.id || 0,
            userId: data.userId || 0,
            bloodType: data.bloodType || '',
            medicalHistory: data.medicalHistory || '',
            allergies: data.allergies || '',
            accountBalance: data.accountBalance || 0
          };
        } else {
          throw new Error('Dữ liệu không hợp lệ từ API');
        }
        
        form.value = {
          visible: true,
          data: profileData
        };
      } catch (error) {
        console.error('Lỗi khi lấy thông tin hồ sơ bệnh nhân:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin hồ sơ bệnh nhân',
          life: 3000
        });
      }
    } else {
      // Thêm hồ sơ mới
      form.value = {
        visible: true,
        data: {
          id: 0,
          userId: 0,
          bloodType: '',
          medicalHistory: '',
          allergies: '',
          accountBalance: 0
        }
      };
    }
  };
  
  // Delete a single patient profile
  const deletePatientProfile = (id) => {
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân này không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await PatientProfileService.deletePatientProfiles([id]);
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã xóa hồ sơ bệnh nhân',
            life: 3000
          });
          
          fetchPatientProfiles();
        } catch (error) {
          console.error('Lỗi khi xóa hồ sơ bệnh nhân:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa hồ sơ bệnh nhân',
            life: 3000
          });
        }
      }
    });
  };
  
  // Delete multiple selected patient profiles
  const deleteSelectedPatientProfiles = () => {
    if (selectedPatientProfiles.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Chưa chọn hồ sơ bệnh nhân để xóa',
        life: 3000
      });
      return;
    }
    
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa các hồ sơ bệnh nhân đã chọn không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          const ids = selectedPatientProfiles.value.map(profile => profile.id);
          await PatientProfileService.deletePatientProfiles(ids);
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã xóa ${selectedPatientProfiles.value.length} hồ sơ bệnh nhân`,
            life: 3000
          });
          
          fetchPatientProfiles();
          selectedPatientProfiles.value = [];
        } catch (error) {
          console.error('Lỗi khi xóa nhiều hồ sơ bệnh nhân:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa các hồ sơ bệnh nhân đã chọn',
            life: 3000
          });
        }
      }
    });
  };
  
  // Get user avatar URL
  const getUserAvatar = (profile) => {
    const avatar = profile.user?.avatar;
    if (!avatar) return 'https://placehold.co/100x100/EEE/999?text=No+Avatar';
    
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    
    return `http://localhost:8080/uploads/users/${avatar}`;
  };
  
  // Lifecycle hook
  onMounted(() => {
    fetchUsers();
    fetchPatientProfiles();
  });
  </script>
  
  <template>
    <div class="card">
      <Toast />
      <ConfirmDialog />
      
      <DataTable
        v-model:selection="selectedPatientProfiles"
        :value="patientProfiles"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :loading="isLoading"
        showCurrentPageReport
        currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} bản ghi"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        responsiveLayout="scroll"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-xl">Quản lý hồ sơ bệnh nhân</span>
            <div class="flex gap-2">
              <Button
                v-if="selectedPatientProfiles.length > 0"
                label="Xóa các mục đã chọn"
                icon="pi pi-trash"
                severity="danger"
                @click="deleteSelectedPatientProfiles"
              />
              <Button label="Thêm hồ sơ bệnh nhân" icon="pi pi-plus" @click="openForm()" />
            </div>
          </div>
        </template>
        
        <!-- Cột chọn nhiều dòng -->
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        
        <!-- Cột ID -->
        <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
        
        <!-- Cột bệnh nhân -->
        <Column field="userId" header="Bệnh nhân" sortable style="min-width: 14rem">
          <template #body="{ data }">
            <div class="flex items-center" v-if="data.user">
              <img 
                :src="getUserAvatar(data)" 
                :alt="data.user.fullName"
                class="w-10 h-10 mr-2 object-cover rounded-full"
                @error="$event.target.src='https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'"
              />
              <div>
                <div class="font-semibold">{{ data.user.fullName }}</div>
                <div class="text-sm text-gray-500">{{ data.user.email }}</div>
              </div>
            </div>
            <div v-else>Không có thông tin</div>
          </template>
        </Column>
        
        <!-- Cột nhóm máu -->
        <Column field="bloodType" header="Nhóm máu" sortable style="min-width: 8rem"></Column>
        
        <!-- Cột tiền sử bệnh -->
        <Column field="medicalHistory" header="Tiền sử bệnh" sortable style="min-width: 12rem"></Column>
        
        <!-- Cột dị ứng -->
        <Column field="allergies" header="Dị ứng" sortable style="min-width: 12rem"></Column>
        
        <!-- Cột số dư tài khoản -->
        <Column field="accountBalance" header="Số dư tài khoản" sortable style="min-width: 12rem">
          <template #body="{ data }">
            <span class="font-semibold">{{ formatCurrency(data.accountBalance) }}</span>
          </template>
        </Column>
        
        <!-- Cột tác vụ -->
        <Column header="Tác vụ" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" rounded outlined @click="openForm(data)" />
              <Button icon="pi pi-trash" rounded outlined severity="danger" @click="deletePatientProfile(data.id)" />
            </div>
          </template>
        </Column>
        
        <!-- Template khi không có dữ liệu -->
        <template #empty>
          <div class="text-center py-4">
            <i class="pi pi-search text-gray-400 text-3xl mb-2"></i>
            <p>Không tìm thấy hồ sơ bệnh nhân nào.</p>
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
      
      <CreatePatientProfile 
        v-model:modelValue="form.visible" 
        :data="form.data"
        :users="users"
        :usersWithProfiles="usersWithProfiles"
        @refreshList="fetchPatientProfiles" 
      />
    </div>
  </template>
  
  <style scoped>
  .card {
    padding: 1.5rem;
    border-radius: 0.5rem;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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