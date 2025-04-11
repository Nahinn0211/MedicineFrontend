<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useConfirm } from 'primevue/useconfirm';
  import { useToast } from 'primevue/usetoast';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Toast from 'primevue/toast';
  import ConfirmDialog from 'primevue/confirmdialog';
  import CreateDoctorProfile from './Create.vue';
  import { DoctorProfileService } from '@admin/stores/admin/DoctorProfile';
  
  const confirm = useConfirm();
  const toast = useToast();
  const doctorProfiles = ref([]);
  const selectedDoctorProfiles = ref([]);
  const isLoading = ref(false);
  
  // Quản lý trạng thái form
  const form = ref({ 
    visible: false, 
    data: {
      id: 0,
      userId: 0,
      experience: '',
      specialization: '',
      workplace: '',
      accountBalance: 0
    } 
  });
  
  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };
  
  // Tải danh sách hồ sơ bác sĩ
  const fetchDoctorProfiles = async () => {
    try {
      isLoading.value = true;
      const response = await DoctorProfileService.getDoctorProfiles();
      
      doctorProfiles.value = Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Lỗi tải danh sách hồ sơ bác sĩ:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách hồ sơ bác sĩ',
        life: 3000
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  // Lấy thông tin người dùng từ hồ sơ bác sĩ
  const getUserDetails = (user) => {
    if (!user) return {
      name: 'Không xác định',
      email: '',
      avatar: 'https://placehold.co/100x100/EEE/999?text=Không+Có+Ảnh'
    };
  
    return {
      name: user.fullName || `ID: ${user.id}`,
      email: user.email || '',
      avatar: user.avatar || 'https://placehold.co/100x100/EEE/999?text=Không+Có+Ảnh'
    };
  };
  
  // Mở form thêm/sửa hồ sơ bác sĩ
  const openForm = async (data = null) => {
    if (data && data.id) {
      try {
        const response = await DoctorProfileService.getDoctorProfileById(data.id);
        form.value = {
          visible: true,
          data: { ...response }
        };
      } catch (error) {
        console.error('Lỗi tải chi tiết hồ sơ bác sĩ:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải chi tiết hồ sơ bác sĩ',
          life: 3000
        });
      }
    } else {
      form.value = {
        visible: true,
        data: {
          id: 0,
          userId: 0,
          experience: '',
          specialization: '',
          workplace: '',
          accountBalance: 0
        }
      };
    }
  };
  
  // Xóa một hồ sơ bác sĩ
  const deleteDoctorProfile = (id) => {
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa hồ sơ bác sĩ này không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await DoctorProfileService.deleteDoctorProfile(id);
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã xóa hồ sơ bác sĩ',
            life: 3000
          });
          
          fetchDoctorProfiles();
        } catch (error) {
          console.error('Lỗi xóa hồ sơ bác sĩ:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa hồ sơ bác sĩ',
            life: 3000
          });
        }
      }
    });
  };
  
  // Xóa nhiều hồ sơ bác sĩ đã chọn
  const deleteSelectedDoctorProfiles = () => {
    if (selectedDoctorProfiles.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Chưa chọn hồ sơ bác sĩ để xóa',
        life: 3000
      });
      return;
    }
    
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa các hồ sơ bác sĩ đã chọn không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          const ids = selectedDoctorProfiles.value.map(profile => profile.id);
          await DoctorProfileService.deleteDoctorProfiles(ids);
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã xóa ${selectedDoctorProfiles.value.length} hồ sơ bác sĩ`,
            life: 3000
          });
          
          fetchDoctorProfiles();
          selectedDoctorProfiles.value = [];
        } catch (error) {
          console.error('Lỗi xóa hồ sơ bác sĩ:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa các hồ sơ bác sĩ đã chọn',
            life: 3000
          });
        }
      }
    });
  };
  
  // Tải hồ sơ bác sĩ khi component được khởi tạo
  onMounted(fetchDoctorProfiles);
  </script>
  
  <template>
    <div class="card">
      <Toast />
      <ConfirmDialog />
      
      <DataTable
        v-model:selection="selectedDoctorProfiles"
        :value="doctorProfiles"
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
            <span class="font-semibold text-xl">Quản Lý Hồ Sơ Bác Sĩ</span>
            <div class="flex gap-2">
              <Button
                v-if="selectedDoctorProfiles.length > 0"
                label="Xóa Mục Đã Chọn"
                icon="pi pi-trash"
                severity="danger"
                @click="deleteSelectedDoctorProfiles"
              />
              <Button label="Thêm Hồ Sơ Bác Sĩ" icon="pi pi-plus" @click="openForm()" />
            </div>
          </div>
        </template>
        
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        
        <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
        
        <Column field="userId" header="Bác Sĩ" sortable style="min-width: 14rem">
          <template #body="{ data }">
            <div class="flex items-center">
              <img 
                :src="getUserDetails(data.user).avatar" 
                :alt="getUserDetails(data.user).name"
                class="w-10 h-10 mr-2 object-cover rounded-full"
                @error="$event.target.src='https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'"
              />
              <div>
                <div class="font-semibold">{{ getUserDetails(data.user).name }}</div>
                <div class="text-sm text-gray-500">{{ getUserDetails(data.user).email }}</div>
              </div>
            </div>
          </template>
        </Column>
        
        <Column field="specialization" header="Chuyên Khoa" sortable style="min-width: 12rem"></Column>
        
        <Column field="experience" header="Kinh Nghiệm" sortable style="min-width: 12rem"></Column>
        
        <Column field="workplace" header="Nơi Làm Việc" sortable style="min-width: 12rem"></Column>
        
        <Column field="accountBalance" header="Số Dư Tài Khoản" sortable style="min-width: 12rem">
          <template #body="{ data }">
            <span class="font-semibold">{{ formatCurrency(data.accountBalance) }}</span>
          </template>
        </Column>
        
        <Column header="Thao Tác" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" rounded outlined @click="openForm(data)" />
              <Button icon="pi pi-trash" rounded outlined severity="danger" @click="deleteDoctorProfile(data.id)" />
            </div>
          </template>
        </Column>
        
        <template #empty>
          <div class="text-center py-4">
            <i class="pi pi-search text-gray-400 text-3xl mb-2"></i>
            <p>Không tìm thấy hồ sơ bác sĩ nào.</p>
          </div>
        </template>
        
        <template #loading>
          <div class="text-center py-4">
            <i class="pi pi-spin pi-spinner text-primary text-3xl mb-2"></i>
            <p>Đang tải dữ liệu...</p>
          </div>
        </template>
      </DataTable>
      
      <CreateDoctorProfile v-model:modelValue="form.visible" :data="form.data" @refreshList="fetchDoctorProfiles" />
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