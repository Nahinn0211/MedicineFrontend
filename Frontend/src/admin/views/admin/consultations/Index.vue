<script setup>
    import { ref, onMounted } from 'vue';
    import { useConfirm } from 'primevue/useconfirm';
    import { useToast } from 'primevue/usetoast';
    import CreateForm from './Create.vue';
    import { ConsultationService } from '@admin/services/admin/Consultation';

    
    const confirm = useConfirm();
    const toast = useToast();
    const consultations = ref([]);
    const selectedConsultations = ref([]);
    const isLoading = ref(false);
    const form = ref({ visible: false, data: {} });
    
    // Định nghĩa các cột cho DataTable
    const columns = ref([
      { field: 'patientName', label: 'Bệnh nhân', visible: true },
      { field: 'doctorName', label: 'Bác sĩ', visible: true },
      { field: 'status', label: 'Trạng thái', visible: true },
      { field: 'startedAt', label: 'Thời gian bắt đầu', visible: true },
      { field: 'endedAt', label: 'Thời gian kết thúc', visible: true },
      { field: 'isVideoEnabled', label: 'Video', visible: true },
    ]);
    
    // Lấy danh sách buổi tư vấn từ API
    const fetchConsultations = async () => {
      try {
        isLoading.value = true;
        const response = await ConsultationService.getConsultations();
        consultations.value = response.data;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách buổi tư vấn:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách buổi tư vấn',
          life: 3000
        });
      } finally {
        isLoading.value = false;
      }
    };
    
    // Gọi API khi component được tạo
    onMounted(fetchConsultations);
    
    // Mở form thêm hoặc sửa buổi tư vấn
    const openForm = (data = null) => {
      if (data) {
        form.value = {
          visible: true,
          data: { ...data }
        };
      } else {
        form.value = {
          visible: true,
          data: {
            patientId: null,
            doctorId: null,
            appointmentId: null,
            status: 'PENDING',
            isVideoEnabled: true
          }
        };
      }
    };
    
    // Xác nhận xóa buổi tư vấn
    const deleteConsultation = (id) => {
      confirm.require({
        message: 'Bạn có chắc chắn muốn xóa buổi tư vấn này không?',
        header: 'Xác nhận',
        icon: 'pi pi-info-circle',
        accept: async () => {
          try {
            isLoading.value = true;
            await ConsultationService.deleteConsultation(id);
            await fetchConsultations(); // Gọi lại API để refresh dữ liệu
            toast.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã xóa buổi tư vấn thành công',
              life: 3000
            });
          } catch (error) {
            console.error('Lỗi khi xóa buổi tư vấn:', error);
            toast.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể xóa buổi tư vấn',
              life: 3000
            });
          } finally {
            isLoading.value = false;
          }
        }
      });
    };
    
    // Bắt đầu buổi tư vấn
    const startSession = async (consultation) => {
      if (!ConsultationService.canStartSession(consultation)) {
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Không thể bắt đầu buổi tư vấn này',
          life: 3000
        });
        return;
      }
    
      try {
        isLoading.value = true;
        await ConsultationService.startConsultationSession({
          consultationId: consultation.id
        });
        await fetchConsultations();
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã bắt đầu buổi tư vấn',
          life: 3000
        });
      } catch (error) {
        console.error('Lỗi khi bắt đầu buổi tư vấn:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể bắt đầu buổi tư vấn',
          life: 3000
        });
      } finally {
        isLoading.value = false;
      }
    };
    
    // Kết thúc buổi tư vấn
    const endSession = async (consultation) => {
      if (!ConsultationService.canEndSession(consultation)) {
        toast.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Không thể kết thúc buổi tư vấn này',
          life: 3000
        });
        return;
      }
    
      try {
        isLoading.value = true;
        await ConsultationService.endConsultationSession({
          consultationId: consultation.id
        });
        await fetchConsultations();
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã kết thúc buổi tư vấn',
          life: 3000
        });
      } catch (error) {
        console.error('Lỗi khi kết thúc buổi tư vấn:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể kết thúc buổi tư vấn',
          life: 3000
        });
      } finally {
        isLoading.value = false;
      }
    };
    </script>
    
    <template>
      <div class="card">
        <ConfirmDialog />
        <Toast />
    
        <DataTable 
          v-model:selection="selectedConsultations" 
          :value="consultations" 
          dataKey="id" 
          :paginator="true" 
          :rows="5" 
          :loading="isLoading"
          showCurrentPageReport
          currentPageReportTemplate="Hiển thị {first} đến {last} của {totalRecords} bản ghi"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="font-semibold text-xl">Danh sách buổi tư vấn</span>
              <!-- <Button label="Thêm buổi tư vấn" icon="pi pi-plus" @click="openForm()" /> -->
            </div>
          </template>
    
          <!-- Cột chọn nhiều dòng -->
          <Column selectionMode="multiple" style="width: 3rem"></Column>
    
          <!-- Cột thông tin bệnh nhân -->
          <Column field="patientName" header="Bệnh nhân" sortable>
            <template #body="{ data }">
              <div>
                <span class="font-semibold">{{ data.patientName || '---' }}</span>
              </div>
            </template>
          </Column>
    
          <!-- Cột thông tin bác sĩ -->
          <Column field="doctorName" header="Bác sĩ" sortable>
            <template #body="{ data }">
              <div>
                <span class="font-semibold">{{ data.doctorName || '---' }}</span>
              </div>
            </template>
          </Column>
    
          <!-- Cột trạng thái -->
          <Column field="status" header="Trạng thái" sortable>
            <template #body="{ data }">
              <span :class="['px-2 py-1 rounded-lg text-xs font-medium', ConsultationService.getStatusClass(data.status)]">
                {{ ConsultationService.getStatusLabel(data.status) }}
              </span>
            </template>
          </Column>
    
          <!-- Cột thời gian bắt đầu -->
          <Column field="startedAt" header="Bắt đầu" sortable>
            <template #body="{ data }">
              {{ ConsultationService.formatDate(data.startedAt) }}
            </template>
          </Column>
    
          <!-- Cột thời gian kết thúc -->
          <Column field="endedAt" header="Kết thúc" sortable>
            <template #body="{ data }">
              {{ ConsultationService.formatDate(data.endedAt) }}
            </template>
          </Column>
    
          <!-- Cột Video -->
          <Column field="isVideoEnabled" header="Video" sortable>
            <template #body="{ data }">
              <i :class="['pi text-lg', data.isVideoEnabled ? 'pi-video text-green-500' : 'pi-video-off text-gray-400']"></i>
            </template>
          </Column>
    
          <!-- Cột Tin nhắn gần đây -->
          <Column header="Tin nhắn gần đây">
            <template #body="{ data }">
              <div v-if="data.recentMessages && data.recentMessages.length > 0" class="recent-message">
                <div class="text-xs text-gray-500">{{ ConsultationService.formatDate(data.recentMessages[0].sentAt) }}</div>
                <div class="message-content">{{ data.recentMessages[0].content }}</div>
              </div>
              <div v-else class="text-gray-400 text-sm italic">Chưa có tin nhắn</div>
            </template>
          </Column>
    
          <!-- Cột Tác vụ -->
          <Column header="Tác vụ" style="width: 10rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" outlined @click="openForm(data)" tooltip="Chỉnh sửa" />
                <Button icon="pi pi-trash" outlined severity="danger" @click="deleteConsultation(data.id)" tooltip="Xóa" />
                <Button 
                  v-if="data.status === 'PENDING'" 
                  icon="pi pi-play" 
                  outlined 
                  severity="success" 
                  @click="startSession(data)"
                  tooltip="Bắt đầu buổi tư vấn"
                />
                <Button 
                  v-else-if="data.status === 'ACTIVE'" 
                  icon="pi pi-stop" 
                  outlined 
                  severity="info" 
                  @click="endSession(data)"
                  tooltip="Kết thúc buổi tư vấn"
                />
              </div>
            </template>
          </Column>
        </DataTable>
    
        <!-- Popup thêm buổi tư vấn -->
        <CreateForm v-model:visible="form.visible" :data="form.data" @refresh="fetchConsultations" />
      </div>
    </template>
    
    <style scoped>
    .card {
      padding: 1rem;
    }
    
    .recent-message {
      max-width: 200px;
      overflow: hidden;
    }
    
    .message-content {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.875rem;
    }
    </style>