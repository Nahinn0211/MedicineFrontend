<script setup>
  import { ref, computed, defineProps, defineEmits, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import FormDialog from '@admin/components/FormDialog.vue';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import { PatientProfileService } from '@admin/stores/admin/PatientProfile';
  
  // Define props and emits
  const props = defineProps({
    modelValue: Boolean,
    data: {
      type: Object,
      default: () => ({
        id: 0,
        userId: 0,
        bloodType: '',
        medicalHistory: '',
        allergies: '',
        accountBalance: 0
      })
    },
    users: {
      type: Array,
      default: () => []
    },
    usersWithProfiles: {
      type: Object, // Set of user IDs that already have profiles
      default: () => new Set()
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'refreshList']);
  
  // Reactive state
  const formVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  const isSubmitting = ref(false);
  const toast = useToast();
  const formData = ref({
    id: 0,
    userId: 0,
    bloodType: '',
    medicalHistory: '',
    allergies: '',
    accountBalance: 0
  });
  
  // Update formData when props.data changes
  watch(() => props.data, (newData) => {
    // Đảm bảo dữ liệu form được cập nhật với định dạng chính xác
    formData.value = {
      id: newData.id || 0,
      userId: newData.userId || 0,
      bloodType: newData.bloodType || '',
      medicalHistory: newData.medicalHistory || '',
      allergies: newData.allergies || '',
      accountBalance: newData.accountBalance || 0
    };
  }, { deep: true, immediate: true });
  
  // Blood type options
  const bloodTypes = [
    { name: 'A+', value: 'A_POSITIVE' },
    { name: 'A-', value: 'A_NEGATIVE' },
    { name: 'B+', value: 'B_POSITIVE' },
    { name: 'B-', value: 'B_NEGATIVE' },
    { name: 'AB+', value: 'AB_POSITIVE' },
    { name: 'AB-', value: 'AB_NEGATIVE' },
    { name: 'O+', value: 'O_POSITIVE' },
    { name: 'O-', value: 'O_NEGATIVE' }
  ];
  
  // Computed to check if in edit mode
  const isEditMode = computed(() => formData.value.id !== 0);
  
  // Computed to filter available users (remove users that already have profiles unless in edit mode)
  const availableUsers = computed(() => {
    return props.users.filter(user => {
      // Nếu đang edit, cho phép hiển thị user đang được chọn
      if (isEditMode.value && user.id === formData.value.userId) {
        return true;
      }
      // Chỉ hiện những user chưa có hồ sơ
      return !props.usersWithProfiles.has(user.id);
    });
  });
  
  // Validate form before submission
  const validateForm = () => {
    const errors = [];
    
    if (!formData.value.userId) {
      errors.push('Vui lòng chọn bệnh nhân');
    }
    
    if (!formData.value.bloodType) {
      errors.push('Vui lòng chọn nhóm máu');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: error,
          life: 3000
        });
      });
      return false;
    }
    
    return true;
  };
  
  // Close the form
  const closeForm = () => {
    formVisible.value = false;
  };
  
  // Save patient profile
  const savePatientProfile = async () => {
    if (!validateForm()) return;
    
    try {
      isSubmitting.value = true;
      
      // Prepare data for submission
      const profileData = {
        id: isEditMode.value ? formData.value.id : undefined,
        userId: formData.value.userId,
        bloodType: formData.value.bloodType,
        medicalHistory: formData.value.medicalHistory,
        allergies: formData.value.allergies,
        accountBalance: formData.value.accountBalance
      };
      
      console.log('Gửi dữ liệu hồ sơ:', profileData);
      
      // Save patient profile
      const response = await PatientProfileService.savePatientProfile(profileData);
      console.log('Phản hồi từ API:', response);
      
      // Show success toast
      toast.add({
        severity: 'success',
        summary: 'Thành Công',
        detail: isEditMode.value
          ? 'Đã cập nhật hồ sơ bệnh nhân thành công'
          : 'Đã thêm hồ sơ bệnh nhân thành công',
        life: 3000
      });
      
      // Emit events to refresh list and close form
      emit('refreshList');
      closeForm();
    } catch (error) {
      console.error('Chi tiết lỗi:', error);
      
      // Kiểm tra nếu là lỗi vi phạm ràng buộc unique
      if (error.response?.data?.message?.includes('idx_patient_user') || 
          error.message?.includes('idx_patient_user') || 
          error.response?.data?.includes('Violation of UNIQUE KEY constraint') ||
          error.message?.includes('Violation of UNIQUE KEY constraint')) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Người dùng này đã có hồ sơ bệnh nhân. Vui lòng chọn người dùng khác.',
          life: 5000
        });
      } else {
        // Xử lý các lỗi khác
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lưu hồ sơ bệnh nhân: ' + (error.response?.data?.message || error.message),
          life: 3000
        });
      }
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Get avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    
    return `http://localhost:8080/uploads/users/${avatar}`;
  };
  </script>
  
  <template>
    <FormDialog
      :visible="formVisible"
      :title="isEditMode ? 'Cập nhật hồ sơ bệnh nhân' : 'Thêm hồ sơ bệnh nhân mới'"
      :loading="isSubmitting"
      @save="savePatientProfile"
      @cancel="closeForm"
      @hide="closeForm"
    >
      <div class="flex flex-col gap-4">
        <!-- Bệnh nhân -->
        <div class="flex flex-col gap-1 w-full">
          <label for="userId" class="font-semibold">Bệnh nhân:</label>
          <Dropdown
            id="userId"
            v-model="formData.userId"
            :options="availableUsers"
            optionLabel="name"
            optionValue="id"
            placeholder="Chọn bệnh nhân"
            class="w-full"
            :disabled="isEditMode"
          >
            <template #option="slotProps">
              <div class="flex items-center">
                <img 
                  :src="getAvatarUrl(slotProps.option.avatar) || 'https://placehold.co/100x100/EEE/999?text=No+Avatar'" 
                  :alt="slotProps.option.name"
                  class="w-8 h-8 mr-2 object-cover rounded-full"
                  @error="$event.target.src='https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'"
                />
                <div>
                  <div>{{ slotProps.option.name }}</div>
                  <div class="text-sm text-gray-500">{{ slotProps.option.email }}</div>
                </div>
              </div>
            </template>
            <template #value="slotProps">
              <div class="flex items-center" v-if="slotProps.value">
                <img 
                  :src="getAvatarUrl(props.users.find(u => u.id === slotProps.value)?.avatar) || 'https://placehold.co/100x100/EEE/999?text=No+Avatar'" 
                  :alt="props.users.find(u => u.id === slotProps.value)?.name"
                  class="w-6 h-6 mr-2 object-cover rounded-full"
                  @error="$event.target.src='https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'"
                />
                <div>{{ props.users.find(u => u.id === slotProps.value)?.name }}</div>
              </div>
              <span v-else>Chọn bệnh nhân</span>
            </template>
          </Dropdown>
          <small v-if="isEditMode" class="text-gray-500">Không thể thay đổi bệnh nhân khi cập nhật hồ sơ</small>
          <small v-else-if="availableUsers.length === 0" class="text-orange-500">
            Tất cả người dùng đã có hồ sơ bệnh nhân. Vui lòng thêm người dùng mới trước khi tạo hồ sơ.
          </small>
        </div>
        
        <!-- Nhóm máu -->
        <div class="flex flex-col gap-1 w-full">
          <label for="bloodType" class="font-semibold">Nhóm máu:</label>
          <Dropdown
            id="bloodType"
            v-model="formData.bloodType"
            :options="bloodTypes"
            optionLabel="name"
            optionValue="value"
            placeholder="Chọn nhóm máu"
            class="w-full"
          />
        </div>
        
        <!-- Tiền sử bệnh -->
        <div class="flex flex-col gap-1 w-full">
          <label for="medicalHistory" class="font-semibold">Tiền sử bệnh:</label>
          <InputText
            id="medicalHistory"
            v-model="formData.medicalHistory"
            placeholder="Nhập tiền sử bệnh"
            class="w-full"
          />
        </div>
        
        <!-- Dị ứng -->
        <div class="flex flex-col gap-1 w-full">
          <label for="allergies" class="font-semibold">Dị ứng:</label>
          <InputText
            id="allergies"
            v-model="formData.allergies"
            placeholder="Nhập dị ứng"
            class="w-full"
          />
        </div>
        
        <!-- Số dư tài khoản -->
        <div class="flex flex-col gap-1 w-full">
          <label for="accountBalance" class="font-semibold">Số dư tài khoản:</label>
          <InputNumber
            id="accountBalance"
            v-model="formData.accountBalance"
            placeholder="Nhập số dư tài khoản"
            mode="currency"
            currency="VND"
            locale="vi-VN"
            class="w-full"
          />
        </div>
      </div>
    </FormDialog>
  </template>