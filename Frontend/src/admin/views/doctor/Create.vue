<script setup>
  import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import FormDialog from '@admin/components/FormDialog.vue';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import { ServiceBookingService } from '@admin/stores/admin/ServiceBooking';
  import { UserService } from '@admin/stores/admin/User';
  import { ListService } from '@admin/stores/admin/ListService';
  import { PatientProfileService } from '@admin/stores/admin/PatientProfile';
  
  const props = defineProps({
    modelValue: Boolean,
    data: {
      type: Object,
      default: () => ({
        id: 0,
        serviceId: 0,
        patientId: 0,
        doctorId: 0,
        totalPrice: 0,
        paymentMethod: 'PAYPAL',
        status: 'PENDING'
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
  
  // Danh sách để populate dropdown
  const doctors = ref([]);
  const patients = ref([]);
  const services = ref([]);
  const patientProfiles = ref([]);
  onMounted(async () => {
  try {
    const [userProfileResponse, doctorResponse, serviceResponse] = await Promise.all([
      UserService.getUserProfiles(),
      UserService.getAllUsersRoleDoctor(),
      ListService.getServices()
    ]);
    
    // Mapping cho userProfiles
    patientProfiles.value = userProfileResponse.data.map(profile => ({
      label: `${profile.fullName} (ID: ${profile.profileId})`, 
      value: profile.profileId
    }));

    doctors.value = doctorResponse.data.map(doctor => ({
      label: `${doctor.fullName} (ID: ${doctor.id})`,
      value: doctor.id
    }));

    services.value = serviceResponse.data.map(service => ({
      label: `${service.name} (ID: ${service.id}, Giá: ${service.price.toLocaleString()} VND)`,
      value: service.id,
      price: service.price
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải dữ liệu',
      life: 3000
    });
  }
});
const handleServiceSelect = (event) => {
  const serviceId = event.value; 
  const selectedService = services.value.find(s => s.value === serviceId);
  if (selectedService) {
    props.data.totalPrice = selectedService.price;
  }
};
  const closeForm = () => {
    formVisible.value = false;
  };
  
  const saveServiceBooking = async () => {
  try {
    // Validate fields
    if (!props.data.serviceId || !props.data.patientId || !props.data.doctorId || !props.data.totalPrice) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập đầy đủ thông tin',
        life: 3000
      });
      return;
    }

    isSubmitting.value = true;

    // Tạo một bản sao của dữ liệu để không ảnh hưởng đến props gốc
    const bookingData = { ...props.data };

    // Nếu không có ID thì xóa trường id
    if (bookingData.id === 0) {
      delete bookingData.id;
    }

    if (isEditMode.value) {
      await ServiceBookingService.updateServiceBooking(bookingData);
    } else {
      await ServiceBookingService.createServiceBooking(bookingData);
    }

    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: isEditMode.value ? 'Đã cập nhật đặt lịch' : 'Đã thêm đặt lịch mới',
      life: 3000
    });

    emit('refreshList');
    closeForm();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể lưu đặt lịch',
      life: 3000
    });
    console.error('Error saving service booking:', error);
  } finally {
    isSubmitting.value = false;
  }
};
  
  
  </script>
  
  <template>
  <FormDialog
    :visible="formVisible"
    :title="isEditMode ? 'Cập nhật đặt lịch' : 'Thêm đặt lịch mới'"
    :loading="isSubmitting"
    @save="saveServiceBooking"
    @cancel="closeForm"
    @hide="closeForm"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1 w-full">
        <label for="serviceId" class="font-semibold">Dịch vụ:</label>
        <Dropdown
          id="serviceId"
          v-model="props.data.serviceId"
          :options="services"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn dịch vụ"
          class="w-full"
          @change="handleServiceSelect"
        />
      </div>
      <div class="flex flex-col gap-1 w-full">
        <label for="patientId" class="font-semibold">Bệnh nhân:</label>
        <Dropdown
          id="patientId"
          v-model="props.data.patientId"
          :options="patientProfiles"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn bệnh nhân"
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1 w-full">
        <label for="doctorId" class="font-semibold">Bác sĩ:</label>
        <Dropdown
          id="doctorId"
          v-model="props.data.doctorId"
          :options="doctors"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn bác sĩ"
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1 w-full">
        <label for="totalPrice" class="font-semibold">Tổng giá:</label>
        <InputNumber
          id="totalPrice"
          v-model="props.data.totalPrice"
          placeholder="Tổng giá"
          class="w-full"
          mode="currency"
          currency="VND"
          :disabled="true"
        />
      </div>
      <div class="flex flex-col gap-1 w-full">
        <label for="paymentMethod" class="font-semibold">Phương thức thanh toán:</label>
        <Dropdown
          id="paymentMethod"
          v-model="props.data.paymentMethod"
          :options="['PAYPAL', 'STRIPE', 'COD']"
          placeholder="Chọn phương thức thanh toán"
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1 w-full">
        <label for="status" class="font-semibold">Trạng thái:</label>
        <Dropdown
          id="status"
          v-model="props.data.status"
          :options="['PENDING', 'COMPLETED', 'CANCELLED']"
          placeholder="Chọn trạng thái"
          class="w-full"
        />
      </div>
    </div>
  </FormDialog>
  </template>