<script setup>
    import { ref, onMounted } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { useConfirm } from 'primevue/useconfirm';
    import DataTable from 'primevue/datatable';
    import Column from 'primevue/column';
    import Button from 'primevue/button';
    import Menu from 'primevue/menu';
    import InputText from 'primevue/inputtext';
    import { Attributes } from '@admin/services/admin/AttributeService';
    import CreateForm from './Create.vue';
    
    // Component setup
    const toast = useToast();
    const confirm = useConfirm();
    const menuRef = ref(null);
    const attributes = ref([]);
    const isLoading = ref(false);
    const selectedAttribute = ref(null);
    const formVisible = ref(false);
    
    const menuItems = ref([
      {
        label: 'Cập nhật',
        icon: 'pi pi-pencil',
        command: () => openForm(selectedAttribute.value?.id)
      },
      {
        label: 'Xoá',
        icon: 'pi pi-trash',
        command: () => deleteAttribute(selectedAttribute.value?.id)
      }
    ]);
    
    onMounted(() => {
      fetchAttributes();
    });
    
    const fetchAttributes = async () => {
      isLoading.value = true;
      try {
        const response = await Attributes.getAttributes();
        attributes.value = response.data;
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thuộc tính:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lấy dữ liệu thuộc tính',
          life: 3000
        });
      } finally {
        isLoading.value = false;
      }
    };
    
    const openForm = (id = null) => {
      if (id) {
        // Chỉnh sửa
        fetchAttributeDetail(id);
      } else {
        // Thêm mới
        selectedAttribute.value = {
          name: '',
          medicineId: null,
          priceIn: 0,
          priceOut: 0,
          stock: 0,
          expiryDate: new Date().toISOString().substring(0, 10)
        };
      }
      formVisible.value = true;
    };
    
    const fetchAttributeDetail = async (id) => {
      try {
        const response = await Attributes.getAttributeById(id);
        selectedAttribute.value = response.data;
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết thuộc tính:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lấy chi tiết thuộc tính',
          life: 3000
        });
      }
    };
    
    const deleteAttribute = (id) => {
      confirm.require({
        message: 'Bạn có chắc chắn muốn xóa bản ghi này không?',
        header: 'Xác nhận',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Đồng ý',
        rejectLabel: 'Huỷ',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary p-button-outlined',
        accept: () => confirmDelete(id)
      });
    };
    
    const confirmDelete = async (id) => {
      try {
        await Attributes.deleteAttribute(id);
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa thuộc tính thành công',
          life: 3000
        });
        fetchAttributes();
      } catch (error) {
        console.error('Lỗi khi xóa thuộc tính:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xóa thuộc tính',
          life: 3000
        });
      }
    };
    
    const toggleMenu = (event, data) => {
      selectedAttribute.value = data;
      menuRef.value.toggle(event);
    };
    
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('vi-VN');
    };
    
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    };
    
    const refreshList = () => {
      fetchAttributes();
    };
    </script>
    
    <template>
      <div class="card">
        <ConfirmDialog></ConfirmDialog>
        <DataTable 
          :value="attributes" 
          :loading="isLoading"
          dataKey="id" 
          :paginator="true" 
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} bản ghi"
          responsiveLayout="scroll"
          stripedRows
          showGridlines
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-semibold text-xl">Danh sách Thuộc tính</span>
              <div class="flex gap-2">
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText placeholder="Tìm kiếm..." />
                </span>
                <Button type="button" icon="pi pi-plus" label="Thêm mới" outlined @click="openForm(null)" />
              </div>
            </div>
          </template>
    
          <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
          
          <Column field="name" header="Tên thuộc tính" sortable style="min-width: 14rem">
            <template #body="{ data }">
              <span class="text-primary cursor-pointer" @click="openForm(data.id)">{{ data.name }}</span>
            </template>
          </Column>
          
          <Column field="medicineId" header="ID Thuốc" sortable style="min-width: 8rem"></Column>
          
          <Column field="priceIn" header="Giá nhập" sortable style="min-width: 10rem">
            <template #body="{ data }">
              {{ formatCurrency(data.priceIn) }}
            </template>
          </Column>
          
          <Column field="priceOut" header="Giá bán" sortable style="min-width: 10rem">
            <template #body="{ data }">
              {{ formatCurrency(data.priceOut) }}
            </template>
          </Column>
          
          <Column field="stock" header="Tồn kho" sortable style="min-width: 8rem"></Column>
          
          <Column field="expiryDate" header="Ngày hết hạn" sortable style="min-width: 10rem">
            <template #body="{ data }">
              {{ formatDate(data.expiryDate) }}
            </template>
          </Column>
          
          <Column field="createdAt" header="Ngày tạo" sortable style="min-width: 10rem">
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
            </template>
          </Column>
          
          <Column header="Tác vụ" style="min-width: 10rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" outlined class="p-button-sm" @click="openForm(data.id)" />
                <Button icon="pi pi-trash" outlined severity="danger" class="p-button-sm" @click="deleteAttribute(data.id)" />
               </div>
            </template>
          </Column>
        </DataTable>
        
        <Menu :model="menuItems" ref="menuRef" popup />
        
        <CreateForm 
          v-model="formVisible" 
          :data="selectedAttribute" 
          @refreshList="refreshList"
        />
      </div>
    </template>
    
    <style scoped>
    .p-datatable-gridlines :deep(.p-datatable-thead) > tr > th {
      background-color: #f8f9fa;
    }
    
    .cursor-pointer {
      cursor: pointer;
    }
    </style>