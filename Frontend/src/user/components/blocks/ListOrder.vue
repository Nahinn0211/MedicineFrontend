
<template>
  <div class="order-history">
    <div class="order-history__container">
      <header class="order-history__header">
        <div class="order-history__title-section">
          <h1 class="order-history__title">Lịch sử đơn hàng</h1>
          <p class="order-history__subtitle">Tổng quan các đơn hàng của bạn</p>
        </div>
        <div class="order-history__stats">
          <div v-if="orders && orders.length" class="order-history__count">
            <span class="order-history__count-icon">📦</span>
            <span>{{ orders.length }} đơn hàng</span>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="order-history__loading">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="order-history__error">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2>{{ error }}</h2>
        <p>Đã xảy ra lỗi. Vui lòng thử lại.</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!orders || orders.length === 0" class="order-history__empty">
        <div class="empty-illustration">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" fill="none">
            <path d="M130 10C59.223 10 10 59.223 10 130s49.223 120 120 120 120-49.223 120-120S200.777 10 130 10zm0 210c-49.627 0-90-40.373-90-90s40.373-90 90-90 90 40.373 90 90-40.373 90-90 90z" fill="#E0E0E0"/>
            <path d="M130 50c-44.112 0-80 35.888-80 80s35.888 80 80 80 80-35.888 80-80-35.888-80-80-80zm0 140c-33.084 0-60-26.916-60-60s26.916-60 60-60 60 26.916 60 60-26.916 60-60 60z" fill="#BDBDBD"/>
            <path d="M130 70c-33.084 0-60 26.916-60 60s26.916 60 60 60 60-26.916 60-60-26.916-60-60-60zm0 100c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z" fill="#9E9E9E"/>
            <path d="M130 90c-22.056 0-40 17.944-40 40s17.944 40 40 40 40-17.944 40-40-17.944-40-40-40zm0 60c-11.028 0-20-8.972-20-20s8.972-20 20-20 20 8.972 20 20-8.972 20-20 20z" fill="#757575"/>
          </svg>
        </div>
        <h2>Chưa có đơn hàng</h2>
        <p>Bạn chưa thực hiện đặt hàng nào</p>
        <button @click="continueShopping" class="empty-cta-button">
          Bắt đầu mua sắm
        </button>
      </div>

      <!-- Order List -->
      <div v-else class="order-history__list">
        <div 
          v-for="order in paginatedOrders" 
          :key="order.id" 
          class="order-card"
        >
          <div class="order-card__header">
            <div class="order-card__info">
              <span class="order-card__code">Mã đơn: {{ order.orderCode }}</span>
              <span 
                :class="getStatusClass(order.status)"
                class="order-card__status"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <button 
              @click="viewOrderDetails(order.id)" 
              class="order-card__details-btn"
            >
              Chi tiết
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div class="order-card__body">
            <div class="order-card__summary">
              <div class="order-card__summary-row">
                <span>Tổng tiền</span>
                <span class="order-card__total">{{ formatCurrency(order.totalPrice) }}</span>
              </div>
              <div class="order-card__summary-row">
                <span>Ngày tạo</span>
                <span>{{ formatDate(order.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="order-history__pagination">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="pagination-button pagination-button--prev"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Trước
        </button>
        
        <div class="pagination-numbers">
          <button 
            v-for="pageNumber in visiblePageNumbers" 
            :key="pageNumber"
            @click="changePage(pageNumber)"
            :class="{
              'pagination-number': true, 
              'pagination-number--active': pageNumber === currentPage
            }"
          >
            {{ pageNumber }}
          </button>
        </div>
        
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="pagination-button pagination-button--next"
        >
          Tiếp
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@user/stores/auth/useAuthStore'
import { orderService } from '@user/services/OrderService'
import { authService } from '@user/services/AuthService'

// Router and store
const router = useRouter()
const authStore = useAuthStore()

// Pagination settings
const itemsPerPage = ref(5) // Number of orders per page
const currentPage = ref(1)

// Reactive state
const orders = ref(null)
const loading = ref(true)
const error = ref(null)
const patientData = ref(null)
const userData = ref(null)

// Computed property to sort orders by most recent first
const sortedOrders = computed(() => {
  if (!orders.value) return []
  return [...orders.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// Pagination computed properties
const totalPages = computed(() => {
  if (!sortedOrders.value) return 0
  return Math.ceil(sortedOrders.value.length / itemsPerPage.value)
})

const paginatedOrders = computed(() => {
  if (!sortedOrders.value) return []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedOrders.value.slice(start, end)
})

// Computed property for visible page numbers
const visiblePageNumbers = computed(() => {
  const range = 2 // Number of page numbers to show on each side of current page
  let start = Math.max(1, currentPage.value - range)
  let end = Math.min(totalPages.value, currentPage.value + range)

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Page change method
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Fetch order history
onMounted(async () => {
  try {
    if (authStore.isAuthenticated && authStore.user) {
      const userDataResponse = await authService.getDataUser(authStore.user.id);
      userData.value = userDataResponse;
      const patientDataResponse = await authService.getDataPatient(authStore.user.id);
      patientData.value = patientDataResponse;
      orders.value = await orderService.getOrderHistory(patientData.value.id)
      console.log(orders.value);
    }
  } catch (err) {
    error.value = 'Không thể tải danh sách đơn hàng'
    console.error(err);
  } finally {
    loading.value = false
  }
})

// Utility methods
const formatCurrency = (amount) => {
  if (!amount) return '0đ';
  return amount.toLocaleString('vi-VN') + 'đ';
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getStatusClass = (status) => {
  const statusClasses = {
    PENDING: 'status-pending',
    COMPLETED: 'status-completed',
    CANCELLED: 'status-cancelled'
  }
  return statusClasses[status] || 'status-default'
}

const getStatusLabel = (status) => {
  const statusLabels = {
    PENDING: 'Chờ xử lý',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
  }
  return statusLabels[status] || status
}

const viewOrderDetails = (orderId) => {
  router.push(`/order/${orderId}`)
}

const continueShopping = () => {
  router.push('/shop')
}
</script>

<style scoped>
:root {
  /* Color Palette */
  --color-primary: #2563eb;
  --color-primary-light: #3b82f6;
  --color-background: #f4f6f9;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
  --color-border: #e5e7eb;
  --color-white: #ffffff;

  /* Typography */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

  /* Transitions */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-history {
  background-color: var(--color-background);
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
}

.order-history__container {
  width: 100%;
  max-width: 800px;
  background-color: var(--color-white);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.order-history__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
}

.order-history__title-section {
  flex-grow: 1;
}

.order-history__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 0.5rem;
}

.order-history__subtitle {
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.order-history__stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-light);
}

.order-history__count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-background);
  border-radius: 9999px;
  font-size: 0.875rem;
}

.order-history__loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  text-align: center;
  color: var(--color-text-light);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--color-primary-light);
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.order-history__error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  text-align: center;
  color: #ef4444;
  padding: 1rem;
}

.order-history__empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  text-align: center;
  padding: 2rem;
}

.empty-illustration {
  width: 200px;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.order-history__list {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.order-card {
  position: relative;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: var(--transition-smooth);
}

.order-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.order-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.order-card__info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-card__code {
  font-weight: 600;
  color: var(--color-text-dark);
}

.order-card__status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.order-card__details-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: var(--transition-smooth);
}

.order-card__details-btn:hover {
  background-color: var(--color-primary);
  color: white;
}

.order-card__body {
  padding: 1rem;
}

.order-card__summary {
  display: grid;
  gap: 0.5rem;
}

.order-card__summary-row {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-light);
}

.order-card__total {
  font-weight: 700;
  color: var(--color-text-dark);
}

.order-history__pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background-color: var(--color-background);
  border-top: 1px solid var(--color-border);
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text-dark);
  transition: var(--transition-smooth);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  width: 40px;
  padding: 0.5rem;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text-dark);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.pagination-number:hover {
  background-color: var(--color-primary-light);
  color: white;
}

.pagination-number--active {
  background-color: var(--color-primary);
  color: white;
}

/* Status Colors */
.status-pending {
  background-color: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.status-completed {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-cancelled {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-default {
  background-color: rgba(55, 65, 81, 0.1);
  color: #374151;
}

/* Empty State CTA Button */
.empty-cta-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: var(--transition-smooth);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.empty-cta-button:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Responsive Adjustments */
@media (max-width: 640px) {
  .order-history__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-card__info {
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .order-history__container {
    border-radius: 0;
  }
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.order-card {
  animation: fadeIn 0.4s ease-out;
}

/* Advanced Hover Effects */
.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.order-card:hover::before {
  opacity: 1;
}

/* SVG Icons Styling */
svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* Accessibility Improvements */
.order-card__details-btn:focus,
.pagination-button:focus,
.pagination-number:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .order-history {
    background: white;
  }

  .order-history__container {
    box-shadow: none;
    border: 1px solid var(--color-border);
  }

  .order-card__details-btn {
    display: none;
  }

  .order-history__pagination {
    display: none;
  }
}
</style>