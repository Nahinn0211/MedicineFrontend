<script setup>
  import { ref, onMounted, reactive } from 'vue';
  import { useConfirm } from 'primevue/useconfirm';
  import { useToast } from 'primevue/usetoast';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Toast from 'primevue/toast';
  import ConfirmDialog from 'primevue/confirmdialog';
  import Tag from 'primevue/tag';
  import CreateForm from './Create.vue';
  import ReviewService from '@admin/stores/admin/Review';
  import { DoctorProfileService } from '@admin/stores/admin/DoctorProfile';
  import { Medicines } from '@admin/stores/admin/Medicines';
  
  // Quản lý trạng thái
  const confirm = useConfirm();
  const toast = useToast();
  const reviews = ref([]);
  const selectedReviews = ref([]);
  const isLoading = ref(false);
  
  // Lưu trữ thông tin bác sĩ và thuốc
  const doctorInfo = reactive({});
  const medicineInfo = reactive({});
  
  // Quản lý form
  const form = ref({ 
    visible: false, 
    data: {
      id: 0,
      userId: 0,
      user: null,
      rating: 0,
      comment: '',
      doctorId: 0,
      medicineId: 0,
      isPositiveReview: false,
      isNegativeReview: false
    } 
  });
  
  // Lấy tên bác sĩ
  const getDoctorName = async (doctorId) => {
    if (!doctorId) return 'Không có';
    
    // Kiểm tra cache trước
    if (doctorInfo[doctorId]) {
      return doctorInfo[doctorId].fullName || `Bác sĩ ID: ${doctorId}`;
    }
    
    try {
      const doctorProfile = await DoctorProfileService.getDoctorProfileById(doctorId);
      
      // Lưu thông tin bác sĩ vào cache
      doctorInfo[doctorId] = doctorProfile.user || { fullName: `Bác sĩ ID: ${doctorId}` };
      
      return doctorInfo[doctorId].fullName;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin bác sĩ ${doctorId}:`, error);
      return `Bác sĩ ID: ${doctorId}`;
    }
  };
  
  // Lấy tên thuốc
  const getMedicineName = async (medicineId) => {
    if (!medicineId) return 'Không có';
    
    // Kiểm tra cache trước
    if (medicineInfo[medicineId]) {
      return medicineInfo[medicineId].name || `Thuốc ID: ${medicineId}`;
    }
    
    try {
      const medicine = await Medicines.getMedicineById(medicineId);
      
      // Lưu thông tin thuốc vào cache
      medicineInfo[medicineId] = medicine || { name: `Thuốc ID: ${medicineId}` };
      
      return medicineInfo[medicineId].name;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thuốc ${medicineId}:`, error);
      return `Thuốc ID: ${medicineId}`;
    }
  };
  
  // Tải danh sách thuốc
  const loadAllMedicines = async () => {
    try {
      const response = await Medicines.getMedicines();
      if (response && response.data && Array.isArray(response.data)) {
        response.data.forEach(medicine => {
          medicineInfo[medicine.id] = medicine;
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thuốc:', error);
    }
  };
  
  // Lấy danh sách đánh giá
  const fetchReviews = async () => {
    try {
      isLoading.value = true;
      
      // Tải danh sách thuốc để có thông tin đầy đủ
      await loadAllMedicines();
      
      const response = await ReviewService.getReviews();
      
      reviews.value = Array.isArray(response.data) ? response.data : [];
      
      // Tải thông tin bác sĩ cho các review có doctorId
      const doctorIds = [...new Set(reviews.value
        .filter(review => review.doctorId)
        .map(review => review.doctorId)
      )];
      
      // Tải thông tin thuốc cho các review có medicineId
      const medicineIds = [...new Set(reviews.value
        .filter(review => review.medicineId)
        .map(review => review.medicineId)
      )];
      
      await Promise.all([
        ...doctorIds.map(getDoctorName),
        ...medicineIds.map(getMedicineName)
      ]);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đánh giá:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách đánh giá',
        life: 3000
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  // Mở form thêm hoặc sửa đánh giá
  const openForm = async (data = null) => {
    if (data && data.id) {
      try {
        const response = await ReviewService.getReviewById(data.id);
        
        // Nếu có doctorId, tải thêm thông tin bác sĩ
        if (response.data.doctorId) {
          await getDoctorName(response.data.doctorId);
        }
        
        // Nếu có medicineId, tải thêm thông tin thuốc
        if (response.data.medicineId) {
          await getMedicineName(response.data.medicineId);
        }
        
        form.value = {
          visible: true,
          data: { ...response.data }
        };
      } catch (error) {
        console.error('Lỗi khi lấy thông tin đánh giá:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải thông tin đánh giá',
          life: 3000
        });
      }
    } else {
      form.value = {
        visible: true,
        data: {
          id: 0,
          userId: 0,
          user: null,
          rating: 0,
          comment: '',
          doctorId: 0,
          medicineId: 0,
          isPositiveReview: false,
          isNegativeReview: false
        }
      };
    }
  };
  
  // Xóa đánh giá
  const deleteReview = (id) => {
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa đánh giá này không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          await ReviewService.deleteReviews([id]);
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã xóa đánh giá',
            life: 3000
          });
          
          fetchReviews();
        } catch (error) {
          console.error('Lỗi khi xóa đánh giá:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa đánh giá',
            life: 3000
          });
        }
      }
    });
  };
  
  // Xóa nhiều đánh giá được chọn
  const deleteSelectedReviews = () => {
    if (selectedReviews.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Chưa chọn đánh giá để xóa',
        life: 3000
      });
      return;
    }
    
    confirm.require({
      message: 'Bạn có chắc chắn muốn xóa các đánh giá đã chọn không?',
      header: 'Xác nhận',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Đồng ý',
      rejectLabel: 'Hủy',
      acceptClass: 'p-button-danger',
      accept: async () => {
        try {
          const ids = selectedReviews.value.map(review => review.id);
          await ReviewService.deleteReviews(ids);
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã xóa ${selectedReviews.value.length} đánh giá`,
            life: 3000
          });
          
          fetchReviews();
          selectedReviews.value = [];
        } catch (error) {
          console.error('Lỗi khi xóa nhiều đánh giá:', error);
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể xóa các đánh giá đã chọn',
            life: 3000
          });
        }
      }
    });
  };
  
  // Lấy tên người dùng
  const getUserName = (user) => {
    return user ? user.fullName || `ID: ${user.id}` : 'Không xác định';
  };
  
  // Lấy avatar người dùng
  const getUserAvatar = (user) => {
    return user && user.avatar ? user.avatar : 'https://placehold.co/100x100/EEE/999?text=Không+Có+Ảnh';
  };
  
  // Gọi API khi component được tạo
  onMounted(fetchReviews);
</script>
  
<template>
  <div class="card">
    <Toast />
    <ConfirmDialog />
    
    <DataTable
      v-model:selection="selectedReviews"
      :value="reviews"
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
          <span class="font-semibold text-xl">Quản lý đánh giá</span>
          <div class="flex gap-2">
            <Button
              v-if="selectedReviews.length > 0"
              label="Xóa các mục đã chọn"
              icon="pi pi-trash"
              severity="danger"
              @click="deleteSelectedReviews"
            />
            <Button label="Thêm đánh giá" icon="pi pi-plus" @click="openForm()" />
          </div>
        </div>
      </template>
      
      <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
      
      <Column header="STT" :exportable="false" style="min-width: 5rem">
        <template #body="{ index }">
          {{ index + 1 }}
        </template>
      </Column>
      
      <Column field="user" header="Người đánh giá" sortable style="min-width: 14rem">
        <template #body="{ data }">
          <div class="flex items-center">
            <img 
              :src="getUserAvatar(data.user)" 
              :alt="getUserName(data.user)"
              class="w-10 h-10 mr-2 object-cover rounded-full"
              @error="$event.target.src='https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'"
            />
            <div>
              <div class="font-semibold">{{ getUserName(data.user) }}</div>
              <div class="text-sm text-gray-500">{{ data.user?.email || 'Không có email' }}</div>
            </div>
          </div>
        </template>
      </Column>
      
      <!-- Rating Column với hiển thị ngôi sao -->
      <Column field="rating" header="Điểm đánh giá" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <div class="flex items-center">
            <!-- Ngôi sao đầy với màu phù hợp với đánh giá -->
            <i v-for="i in (data.rating || 0)" :key="`star-filled-${i}`"
              class="pi pi-star-fill mr-1"
              :class="{
                'text-red-500': data.rating <= 2,
                'text-yellow-500': data.rating === 3,
                'text-green-500': data.rating >= 4
              }"></i>
            
            <!-- Ngôi sao rỗng -->
            <i v-for="i in (5 - (data.rating || 0))" :key="`star-empty-${i}`"
              class="pi pi-star text-gray-300 mr-1"></i>
            
          </div>
        </template>
      </Column>
      
      <Column field="comment" header="Nhận xét" sortable style="min-width: 14rem">
        <template #body="{ data }">
          <span>{{ data.comment || 'Không có nhận xét' }}</span>
        </template>
      </Column>
      
     
      
      <Column field="doctorId" header="Bác Sĩ" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <span>
            {{ data.doctorId 
              ? (doctorInfo[data.doctorId]?.fullName || `Bác sĩ ID: ${data.doctorId}`) 
              : 'Không có' 
            }}
          </span>
        </template>
      </Column>
      
      <Column field="medicineId" header="Thuốc" sortable style="min-width: 10rem">
        <template #body="{ data }">
          <span>
            {{ data.medicineId 
              ? (medicineInfo[data.medicineId]?.name || `Thuốc ID: ${data.medicineId}`) 
              : 'Không có' 
            }}
          </span>
        </template>
      </Column>
      
      <Column header="Tác vụ" :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined @click="openForm(data)" />
            <Button icon="pi pi-trash" rounded outlined severity="danger" @click="deleteReview(data.id)" />
          </div>
        </template>
      </Column>
      
      <template #empty>
        <div class="text-center py-4">
          <i class="pi pi-search text-gray-400 text-3xl mb-2"></i>
          <p>Không tìm thấy đánh giá nào.</p>
        </div>
      </template>
      
      <template #loading>
        <div class="text-center py-4">
          <i class="pi pi-spin pi-spinner text-primary text-3xl mb-2"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      </template>
    </DataTable>
    
    <CreateForm v-model:visible="form.visible" :data="form.data" @refreshList="fetchReviews" />
  </div>
</template>