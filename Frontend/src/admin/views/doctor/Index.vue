<template>
  <div class="profile-container p-4">
    <div class="p-grid">
      <div class="p-col-12 p-md-4">
        <div class="p-card profile-card">
          <div class="p-card-header text-center">
            <div class="profile-header">
              <img
                :src="
                  user.avatar ||
                  'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'
                "
                class="profile-avatar"
                alt="Avatar"
              />
              <div class="upload-section mt-2">
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileChange"
                  accept="image/*"
                  class="hidden-input"
                />
                <button
                  class="p-button p-button-rounded p-button-outlined p-button-sm"
                  @click="triggerFileInput"
                >
                  <i class="pi pi-camera"></i> Thay đổi
                </button>
              </div>
            </div>
          </div>
          <div class="p-card-title text-center">
            <h2 class="profile-name m-0">{{ user.fullName }}</h2>
            <div class="p-tag p-tag-info">{{ user.role }}</div>
          </div>
          <div class="p-card-subtitle text-center">
            <div class="profile-subtitle">
              <i class="pi pi-envelope mr-2"></i>{{ user.email }}
            </div>
          </div>
          <div class="p-card-content">
            <div class="profile-info">
              <div class="info-item">
                <i class="pi pi-phone mr-2"></i>
                <span>{{ user.phone || "Chưa cập nhật" }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-map-marker mr-2"></i>
                <span>{{ user.address || "Chưa cập nhật" }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-calendar mr-2"></i>
                <span>Tham gia: {{ formatDate(user.joinDate) }}</span>
              </div>
            </div>
          </div>
          <div class="p-card-footer">
            <div class="social-links">
              <button class="p-button p-button-rounded p-button-text">
                <i class="pi pi-facebook"></i>
              </button>
              <button class="p-button p-button-rounded p-button-text">
                <i class="pi pi-twitter"></i>
              </button>
              <button class="p-button p-button-rounded p-button-text">
                <i class="pi pi-linkedin"></i>
              </button>
              <button class="p-button p-button-rounded p-button-text">
                <i class="pi pi-github"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="p-col-12 p-md-8">
        <div class="p-tabview">
          <div class="p-tabview-nav">
            <div v-for="(tab, index) in tabs" :key="index" class="p-tabview-nav-link" :class="{ 'p-highlight': activeTabIndex === index }" @click="activeTabIndex = index">
              {{ tab.header }}
            </div>
          </div>
          <div class="p-tabview-panels">
            <div v-if="activeTabIndex === 0" class="p-tabview-panel">
              <DataTable :value="[user]">
                <Column field="fullName" header="Họ và Tên"></Column>
                <Column field="email" header="Email"></Column>
                <Column field="phone" header="Số điện thoại"></Column>
                <Column field="address" header="Địa chỉ"></Column>
                <Column field="joinDate" header="Tham gia" :body="(row) => formatDate(row.joinDate)"></Column>
              </DataTable>
            </div>
            <div v-if="activeTabIndex === 1" class="p-tabview-panel">
              <div class="p-card">
                <div class="p-card-content">
                  <form @submit.prevent="changePassword" class="form-layout">
                    <div class="p-grid">
                      <div class="p-col-12 field">
                        <label for="currentPassword">Mật khẩu hiện tại</label>
                        <input
                          id="currentPassword"
                          v-model="passwordForm.currentPassword"
                          type="password"
                          class="p-inputtext w-full"
                        />
                      </div>
                      <div class="p-col-12 field">
                        <label for="newPassword">Mật khẩu mới</label>
                        <input
                          id="newPassword"
                          v-model="passwordForm.newPassword"
                          type="password"
                          class="p-inputtext w-full"
                        />
                      </div>
                      <div class="p-col-12 field">
                        <label for="confirmPassword">Xác nhận mật khẩu</label>
                        <input
                          id="confirmPassword"
                          v-model="passwordForm.confirmPassword"
                          type="password"
                          class="p-inputtext w-full"
                        />
                      </div>
                      <div class="p-col-12">
                        <button type="submit" class="p-button">
                          <i class="pi pi-lock mr-2"></i>
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div v-if="activeTabIndex === 2" class="p-tabview-panel">
              <DataTable :value="serviceBookings">
                <Column field="id" header="Mã đặt"></Column>
                <Column field="serviceName" header="Dịch vụ"></Column>
                <Column v-if="user.role === 'DOCTOR'" field="patientName" header="Bệnh nhân"></Column>
                <Column v-if="user.role === 'PATIENT'" field="doctorName" header="Bác sĩ"></Column>
                <Column field="totalPrice" header="Tổng tiền" :body="(row) => formatCurrency(row.totalPrice)"></Column>
                <Column field="paymentMethod" header="Phương thức"></Column>
                <Column field="status" header="Trạng thái"></Column>
                <Column field="createdAt" header="Ngày đặt" :body="(row) => formatDate(row.createdAt)"></Column>
              </DataTable>
            </div>
            <div v-if="activeTabIndex === 3" class="p-tabview-panel">
              <DataTable :value="appointments">
                <Column field="id" header="Mã lịch hẹn"></Column>
                <Column field="patientName" header="Bệnh nhân"></Column>
                <Column field="doctorName" header="Bác sĩ"></Column>
                <Column field="appointmentDate" header="Ngày hẹn" :body="(row) => formatDate(row.appointmentDate)"></Column>
                <Column field="appointmentTime" header="Giờ hẹn"></Column>
                <Column field="status" header="Trạng thái"></Column>
              </DataTable>
            </div>
            <div v-if="activeTabIndex === 4" class="p-tabview-panel">
              <DataTable :value="activities">
                <Column field="title" header="Hoạt động"></Column>
                <Column field="description" header="Mô tả"></Column>
                <Column field="date" header="Thời gian" :body="(row) => formatDate(row.date)"></Column>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
   import { Profile } from '@admin/stores/admin/Profile';  
 import { Appointments } from '@admin/stores/admin/Appointments';
 
 import { ServiceBookingService } from '@admin/stores/admin/ServiceBooking';  
export default {
  name: "ProfilePage",
  data() {
    return {
      activeTabIndex: 0,
      tabs: [
        { header: "Thông tin cá nhân" },
        { header: "Bảo mật" },
        { header: "Lịch sử đặt dịch vụ" },
        { header: "Danh sách lịch hẹn" },

        { header: "Hoạt động gần đây" }

      ],
      user: {
        fullName: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        avatar: "",
        role: "",
        location: "",
        joinDate: null,
        birthday: null,
        bio: "",
      },
      userForm: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        birthdayStr: "",
        bio: "",
      },
      appointment : {
        patientName: "",
        doctorName: "",
        patientEmail: "",
        doctorEmail: "",
        patientPhone: "",
        doctorPhone: "",
        appointmentTime: "",
        appointmentDate: "",
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      activities: [],
      serviceBookings: [], // Thêm danh sách đặt dịch vụ
      toast: {
        visible: false,
        severity: "success",
        summary: "",
        detail: "",
        timeout: null,
      },
    };
  },
 
  // Thêm các phương thức này vào methods
formatDateTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
},

formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
},

translatePaymentMethod(method) {
  const methodMap = {
    'CASH': 'Tiền mặt',
    'BANKING': 'Chuyển khoản',
    'PAYPAL': 'PayPal',
    'VISA': 'Thẻ Visa/Master',
    'MOMO': 'Ví MoMo'
  };
  return methodMap[method] || method;
},

getStatusClass(status) {
  return `status-${status}`;
},
  mounted() {
    this.fetchProfileData();
    this.fetchServiceBookings();
    this.fetchAppointments();

  },
  methods: {
    async fetchAppointments() {
  try {
    const response = await Appointments.getAppointmentsByIdDoctor();
    this.appointments = response.data;
   } catch (error) {
    this.showToast('error', 'Lỗi', 'Không thể tải danh sách lịch hẹn');
    console.error(error);
  }
}
,
    async fetchProfileData() {
  try {
    const response = await Profile.getProfile();
    const profileData = response.data;
    
    // Cập nhật thông tin người dùng
    this.user = {
      id: profileData.id,
      fullName: profileData.fullName,
      firstName: profileData.fullName.split(' ').slice(1).join(' '),
      lastName: profileData.fullName.split(' ')[0],
      email: profileData.email,
      role: profileData.currentRole,
      avatar: profileData.avatar,  
      phone: profileData.phone,  
      address: profileData.address,  
      joinDate: new Date(),
      birthday: null,
      bio: "",
      doctorProfile: profileData.doctorProfile,
      doctorProfileId: profileData.doctorProfileId
    };

    // Khởi tạo form
    this.initUserForm();
    
     
    // Thêm hoạt động
    this.activities.push({
      title: "Tải thông tin cá nhân",
      description: "Đã tải thông tin cá nhân thành công",
      date: new Date(),
    });
    
   } catch (error) {
    this.showToast('error', 'Lỗi', 'Không thể tải thông tin cá nhân');
    console.error(error);
  }
},
    
async fetchServiceBookings() {
  try {
    const response = await ServiceBookingService.getUserServiceBookings();
    this.serviceBookings = response.data;
    
    if (this.serviceBookings && this.serviceBookings.length > 0) {
      // Thêm hoạt động từ các đặt dịch vụ vào timeline
      const bookingActivities = this.serviceBookings.map(booking => ({
        title: `Đặt dịch vụ: ${booking.serviceName}`,
        description: `Trạng thái: ${this.translateBookingStatus(booking.status)}`,
        date: new Date(booking.createdAt)
      }));

      this.activities.push(...bookingActivities);
      
      // Sắp xếp hoạt động theo thời gian mới nhất đầu tiên
      this.activities.sort((a, b) => b.date - a.date);
      
      this.showToast('success', 'Thành công', `Đã tải ${this.serviceBookings.length} lịch sử đặt dịch vụ`);
    }
  } catch (error) {
    this.showToast('error', 'Lỗi', 'Không thể tải danh sách dịch vụ đã đặt');
    console.error(error);
  }
},
formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
},
    
    translateBookingStatus(status) {
      const statusMap = {
        'PENDING': 'Đang chờ',
        'CONFIRMED': 'Đã xác nhận',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
      };
      return statusMap[status] || status;
    },
    initUserForm() {
      this.userForm = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone,
        address: this.user.address
       };
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    formatDateForInput(date) {
      if (!date) return "";
      return new Date(date).toISOString().split("T")[0];
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.user.avatar = e.target.result;
          this.showToast(
            "success",
            "Thành công",
            "Cập nhật ảnh đại diện thành công"
          );
        };
        reader.readAsDataURL(file);
      }
    },
    saveProfile() {
      // Cập nhật thông tin
      this.user.firstName = this.userForm.firstName;
      this.user.lastName = this.userForm.lastName;
      this.user.fullName = `${this.userForm.lastName} ${this.userForm.firstName}`;
      this.user.email = this.userForm.email;
      this.user.phone = this.userForm.phone;
      this.user.location = this.userForm.location;
      this.user.birthday = this.userForm.birthdayStr
        ? new Date(this.userForm.birthdayStr)
        : null;
      this.user.bio = this.userForm.bio;

      // Thông báo thành công
      this.showToast(
        "success",
        "Thành công",
        "Thông tin cá nhân đã được cập nhật"
      );

      // Thêm hoạt động mới
      this.activities.unshift({
        title: "Cập nhật thông tin cá nhân",
        description: "Bạn đã cập nhật thông tin cá nhân",
        date: new Date(),
      });
    },
    changePassword() {
      // Kiểm tra mật khẩu nhập lại
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.showToast("error", "Lỗi", "Mật khẩu xác nhận không khớp");
        return;
      }

      // Thông báo thành công
      this.showToast("success", "Thành công", "Mật khẩu đã được thay đổi");

      // Thêm hoạt động mới
      this.activities.unshift({
        title: "Thay đổi mật khẩu",
        description: "Bạn đã thay đổi mật khẩu",
        date: new Date(),
      });

      // Reset form
      this.passwordForm.currentPassword = "";
      this.passwordForm.newPassword = "";
      this.passwordForm.confirmPassword = "";
    },
    showToast(severity, summary, detail) {
      // Xóa timeout trước đó nếu có
      if (this.toast.timeout) {
        clearTimeout(this.toast.timeout);
      }

      this.toast.severity = severity;
      this.toast.summary = summary;
      this.toast.detail = detail;
      this.toast.visible = true;

      // Tự động ẩn sau 3 giây
      this.toast.timeout = setTimeout(() => {
        this.hideToast();
      }, 3000);
    },
    hideToast() {
      this.toast.visible = false;
    },
    getToastIcon() {
      const icons = {
        success: "pi pi-check",
        info: "pi pi-info-circle",
        warn: "pi pi-exclamation-triangle",
        error: "pi pi-times-circle",
      };
      return icons[this.toast.severity] || icons.info;
    },
  },
};



</script>

<style scoped>
/* CSS toàn cầu cho các class PrimeVue, có thể đặt trong file CSS riêng */
.p-grid {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.5rem;
  margin-left: -0.5rem;
  margin-top: -0.5rem;
}

.p-col-12 {
  flex: 0 0 100%;
  padding: 0.5rem;
}

@media screen and (min-width: 768px) {
  .p-md-4 {
    flex: 0 0 33.3333%;
  }

  .p-md-6 {
    flex: 0 0 50%;
  }

  .p-md-8 {
    flex: 0 0 66.6667%;
  }
}

.p-card {
  background: #ffffff;
  border-radius: 4px;
  box-shadow:
    0 2px 1px -1px rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  padding: 1rem;
  margin-bottom: 1rem;
}

.p-card-header {
  padding-bottom: 1rem;
}

.p-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.p-card-subtitle {
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 1rem;
}

.p-card-content {
  padding: 1rem 0;
}

.p-card-footer {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.p-button {
  color: #ffffff;
  background: #3b82f6;
  border: 1px solid #3b82f6;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.p-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.p-button-text {
  background-color: transparent;
  color: #3b82f6;
  border-color: transparent;
}

.p-button-text:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: transparent;
  color: #3b82f6;
}

.p-button-rounded {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
}

.p-button-sm {
  font-size: 0.875rem;
  padding: 0.4rem 0.8rem;
}

.p-button-outlined {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid;
}

.p-button-outlined:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.p-inputtext,
.p-inputtextarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.p-inputtext:focus,
.p-inputtextarea:focus {
  outline: 0 none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.p-tabview-nav {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 1rem;
}

.p-tabview-nav-link {
  padding: 1rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: border-color 0.2s;
}

.p-tabview-nav-link:hover {
  color: #3b82f6;
}

.p-tabview-nav-link.p-highlight {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.p-tabview-panels {
  padding: 1rem 0;
}

.p-tag {
  display: inline-flex;
  align-items: center;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: 0.25rem;
  font-size: 0.75rem;
}

.p-tag-info {
  background: #64b5f6;
}

/* CSS riêng cho component */
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  height: 100%;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 1rem 0;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 3px solid #3b82f6;
}

.hidden-input {
  display: none;
}

.profile-name {
  margin: 0.5rem 0;
  text-align: center;
}

.profile-subtitle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.profile-info {
  margin: 1rem 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.form-layout {
  padding: 1rem 0;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.m-0 {
  margin: 0;
}

.p-4 {
  padding: 1rem;
}

/* Activity Timeline */
.activity-timeline {
  position: relative;
  margin-left: 1rem;
}

.activity-timeline::before {
  content: "";
  position: absolute;
  left: -1rem;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: #dee2e6;
}

.activity-item {
  position: relative;
  padding-bottom: 1.5rem;
  padding-left: 1rem;
}

.activity-time-line {
  position: absolute;
  left: -1.25rem;
  top: 0.25rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
}

.activity-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.activity-description {
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.25rem;
}

.activity-time {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

/* Custom Toast */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.p-toast-item {
  display: flex;
  background: white;
  color: #212121;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow:
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);
  animation: slideIn 0.3s ease-out;
  max-width: 25rem;
}

.p-toast-icon {
  margin-right: 0.5rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}

.p-toast-message {
  flex: 1;
}

.p-toast-summary {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.p-toast-close-icon {
  background: transparent;
  border: none;
  color: #212121;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
}

.p-toast-close-icon:hover {
  opacity: 1;
}

.p-toast-success .p-toast-icon {
  color: #4caf50;
}

.p-toast-info .p-toast-icon {
  color: #2196f3;
}

.p-toast-warn .p-toast-icon {
  color: #ff9800;
}

.p-toast-error .p-toast-icon {
  color: #f44336;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media screen and (max-width: 768px) {
  .profile-header {
    padding: 0.5rem 0;
  }
}
</style>

