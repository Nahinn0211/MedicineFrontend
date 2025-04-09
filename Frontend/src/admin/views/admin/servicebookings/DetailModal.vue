<script setup>
    import { ref, defineProps, defineEmits, computed } from 'vue';
    import Dialog from 'primevue/dialog';
    import Card from 'primevue/card';
    import Divider from 'primevue/divider';
    import Avatar from 'primevue/avatar';
    
    const props = defineProps({
      visible: {
        type: Boolean,
        default: false
      },
      booking: {
        type: Object,
        default: () => ({})
      }
    });
    
    const emit = defineEmits(['update:visible']);
    
    const modalVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    });
    
    // Format tiền VND
    const formatPrice = (price) => {
      return price ? price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '---';
    };
    
    // Format ngày giờ
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
    
    // Format phương thức thanh toán
    const getPaymentMethodLabel = (method) => {
      const methodMap = {
        'PAYPAL': 'PayPal',
        'CREDIT_CARD': 'Thẻ tín dụng',
        'BANK_TRANSFER': 'Chuyển khoản',
        'CASH': 'Tiền mặt',
        'MOMO': 'Ví MoMo',
        'VNPAY': 'VNPay',
        'BALANCEACCOUNT': 'Số dư tài khoản'
      };
      return methodMap[method] || method;
    };
    
    // Format trạng thái
    const getStatusLabel = (status) => {
      const statusMap = {
        'PENDING': 'Đang chờ',
        'CONFIRMED': 'Đã xác nhận',
        'CANCELLED': 'Đã hủy',
        'COMPLETED': 'Hoàn thành',
        'FAILED': 'Thất bại'
      };
      return statusMap[status] || status;
    };
    
    // CSS class cho trạng thái
    const getStatusClass = (status) => {
      const classMap = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'CONFIRMED': 'bg-blue-100 text-blue-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'COMPLETED': 'bg-green-100 text-green-800',
        'FAILED': 'bg-gray-100 text-gray-800'
      };
      return classMap[status] || '';
    };
    </script>
    
    <template>
      <Dialog 
        v-model:visible="modalVisible" 
        :modal="true" 
        :draggable="false"
        :closable="true"
        :style="{ width: '90vw', maxWidth: '900px' }" 
        header="Chi tiết đặt lịch dịch vụ"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-3">
          <!-- Thông tin đặt lịch -->
          <div class="col-span-1 md:col-span-2">
            <Card class="shadow-sm">
              <template #title>
                <div class="flex items-center">
                  <i class="pi pi-calendar-plus mr-2 text-blue-500"></i>
                  <span>Thông tin đặt lịch</span>
                </div>
              </template>
              <template #content>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Mã đặt lịch:</p>
                    <p class="font-bold">#{{ props.booking.id }}</p>
                  </div>
                  
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Trạng thái:</p>
                    <span :class="['px-2 py-1 rounded-lg text-xs font-medium inline-block', getStatusClass(props.booking.status)]">
                      {{ getStatusLabel(props.booking.status) }}
                    </span>
                  </div>
    
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Tổng thanh toán:</p>
                    <p class="font-bold text-red-600">{{ formatPrice(props.booking.totalPrice) }}</p>
                  </div>
    
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Phương thức thanh toán:</p>
                    <p>{{ getPaymentMethodLabel(props.booking.paymentMethod) }}</p>
                  </div>
    
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Ngày tạo:</p>
                    <p>{{ formatDate(props.booking.createdAt) }}</p>
                  </div>
    
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Cập nhật lần cuối:</p>
                    <p>{{ formatDate(props.booking.updatedAt) }}</p>
                  </div>
    
                  <div class="col-span-1 md:col-span-2 mb-3" v-if="props.booking.notes">
                    <p class="text-gray-500 mb-1 text-sm">Ghi chú:</p>
                    <p class="italic">{{ props.booking.notes || 'Không có ghi chú' }}</p>
                  </div>
                </div>
              </template>
            </Card>
          </div>
    
          <!-- Thông tin dịch vụ -->
          <div>
            <Card class="shadow-sm h-full">
              <template #title>
                <div class="flex items-center">
                  <i class="pi pi-briefcase-medical mr-2 text-green-500"></i>
                  <span>Thông tin dịch vụ</span>
                </div>
              </template>
              <template #content>
                <div class="flex flex-col h-full">
                  <div v-if="props.booking.service?.image" class="mb-4 flex justify-center">
                    <img 
                      :src="props.booking.service.image" 
                      :alt="props.booking.service?.name" 
                      class="h-36 object-cover rounded-lg shadow-sm"
                      @error="$event.target.src = 'https://placehold.co/150x150/EEE/999?text=Không+có+ảnh'"
                    />
                  </div>
                  
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Tên dịch vụ:</p>
                    <p class="font-semibold text-lg text-blue-700">{{ props.booking.service?.name }}</p>
                  </div>
                  
                  <div class="mb-3">
                    <p class="text-gray-500 mb-1 text-sm">Giá dịch vụ:</p>
                    <p class="font-bold text-red-600">{{ formatPrice(props.booking.service?.price) }}</p>
                  </div>
                  
                  <div class="mb-3 flex-grow">
                    <p class="text-gray-500 mb-1 text-sm">Mô tả:</p>
                    <p class="text-gray-700">{{ props.booking.service?.description || 'Không có mô tả' }}</p>
                  </div>
                </div>
              </template>
            </Card>
          </div>
    
          <!-- Thông tin bệnh nhân và bác sĩ -->
          <div class="flex flex-col gap-4">
            <!-- Thông tin bệnh nhân -->
            <Card class="shadow-sm">
              <template #title>
                <div class="flex items-center">
                  <i class="pi pi-user mr-2 text-purple-500"></i>
                  <span>Thông tin bệnh nhân</span>
                </div>
              </template>
              <template #content>
                <div class="flex items-center mb-4">
                  <Avatar 
                    :image="props.booking.patient?.user?.avatar" 
                    shape="circle" 
                    size="large" 
                    class="mr-3"
                  />
                  <div>
                    <div class="font-bold">{{ props.booking.patient?.user?.fullName || 'Không có tên' }}</div>
                    <div class="text-sm text-gray-600">ID: {{ props.booking.patient?.id }}</div>
                  </div>
                </div>
    
                <div class="grid grid-cols-1 gap-3">
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Email:</p>
                    <p>{{ props.booking.patient?.user?.email || '---' }}</p>
                  </div>
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Số điện thoại:</p>
                    <p>{{ props.booking.patient?.user?.phone || '---' }}</p>
                  </div>
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Địa chỉ:</p>
                    <p>{{ props.booking.patient?.user?.address || '---' }}</p>
                  </div>
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Nhóm máu:</p>
                    <p>{{ props.booking.patient?.bloodType || '---' }}</p>
                  </div>
                </div>
              </template>
            </Card>
    
            <!-- Thông tin bác sĩ -->
            <Card class="shadow-sm">
              <template #title>
                <div class="flex items-center">
                  <i class="pi pi-user-plus mr-2 text-indigo-500"></i>
                  <span>Thông tin bác sĩ</span>
                </div>
              </template>
              <template #content>
                <div class="flex items-center mb-4">
                  <Avatar 
                    :image="props.booking.doctor?.user?.avatar" 
                    shape="circle" 
                    size="large" 
                    class="mr-3"
                  />
                  <div>
                    <div class="font-bold">{{ props.booking.doctor?.user?.fullName || 'Không có tên' }}</div>
                    <div class="text-sm text-gray-600">ID: {{ props.booking.doctor?.id }}</div>
                  </div>
                </div>
    
                <div class="grid grid-cols-1 gap-3">
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Chuyên khoa:</p>
                    <p class="font-medium">{{ props.booking.doctor?.specialization || '---' }}</p>
                  </div>
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Kinh nghiệm:</p>
                    <p>{{ props.booking.doctor?.experience || '---' }}</p>
                  </div>
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Nơi làm việc:</p>
                    <p>{{ props.booking.doctor?.workplace || '---' }}</p>
                  </div>
                  <div class="mb-1">
                    <p class="text-gray-500 text-sm">Email:</p>
                    <p>{{ props.booking.doctor?.user?.email || '---' }}</p>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </Dialog>
    </template>
    
    <style scoped>
    .p-card .p-card-title {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
    
    .p-card .p-card-content {
      padding-top: 0;
    }
    
    .p-dialog-content {
      padding: 0 !important;
    }
    </style>