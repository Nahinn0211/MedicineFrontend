<!-- src/views/admin/roles/Create.vue -->
<script setup>
  import { ref, computed, defineProps, defineEmits } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import FormDialog from '@admin/components/FormDialog.vue';
  import InputText from 'primevue/inputtext';
  import { RoleService } from '@admin/services/admin/Role';
  
  const props = defineProps({
    modelValue: Boolean,
    data: {
      type: Object,
      default: () => ({
        id: 0,
        name: ''
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
  
  const validateForm = () => {
    const errors = [];
    
    if (!props.data.name || props.data.name.trim() === '') {
      errors.push('Vui lòng nhập tên vai trò');
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
  
  const saveRole = async () => {
    if (!validateForm()) return;
    
    try {
      isSubmitting.value = true;
      
      // Sử dụng định dạng API đã cung cấp
      await RoleService.saveRole({
        id: props.data.id,
        name: props.data.name
      });
      
      toast.add({
        severity: 'success',
        summary: 'Thành Công',
        detail: isEditMode.value
          ? 'Đã cập nhật vai trò thành công'
          : 'Đã thêm vai trò thành công',
        life: 3000
      });
      
      emit('refreshList');
      closeForm();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể lưu vai trò: ' + (error.response?.data?.message || error.message),
        life: 3000
      });
      console.error('Lỗi khi lưu vai trò:', error);
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>
  
  <template>
    <FormDialog
      :visible="formVisible"
      :title="isEditMode ? 'Cập nhật vai trò' : 'Thêm vai trò mới'"
      :loading="isSubmitting"
      @save="saveRole"
      @cancel="closeForm"
      @hide="closeForm"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 w-full">
          <label for="roleName" class="font-semibold">Tên vai trò:</label>
          <InputText
            id="roleName"
            v-model="props.data.name"
            placeholder="Nhập tên vai trò"
            class="w-full"
          />
        </div>
      </div>
    </FormDialog>
  </template>