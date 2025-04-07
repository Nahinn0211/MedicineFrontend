<script setup>
  import { ref, computed, watchEffect } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import FormDialog from '@admin/components/FormDialog.vue';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Textarea from 'primevue/textarea';
  import MultiSelect from 'primevue/multiselect';
  import FileUpload from 'primevue/fileupload';  
  import { ListService } from '@admin/stores/admin/ListService';
  import { DoctorService } from '@admin/stores/admin/DoctorService';
  import { DoctorProfileService } from '@admin/stores/admin/DoctorProfile';
  
  const props = defineProps({
      modelValue: Boolean,
      data: {
          type: Object,
          default: () => ({
              name: '',
              price: null,
              description: '',
              image: '',
              doctorIds: []
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
  const isEditMode = computed(() => !!props.data.id);
  
  const doctors = ref([]);
  const selectedDoctors = ref([]);
  const selectedDoctorServices = ref([]);
  
  // 📌 Ảnh dịch vụ
  const selectedImage = ref(null);   // Ảnh mới được chọn
  const serviceImageUrl = ref('');   // Ảnh hiển thị trong giao diện
  const fileUpload = ref(null);      // Ref cho component FileUpload
  
  // 📌 Khi mở form, hiển thị ảnh cũ nếu có
  watchEffect(() => {
      if (formVisible.value) {
          serviceImageUrl.value = props.data.image || '';  
      }
  });
  
  // 📌 Lấy danh sách bác sĩ
  const fetchDoctors = async () => {
      try {
          const response = await DoctorProfileService.getDoctorProfiles();
          doctors.value = response.data.map((doctor) => ({
              id: doctor.id,
              name: doctor.fullName || `Bác sĩ #${doctor.id}`,
              specialization: doctor.specialization || 'Chưa có chuyên môn'
          }));
      } catch (error) {
          toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách bác sĩ', life: 3000 });
      }
  };
  
  // 📌 Lấy danh sách bác sĩ theo dịch vụ
  const fetchDoctorsByServiceId = async () => {
      if (!props.data.id) return;
      try {
          const response = await DoctorService.getDoctorServicesByServiceId(props.data.id);
          if (response?.data) {
              selectedDoctorServices.value = response.data;
              selectedDoctors.value = doctors.value.filter((doctor) => selectedDoctorServices.value.some((ds) => ds.doctorId === doctor.id));
          }
      } catch (error) {
          toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách bác sĩ', life: 3000 });
      }
  };
  
  // 📌 Theo dõi khi mở form
  watchEffect(async () => {
      if (formVisible.value) {
          await fetchDoctors();
          if (isEditMode.value) {
              await fetchDoctorsByServiceId();
          }
      }
  });
  
  // 📌 Đóng form
  const closeForm = () => {
      formVisible.value = false;
      selectedDoctors.value = [];
      selectedImage.value = null;
      serviceImageUrl.value = ''; // Xóa ảnh xem trước khi đóng
      if (fileUpload.value) {
          fileUpload.value.clear(); // Xóa file trong component upload
      }
  };
  
  // 📌 Khi chọn ảnh mới
  const onSelect = (event) => {
      const file = event.files[0]; 
      if (file) {
          selectedImage.value = file;
          serviceImageUrl.value = URL.createObjectURL(file); // Hiển thị ảnh xem trước
      }
  };
  
  // 📌 Khi xóa ảnh
  const onClear = () => {
      selectedImage.value = null;
      serviceImageUrl.value = props.data.image || ''; // Nếu xóa ảnh, quay về ảnh cũ
  };
  
  // 📌 Xử lý khi upload hoàn tất (nếu cần)
  const onUpload = () => {
      // Xử lý khi upload hoàn tất
      // Trong trường hợp auto="true", việc này sẽ không cần thiết
  };
  
  // 📌 Kiểm tra dữ liệu nhập vào
  const validateForm = () => {
      if (!props.data.name?.trim()) {
          toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập tên dịch vụ', life: 3000 });
          return false;
      }
      if (!props.data.price || props.data.price <= 0) {
          toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập giá dịch vụ hợp lệ', life: 3000 });
          return false;
      }
      return true;
  };
  
  // 📌 Lưu dịch vụ
  const saveService = async () => {
      if (!validateForm()) return;
      isSubmitting.value = true;
  
      try {
          const formData = new FormData();
          formData.append(
              'service',
              JSON.stringify({
                  id: isEditMode.value ? props.data.id : undefined,
                  name: props.data.name,
                  price: props.data.price,
                  description: props.data.description,
                  image: selectedImage.value ? '' : props.data.image  // Nếu không có ảnh mới, giữ ảnh cũ
              })
          );
  
          if (selectedImage.value) {
              formData.append('file', selectedImage.value); // 🛠 Thêm ảnh mới nếu có
          }
  
          // Gửi dữ liệu
          const savedService = await ListService.saveServices(formData);
          const serviceId = savedService.data.id;
  
          // Xử lý danh sách bác sĩ
          if (isEditMode.value) {
              const existingDoctorIds = selectedDoctorServices.value.map((ds) => ds.doctorId);
              const newDoctorIds = selectedDoctors.value.map((doctor) => doctor.id);
  
              const doctorServicesToAdd = newDoctorIds.filter((id) => !existingDoctorIds.includes(id)).map((doctorId) => ({ id: 0, serviceId, doctorId }));
              await Promise.all(doctorServicesToAdd.map((data) => DoctorService.createDoctorService(data)));
  
              const doctorServicesToRemove = existingDoctorIds
                  .filter((id) => !newDoctorIds.includes(id))
                  .map((doctorId) => selectedDoctorServices.value.find((ds) => ds.doctorId === doctorId)?.id)
                  .filter(Boolean);
  
              await Promise.all(doctorServicesToRemove.map((id) => DoctorService.deleteDoctorService(id)));
          } else {
              const doctorServiceData = selectedDoctors.value.map((doctor) => ({
                  id: 0,
                  serviceId,
                  doctorId: doctor.id
              }));
              await Promise.all(doctorServiceData.map((data) => DoctorService.createDoctorService(data)));
          }
  
          toast.add({ severity: 'success', summary: 'Thành công', detail: isEditMode.value ? 'Đã cập nhật dịch vụ' : 'Đã thêm dịch vụ mới', life: 3000 });
          emit('refreshList');
          closeForm();
      } catch (error) {
          toast.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể lưu dịch vụ: ${error.message}`, life: 3000 });
      } finally {
          isSubmitting.value = false;
      }
  };
  </script>
  
  
<template>
    <FormDialog :visible="formVisible" :title="isEditMode ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'" :loading="isSubmitting" @save="saveService" @cancel="closeForm" @hide="closeForm">
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1 w-full">
                <label for="name" class="font-semibold">Tên dịch vụ:</label>
                <InputText id="name" v-model="props.data.name" placeholder="Nhập tên dịch vụ" class="w-full" />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="price" class="font-semibold">Giá:</label>
                <InputNumber id="price" v-model="props.data.price" placeholder="Nhập giá dịch vụ" class="w-full" mode="currency" currency="VND" />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="image" class="font-semibold">Ảnh dịch vụ:</label>
                <FileUpload 
                    ref="fileUpload"
                    mode="basic" 
                    name="file" 
                    accept="image/*" 
                    :maxFileSize="1000000" 
                    @upload="onUpload" 
                    @select="onSelect" 
                    @clear="onClear" 
                    :auto="true" 
                    chooseLabel="Chọn ảnh" 
                />

                <div v-if="serviceImageUrl" class="mt-2">
                    <img 
                        :src="serviceImageUrl" 
                        alt="Ảnh xem trước" 
                        class="max-w-full h-auto max-h-40 rounded border"
                        @error="$event.target.src = 'https://placehold.co/150x150/EEE/999?text=Lỗi+Ảnh'" 
                    />
                </div>
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="description" class="font-semibold">Mô tả</label>
                <Textarea id="description" v-model="props.data.description" placeholder="Nhập mô tả" class="w-full" rows="3" autoResize />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="doctors" class="font-semibold">Chọn bác sĩ</label>
                <MultiSelect id="doctors" v-model="selectedDoctors" :options="doctors" optionLabel="name" placeholder="Chọn bác sĩ" class="w-full" :filter="true" :showToggleAll="true" display="chip">
                    <template #option="{ option }">
                        <div class="flex align-items-center">
                            <div>
                                <div>{{ option.name }}</div>
                                <div class="text-sm text-gray-600">{{ option.specialization }}</div>
                            </div>
                        </div>
                    </template>
                </MultiSelect>
            </div>
        </div>
    </FormDialog>
</template>