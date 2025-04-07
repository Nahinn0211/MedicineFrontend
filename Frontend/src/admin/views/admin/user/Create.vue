<script setup>
  import { ref, computed, defineProps, defineEmits, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import FormDialog from '@admin/components/FormDialog.vue';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import Password from 'primevue/password';
  import Checkbox from 'primevue/checkbox';
  import FileUpload from 'primevue/fileupload';
  import MultiSelect from 'primevue/multiselect';
  import { UserService } from '@admin/services/admin/User';
  import { RoleService } from '@admin/services/admin/Role';
  import { UserRoleService } from '@admin/services/admin/UserRole';
  
  const props = defineProps({
    modelValue: Boolean,
    data: {
      type: Object,
      default: () => ({
        id: 0,
        fullName: '',
        phone: '',
        address: '',
        email: '',
        password: '',
        enabled: true,
        locked: false,
        countLock: 0,
        avatar: null,
        createdAt: null,
        updatedAt: null
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
  const roles = ref([]);
  const selectedRoles = ref([]);
  const isEditMode = computed(() => props.data.id !== 0);
  const uploadedFile = ref(null);
  const uploadedFilePath = ref(null);
  const fileUpload = ref(null);
  const isDataLoaded = ref(false);
  
  // Fetch danh sách vai trò
  const fetchRoles = async () => {
    try {
      const response = await RoleService.getRoles();
      roles.value = response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vai trò:', error);
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể lấy danh sách vai trò',
        life: 3000
      });
    }
  };
  
   const fetchUserRoles = async () => {
    if (isEditMode.value) {
      try {
        const response = await UserRoleService.getUserRolesByUserId(props.data.id);
        selectedRoles.value = response.data.map(userRole => userRole.roleId);
      } catch (error) {
        console.error('Lỗi khi lấy vai trò của người dùng:', error);
      }
    }
  };
  
  // Hàm tải tất cả dữ liệu cần thiết
  const loadAllData = async () => {
    if (!isDataLoaded.value) {
      await fetchRoles();
      await fetchUserRoles();

      isDataLoaded.value = true;
    }
  };
  
  // Xử lý khi form hiển thị
  watch(formVisible, async (newVal) => {
    if (newVal) {
      // Reset trạng thái khi mở form
      isDataLoaded.value = false;
      
      // Load dữ liệu
      await loadAllData();
      
      // Xử lý hiển thị avatar nếu có
      if (isEditMode.value && props.data.avatar) {
        if (props.data.avatar.startsWith('http')) {
          uploadedFilePath.value = props.data.avatar;
        } else {
          uploadedFilePath.value = `http://localhost:8080/uploads/users/${props.data.avatar}`;
        }
      } else {
        uploadedFilePath.value = null;
      }
    } else {
      // Reset khi đóng form
      selectedRoles.value = [];
    }
  });
  
  const validateForm = () => {
    const errors = [];
    
    if (!props.data.fullName || props.data.fullName.trim() === '') {
      errors.push('Vui lòng nhập họ tên');
    }
    
    if (!props.data.email || props.data.email.trim() === '') {
      errors.push('Vui lòng nhập email');
    } else if (!/\S+@\S+\.\S+/.test(props.data.email)) {
      errors.push('Email không hợp lệ');
    }
    
    if (!isEditMode.value && (!props.data.password || props.data.password.trim() === '')) {
      errors.push('Vui lòng nhập mật khẩu');
    } else if (!isEditMode.value && props.data.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    if (!props.data.phone || props.data.phone.trim() === '') {
      errors.push('Vui lòng nhập số điện thoại');
    } else if (!/^\d{10,11}$/.test(props.data.phone)) {
      errors.push('Số điện thoại không hợp lệ');
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
    uploadedFile.value = null;
    uploadedFilePath.value = null;
    formVisible.value = false;
  };
  
  const onSelect = (event) => {
    if (event.files && event.files.length > 0) {
      uploadedFile.value = event.files[0];
      
      // Tạo URL xem trước
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFilePath.value = e.target.result;
      };
      reader.readAsDataURL(uploadedFile.value);
    }
  };
  
  const onUpload = (event) => {
    const [file] = event.files;
    uploadedFile.value = file;
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFilePath.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    
    toast.add({ 
      severity: 'info', 
      summary: 'Thành công', 
      detail: 'Đã tải ảnh lên', 
      life: 3000 
    });
  };
  
  const onClear = () => {
    uploadedFilePath.value = null;
    uploadedFile.value = null;
  };
  
  const saveUser = async () => {
    if (!validateForm()) return;
    
    try {
      isSubmitting.value = true;
      
      // Chuẩn bị dữ liệu người dùng theo đúng định dạng API yêu cầu
      const userData = {
        fullName: props.data.fullName,
        phone: props.data.phone,
        address: props.data.address,
        email: props.data.email,
        password: props.data.password || '', // Đảm bảo password luôn có giá trị
        enabled: props.data.enabled,
        locked: props.data.locked,
        countLock: props.data.countLock || 0
      };
      
      // Chỉ thêm ID vào dữ liệu khi ở chế độ cập nhật (ID > 0)
      if (isEditMode.value) {
        userData.id = props.data.id;
      }
      
      // Chuẩn bị FormData để gửi dữ liệu kèm file
      const formData = new FormData();
      formData.append('user', JSON.stringify(userData));
      
      if (uploadedFile.value) {
        formData.append('file', uploadedFile.value);
      }
      
      // Gọi API lưu thông tin người dùng
      const response = await UserService.saveUserWithAvatar(formData);
      const userId = response.data.id;
      
      // Cập nhật vai trò của người dùng
      if (selectedRoles.value.length > 0) {
        try {
          // Xóa tất cả vai trò hiện tại (trong trường hợp cập nhật)
          if (isEditMode.value) {
            const currentRoles = await UserRoleService.getUserRolesByUserId(userId);
            await Promise.all(
              currentRoles.data.map(userRole => UserRoleService.deleteUserRole(userRole.id))
            );
          }
          
          // Thêm vai trò mới theo đúng định dạng API yêu cầu
          await Promise.all(
            selectedRoles.value.map(roleId => 
              UserRoleService.saveUserRole({
                userId: userId,
                roleId: roleId
              })
            )
          );
        } catch (error) {
          console.error('Lỗi khi cập nhật vai trò:', error);
          toast.add({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Đã lưu người dùng nhưng có lỗi khi cập nhật vai trò',
            life: 3000
          });
        }
      }
      
      toast.add({
        severity: 'success',
        summary: 'Thành Công',
        detail: isEditMode.value
          ? 'Đã cập nhật người dùng thành công'
          : 'Đã thêm người dùng thành công',
        life: 3000
      });
      
      emit('refreshList');
      closeForm();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể lưu người dùng: ' + (error.response?.data?.message || error.message),
        life: 3000
      });
      console.error('Lỗi khi lưu người dùng:', error);
    } finally {
      isSubmitting.value = false;
    }
  };
 
 </script>
  
  <template>
    <FormDialog
      :visible="formVisible"
      :title="isEditMode ? 'Cập nhật người dùng' : 'Thêm người dùng mới'"
      :loading="isSubmitting"
      @save="saveUser"
      @cancel="closeForm"
      @hide="closeForm"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-4 md:flex-row">
          <div class="flex flex-col gap-1 w-full md:w-1/2">
            <label for="fullName" class="font-semibold">Họ và tên:</label>
            <InputText
              id="fullName"
              v-model="props.data.fullName"
              placeholder="Nhập họ và tên"
              class="w-full"
            />
          </div>
          
          <div class="flex flex-col gap-1 w-full md:w-1/2">
            <label for="email" class="font-semibold">Email:</label>
            <InputText
              id="email"
              v-model="props.data.email"
              placeholder="Nhập địa chỉ email"
              type="email"
              class="w-full"
            />
          </div>
        </div>
        
        <div class="flex flex-col gap-4 md:flex-row">
          <div class="flex flex-col gap-1 w-full md:w-1/2">
            <label for="phone" class="font-semibold">Số điện thoại:</label>
            <InputText
              id="phone"
              v-model="props.data.phone"
              placeholder="Nhập số điện thoại"
              class="w-full"
            />
          </div>
          
          <div class="flex flex-col gap-1 w-full md:w-1/2">
            <label for="password" class="font-semibold">
              Mật khẩu:
              <span v-if="isEditMode" class="text-sm text-gray-500">(Để trống nếu không thay đổi)</span>
            </label>
            <Password
              id="password"
              v-model="props.data.password"
              placeholder="Nhập mật khẩu"
              :feedback="false"
              toggleMask
              class="w-full"
            />
          </div>
        </div>
        
        <div class="flex flex-col gap-1 w-full">
          <label for="address" class="font-semibold">Địa chỉ:</label>
          <InputText
            id="address"
            v-model="props.data.address"
            placeholder="Nhập địa chỉ"
            class="w-full"
          />
        </div>
        
        <div class="flex flex-col gap-1 w-full">
          <label for="roles" class="font-semibold">Vai trò:</label>
          <MultiSelect
            id="roles"
            v-model="selectedRoles"
            :options="roles"
            optionLabel="name"
            optionValue="id"
            placeholder="Chọn vai trò"
            class="w-full"
            :loading="!isDataLoaded"
          />
        </div>
        
        <div class="flex gap-4">
          <div class="flex items-center gap-2">
            <Checkbox
              id="enabled"
              v-model="props.data.enabled"
              :binary="true"
            />
            <label for="enabled" class="cursor-pointer">Kích hoạt</label>
          </div>
          
          <div class="flex items-center gap-2">
            <Checkbox
              id="locked"
              v-model="props.data.locked"
              :binary="true"
            />
            <label for="locked" class="cursor-pointer">Khóa</label>
          </div>
        </div>
        
        <div class="flex flex-col gap-1 w-full">
          <label for="avatar" class="font-semibold">Ảnh đại diện:</label>
          <FileUpload 
            ref="fileUpload" 
            mode="basic" 
            name="file" 
            accept="image/*" 
            :maxFileSize="1000000" 
            @upload="onUpload" 
            @select="onSelect" 
            @clear="onClear" 
            :auto="false" 
            chooseLabel="Chọn ảnh" 
            class="w-full"
          />
  
          <div v-if="uploadedFilePath" class="mt-2">
            <img 
              :src="uploadedFilePath" 
              alt="Ảnh xem trước" 
              class="max-w-full h-auto max-h-40 rounded border" 
              @error="$event.target.src = 'https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'" 
            />
          </div>
        </div>
      </div>
    </FormDialog>
  </template>