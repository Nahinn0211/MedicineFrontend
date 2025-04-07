<!-- CategoryList.vue -->
<script setup>
  import { ref, onMounted } from 'vue';
  import { useConfirm } from 'primevue/useconfirm';
  import CreateForm from './Create.vue';
  import { Categories } from '@admin/services/admin/Categories';
  import { useToast } from 'primevue/usetoast';
  
  const confirm = useConfirm();
  const toast = useToast();
  const categories = ref([]);
  const selectedCategories = ref([]);
  
  // Trạng thái form
  const form = ref({ visible: false, data: {} });
  
  const columns = ref([
    { field: 'name', label: 'Tên danh mục', visible: true },
    { field: 'parentId', label: 'Danh mục cha', visible: true },
    { field: 'createdAt', label: 'Ngày tạo', visible: true },
    { field: 'updatedAt', label: 'Ngày cập nhật', visible: true }
  ]);
  
  // Hàm lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await Categories.getCategories();
      categories.value = response.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu danh mục:', error);
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Không thể tải danh sách danh mục', 
        life: 3000 
      });
    }
  };
  
  // Gọi API khi component được tạo
  onMounted(fetchCategories);
  
  // Mở form thêm hoặc sửa danh mục
  const openForm = async (data = null) => {
    if (data && data.id) {
      try {
        // Nếu có id, gọi API lấy chi tiết danh mục để edit
        const response = await Categories.getCategoryById(data.id);
        form.value = {
          visible: true,
          data: { ...response.data }
        };
      } catch (error) {
        console.error('Lỗi khi lấy thông tin danh mục:', error);
        toast.add({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Không thể tải thông tin danh mục', 
          life: 3000 
        });
      }
    } else {
      form.value = {
        visible: true,
        data: { name: '', parentId: null }
      };
    }
  };
  
  // Hàm xóa nhiều hoặc một item
  const handleDelete = (ids) => {
    confirm.require({
      message: ids.length > 1 
        ? 'Bạn có chắc chắn muốn xóa các danh mục đã chọn không?' 
        : 'Bạn có chắc chắn muốn xóa danh mục này không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      accept: async () => {
        try {
          // Nếu ids là số (xóa 1 item) thì chuyển thành mảng
          const deleteIds = Array.isArray(ids) ? ids : [ids];
          
          await Categories.deleteCategories(deleteIds);
          
          // Thông báo thành công
          toast.add({ 
            severity: 'success', 
            summary: 'Thành công', 
            detail: `Đã xóa ${deleteIds.length} danh mục`, 
            life: 3000 
          });
          
          fetchCategories();
          
          // Reset selection nếu xóa nhiều item
          if (deleteIds.length > 1) {
            selectedCategories.value = [];
          }
        } catch (error) {
          console.error('Lỗi khi xóa danh mục:', error);
          toast.add({ 
            severity: 'error', 
            summary: 'Lỗi', 
            detail: 'Không thể xóa danh mục', 
            life: 3000 
          });
        }
      }
    });
  };
  
  // Thay thế hàm confirmDelete cũ
  const confirmDelete = (id) => {
    handleDelete(id);
  };
  
  // Thêm hàm xóa nhiều item được chọn
  const deleteSelectedCategories = () => {
    if (selectedCategories.value.length === 0) {
      toast.add({ 
        severity: 'warn', 
        summary: 'Cảnh báo', 
        detail: 'Chưa chọn danh mục để xóa', 
        life: 3000 
      });
      return;
    }
    
    handleDelete(selectedCategories.value.map(category => category.id));
  };
  
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
  
  // Tìm tên danh mục cha
  const findParentName = (parentId) => {
    const parentCategory = categories.value.find(cat => cat.id === parentId);
    return parentCategory ? parentCategory.name : 'Không có';
  };
  </script>
  
  <template>
    <div class="card">
      <Toast />
      <ConfirmDialog />
      
      <DataTable 
        v-model:selection="selectedCategories" 
        :value="categories" 
        dataKey="id" 
        :paginator="true"
        :rows="5" 
        showCurrentPageReport
        currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} bản ghi"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-xl">Danh mục</span>
            <div class="flex gap-2">
              <!-- Nút xóa nhiều item -->
              <Button 
                v-if="selectedCategories.length > 0" 
                label="Xóa các mục đã chọn" 
                icon="pi pi-trash" 
                severity="danger" 
                @click="deleteSelectedCategories"
              />
              <Button label="Thêm danh mục" icon="pi pi-plus" @click="openForm()" />
            </div>
          </div>
        </template>
        
        <!-- Cột chọn nhiều dòng -->
        <Column selectionMode="multiple" style="width: 3rem"></Column>
        
        <!-- Hiển thị cột ID -->
        <Column field="id" header="ID" sortable style="width: 5rem"></Column>
        
        <!-- Duyệt qua tất cả các cột để hiển thị -->
        <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.label" sortable>
          <template #body="{ data }">
            <span v-if="col.field === 'parentId'">
              {{ findParentName(data.parentId) }}
            </span>
            <span v-else-if="col.field === 'createdAt' || col.field === 'updatedAt'">
              {{ formatDate(data[col.field]) }}
            </span>
            <span v-else>
              {{ data[col.field] || '---' }}
            </span>
          </template>
        </Column>
        
        <Column header="Tác vụ" style="width: 10rem">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" class="mr-2" @click="openForm(data)" />
            <Button icon="pi pi-trash" outlined severity="danger" @click="confirmDelete(data.id)" />
          </template>
        </Column>
      </DataTable>
      
      <CreateForm v-model:modelValue="form.visible" :data="form.data" @refreshList="fetchCategories" />
    </div>
  </template>
  
  <style scoped>
  .card {
    padding: 1rem;
  }
  </style>