<script setup>
  import { ref, computed, defineProps, defineEmits, onMounted, watch } from "vue";
  import { useToast } from "primevue/usetoast";
  import FormDialog from "@admin/components/FormDialog.vue";
  import InputText from "primevue/inputtext";
  import Dropdown from "primevue/dropdown";
  import Textarea from "primevue/textarea";
  import ReviewService from '@admin/stores/admin/Review';
  import DoctorProfileService from '@admin/stores/admin/DoctorProfile';
  import { Medicines } from '@admin/stores/admin/Medicines';
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({
        id: 0,
        userId: 0,
        user: null,
        rating: 0,
        comment: "",
        doctorId: 0,
        medicineId: 0,
        isPositiveReview: false,
        isNegativeReview: false
      }),
    },
  });
  
  const emit = defineEmits(["update:visible", "refreshList"]);
  
  // Sử dụng visible thay vì modelValue
  const formVisible = computed({
    get: () => props.visible,
    set: (value) => emit("update:visible", value),
  });
  
  const isSubmitting = ref(false);
  const toast = useToast();
  const isEditMode = computed(() => props.data.id !== 0);
  
  // Danh sách và thông tin
  const doctors = ref([]);
  const medicines = ref([]);
  const doctorName = ref("");
  const medicineName = ref("");
  
  // Danh sách điểm đánh giá
  const ratings = [
    { label: "1/5", value: 1 },
    { label: "2/5", value: 2 },
    { label: "3/5", value: 3 },
    { label: "4/5", value: 4 },
    { label: "5/5", value: 5 }
  ];
  
  // Tải danh sách bác sĩ và thuốc
  const fetchDoctorsAndMedicines = async () => {
    try {
      // Tải danh sách bác sĩ
      const doctorResponse = await DoctorProfileService.getDoctorProfiles();
      doctors.value = doctorResponse.map(doctor => ({
        label: doctor.user?.fullName || `Bác sĩ ID: ${doctor.id}`,
        value: doctor.id
      }));
      
      // Nếu có doctorId, tìm tên bác sĩ
      if (props.data.doctorId) {
        const doctor = doctorResponse.find(doc => doc.id === props.data.doctorId);
        doctorName.value = doctor 
          ? (doctor.user?.fullName || `Bác sĩ ID: ${doctor.id}`) 
          : `Bác sĩ ID: ${props.data.doctorId}`;
      }
      
      // Tải danh sách thuốc
      const medicineResponse = await Medicines.getMedicines();
      medicines.value = medicineResponse.data.map(medicine => ({
        label: medicine.name || `Thuốc ID: ${medicine.id}`,
        value: medicine.id
      }));
      
      // Nếu có medicineId, tìm tên thuốc
      if (props.data.medicineId) {
        const medicine = medicineResponse.data.find(med => med.id === props.data.medicineId);
        medicineName.value = medicine 
          ? (medicine.name || `Thuốc ID: ${medicine.id}`) 
          : `Thuốc ID: ${props.data.medicineId}`;
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách bác sĩ và thuốc',
        life: 3000
      });
    }
  };
  
  // Theo dõi sự thay đổi của props.data để cập nhật tên bác sĩ và thuốc
  watch(() => props.data, async (newData) => {
    if (newData.doctorId) {
      try {
        const doctorProfile = await DoctorProfileService.getDoctorProfileById(newData.doctorId);
        doctorName.value = doctorProfile.user?.fullName || `Bác sĩ ID: ${newData.doctorId}`;
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin bác sĩ ${newData.doctorId}:`, error);
        doctorName.value = `Bác sĩ ID: ${newData.doctorId}`;
      }
    } else {
      doctorName.value = 'Không có';
    }
    
    if (newData.medicineId) {
      try {
        const medicine = await Medicines.getMedicineById(newData.medicineId);
        medicineName.value = medicine.name || `Thuốc ID: ${newData.medicineId}`;
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin thuốc ${newData.medicineId}:`, error);
        medicineName.value = `Thuốc ID: ${newData.medicineId}`;
      }
    } else {
      medicineName.value = 'Không có';
    }
  }, { deep: true, immediate: true });
  
  // Khi form hiển thị, tải danh sách
  watch(() => props.visible, (isVisible) => {
    if (isVisible) {
      fetchDoctorsAndMedicines();
    }
  });
  
  const validateForm = () => {
    const errors = [];
  
    if (!props.data.rating || props.data.rating < 1 || props.data.rating > 5) {
      errors.push("Vui lòng chọn điểm đánh giá hợp lệ");
    }
  
    if (!props.data.comment?.trim()) {
      errors.push("Vui lòng nhập nhận xét");
    }
  
    if (errors.length > 0) {
      errors.forEach((error) => {
        toast.add({
          severity: "warn",
          summary: "Cảnh báo",
          detail: error,
          life: 3000,
        });
      });
      return false;
    }
  
    return true;
  };
  
  const closeForm = () => {
    formVisible.value = false;
  };
  
  const saveReview = async () => {
    if (!validateForm()) return;
  
    try {
      isSubmitting.value = true;
  
      const reviewData = {
        id: props.data.id || 0,
        userId: props.data.userId,
        rating: props.data.rating,
        comment: props.data.comment,
        doctorId: props.data.doctorId || null,
        medicineId: props.data.medicineId || null,
        isPositiveReview: props.data.rating >= 4,
        isNegativeReview: props.data.rating <= 2
      };
  
      await ReviewService.saveReview(reviewData);
  
      toast.add({
        severity: "success",
        summary: "Thành Công",
        detail: isEditMode.value 
          ? "Đã cập nhật đánh giá thành công" 
          : "Đã thêm đánh giá thành công",
        life: 3000,
      });
  
      emit("refreshList");
      closeForm();
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Lỗi",
        detail:
          "Không thể lưu đánh giá: " +
          (error.response?.data?.message || error.message),
        life: 3000,
      });
      console.error("Lỗi khi lưu đánh giá:", error);
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Lấy tên người dùng
  const getUserName = (user) => {
    return user ? user.fullName || `ID: ${user.id}` : 'Không xác định';
  };
  
  // Lấy avatar người dùng
  const getUserAvatar = (user) => {
    return user && user.avatar ? user.avatar : 'https://placehold.co/100x100/EEE/999?text=Không+Có+Ảnh';
  };
  
  // Lấy loại đánh giá
  const getReviewTypeLabel = (review) => {
    if (review.isPositiveReview) return 'Tích cực';
    if (review.isNegativeReview) return 'Tiêu cực';
    return 'Trung lập';
  };
  
  // Tải dữ liệu khi component mount
  onMounted(fetchDoctorsAndMedicines);
</script>
  
<template>
  <FormDialog
    :visible="formVisible"
    :title="isEditMode ? 'Cập nhật đánh giá' : 'Thêm đánh giá mới'"
    :loading="isSubmitting"
    @save="saveReview"
    @cancel="closeForm"
    @hide="closeForm"
  >
    <div class="flex flex-col gap-4">
      <!-- User Information (Edit Mode) -->
      <div v-if="isEditMode" class="flex items-center gap-4 mb-4">
        <img 
          :src="getUserAvatar(props.data.user)" 
          :alt="getUserName(props.data.user)"
          class="w-16 h-16 rounded-full object-cover"
          @error="$event.target.src='https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'"
        />
        <div>
          <div class="font-semibold text-lg">{{ getUserName(props.data.user) }}</div>
          <div class="text-gray-500">{{ props.data.user?.email || 'Không có email' }}</div>
        </div>
      </div>

      <!-- Rating -->
      <div class="flex flex-col gap-1 w-full">
        <label for="rating" class="font-semibold">Điểm đánh giá:</label>
        <Dropdown
          id="rating"
          v-model="props.data.rating"
          :options="ratings"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn điểm đánh giá"
          class="w-full"
        />
      </div>

      <!-- Comment -->
      <div class="flex flex-col gap-1 w-full">
        <label for="comment" class="font-semibold text-gray-700">Nhận xét:</label>
        <Textarea
          id="comment"
          v-model="props.data.comment"
          placeholder="Nhập nhận xét của bạn"
          class="w-full"
          rows="4"
        />
      </div>

      <!-- Doctor -->
      <div class="flex flex-col gap-1 w-full">
        <label for="doctorId" class="font-semibold text-gray-700">Bác sĩ:</label>
        <template v-if="!isEditMode">
          <Dropdown
            id="doctorId"
            v-model="props.data.doctorId"
            :options="doctors"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn bác sĩ (nếu có)"
            class="w-full"
          />
        </template>
        <template v-else>
          <InputText
            id="doctorName"
            v-model="doctorName"
            disabled
            class="w-full disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </template>
      </div>

      <!-- Medicine -->
      <div class="flex flex-col gap-1 w-full">
        <label for="medicineId" class="font-semibold text-gray-700">Thuốc:</label>
        <template v-if="!isEditMode">
          <Dropdown
            id="medicineId"
            v-model="props.data.medicineId"
            :options="medicines"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn thuốc (nếu có)"
            class="w-full"
          />
        </template>
        <template v-else>
          <InputText
            id="medicineName"
            v-model="medicineName"
            disabled
            class="w-full disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          />
        </template>
      </div>

      <!-- Review Type (Edit Mode) -->
      <div v-if="isEditMode" class="flex flex-col gap-1 w-full">
        <label class="font-semibold text-gray-700">Loại đánh giá:</label>
        <InputText
          :value="getReviewTypeLabel(props.data)"
          disabled
          class="w-full disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  </FormDialog>
</template>