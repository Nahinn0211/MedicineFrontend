<template>
  <div class="medicine-detail-page">
    <!-- Notification system -->
    <div class="notification-container" v-if="notification.show">
      <div class="notification" :class="notification.type">
        <i :class="getNotificationIcon(notification.type)"></i>
        <span>{{ notification.message }}</span>
      </div>
    </div>

    <div class="container">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Đang tải...</span>
        </div>
        <p>Đang tải thông tin thuốc...</p>
      </div>

      <!-- Error message -->
      <div v-else-if="hasError" class="error-container alert alert-danger">
        <i class="icofont-warning-alt"></i>
        <p>{{ error }}</p>
        <button class="btn btn-outline-danger" @click="loadMedicineData">
          Thử lại
        </button>
      </div>

      <!-- Medicine details -->
      <div v-else-if="medicine">
        <!-- Breadcrumb Navigation -->
        <div class="breadcrumb">
          <a href="#" @click.prevent="goBack">Trang chủ</a>
          <span class="divider">/</span>
          <span class="current">{{ medicine.medicine.name }}</span>
        </div>

        <!-- Product Detail Main Section -->
        <div class="product-detail-container">
          <div class="row">
            <!-- Product Images -->
            <div class="col-lg-5">
              <div class="product-images">
                <div class="product-badges">
                  <span v-if="hasDiscount" class="badge-sale">
                    -{{ medicine.discount[0].discountPercentage }}%
                  </span>
                  <span v-if="medicine.medicine.prescriptionRequired" class="badge-rx">Kê đơn</span>
                </div>

                <div class="main-image">
                  <img :src="getImageUrl(mainImageUrl)" :alt="medicine.medicine.name">
                </div>

                <div class="image-thumbnails" v-if="medicine.media && medicine.media.length > 0">
                  <div v-for="(mediaItem, index) in medicine.media" :key="mediaItem.id" class="thumbnail"
                    :class="{ active: selectedImageId === mediaItem.id }" @click="selectImage(mediaItem.id)">
                    <img :src="getImageUrl(mediaItem.mediaUrl)" :alt="`${medicine.medicine.name} - Hình ${index + 1}`">
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Information -->
            <div class="col-lg-7">
              <div class="product-info">
                <h1 class="product-title">{{ medicine.medicine.name }}</h1>

                <div class="product-meta">
                  <div class="product-brand" v-if="medicine.brand">
                    <span>Thương hiệu:</span> {{ medicine.brand.name }}
                  </div>
                  <div class="product-category" v-if="medicine.categories && medicine.categories.length">
                    <span>Danh mục:</span> {{medicine.categories.map(category =>
                      category.name).join(', ')}}
                  </div>
                </div>

                <!-- Rating section -->
                <div class="product-rating" v-if="medicine.medicine.rating !== undefined">
                  <div class="stars">
                    <i v-for="n in 5" :key="n"
                      :class="[n <= medicine.medicine.rating ? 'icofont-star' : 'icofont-star-shape']"></i>
                  </div>
                  <span class="rating-count" v-if="medicine.medicine.reviewCount !== undefined">
                    ({{ medicine.medicine.reviewCount }})
                  </span>
                </div>

                <!-- Product attributes/package options -->
                <div class="product-attributes" v-if="medicine.attributes && medicine.attributes.length > 0">
                  <h3>Quy cách đóng gói</h3>
                  <div class="attributes-container">
                    <div v-for="attr in medicine.attributes" :key="attr.id" class="attribute-item"
                      :class="{ active: selectedAttribute && selectedAttribute.id === attr.id }"
                      @click="selectAttribute(attr)">
                      <span class="attribute-name">{{ attr.name }}</span>
                      <span class="attribute-detail">{{ formatAttributeDetail(attr) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Price display -->
                <div class="product-price" v-if="selectedAttribute">
                  <div class="price-container">
                    <template v-if="hasDiscount">
                      <span class="original-price">
                        {{ formatCurrency(selectedAttribute.priceOut) }}
                      </span>
                      <span class="current-price">
                        {{ formatCurrency(calculateDiscountedPrice(selectedAttribute.priceOut))
                        }}
                      </span>
                      <div class="discount-badge">
                        -{{ medicine.discount[0].discountPercentage }}%
                      </div>
                    </template>
                    <template v-else>
                      <span class="current-price">
                        {{ formatCurrency(selectedAttribute.priceOut) }}
                      </span>
                    </template>
                  </div>
                </div>
                <div class="no-price-message" v-else>
                  <p>Vui lòng chọn quy cách đóng gói để xem giá</p>
                </div>

                <!-- Stock information -->
                <div class="product-availability" v-if="selectedAttribute" :class="{
                  'in-stock': selectedAttribute.stock > 0,
                  'out-of-stock': selectedAttribute.stock <= 0
                }">
                  <i :class="selectedAttribute.stock > 0 ? 'icofont-check-circled' : 'icofont-close-circled'"></i>
                  <span>{{ selectedAttribute.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}</span>
                </div>

                <!-- Product description -->
                <div class="product-description">
                  <h3>Mô tả sản phẩm</h3>
                  <p>{{ medicine.medicine.description }}</p>
                </div>

                <!-- Product actions (add to cart, wishlist) -->
                <div class="product-actions">
                  <div class="quantity-selector">
                    <button @click="decreaseQuantity" :disabled="quantity <= 1">
                      <i class="icofont-minus"></i>
                    </button>
                    <input type="number" v-model.number="quantity" min="1" :max="maxQuantity">
                    <button @click="increaseQuantity" :disabled="quantity >= maxQuantity">
                      <i class="icofont-plus"></i>
                    </button>
                  </div>

                  <button class="btn-add-to-cart" @click="addToCart"
                    :disabled="medicine.medicine.prescriptionRequired && !hasPrescription">
                    <i class="icofont-cart"></i> Thêm vào giỏ hàng
                  </button>

                  <button class="btn-add-to-wishlist" @click="toggleWishlist" :class="{ 'in-wishlist': isInWishlist }">
                    <i :class="isInWishlist ? 'icofont-heart' : 'icofont-heart-alt'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product information tabs -->
        <div class="product-tabs">
          <div class="tab-navigation">
            <button :class="{ active: activeTab === 'description' }" @click="activeTab = 'description'">
              Mô tả
            </button>
            <button :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">
              Đánh giá ({{ medicine.reviews?.length || 0 }})
            </button>
            <button :class="{ active: activeTab === 'faq' }" @click="activeTab = 'faq'">
              Câu hỏi thường gặp
            </button>
          </div>

          <!-- Description Tab -->
          <div class="tab-content" v-if="activeTab === 'description'">
            <div class="product-description-detailed">
              <h3>Về {{ medicine.medicine.name }}</h3>
              <p>{{ medicine.medicine.description }}</p>

              <div class="product-highlights" v-if="medicine.medicine.highlights">
                <h4>Điểm nổi bật</h4>
                <ul>
                  <li v-for="(highlight, index) in medicine.medicine.highlights" :key="index">
                    {{ highlight }}
                  </li>
                </ul>
              </div>

              <div class="product-usage" v-if="medicine.medicine.usage">
                <h4>Cách sử dụng</h4>
                <p>{{ medicine.medicine.usage }}</p>
              </div>
            </div>
          </div>

          <!-- Reviews Tab -->
          <div class="tab-content" v-if="activeTab === 'reviews'">
            <div class="product-reviews">
              <div class="review-summary" v-if="medicine.reviews && medicine.reviews.length > 0">
                <!-- Review summary display -->
                <div class="rating-average">
                  <span class="average-score">{{ calculateAverageRating() }}</span>
                  <div class="stars">
                    <i v-for="n in 5" :key="n"
                      :class="[n <= calculateAverageRating() ? 'icofont-star' : 'icofont-star-shape']"></i>
                  </div>
                  <span>{{ medicine.reviews.length }} đánh giá</span>
                </div>

                <!-- Rating bars -->
                <div class="rating-bars">
                  <div class="rating-bar" v-for="i in 5" :key="i">
                    <span class="rating-label">{{ 6 - i }} sao</span>
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: getRatingPercentage(6 - i) + '%' }">
                      </div>
                    </div>
                    <span class="rating-count">({{ getRatingCount(6 - i) }})</span>
                  </div>
                </div>
              </div>

              <div class="review-list" v-if="medicine.reviews && medicine.reviews.length > 0">
                <h3>Các đánh giá</h3>
                <div v-for="review in medicine.reviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <div class="reviewer-info">
                      <span class="reviewer-name">{{ review.user?.fullName }}</span>
                      <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                    </div>
                    <div class="review-rating">
                      <div class="stars">
                        <i v-for="n in 5" :key="n"
                          :class="[n <= review.rating ? 'icofont-star' : 'icofont-star-shape']"></i>
                      </div>
                    </div>
                  </div>
                  <p class="review-content">{{ review.comment }}</p>
                  <div class="review-helpful">
                    <span>Đánh giá này có hữu ích?</span>
                    <button @click="markReviewHelpful(review)">
                      <i class="icofont-thumbs-up"></i> Có
                    </button>
                    <button @click="markReviewNotHelpful(review)">
                      <i class="icofont-thumbs-down"></i> Không
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="no-reviews">
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            </div>
          </div>

          <!-- FAQ Tab -->
          <div class="tab-content" v-if="activeTab === 'faq'">
            <div class="product-faqs">
              <h3>Câu hỏi thường gặp</h3>

              <div v-if="medicine.medicine.faqs && medicine.medicine.faqs.length > 0">
                <div class="faq-list">
                  <div class="faq-item" v-for="(faq, index) in medicine.medicine.faqs" :key="index"
                    :class="{ 'active': activeFaq === index }">
                    <div class="faq-question" @click="toggleFaq(index)">
                      <h4>{{ faq.question }}</h4>
                      <i :class="['icofont-rounded-down', { 'rotate': activeFaq === index }]"></i>
                    </div>
                    <div class="faq-answer" :class="{ 'active': activeFaq === index }">
                      <p>{{ faq.answer }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-faqs">
                <p>Chưa có câu hỏi thường gặp nào cho sản phẩm này.</p>
              </div>

              <div class="ask-question">
                <h3>Bạn vẫn còn thắc mắc?</h3>
                <p>Nếu không tìm thấy câu trả lời cho câu hỏi của bạn, hãy liên hệ với chúng tôi.</p>
                <button class="btn-ask-question" @click="contactSupport">
                  Liên hệ hỗ trợ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state when medicine not found -->
      <div v-else class="empty-medicine">
        <h3>Không tìm thấy thông tin thuốc</h3>
        <p>Thông tin sản phẩm không tồn tại hoặc đã bị xóa.</p>
        <button class="btn-back" @click="goBack">Quay lại trang chủ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMedicineStore } from '@user/stores/MedicineStore';
import { useWishlistStore } from '@user/stores/WishListStore';
import { useCartStore } from '@user/stores/CartStore';
import { useAuthStore } from '@user/stores/auth/useAuthStore';

// Store instances
const medicineStore = useMedicineStore();
const wishlistStore = useWishlistStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Local state
const isLoading = ref(true);
const error = ref(null);
const medicine = ref(null);
const selectedImageId = ref(null);
const selectedAttribute = ref(null);
const quantity = ref(1);
const activeTab = ref('description');
const activeFaq = ref(null);
const maxQuantity = ref(10);
const hasPrescription = ref(false);

// Notification system
const notification = ref({
  show: false,
  message: '',
  type: 'success',
  timeout: null
});

// Computed properties
const hasError = computed(() => !!error.value);

const hasDiscount = computed(() => {
  return medicine.value &&
    medicine.value.discount &&
    medicine.value.discount.length > 0;
});

const isLoggedIn = computed(() => {
  return authStore.isAuthenticated && !!authStore.user;
});

const isInWishlist = computed(() => {
  if (!medicine.value || !medicine.value.attributes || medicine.value.attributes.length === 0) return false;
  return wishlistStore.isInWishlist(medicine.value.medicine.id, medicine.value.attributes[0].id);
});

const mainImageUrl = computed(() => {
  if (!medicine.value || !medicine.value.media || medicine.value.media.length === 0) {
    return '/assets/images/favicon.png';
  }

  if (selectedImageId.value) {
    const selectedMedia = medicine.value.media.find(media => media.id === selectedImageId.value);
    if (selectedMedia) {
      return selectedMedia.mediaUrl;
    }
  }

  const mainImage = medicine.value.media.find(media => media.mainImage === true);
  return mainImage ? mainImage.mediaUrl : medicine.value.media[0].mediaUrl;
});

const discountedPrice = computed(() => {
  if (!hasDiscount.value || !selectedAttribute.value) return 0;
  return calculateDiscountedPrice(selectedAttribute.value.priceOut);
});

// Methods
const getImageUrl = (url) => {
  if (!url) return '/assets/images/favicon.png';

  // Kiểm tra nếu URL bắt đầu bằng http hoặc https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Xử lý URL tương đối
  if (url.startsWith('@/')) {
    // Thay thế @/ với đường dẫn thực tế đến thư mục assets
    return url.replace('@/', '/assets/');
  }

  // Trường hợp URL không có định dạng rõ ràng, thêm tiền tố
  return '/uploads/' + url;
};

const showNotification = (message, type = 'success', duration = 3000) => {
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }

  notification.value.show = true;
  notification.value.message = message;
  notification.value.type = type;

  notification.value.timeout = setTimeout(() => {
    notification.value.show = false;
  }, duration);
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success': return 'icofont-check-circled';
    case 'error': return 'icofont-close-circled';
    case 'warning': return 'icofont-warning';
    case 'info': return 'icofont-info-circle';
    default: return 'icofont-info-circle';
  }
};

const formatCurrency = (price) => {
  if (!price) return '0đ';
  return price.toLocaleString('vi-VN') + 'đ';
};

const calculateDiscountedPrice = (originalPrice) => {
  if (!hasDiscount.value) return originalPrice;
  const discountPercent = medicine.value.discount[0].discountPercentage;
  return originalPrice * (1 - discountPercent / 100);
};

const formatAttributeDetail = (attribute) => {
  const details = [];

  if (attribute.quantity) {
    details.push(`${attribute.quantity} ${attribute.unit || 'đơn vị'}`);
  }

  if (attribute.description) {
    details.push(attribute.description);
  }

  return details.join(' - ');
};

const selectAttribute = (attribute) => {
  selectedAttribute.value = attribute;
  if (attribute.stock) {
    maxQuantity.value = Math.min(attribute.stock, 10);
    if (quantity.value > maxQuantity.value) {
      quantity.value = maxQuantity.value;
    }
  } else {
    maxQuantity.value = 10;
  }
};

const selectImage = (imageId) => {
  selectedImageId.value = imageId;
};

const goBack = () => {
  router.push('/');
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++;
  }
};

const calculateAverageRating = () => {
  if (!medicine.value || !medicine.value.reviews || medicine.value.reviews.length === 0) {
    return 0;
  }
  const totalRating = medicine.value.reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / medicine.value.reviews.length).toFixed(1);
};

const getRatingCount = (rating) => {
  if (!medicine.value || !medicine.value.reviews) {
    return 0;
  }
  return medicine.value.reviews.filter(review => review.rating === rating).length;
};

const getRatingPercentage = (rating) => {
  if (!medicine.value || !medicine.value.reviews || medicine.value.reviews.length === 0) {
    return 0;
  }
  const ratingCount = getRatingCount(rating);
  return (ratingCount / medicine.value.reviews.length) * 100;
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const markReviewHelpful = (review) => {
  showNotification('Cảm ơn bạn đã đánh giá phản hồi', 'success');
};

const markReviewNotHelpful = (review) => {
  showNotification('Cảm ơn bạn đã đánh giá phản hồi', 'success');
};

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};

const contactSupport = () => {
  router.push('/contact');
};

const addToCart = async () => {
  if (!medicine.value || !selectedAttribute.value) {
    showNotification('Vui lòng chọn quy cách đóng gói trước khi thêm vào giỏ hàng', 'warning');
    return;
  }

  if (medicine.value.medicine.prescriptionRequired && !hasPrescription.value) {
    showNotification('Sản phẩm này yêu cầu đơn thuốc', 'warning');
    return;
  }

  if (selectedAttribute.value.stock <= 0) {
    showNotification('Sản phẩm hiện hết hàng', 'error');
    return;
  }

  if (!isLoggedIn.value) {
    if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?')) {
      router.push('/auth/login');
    }
    return;
  }

  let patientId = null;
  try {
    patientId = await authService.getDataPatient(authStore.$state.user.id);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin bệnh nhân:', error);
  }

  // Tạo đối tượng medicineCart với cấu trúc đúng
  const medicineCart = {
    ...medicine.value.medicine,
    attributes: [selectedAttribute.value],
    medias: medicine.value.media,
    brand: medicine.value.brand
  };
  await cartStore.syncWithAuthStore();
  const added = await cartStore.addToCart(medicineCart, quantity.value, patientId);

  if (added) {
    showNotification(`Đã thêm ${medicine.value.medicine.name} vào giỏ hàng`, 'success');
  } else {
    showNotification('Không thể thêm sản phẩm vào giỏ hàng', 'error');
  }
};

const toggleWishlist = async () => {
  if (!medicine.value || !medicine.value.attributes || medicine.value.attributes.length === 0) {
    showNotification("Không thể thêm sản phẩm vào danh sách yêu thích", "error");
    return;
  }

  if (!isLoggedIn.value) {
    if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích. Đăng nhập ngay?')) {
      router.push('/auth/login');
    }
    return;
  }

  wishlistStore.syncWithAuthStore();
  const selectedAttr = medicine.value.attributes[0];
  let patientId = null;
  try {
    patientId = await authService.getDataPatient(authStore.$state.user.id);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin bệnh nhân:', error);
  }

  // Tạo đối tượng medicineCart với cấu trúc đúng
  const medicineWishlist = {
    ...medicine.value.medicine,
    attributes: [selectedAttribute.value],
    medias: medicine.value.media,
    brand: medicine.value.brand
  };
  if (wishlistStore.isInWishlist(medicine.value.medicine.id, selectedAttr.id)) {
    const removed = wishlistStore.removeFromWishlist(medicine.value.medicine.id, selectedAttr.id);
    if (removed) {
      showNotification(`Đã xóa ${medicine.value.medicine.name} khỏi danh sách yêu thích`, "info");
    }
  } else {
    const added = wishlistStore.addToWishlist(medicineWishlist, patientId);
    if (added) {
      showNotification(`Đã thêm ${medicine.value.medicine.name} vào danh sách yêu thích`, "success");
    }
  }
};

// Data loading
const loadMedicineData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const medicineId = parseInt(route.params.id);
    if (!medicineId) {
      error.value = 'ID thuốc không hợp lệ';
      return;
    }

    // Gọi API duy nhất để lấy toàn bộ dữ liệu thuốc
    const medicineData = await medicineStore.fetchComprehensiveMedicineById(medicineId);

    if (!medicineData) {
      error.value = 'Không tìm thấy thông tin thuốc';
      return;
    }

    // Xử lý cấu trúc dữ liệu
    medicine.value = {
      ...medicineData,
      // Đảm bảo cấu trúc dữ liệu đúng
      media: medicineData.medicine.medias || [],
      attributes: medicineData.medicine.attributes || [],
      categories: medicineData.medicine.categories || [],
      brand: medicineData.medicine.brand || null
    };

    console.log('Dữ liệu thuốc đã tải:', medicine.value);

    // Khởi tạo ảnh đầu tiên
    if (medicine.value.media && medicine.value.media.length > 0) {
      const mainImage = medicine.value.media.find(media => media.mainImage === true);
      selectedImageId.value = mainImage ? mainImage.id : medicine.value.media[0].id;
    }

    // Khởi tạo thuộc tính đầu tiên
    if (medicine.value.attributes && medicine.value.attributes.length > 0) {
      selectAttribute(medicine.value.attributes[0]);
    }

    // Chuẩn bị cart và wishlist
    cartStore.syncWithAuthStore();
    wishlistStore.syncWithAuthStore();

  } catch (err) {
    console.error('Lỗi khi tải dữ liệu thuốc:', err);
    error.value = 'Có lỗi xảy ra khi tải thông tin thuốc. Vui lòng thử lại sau.';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  loadMedicineData();
});
</script>
<style scoped>
/* ===== Product Detail Page Styles ===== */

/* Common styles */
.btn-add-to-wishlist.in-wishlist {
  background-color: #ffebee;
  color: #f44336;
  border-color: #f44336;
}

.product-attributes {
  margin-bottom: 20px;
}

/* Add this to your style section */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 300px;
}

.notification {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  animation: slide-in 0.3s ease-out forwards;
  color: white;
}

.notification i {
  margin-right: 12px;
  font-size: 18px;
}

.notification.success {
  background-color: #4caf50;
}

.notification.error {
  background-color: #f44336;
}

.notification.warning {
  background-color: #ff9800;
}

.notification.info {
  background-color: #2196f3;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.product-attributes h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.attributes-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attribute-item {
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  min-width: 100px;
  transition: all 0.3s;
}

.attribute-item:hover {
  border-color: #5280e2;
}

.attribute-item.active {
  border-color: #5280e2;
  background-color: #f0f5ff;
}

.attribute-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 3px;
}

.attribute-detail {
  font-size: 12px;
  color: #666;
}

.no-price-message {
  margin-bottom: 20px;
  font-style: italic;
  color: #666;
}

.discount-badge {
  background-color: #e12454;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 15px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Product Details Accordion */
.product-details-accordion {
  margin-top: 30px;
}

.accordion-item {
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.3s;
}

.accordion-header:hover {
  background-color: #f1f1f1;
}

.accordion-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.accordion-header i {
  font-size: 18px;
  color: #777;
  transition: transform 0.3s;
}

.accordion-header i.rotate {
  transform: rotate(180deg);
}

.accordion-content {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}

.accordion-content.active {
  height: auto;
  padding: 15px;
}

.accordion-content p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

/* Product Tabs */
.product-tabs {
  margin-bottom: 50px;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab-navigation button {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-navigation button:hover {
  color: #5280e2;
}

.tab-navigation button.active {
  color: #5280e2;
}

.tab-navigation button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #5280e2;
  border-radius: 3px 3px 0 0;
}

.tab-content {
  padding: 20px 0;
}

/* Description Tab */
.product-description-detailed h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 15px;
  color: #333;
}

.product-description-detailed p {
  font-size: 14px;
  line-height: 1.7;
  color: #555;
  margin-bottom: 20px;
}

.product-highlights,
.product-usage {
  margin-bottom: 20px;
}

.product-highlights h4,
.product-usage h4 {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 10px;
  color: #333;
}

.product-highlights ul {
  padding-left: 20px;
}

.product-highlights li {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 8px;
}

.product-usage p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}

/* Reviews Tab */
.review-summary {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.rating-average {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.average-score {
  font-size: 48px;
  font-weight: 700;
  color: #333;
}

.rating-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-label {
  font-size: 14px;
  width: 50px;
}

.bar-container {
  flex: 1;
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: #ffc107;
  border-radius: 4px;
}

.rating-count {
  font-size: 14px;
  width: 50px;
  text-align: right;
  color: #777;
}

.review-form {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.review-form h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.rating-selector {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
  cursor: pointer;
}

.rating-selector i {
  font-size: 24px;
  color: #ffc107;
}

.rating-selector i.icofont-star-shape {
  color: #d1d1d1;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5280e2;
}

.btn-submit-review {
  background-color: #5280e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit-review:hover {
  background-color: #355db9;
}

.review-list h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

.review-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.reviewer-info {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.review-date {
  font-size: 12px;
  color: #777;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.review-content {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 15px;
}

.review-helpful {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #777;
}

.review-helpful button {
  background: none;
  border: none;
  color: #5280e2;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.review-helpful button:hover {
  text-decoration: underline;
}

/* FAQ Tab */
.product-faqs h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

.faq-item {
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.3s;
}

.faq-question:hover {
  background-color: #f1f1f1;
}

.faq-question h4 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.faq-question i {
  font-size: 18px;
  color: #777;
  transition: transform 0.3s;
}

.faq-question i.rotate {
  transform: rotate(180deg);
}

.faq-answer {
  height: 0;
  overflow: hidden;
  transition: height 0.3s ease;
}

.faq-answer.active {
  height: auto;
  padding: 15px;
}

.faq-answer p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.ask-question {
  margin-top: 30px;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.ask-question h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px;
}

.ask-question p {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}

.btn-ask-question {
  background-color: #5280e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-ask-question:hover {
  background-color: #355db9;
}

/* Related Products */
.related-products,
.recently-viewed {
  margin-bottom: 50px;
}

.related-products h2,
.recently-viewed h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px;
  color: #333;
}

.product-carousel {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: #ddd #f5f5f5;
}

.product-carousel::-webkit-scrollbar {
  height: 8px;
}

.product-carousel::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.product-carousel::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4px;
}

.product-card {
  flex: 0 0 250px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s, transform 0.3s;
}

.product-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.product-card .product-image {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  overflow: hidden;
}

.product-card .product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-card .product-actions {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  transition: bottom 0.3s;
}

.product-card:hover .product-actions {
  bottom: 0;
}

.product-card .btn-quick-view,
.product-card .btn-add-wishlist,
.product-card .btn-add-cart {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.product-card .btn-quick-view:hover {
  background-color: #e3f2fd;
  color: #2196f3;
  border-color: #2196f3;
}

.product-card .btn-add-wishlist:hover {
  background-color: #ffebee;
  color: #f44336;
  border-color: #f44336;
}

.product-card .btn-add-cart:hover:not(:disabled) {
  background-color: #5280e2;
  color: white;
  border-color: #5280e2;
}

.product-card .btn-add-cart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-card .product-info {
  padding: 15px;
}

.product-card .product-category {
  font-size: 12px;
  color: #777;
  margin-bottom: 5px;
}

.product-card .product-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 5px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-card .product-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.product-card .product-title a:hover {
  color: #5280e2;
}

.product-card .product-brand {
  font-size: 12px;
  color: #777;
  margin-bottom: 10px;
}

.product-card .product-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.product-card .current-price {
  font-size: 18px;
  font-weight: 600;
}

.product-card .original-price {
  font-size: 14px;
}

.product-card .product-rating {
  display: flex;
  align-items: center;
}

.product-card .stars {
  margin-right: 5px;
}

.product-card .stars i {
  font-size: 14px;
}

.product-card .rating-count {
  font-size: 12px;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.close-modal {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #777;
  transition: color 0.3s;
}

.close-modal:hover {
  color: #f44336;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.prescription-instructions {
  margin-bottom: 20px;
}

.prescription-instructions h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #333;
}

.prescription-instructions ul {
  padding-left: 20px;
}

.prescription-instructions li {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 8px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #5280e2;
}

.upload-area i {
  font-size: 48px;
  color: #777;
  margin-bottom: 10px;
}

.upload-area p {
  font-size: 14px;
  color: #555;
  margin: 0;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-preview i {
  font-size: 36px;
  color: #5280e2;
}

.file-preview p {
  flex: 1;
  text-align: left;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 18px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-submit-prescription {
  background-color: #5280e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit-prescription:hover:not(:disabled) {
  background-color: #355db9;
}

.btn-submit-prescription:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

/* Responsive styles */
@media (max-width: 992px) {
  .product-detail-container {
    padding: 20px;
  }

  .product-info {
    padding-left: 0;
    margin-top: 30px;
  }

  .review-summary {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .tab-navigation {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 5px;
  }

  .tab-navigation button {
    padding: 10px 15px;
    font-size: 14px;
  }

  .product-carousel {
    gap: 15px;
  }

  .product-card {
    flex: 0 0 200px;
  }
}

@media (max-width: 576px) {
  .breadcrumb {
    font-size: 12px;
  }

  .product-title {
    font-size: 24px;
  }

  .main-image {
    height: 300px;
  }

  .thumbnail {
    width: 60px;
    height: 60px;
  }

  .product-actions {
    flex-wrap: wrap;
  }

  .quantity-selector {
    width: 100%;
    margin-bottom: 10px;
  }

  .btn-add-to-cart {
    width: calc(100% - 50px);
  }
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col-lg-5 {
  flex: 0 0 41.666667%;
  max-width: 41.666667%;
  padding: 0 15px;
}

.col-lg-7 {
  flex: 0 0 58.333333%;
  max-width: 58.333333%;
  padding: 0 15px;
}

@media (max-width: 992px) {

  .col-lg-5,
  .col-lg-7 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* Breadcrumb Navigation */
.breadcrumb {
  display: flex;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb a {
  color: #5280e2;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb a:hover {
  color: #355db9;
  text-decoration: underline;
}

.breadcrumb .divider {
  margin: 0 10px;
  color: #888;
}

.breadcrumb .current {
  color: #333;
  font-weight: 500;
}

/* Product Detail Container */
.product-detail-container {
  margin-bottom: 50px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

/* Product Images */
.product-images {
  position: relative;
  margin-bottom: 30px;
}

.product-badges {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.badge-new,
.badge-sale,
.badge-rx {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-new {
  background-color: #4caf50;
  color: white;
}

.badge-sale {
  background-color: #f44336;
  color: white;
}

.badge-rx {
  background-color: #2196f3;
  color: white;
}

.main-image {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid #eee;
}

.main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-thumbnails {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid #ddd;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail.active {
  border-color: #5280e2;
}

.thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Product Information */
.product-info {
  padding-left: 15px;
}

.product-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 15px;
  color: #333;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  margin-bottom: 15px;
  color: #666;
}

.product-meta>div {
  margin-right: 20px;
}

.product-meta span {
  font-weight: 500;
  color: #333;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.stars {
  display: flex;
  gap: 2px;
  margin-right: 10px;
}

.stars i {
  color: #ffc107;
  font-size: 18px;
}

.stars i.icofont-star-shape {
  color: #d1d1d1;
}

.rating-count {
  font-size: 14px;
  color: #666;
  margin-right: 15px;
}

.write-review {
  font-size: 14px;
  color: #5280e2;
  text-decoration: none;
}

.write-review:hover {
  text-decoration: underline;
}

.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.original-price {
  font-size: 18px;
  color: #888;
  text-decoration: line-through;
}

.discount-badge {
  background-color: #f44336;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 15px;
}

.product-availability {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
}

.product-availability.in-stock {
  color: #4caf50;
}

.product-availability.out-of-stock {
  color: #f44336;
}

.product-description {
  margin-bottom: 25px;
}

.product-description h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px;
  color: #333;
}

.product-description p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}

/* Prescription Information */
.prescription-info {
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 8px;
  background-color: #e3f2fd;
}

.prescription-alert {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 15px;
}

.prescription-alert i {
  font-size: 24px;
  color: #2196f3;
}

.alert-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px;
  color: #0d47a1;
}

.alert-content p {
  font-size: 14px;
  margin: 0;
  color: #0d47a1;
}

.prescription-upload {
  display: flex;
  justify-content: flex-end;
}

.btn-upload-prescription {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.btn-upload-prescription:hover {
  background-color: #0d8bf2;
}

/* Product Actions */
.product-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-selector button {
  background-color: #f5f5f5;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.quantity-selector button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 50px;
  border: none;
  text-align: center;
  font-size: 14px;
  padding: 8px;
  -moz-appearance: textfield;
}

.quantity-selector input::-webkit-outer-spin-button,
.quantity-selector input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btn-add-to-cart {
  flex: 1;
  background-color: #5280e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background-color 0.3s;
}

.btn-add-to-cart:hover:not(:disabled) {
  background-color: #355db9;
}

.btn-add-to-cart:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

.btn-add-to-wishlist {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-add-to-wishlist:hover {
  background-color: #ffebee;
  color: #f44336;
  border-color: #f44336;
}
</style>