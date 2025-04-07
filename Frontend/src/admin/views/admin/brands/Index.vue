<!-- BrandList.vue -->
<script setup>
  import { ref, onMounted } from 'vue';
  import { useConfirm } from 'primevue/useconfirm';
  import CreateForm from './Create.vue';
  import { Brands } from '@admin/stores/admin/Brands';
  import { useToast } from 'primevue/usetoast';
  
  const confirm = useConfirm();
  const toast = useToast();
  const brands = ref([]);
  const selectedBrands = ref([]);
  
  // Trạng thái form
  const form = ref({ visible: false, data: {} });
  
  const columns = ref([
    { field: 'name', label: 'Tên thương hiệu', visible: true },
    { field: 'image', label: 'Hình ảnh', visible: true },
    { field: 'createdAt', label: 'Ngày tạo', visible: true },
    { field: 'updatedAt', label: 'Ngày cập nhật', visible: true }
  ]);
  
  // Hàm lấy danh sách thương hiệu
  const fetchBrands = async () => {
    try {
      const response = await Brands.getBrands();
      brands.value = response.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thương hiệu:', error);
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Không thể tải danh sách thương hiệu', 
        life: 3000 
      });
    }
  };
  
  // Gọi API khi component được tạo
  onMounted(fetchBrands);
  
  // Mở form thêm hoặc sửa thương hiệu
  const openForm = async (data = null) => {
    if (data && data.id) {
      try {
        // Nếu có id, gọi API lấy chi tiết brand để edit
        const response = await Brands.getBrandById(data.id);
        form.value = {
          visible: true,
          data: { ...response.data }
        };
      } catch (error) {
        console.error('Lỗi khi lấy thông tin thương hiệu:', error);
        toast.add({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Không thể tải thông tin thương hiệu', 
          life: 3000 
        });
      }
    } else {
      form.value = {
        visible: true,
        data: { name: '', image: '' }
      };
    }
  };
  
  // Hàm xóa nhiều hoặc một item
  const handleDelete = (ids) => {
    confirm.require({
      message: ids.length > 1 
        ? 'Bạn có chắc chắn muốn xóa các thương hiệu đã chọn không?' 
        : 'Bạn có chắc chắn muốn xóa thương hiệu này không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      accept: async () => {
        try {
          // Nếu ids là số (xóa 1 item) thì chuyển thành mảng
          const deleteIds = Array.isArray(ids) ? ids : [ids];
          
          await Brands.deleteBrands(deleteIds);
          
          // Thông báo thành công
          toast.add({ 
            severity: 'success', 
            summary: 'Thành công', 
            detail: `Đã xóa ${deleteIds.length} thương hiệu`, 
            life: 3000 
          });
          
          fetchBrands();
          
          // Reset selection nếu xóa nhiều item
          if (deleteIds.length > 1) {
            selectedBrands.value = [];
          }
        } catch (error) {
          console.error('Lỗi khi xóa thương hiệu:', error);
          toast.add({ 
            severity: 'error', 
            summary: 'Lỗi', 
            detail: 'Không thể xóa thương hiệu', 
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
  const deleteSelectedBrands = () => {
    if (selectedBrands.value.length === 0) {
      // Không có item nào được chọn
      toast.add({ 
        severity: 'warn', 
        summary: 'Cảnh báo', 
        detail: 'Chưa chọn thương hiệu để xóa', 
        life: 3000 
      });
      return;
    }
    
    handleDelete(selectedBrands.value.map(brand => brand.id));
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
  
  // Xử lý URL hình ảnh
  const getImageUrl = (image) => {
    if (!image) return null;
    
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    return `http://localhost:8080/uploads/brands/${image}`;
  };
  </script>
  
  <template>
    <div class="card">
      <Toast />
      <ConfirmDialog />
      
      <DataTable 
        v-model:selection="selectedBrands" 
        :value="brands" 
        dataKey="id" 
        :paginator="true"
        :rows="5" 
        showCurrentPageReport
        currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} bản ghi"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold text-xl">Thương hiệu</span>
            <div class="flex gap-2">
              <!-- Nút xóa nhiều item -->
              <Button 
                v-if="selectedBrands.length > 0" 
                label="Xóa các mục đã chọn" 
                icon="pi pi-trash" 
                severity="danger" 
                @click="deleteSelectedBrands"
              />
              <Button label="Thêm thương hiệu" icon="pi pi-plus" @click="openForm()" />
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
            <span v-if="col.field === 'image'">
              <div class="flex justify-center items-center">
                <img 
                  v-if="data.image" 
                  :src="getImageUrl(data.image)" 
                  alt="Hình ảnh thương hiệu" 
                  class="w-16 h-16 object-contain border rounded shadow-sm"
                  @error="$event.target.src = 'https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'"
                />
                <div v-else class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border">
                  <i class="pi pi-image text-gray-400 text-xl"></i>
                </div>
              </div>
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
      
      <CreateForm v-model:modelValue="form.visible" :data="form.data" @refreshList="fetchBrands" />
    </div>
  </template>
  
  <style scoped>
  .card {
    padding: 1rem;
  }
  </style>