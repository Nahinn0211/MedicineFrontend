<!-- src/views/admin/roles/List.vue -->
<script setup>
  import { ref, onMounted } from 'vue';
  import { useConfirm } from 'primevue/useconfirm';
  import { useToast } from 'primevue/usetoast';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Toast from 'primevue/toast';
  import ConfirmDialog from 'primevue/confirmdialog';
  import CreateForm from './Create.vue';
  import { RoleService } from '@admin/services/admin/Role';
  
  const confirm = useConfirm();
  const toast = useToast();
  const roles = ref([]);
  const selectedRoles = ref([]);
  const isLoading = ref(false);
  
  // Trạng thái form
  const form = ref({ 
    visible: false, 
    data: {
      id: 0,
      name: ''
    } 
  });
  
  // Hàm lấy danh sách vai trò
  const fetchRoles = async () => {
    try {
      isLoading.value = true;
      const response = await RoleService.getRoles();
      
      if (Array.isArray(response.data)) {
        roles.value = response.data;
      } else {
        console.error('Dữ liệu vai trò không phải là mảng:', response.data);
        roles.value = [];
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Dữ liệu vai trò không đúng định dạng',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu vai trò:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách vai trò',
        life: 3000
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  // Gọi API khi component được tạo
  onMounted(() => {
    fetchRoles();
  });
  
  // Mở form thêm hoặc sửa vai trò
  const openForm = async (data = null) => {
    if (data && data.id) {
      try {
        // Nếu có id, gọi API lấy chi tiết vai trò để edit
        const response = await RoleService.getRoleById(data.id);
        form.value = {
          visible: true,
          data: { ...response.data }
        };
      } catch (error) {
        console.error('Lỗi khi lấy thông tin vai trò:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin vai trò',
          life: 3000
        });
      }
    } else {
      form.value = {
        visible: true,
        data: {
          id: 0,
          name: ''
        }
      };
    }
  };
  
  // Hàm xóa vai trò
  const deleteRole = (id) => {
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa vai trò này không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          // Gọi API xóa vai trò
          await RoleService.deleteRoles([id]);
          
          // Thông báo thành công
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã xóa vai trò',
            life: 3000
          });
          
          fetchRoles();
        } catch (error) {
          console.error('Lỗi khi xóa vai trò:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa vai trò',
            life: 3000
          });
        }
      }
    });
  };
  
  // Hàm xóa nhiều vai trò được chọn
  const deleteSelectedRoles = () => {
    if (selectedRoles.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Chưa chọn vai trò để xóa',
        life: 3000
      });
      return;
    }
    
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa các vai trò đã chọn không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          // Sử dụng API xóa nhiều item
          const ids = selectedRoles.value.map(role => role.id);
          await RoleService.deleteRoles(ids);
          
          // Thông báo thành công
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã xóa ${selectedRoles.value.length} vai trò`,
            life: 3000
          });
          
          fetchRoles();
          selectedRoles.value = [];
        } catch (error) {
          console.error('Lỗi khi xóa nhiều vai trò:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa các vai trò đã chọn',
            life: 3000
          });
        }
      }
    });
  };
  </script>
  
  <template>
    <div class="card">
      <Toast />
      <ConfirmDialog />
      
      <DataTable
        v-model:selection="selectedRoles"
        :value="roles"
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
            <span class="font-semibold text-xl">Quản lý vai trò</span>
            <div class="flex gap-2">
              <Button
                v-if="selectedRoles.length > 0"
                label="Xóa các mục đã chọn"
                icon="pi pi-trash"
                severity="danger"
                @click="deleteSelectedRoles"
              />
              <Button label="Thêm vai trò" icon="pi pi-plus" @click="openForm()" />
            </div>
          </div>
        </template>
        
        <!-- Cột chọn nhiều dòng -->
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
        
        <!-- Cột ID -->
        <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
        
        <!-- Cột tên vai trò -->
        <Column field="name" header="Tên vai trò" sortable style="min-width: 14rem">
          <template #body="{ data }">
            <span class="font-semibold">{{ data.name }}</span>
          </template>
        </Column>
        
        <!-- Cột tác vụ -->
        <Column header="Tác vụ" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" rounded outlined @click="openForm(data)" />
              <Button icon="pi pi-trash" rounded outlined severity="danger" @click="deleteRole(data.id)" />
            </div>
          </template>
        </Column>
        
        <!-- Template khi không có dữ liệu -->
        <template #empty>
          <div class="text-center py-4">
            <i class="pi pi-search text-gray-400 text-3xl mb-2"></i>
            <p>Không tìm thấy vai trò nào.</p>
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
      
      <CreateForm v-model:modelValue="form.visible" :data="form.data" @refreshList="fetchRoles" />
    </div>
  </template>
  