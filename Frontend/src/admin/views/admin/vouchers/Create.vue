<!-- src/views/admin/vouchers/Create.vue -->
<script setup>
  import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import FormDialog from '@admin/components/FormDialog.vue';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Calendar from 'primevue/calendar';
  import { VoucherService } from '@admin/services/admin/Voucher';

  
  const props = defineProps({
    modelValue: Boolean,
    data: {
      type: Object,
      default: () => ({
        id: 0,
        code: '',
        voucherPercentage: 0,
        stock: 0,
        startDate: null,
        endDate: null
      })
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'refreshList']);
  
  const formVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  const isSubmitting = ref(false);
  const toast = useToast();
  const isEditMode = computed(() => props.data.id !== 0);
  
  onMounted(() => {
    // Chuyển đổi chuỗi ngày thành đối tượng Date nếu đang ở chế độ sửa
    if (isEditMode.value) {
      if (props.data.startDate && typeof props.data.startDate === 'string') {
        props.data.startDate = new Date(props.data.startDate);
      }
      if (props.data.endDate && typeof props.data.endDate === 'string') {
        props.data.endDate = new Date(props.data.endDate);
      }
    } else {
      // Mặc định thời gian bắt đầu là hiện tại, kết thúc là 1 tháng sau
      if (!props.data.startDate) {
        props.data.startDate = new Date();
      }
      if (!props.data.endDate) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        props.data.endDate = endDate;
      }
    }
  });
  
  const validateForm = () => {
    const errors = [];
    
    if (!props.data.code || props.data.code.trim() === '') {
      errors.push('Vui lòng nhập mã voucher');
    }
    
    if (props.data.voucherPercentage <= 0 || props.data.voucherPercentage > 100) {
      errors.push('Phần trăm giảm giá phải lớn hơn 0 và nhỏ hơn hoặc bằng 100');
    }
    
    if (props.data.stock < 0) {
      errors.push('Số lượng voucher không thể âm');
    }
    
    if (!props.data.startDate) {
      errors.push('Vui lòng chọn ngày bắt đầu');
    }
    
    if (!props.data.endDate) {
      errors.push('Vui lòng chọn ngày kết thúc');
    }
    
    if (props.data.startDate && props.data.endDate && props.data.startDate > props.data.endDate) {
      errors.push('Ngày bắt đầu phải trước ngày kết thúc');
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
  
  const closeForm = () => {
    formVisible.value = false;
  };
  
  const saveVoucher = async () => {
    if (!validateForm()) return;
    
    try {
      isSubmitting.value = true;
      
      // Sử dụng định dạng API đã cung cấp
      await VoucherService.saveVoucher({
        id: props.data.id,
        code: props.data.code,
        voucherPercentage: props.data.voucherPercentage,
        stock: props.data.stock,
        startDate: props.data.startDate,
        endDate: props.data.endDate
      });
      
      toast.add({
        severity: 'success',
        summary: 'Thành Công',
        detail: isEditMode.value
          ? 'Đã cập nhật voucher thành công'
          : 'Đã thêm voucher thành công',
        life: 3000
      });
      
      emit('refreshList');
      closeForm();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể lưu voucher: ' + (error.response?.data?.message || error.message),
        life: 3000
      });
      console.error('Lỗi khi lưu voucher:', error);
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  <template>
    <FormDialog
      :visible="formVisible"
      :title="isEditMode ? 'Cập nhật voucher' : 'Thêm voucher mới'"
      :loading="isSubmitting"
      @save="saveVoucher"
      @cancel="closeForm"
      @hide="closeForm"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 w-full">
          <label for="voucherCode" class="font-semibold">Mã voucher:</label>
          <InputText
            id="voucherCode"
            v-model="props.data.code"
            placeholder="Nhập mã voucher"
            class="w-full"
          />
        </div>
        
        <div class="flex flex-col gap-1 w-full">
          <label for="voucherPercent" class="font-semibold">Phần trăm giảm giá (%):</label>
          <InputNumber
            id="voucherPercent"
            v-model="props.data.voucherPercentage"
            placeholder="Nhập phần trăm giảm giá"
            suffix="%"
            :min="0"
            :max="100"
            class="w-full"
          />
        </div>
        
        <div class="flex flex-col gap-1 w-full">
          <label for="voucherStock" class="font-semibold">Số lượng:</label>
          <InputNumber
            id="voucherStock"
            v-model="props.data.stock"
            placeholder="Nhập số lượng voucher"
            :min="0"
            class="w-full"
          />
        </div>
        
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex flex-col gap-1 w-full md:w-1/2">
            <label for="startDate" class="font-semibold">Ngày bắt đầu:</label>
            <Calendar
              id="startDate"
              v-model="props.data.startDate"
              dateFormat="dd/mm/yy"
              showTime
              hourFormat="24"
              class="w-full"
            />
          </div>
          
          <div class="flex flex-col gap-1 w-full md:w-1/2">
            <label for="endDate" class="font-semibold">Ngày kết thúc:</label>
            <Calendar
              id="endDate"
              v-model="props.data.endDate"
              dateFormat="dd/mm/yy"
              showTime
              hourFormat="24"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </FormDialog>
  </template>