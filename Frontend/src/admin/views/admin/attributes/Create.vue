<script setup>
    import { ref, computed, defineProps, defineEmits, watchEffect } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import FormDialog from '@admin/components/FormDialog.vue';
    import InputText from 'primevue/inputtext';
    import InputNumber from 'primevue/inputnumber';
    import Calendar from 'primevue/calendar';
    import Dropdown from 'primevue/dropdown';
    import Message from 'primevue/message';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minValue } from '@vuelidate/validators';
    import { Attributes } from '@admin/stores/admin/AttributeService';
    import { Medicines } from '@admin/stores/admin/Medicines';

    const props = defineProps({
      modelValue: {
        type: Boolean,
        default: false
      },
      data: {
        type: Object,
        default: () => ({
          name: '',
          medicineId: null,
          priceIn: 0,
          priceOut: 0,
          stock: 0,
          expiryDate: new Date().toISOString().substring(0, 10)
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
    // Sử dụng computed thay vì truy cập trực tiếp props.data.id
    const isEditMode = computed(() => props.data && !!props.data.id);
    const submitted = ref(false);
    const medicines = ref([]);
    const formData = ref({ ...props.data });
    
    // Sử dụng watchEffect để cập nhật formData khi props.data thay đổi
    watchEffect(() => {
      if (props.data) {
        formData.value = { ...props.data };
      }
    });
    
     const fetchMedicines = async () => {
       const response = await Medicines.getMedicines();
      medicines.value = response.data;
      
      
    };
    
    // Gọi fetchMedicines trong watchEffect - sẽ chỉ chạy khi component được tạo 
    watchEffect(() => {
      if (formVisible.value) {
        fetchMedicines();
      }
    });
    
    const closeForm = () => {
      formVisible.value = false;
      resetForm();
    };
    
    const resetForm = () => {
      submitted.value = false;
      // Reset formData về giá trị default
      formData.value = {
        name: '',
        medicineId: null,
        priceIn: 0,
        priceOut: 0,
        stock: 0,
        expiryDate: new Date().toISOString().substring(0, 10)
      };
    };
    
    const rules = computed(() => {
      return {
        name: { required },
        medicineId: { required },
        priceIn: { required, minValue: minValue(0) },
        priceOut: { required, minValue: minValue(0) },
        stock: { required, minValue: minValue(0) },
        expiryDate: { required }
      };
    });
    
    const v$ = useVuelidate(rules, formData);
    
    const saveAttribute = async () => {
      submitted.value = true;
      const isFormValid = await v$.value.$validate();
      
      if (!isFormValid) {
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Vui lòng điền đầy đủ thông tin hợp lệ',
          life: 3000
        });
        return;
      }
    
      try {
        isSubmitting.value = true;
        
        // Chuẩn bị dữ liệu để gửi
        const attributeData = {
          name: formData.value.name,
          medicineId: formData.value.medicineId,
          priceIn: formData.value.priceIn,
          priceOut: formData.value.priceOut,
          stock: formData.value.stock,
          expiryDate: formData.value.expiryDate
        };
        
        // Nếu đang ở chế độ chỉnh sửa, thêm ID
        if (isEditMode.value) {
          attributeData.id = formData.value.id;
          await Attributes.updateAttribute(attributeData);
        } else {
          await Attributes.insertAttribute(attributeData);
        }
        
        toast.add({
          severity: 'success',
          summary: 'Thành Công',
          detail: isEditMode.value 
            ? 'Đã cập nhật thuộc tính thành công'
            : 'Đã thêm thuộc tính thành công',
          life: 3000
        });
        
        emit('refreshList');
        closeForm();
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lưu thuộc tính: ' + (error.response?.data?.message || error.message),
          life: 3000
        });
        console.error('Lỗi khi lưu thuộc tính:', error);
      } finally {
        isSubmitting.value = false;
      }
    };
    </script>
    
    <template>
      <FormDialog
        :visible="formVisible"
        :title="isEditMode ? 'Cập nhật thuộc tính' : 'Thêm thuộc tính mới'"
        :loading="isSubmitting"
        @save="saveAttribute"
        @cancel="closeForm"
        @hide="closeForm"
      >
        <div class="grid">
          <div class="col-12">
            <div class="field">
              <label for="name" class="font-semibold">Tên thuộc tính<span class="text-red-500">*</span></label>
              <InputText
                id="name"
                v-model="formData.name"
                placeholder="Nhập tên thuộc tính"
                class="w-full"
                :class="{ 'p-invalid': v$.name.$error && submitted }"
              />
              <small v-if="v$.name.$error && submitted" class="p-error">Vui lòng nhập tên thuộc tính</small>
            </div>
          </div>
          
          <div class="col-12">
            <div class="field">
              <label for="medicineId" class="font-semibold">Thuốc<span class="text-red-500">*</span></label>
              <Dropdown
                id="medicineId"
                v-model="formData.medicineId"
                :options="medicines"
                optionLabel="name"
                optionValue="id"
                placeholder="Chọn thuốc"
                class="w-full"
                :class="{ 'p-invalid': v$.medicineId.$error && submitted }"
              />
              <small v-if="v$.medicineId.$error && submitted" class="p-error">Vui lòng chọn thuốc</small>
            </div>
          </div>
          
          <div class="col-6">
            <div class="field">
              <label for="priceIn" class="font-semibold">Giá nhập<span class="text-red-500">*</span></label>
              <InputNumber
                id="priceIn"
                v-model="formData.priceIn"
                placeholder="Nhập giá nhập"
                class="w-full"
                :min="0"
                :class="{ 'p-invalid': v$.priceIn.$error && submitted }"
              />
              <small v-if="v$.priceIn.$error && submitted" class="p-error">Vui lòng nhập giá nhập hợp lệ</small>
            </div>
          </div>
          
          <div class="col-6">
            <div class="field">
              <label for="priceOut" class="font-semibold">Giá bán<span class="text-red-500">*</span></label>
              <InputNumber
                id="priceOut"
                v-model="formData.priceOut"
                placeholder="Nhập giá bán"
                class="w-full"
                :min="0"
                :class="{ 'p-invalid': v$.priceOut.$error && submitted }"
              />
              <small v-if="v$.priceOut.$error && submitted" class="p-error">Vui lòng nhập giá bán hợp lệ</small>
            </div>
          </div>
          
          <div class="col-6">
            <div class="field">
              <label for="stock" class="font-semibold">Tồn kho<span class="text-red-500">*</span></label>
              <InputNumber
                id="stock"
                v-model="formData.stock"
                placeholder="Nhập số lượng tồn kho"
                class="w-full"
                :min="0"
                :class="{ 'p-invalid': v$.stock.$error && submitted }"
              />
              <small v-if="v$.stock.$error && submitted" class="p-error">Vui lòng nhập số lượng tồn kho hợp lệ</small>
            </div>
          </div>
          
          <div class="col-6">
            <div class="field">
              <label for="expiryDate" class="font-semibold">Ngày hết hạn<span class="text-red-500">*</span></label>
              <Calendar
                id="expiryDate"
                v-model="formData.expiryDate"
                dateFormat="dd/mm/yy"
                placeholder="Chọn ngày hết hạn"
                showIcon
                class="w-full"
                :class="{ 'p-invalid': v$.expiryDate.$error && submitted }"
              />
              <small v-if="v$.expiryDate.$error && submitted" class="p-error">Vui lòng chọn ngày hết hạn</small>
            </div>
          </div>
        </div>
      </FormDialog>
    </template>
    
    <style scoped>
    .field {
      margin-bottom: 1rem;
    }
    .p-error {
      color: #f44336;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    </style>