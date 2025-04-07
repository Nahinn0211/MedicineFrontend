<!-- src/views/admin/vouchers/List.vue -->
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
    import { VoucherService } from '@admin/services/admin/Voucher';
    
    const confirm = useConfirm();
    const toast = useToast();
    const vouchers = ref([]);
    const selectedVouchers = ref([]);
    const isLoading = ref(false);
    
    // Trạng thái form
    const form = ref({ 
      visible: false, 
      data: {
        id: 0,
        code: '',
        voucherPercentage: 0,
        stock: 0,
        startDate: null,
        endDate: null
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
    
    // Hàm lấy danh sách voucher
    const fetchVouchers = async () => {
      try {
        isLoading.value = true;
        const response = await VoucherService.getVouchers();
        
        if (Array.isArray(response.data)) {
          vouchers.value = response.data;
        } else {
          console.error('Dữ liệu voucher không phải là mảng:', response.data);
          vouchers.value = [];
          toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Dữ liệu voucher không đúng định dạng',
            life: 3000
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu voucher:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách voucher',
          life: 3000
        });
      } finally {
        isLoading.value = false;
      }
    };
    
    // Gọi API khi component được tạo
    onMounted(() => {
      fetchVouchers();
    });
    
    // Mở form thêm hoặc sửa voucher
    const openForm = async (data = null) => {
      if (data && data.id) {
        try {
          // Nếu có id, gọi API lấy chi tiết voucher để edit
          const response = await VoucherService.getVoucherById(data.id);
          form.value = {
            visible: true,
            data: { ...response.data }
          };
        } catch (error) {
          console.error('Lỗi khi lấy thông tin voucher:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải thông tin voucher',
            life: 3000
          });
        }
      } else {
        form.value = {
          visible: true,
          data: {
            id: 0,
            code: '',
            voucherPercentage: 0,
            stock: 0,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Mặc định 1 tháng
          }
        };
      }
    };
    
    // Hàm xóa voucher
    const deleteVoucher = (id) => {
      confirm.require({
        message: 'Bạn có chắc chắn muốn xóa voucher này không?',
        header: 'Xác nhận',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Đồng ý',
        rejectLabel: 'Hủy',
        acceptClass: 'p-button-danger',
        accept: async () => {
          try {
            // Gọi API xóa voucher
            await VoucherService.deleteVouchers([id]);
            
            // Thông báo thành công
            toast.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã xóa voucher',
              life: 3000
            });
            
            fetchVouchers();
          } catch (error) {
            console.error('Lỗi khi xóa voucher:', error);
            toast.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể xóa voucher',
              life: 3000
            });
          }
        }
      });
    };
    
    // Hàm xóa nhiều voucher được chọn
    const deleteSelectedVouchers = () => {
      if (selectedVouchers.value.length === 0) {
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Chưa chọn voucher để xóa',
          life: 3000
        });
        return;
      }
      
      confirm.require({
        message: 'Bạn có chắc chắn muốn xóa các voucher đã chọn không?',
        header: 'Xác nhận',
        icon: 'pi pi-info-circle',
        acceptLabel: 'Đồng ý',
        rejectLabel: 'Hủy',
        acceptClass: 'p-button-danger',
        accept: async () => {
          try {
            // Sử dụng API xóa nhiều item
            const ids = selectedVouchers.value.map(voucher => voucher.id);
            await VoucherService.deleteVouchers(ids);
            
            // Thông báo thành công
            toast.add({
              severity: 'success',
              summary: 'Thành công',
              detail: `Đã xóa ${selectedVouchers.value.length} voucher`,
              life: 3000
            });
            
            fetchVouchers();
            selectedVouchers.value = [];
          } catch (error) {
            console.error('Lỗi khi xóa nhiều voucher:', error);
            toast.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể xóa các voucher đã chọn',
              life: 3000
            });
          }
        }
      });
    };
    
    // Kiểm tra trạng thái của voucher (đã hết hạn, đang hoạt động, sắp bắt đầu)
    const getVoucherStatus = (voucher) => {
      const now = new Date();
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);
      
      if (now < startDate) {
        return { label: 'Sắp bắt đầu', class: 'bg-blue-100 text-blue-800' };
      } else if (now > endDate) {
        return { label: 'Đã kết thúc', class: 'bg-gray-100 text-gray-800' };
      } else if (voucher.stock <= 0) {
        return { label: 'Hết lượt dùng', class: 'bg-red-100 text-red-800' };
      } else {
        return { label: 'Đang hoạt động', class: 'bg-green-100 text-green-800' };
      }
    };
    </script>
    
    <template>
      <div class="card">
        <Toast />
        <ConfirmDialog />
        
        <DataTable
          v-model:selection="selectedVouchers"
          :value="vouchers"
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
              <span class="font-semibold text-xl">Quản lý voucher</span>
              <div class="flex gap-2">
                <Button
                  v-if="selectedVouchers.length > 0"
                  label="Xóa các mục đã chọn"
                  icon="pi pi-trash"
                  severity="danger"
                  @click="deleteSelectedVouchers"
                />
                <Button label="Thêm voucher" icon="pi pi-plus" @click="openForm()" />
              </div>
            </div>
          </template>
          
          <!-- Cột chọn nhiều dòng -->
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          
          <!-- Cột ID -->
          <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
          
          <!-- Cột mã voucher -->
          <Column field="code" header="Mã voucher" sortable style="min-width: 12rem">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.code }}</span>
            </template>
          </Column>
          
          <!-- Cột phần trăm giảm giá -->
          <Column field="voucherPercentage" header="Giảm giá (%)" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <span class="font-semibold">{{ data.voucherPercentage }}%</span>
            </template>
          </Column>
          
          <!-- Cột số lượng còn lại -->
          <Column field="stock" header="Số lượng còn lại" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <span :class="data.stock <= 0 ? 'text-red-500 font-semibold' : 'font-semibold'">
                {{ data.stock }}
              </span>
            </template>
          </Column>
          
          <!-- Cột trạng thái -->
          <Column header="Trạng thái" style="min-width: 10rem">
            <template #body="{ data }">
              <span :class="`px-2 py-1 rounded-full text-xs font-semibold ${getVoucherStatus(data).class}`">
                {{ getVoucherStatus(data).label }}
              </span>
            </template>
          </Column>
          
          <!-- Cột thời gian hiệu lực -->
          <Column header="Thời gian hiệu lực" sortable style="min-width: 14rem">
            <template #body="{ data }">
              <div class="flex flex-col">
                <div><span class="font-semibold">Bắt đầu:</span> {{ formatDate(data.startDate) }}</div>
                <div><span class="font-semibold">Kết thúc:</span> {{ formatDate(data.endDate) }}</div>
              </div>
            </template>
          </Column>
          
          <!-- Cột tác vụ -->
          <Column header="Tác vụ" :exportable="false" style="min-width: 8rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined @click="openForm(data)" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" @click="deleteVoucher(data.id)" />
              </div>
            </template>
          </Column>
          
          <!-- Template khi không có dữ liệu -->
          <template #empty>
            <div class="text-center py-4">
              <i class="pi pi-search text-gray-400 text-3xl mb-2"></i>
              <p>Không tìm thấy voucher nào.</p>
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
        
        <CreateForm v-model:modelValue="form.visible" :data="form.data" @refreshList="fetchVouchers" />
      </div>
    </template>
    
  