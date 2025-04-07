<template>
    <section class="shop-section">
        <div class="notification-container" v-if="notification.show">
            <div class="notification" :class="notification.type">
                <i :class="getNotificationIcon(notification.type)"></i>
                <span>{{ notification.message }}</span>
            </div>
        </div>
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="section-title mb-5">
                        <h2>Nhà thuốc Trực tuyến</h2>
                        <p>Duyệt danh mục thuốc của chúng tôi</p>
                    </div>
                </div>
            </div>

            <div class="row">
                <!-- Sidebar Filters -->
                <div class="col-lg-3">
                    <div class="shop-sidebar">
                        <!-- AI Symptom Search Widget -->
                        <div class="sidebar-widget symptom-search-widget">
                            <h4>Tìm thuốc theo triệu chứng (AI)</h4>
                            <div class="symptom-search-form">
                                <textarea v-model="symptomQuery"
                                    placeholder="Mô tả triệu chứng hoặc vấn đề sức khỏe của bạn..." rows="3"
                                    class="form-control"></textarea>
                                <button @click="getRecommendationsBySymptom" class="btn-search-symptom"
                                    :disabled="isLoadingRecommendations || !symptomQuery.trim()">
                                    <i class="icofont-search-document"></i> Tìm thuốc phù hợp
                                </button>
                            </div>
                        </div>

                        <div class="sidebar-widget">
                            <h4>Danh mục</h4>
                            <div class="widget-content">
                                <template v-if="categoryStore.categories && categoryStore.categories.length > 0">
                                    <div v-for="category in categoryStore.categories" :key="category.id"
                                        class="filter-checkbox">
                                        <input type="checkbox" :id="'category-' + category.id" :value="category.id"
                                            v-model="filters.categories" @change="applyFilters">
                                        <label :for="'category-' + category.id">
                                            {{ category.name }}
                                            <span>({{ getCategoryCount(category.id) }})</span>
                                        </label>
                                    </div>
                                </template>
                                <div v-else>Không có danh mục nào</div>
                            </div>
                        </div>

                        <!-- Brands Filter -->
                        <div class="sidebar-widget">
                            <h4>Thương hiệu</h4>
                            <div class="widget-content">
                                <template v-if="brandStore.brands && brandStore.brands.length > 0">
                                    <div v-for="brand in brandStore.brands" :key="brand.id" class="filter-checkbox">
                                        <input type="checkbox" :id="'brand-' + brand.id" :value="brand.id"
                                            v-model="filters.brands" @change="applyFilters">
                                        <label :for="'brand-' + brand.id">
                                            {{ brand.name }}
                                            <span>({{ getBrandCount(brand.id) }})</span>
                                        </label>
                                    </div>
                                </template>
                                <div v-else>Không có thương hiệu nào</div>
                            </div>
                        </div>

                        <!-- Price Range Filter -->
                        <div class="sidebar-widget">
                            <h4>Khoảng giá</h4>
                            <div class="widget-content">
                                <div class="price-range">
                                    <div class="price-values">
                                        <span>{{ formatCurrency(filters.priceRange[0]) }}</span>
                                        <span>{{ formatCurrency(filters.priceRange[1]) }}</span>
                                    </div>
                                    <div class="range-slider">
                                        <input type="range" :min="priceRange[0]" :max="priceRange[1]" step="10"
                                            v-model.number="filters.priceRange[0]" @change="applyFilters">
                                        <input type="range" :min="priceRange[0]" :max="priceRange[1]" step="10"
                                            v-model.number="filters.priceRange[1]" @change="applyFilters">
                                    </div>
                                </div>
                                <div class="price-inputs">
                                    <div class="form-group">
                                        <label for="min-price">Tối thiểu</label>
                                        <input type="number" id="min-price" v-model.number="filters.priceRange[0]"
                                            @change="applyFilters">
                                    </div>
                                    <div class="form-group">
                                        <label for="max-price">Tối đa</label>
                                        <input type="number" id="max-price" v-model.number="filters.priceRange[1]"
                                            @change="applyFilters">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Reset Filters Button -->
                        <div class="sidebar-widget">
                            <button class="btn-reset-filters" @click="resetFilters">
                                Đặt lại bộ lọc
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Medication Listing -->
                <div class="col-lg-9">
                    <!-- AI Recommendations Section -->
                    <div v-if="showRecommendations" class="ai-recommendations-section mb-4">
                        <div class="section-header">
                            <h3>Gợi ý thuốc dựa trên triệu chứng</h3>
                            <button @click="showRecommendations = false" class="btn-close-recommendations">
                                <i class="icofont-close"></i>
                            </button>
                        </div>

                        <!-- Loading state -->
                        <div v-if="isLoadingRecommendations" class="ai-loading">
                            <div class="spinner-border text-primary" role="status">
                                <span class="sr-only">Đang phân tích...</span>
                            </div>
                            <p>Đang phân tích triệu chứng và tìm thuốc phù hợp...</p>
                        </div>

                        <!-- Results -->
                        <div v-else-if="symptomRecommendations.products.length > 0" class="ai-results">
                            <div class="ai-explanation card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title"><i class="icofont-robot"></i> Phân tích của AI</h5>
                                    <p>{{ symptomRecommendations.explanation }}</p>
                                </div>
                            </div>

                            <div class="ai-products">
                                <div class="grid-view">
                                    <div v-for="item in symptomRecommendations.products" :key="item.id"
                                        class="product-card">
                                        <div class="product-badges">
                                            <span v-if="item.hasDiscount" class="badge-sale">
                                                -{{ Math.round((1 - item.discountedPrice / item.originalPrice) * 100)
                                                }}%
                                            </span>
                                            <span v-if="item.prescriptionRequired" class="badge-rx">Kê đơn</span>
                                            <span class="badge-ai">Gợi ý AI</span>
                                        </div>

                                        <div class="product-image">
                                            <img v-if="item.mainImageUrl" :src="item.mainImageUrl" :alt="item.name" />
                                            <img v-else src="@/assets/user/images/favicon.png" :alt="item.name" />

                                            <div class="product-actions">
                                                <router-link :to="`/Medicine/${item.id}`">
                                                    <button class="btn-quick-view">
                                                        <i class="icofont-eye"></i>
                                                    </button>
                                                </router-link>
                                                <button class="btn-add-wishlist" @click="addToWishlist(item)">
                                                    <i class="icofont-heart"></i>
                                                </button>
                                                <button class="btn-add-cart" @click="addToCart(item)"
                                                    :disabled="item.prescriptionRequired">
                                                    <i class="icofont-cart"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="product-info">
                                            <div class="product-category text-center" v-if="item.categoryNames">
                                                {{ item.categoryNames }}
                                            </div>
                                            <div class="product-category text-center" v-if="item.brandName">
                                                {{ item.brandName }}
                                            </div>
                                            <h3 class="product-title text-center">
                                                <router-link :to="`/Medicine/${item.id}`">{{ item.name }}</router-link>
                                            </h3>

                                            <div class="product-price">
                                                <!-- Hiển thị cả giá gốc và giá đã giảm nếu có giảm giá -->
                                                <template v-if="item.hasDiscount && item.originalPrice">
                                                    <div class="text-center w-100">
                                                        <span class="original-price">
                                                            {{ formatCurrency(item.originalPrice) }}
                                                        </span>
                                                        <!-- Giá sau khi giảm -->
                                                        <span class="current-price">
                                                            {{ formatCurrency(item.discountedPrice) }}
                                                        </span>
                                                    </div>
                                                </template>

                                                <!-- Trường hợp không có giảm giá nhưng có thông tin giá -->
                                                <template v-else-if="item.originalPrice">
                                                    <span class="current-price">
                                                        {{ formatCurrency(item.originalPrice) }}
                                                    </span>
                                                </template>

                                                <!-- Fallback cuối cùng khi không có thông tin giá -->
                                                <template v-else>
                                                    <span class="current-price">Chưa có thông tin giá</span>
                                                </template>
                                            </div>

                                            <div class="product-rating" v-if="item.rating !== undefined">
                                                <div class="stars">
                                                    <i v-for="n in 5" :key="n" :class="[
                                                        n <= item.rating ? 'icofont-star' : 'icofont-star-shape'
                                                    ]"></i>
                                                </div>
                                                <span class="rating-count" v-if="item.reviewCount !== undefined">
                                                    ({{ item.reviewCount }})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- No results -->
                        <div v-else class="ai-no-results">
                            <i class="icofont-sad"></i>
                            <h4>Không tìm thấy thuốc phù hợp</h4>
                            <p>Vui lòng mô tả chi tiết hơn về triệu chứng của bạn</p>
                        </div>
                    </div>

                    <!-- Hiển thị gợi ý cá nhân nếu đăng nhập -->
                    <div v-if="showPersonalized && personalizedProducts.length > 0 && !showRecommendations"
                        class="recommendation-section mb-4">
                        <div class="section-header">
                            <h3>Gợi ý dành cho bạn</h3>
                        </div>
                        <div class="product-container grid-view">
                            <div v-for="item in personalizedProducts" :key="item.id" class="product-card">
                                <div class="product-badges">
                                    <span v-if="item.hasDiscount" class="badge-sale">
                                        -{{ Math.round((1 - item.discountedPrice / item.originalPrice) * 100) }}%
                                    </span>
                                    <span v-if="item.prescriptionRequired" class="badge-rx">Kê đơn</span>
                                    <span class="badge-personal">Dành cho bạn</span>
                                </div>

                                <div class="product-image">
                                    <img v-if="item.mainImageUrl" :src="item.mainImageUrl" :alt="item.name" />
                                    <img v-else src="@/assets/user/images/favicon.png" :alt="item.name" />

                                    <div class="product-actions">
                                        <router-link :to="`/Medicine/${item.id}`">
                                            <button class="btn-quick-view">
                                                <i class="icofont-eye"></i>
                                            </button>
                                        </router-link>
                                        <button class="btn-add-wishlist" @click="addToWishlist(item)">
                                            <i class="icofont-heart"></i>
                                        </button>
                                        <button class="btn-add-cart" @click="addToCart(item)"
                                            :disabled="item.prescriptionRequired">
                                            <i class="icofont-cart"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="product-info">
                                    <div class="product-category text-center" v-if="item.categoryNames">
                                        {{ item.categoryNames }}
                                    </div>
                                    <div class="product-category text-center" v-if="item.brandName">
                                        {{ item.brandName }}
                                    </div>
                                    <h3 class="product-title text-center">
                                        <router-link :to="`/Medicine/${item.id}`">{{ item.name }}</router-link>
                                    </h3>

                                    <div class="product-price">
                                        <!-- Hiển thị cả giá gốc và giá đã giảm nếu có giảm giá -->
                                        <template v-if="item.hasDiscount && item.originalPrice">
                                            <div class="text-center w-100">
                                                <span class="original-price">
                                                    {{ formatCurrency(item.originalPrice) }}
                                                </span>
                                                <span class="current-price">
                                                    {{ formatCurrency(item.discountedPrice) }}
                                                </span>
                                            </div>
                                        </template>

                                        <!-- Trường hợp không có giảm giá nhưng có thông tin giá -->
                                        <template v-else-if="item.originalPrice">
                                            <span class="current-price">
                                                {{ formatCurrency(item.originalPrice) }}
                                            </span>
                                        </template>

                                        <!-- Fallback cuối cùng khi không có thông tin giá -->
                                        <template v-else>
                                            <span class="current-price">Chưa có thông tin giá</span>
                                        </template>
                                    </div>

                                    <div class="product-rating" v-if="item.reviews && item.reviews.length > 0">
                                        <div class="stars">
                                            <i v-for="n in 5" :key="n" :class="[
                                                n <= getAverageRating(item) ? 'icofont-star' : 'icofont-star-shape'
                                            ]"></i>
                                        </div>
                                        <span class="rating-count">
                                            ({{ item.reviews.length }})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Hiển thị xu hướng cho mọi người dùng -->
                    <div v-if="showTrending && trendingProducts.length > 0 && !showRecommendations"
                        class="recommendation-section mb-4">
                        <div class="section-header">
                            <h3>Sản phẩm phổ biến</h3>
                        </div>
                        <div class="product-container grid-view">
                            <div v-for="item in trendingProducts" :key="item.id" class="product-card">
                                <div class="product-badges">
                                    <span v-if="item.hasDiscount" class="badge-sale">
                                        -{{ Math.round((1 - item.discountedPrice / item.originalPrice) * 100) }}%
                                    </span>
                                    <span v-if="item.prescriptionRequired" class="badge-rx">Kê đơn</span>
                                    <span class="badge-trending">Phổ biến</span>
                                </div>

                                <div class="product-image">
                                    <img v-if="item.mainImageUrl" :src="item.mainImageUrl" :alt="item.name" />
                                    <img v-else src="@/assets/user/images/favicon.png" :alt="item.name" />

                                    <div class="product-actions">
                                        <router-link :to="`/Medicine/${item.id}`">
                                            <button class="btn-quick-view">
                                                <i class="icofont-eye"></i>
                                            </button>
                                        </router-link>
                                        <button class="btn-add-wishlist" @click="addToWishlist(item)">
                                            <i class="icofont-heart"></i>
                                        </button>
                                        <button class="btn-add-cart" @click="addToCart(item)"
                                            :disabled="item.prescriptionRequired">
                                            <i class="icofont-cart"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="product-info">
                                    <div class="product-category text-center" v-if="item.categoryNames">
                                        {{ item.categoryNames }}
                                    </div>
                                    <div class="product-category text-center" v-if="item.brandName">
                                        {{ item.brandName }}
                                    </div>
                                    <h3 class="product-title text-center">
                                        <router-link :to="`/Medicine/${item.id}`">{{ item.name }}</router-link>
                                    </h3>

                                    <div class="product-price">
                                        <!-- Hiển thị cả giá gốc và giá đã giảm nếu có giảm giá -->
                                        <template v-if="item.hasDiscount && item.originalPrice">
                                            <div class="text-center w-100">
                                                <span class="original-price">
                                                    {{ formatCurrency(item.originalPrice) }}
                                                </span>
                                                <span class="current-price">
                                                    {{ formatCurrency(item.discountedPrice) }}
                                                </span>
                                            </div>
                                        </template>

                                        <!-- Trường hợp không có giảm giá nhưng có thông tin giá -->
                                        <template v-else-if="item.originalPrice">
                                            <span class="current-price">
                                                {{ formatCurrency(item.originalPrice) }}
                                            </span>
                                        </template>

                                        <!-- Fallback cuối cùng khi không có thông tin giá -->
                                        <template v-else>
                                            <span class="current-price">Chưa có thông tin giá</span>
                                        </template>
                                    </div>

                                    <div class="product-rating" v-if="item.reviews && item.reviews.length > 0">
                                        <div class="stars">
                                            <i v-for="n in 5" :key="n" :class="[
                                                n <= getAverageRating(item) ? 'icofont-star' : 'icofont-star-shape'
                                            ]"></i>
                                        </div>
                                        <span class="rating-count">
                                            ({{ item.reviews.length }})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Top Bar: Sort, View Options, Results Count -->
                    <div class="shop-topbar">
                        <div class="results-count">
                            Đang hiển thị <span>{{ paginatedMedicines.length }}</span> trên <span>{{
                                filteredMedicines.length
                                }}</span>
                            sản phẩm thuốc
                        </div>

                        <div class="sort-options">
                            <label for="sort-by">Sắp xếp theo:</label>
                            <select id="sort-by" v-model="filters.sortBy" @change="applyFilters">
                                <option value="name-asc">Tên (A-Z)</option>
                                <option value="name-desc">Tên (Z-A)</option>
                                <option value="price-asc">Giá (Thấp-Cao)</option>
                                <option value="price-desc">Giá (Cao-Thấp)</option>
                                <option value="popularity">Phổ biến</option>
                                <option value="newest">Mới nhất</option>
                            </select>
                        </div>

                        <div class="view-options">
                            <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                                <i class="icofont-grid"></i>
                            </button>
                            <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                                <i class="icofont-listing-box"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Loading indicator -->
                    <div v-if="medicineStore.loading" class="loading-container">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Đang tải...</span>
                        </div>
                        <p>Đang tải danh sách thuốc...</p>
                    </div>

                    <!-- Error message -->
                    <div v-else-if="medicineStore.error" class="error-container alert alert-danger">
                        <i class="icofont-warning-alt"></i>
                        <p>{{ medicineStore.error }}</p>
                        <button class="btn btn-outline-danger" @click="medicineStore.fetchComprehensiveMedicineList()">
                            Thử lại
                        </button>
                    </div>

                    <!-- Medication Grid/List View -->
                    <div v-else class="product-container"
                        :class="{ 'grid-view': viewMode === 'grid', 'list-view': viewMode === 'list' }">
                        <div v-for="item in paginatedMedicines" :key="item.id" class="product-card">
                            <div class="product-badges">
                                <span v-if="item.hasDiscount" class="badge-sale">
                                    -{{ Math.round((1 - item.discountedPrice / item.originalPrice) * 100) }}%
                                </span>
                                <span v-if="item.prescriptionRequired" class="badge-rx">Kê đơn</span>
                            </div>

                            <div class="product-image">
                                <img v-if="item.mainImageUrl" :src="item.mainImageUrl" :alt="item.name" />
                                <img v-else src="@/assets/user/images/favicon.png" :alt="item.name" />

                                <div class="product-actions">
                                    <router-link :to="`/Medicine/${item.id}`" @click="onProductDetailClick(item)">
                                        <button class="btn-quick-view">
                                            <i class="icofont-eye"></i>
                                        </button>
                                    </router-link>

                                    <button class="btn-add-wishlist" @click="addToWishlist(item)"
                                        :class="{ 'in-wishlist': isLoggedIn && isInWishlist(item) }">
                                        <i
                                            :class="isLoggedIn && isInWishlist(item) ? 'icofont-heart' : 'icofont-heart-alt'"></i>
                                    </button>
                                    <button class="btn-add-cart" @click="addToCart(item)"
                                        :disabled="item.outOfStock || item.prescriptionRequired">
                                        <i class="icofont-cart"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="product-info">
                                <div class="product-category text-center" v-if="item.categoryNames">
                                    {{ item.categoryNames }}
                                </div>
                                <div class="product-category text-center" v-if="item.brandName">
                                    {{ item.brandName }}
                                </div>
                                <h3 class="product-title text-center">
                                    <router-link :to="`/Medicine/${item.id}`" @click="onProductDetailClick(item)">
                                        {{ item.name }}
                                    </router-link>
                                </h3>
                                <div class="product-price justify-content-center">
                                    <!-- Hiển thị cả giá gốc và giá đã giảm nếu có giảm giá -->
                                    <template v-if="item.hasDiscount && item.originalPrice">
                                        <div class="text-center w-100">
                                            <span class="original-price">
                                                {{ formatCurrency(item.originalPrice) }}
                                            </span>
                                            <span class="current-price">
                                                {{ formatCurrency(item.discountedPrice) }}
                                            </span>
                                        </div>
                                    </template>

                                    <!-- Trường hợp không có giảm giá nhưng có thông tin giá -->
                                    <template v-else-if="item.originalPrice" class="justify-content-center">
                                        <span class="current-price">
                                            {{ formatCurrency(item.originalPrice) }}
                                        </span>
                                    </template>

                                    <!-- Fallback cuối cùng khi không có thông tin giá -->
                                    <template v-else>
                                        <span class="current-price">Chưa có thông tin giá</span>
                                    </template>
                                </div>

                                <div class="product-rating" v-if="item.reviews && item.reviews.length > 0">
                                    <div class="stars">
                                        <i v-for="n in 5" :key="n" :class="[
                                            n <= getAverageRating(item) ? 'icofont-star' : 'icofont-star-shape'
                                        ]"></i>
                                    </div>
                                    <span class="rating-count">
                                        ({{ item.reviews.length }})
                                    </span>
                                </div>

                                <div class="product-actions-list">
                                    <button class="btn-add-cart" @click="addToCart(item)"
                                        :disabled="!isLoggedIn || item.outOfStock || item.prescriptionRequired">
                                        {{ item.outOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng' }}
                                    </button>
                                    <button class="btn-add-wishlist" @click="addToWishlist(item)"
                                        :class="{ 'in-wishlist': isLoggedIn && isInWishlist(item) }">
                                        <i
                                            :class="isLoggedIn && isInWishlist(item) ? 'icofont-heart' : 'icofont-heart-alt'"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="!medicineStore.loading && !medicineStore.error && paginatedMedicines.length === 0"
                        class="empty-results">
                        <i class="icofont-search-document"></i>
                        <h3>Không tìm thấy thuốc nào</h3>
                        <p>Hãy điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                        <button class="btn-reset-filters" @click="resetFilters">
                            Đặt lại bộ lọc
                        </button>
                    </div>

                    <!-- Pagination -->
                    <div class="pagination-container" v-if="filteredMedicines.length > 0">
                        <button class="pagination-arrow" @click="prevPage" :disabled="currentPage === 1">
                            <i class="icofont-arrow-left"></i>
                        </button>

                        <button v-for="page in totalPages" :key="page" class="pagination-number"
                            :class="{ active: currentPage === page }" @click="goToPage(page)">
                            {{ page }}
                        </button>

                        <button class="pagination-arrow" @click="nextPage" :disabled="currentPage === totalPages">
                            <i class="icofont-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
// Script Setup
import { useAuthStore } from '@user/stores/auth/useAuthStore';
import { useBrandStore } from '@user/stores/BrandStore';
import { useCartStore } from '@user/stores/CartStore';
import { useCategoryStore } from '@user/stores/CategoryStore';
import { useMedicineStore } from '@user/stores/MedicineStore';
import { useWishlistStore } from '@user/stores/WishListStore';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { recommendationService } from '@user/services/RecommendationService';
import { authService } from '@user/services/AuthService';

const formatCurrency = (price) => {
    if (price === undefined || price === null) {
        return '0đ';
    }
    return price.toLocaleString('vi-VN') + 'đ';
};

// View Mode
const viewMode = ref('grid'); // 'grid' or 'list'

// Pagination
const currentPage = ref(1);
const medicinesPerPage = ref(9);

// AI recommendation
const symptomQuery = ref('');
const symptomRecommendations = ref({ products: [], explanation: '' });
const isLoadingRecommendations = ref(false);
const showRecommendations = ref(false);

// Thêm các biến state mới
const trendingProducts = ref([]);
const personalizedProducts = ref([]);
const showTrending = ref(true);
const showPersonalized = ref(false);

// Biến theo dõi xem sản phẩm
const productViewStartTime = ref(0);
const viewedProductId = ref(null);
let searchTimeout = null;

// Filters
const filters = ref({
    search: '',
    categories: [],
    brands: [],
    priceRange: [0, 999999],
    prescription: 'all',
    sortBy: 'name-asc'
});

const categoryStore = useCategoryStore();
const brandStore = useBrandStore();
const medicineStore = useMedicineStore();
const wishlistStore = useWishlistStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const notification = ref({
    show: false,
    message: '',
    type: 'success', // success, error, warning, info
    timeout: null
});

const showNotification = (message, type = 'success', duration = 3000) => {
    // Clear existing timeout if there is one
    if (notification.value.timeout) {
        clearTimeout(notification.value.timeout);
    }

    // Update notification
    notification.value.show = true;
    notification.value.message = message;
    notification.value.type = type;

    // Auto hide after duration
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

const isLoggedIn = computed(() => {
    return authStore.isAuthenticated && !!authStore.user;
});

// Lấy đánh giá trung bình cho sản phẩm
const getAverageRating = (medicine) => {
    if (!medicine.reviews || medicine.reviews.length === 0) return 0;

    const sum = medicine.reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round(sum / medicine.reviews.length);
};

// Kiểm tra xem sản phẩm có nằm trong wishlist không
const isInWishlist = (medicine) => {
    if (!isLoggedIn.value) return false;
    return medicine.attributeId ?
        wishlistStore.isInWishlist(medicine.id, medicine.attributeId) :
        wishlistStore.isInWishlist(medicine.id);
};

// Theo dõi khi người dùng nhấp vào xem chi tiết sản phẩm
const onProductDetailClick = (medicine) => {
    if (isLoggedIn.value && authStore.user) {
        // Ghi lại thời gian bắt đầu xem và ID sản phẩm
        productViewStartTime.value = Date.now();
        viewedProductId.value = medicine.id;

        // Gửi sự kiện bắt đầu xem
        recommendationService.trackUserActivity(
            authStore.user.id,
            'view',
            {
                medicineId: medicine.id,
                duration: 0,
                timestamp: productViewStartTime.value
            }
        );
    }
};

// Hàm AI - Lấy gợi ý dựa trên triệu chứng
const getRecommendationsBySymptom = async () => {
    if (!symptomQuery.value.trim()) {
        showNotification("Vui lòng nhập triệu chứng bạn đang gặp phải", "warning");
        return;
    }

    isLoadingRecommendations.value = true;
    showRecommendations.value = true;

    try {
        // Theo dõi hoạt động tìm kiếm theo triệu chứng
        if (isLoggedIn.value && authStore.user) {
            recommendationService.trackUserActivity(
                authStore.user.id,
                'search',
                { query: symptomQuery.value }
            );
        }

        symptomRecommendations.value = await recommendationService.getRecommendationsBySymptom(
            symptomQuery.value,
            medicineStore.normalizedMedicines,
            8
        );

        if (symptomRecommendations.value.products.length === 0) {
            showNotification("Không tìm thấy sản phẩm phù hợp với triệu chứng bạn mô tả", "info");
        }
    } catch (error) {
        console.error('Lỗi khi lấy gợi ý thuốc theo triệu chứng:', error);
        symptomRecommendations.value = { products: [], explanation: '' };
        showNotification("Có lỗi xảy ra khi phân tích triệu chứng", "error");
    } finally {
        isLoadingRecommendations.value = false;
    }
};

const priceRange = computed(() => {
    if (!medicineStore.normalizedMedicines || medicineStore.normalizedMedicines.length === 0) {
        return [0, 0];
    }

    const prices = medicineStore.normalizedMedicines.map(item => item.originalPrice || 0);
    const minPrice = Math.floor(Math.min(...prices));
    const maxPrice = Math.ceil(Math.max(...prices));
    return [minPrice, maxPrice];
});

// Filtered medicines based on applied filters
const filteredMedicines = computed(() => {
    if (!medicineStore.normalizedMedicines || medicineStore.normalizedMedicines.length === 0) {
        return [];
    }

    let result = [...medicineStore.normalizedMedicines];

    // Lọc theo từ khoá tìm kiếm
    if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase();
        result = result.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }

    // Lọc theo danh mục
    if (filters.value.categories.length > 0) {
        result = result.filter(item =>
            item.categories.some(category =>
                filters.value.categories.includes(category.id))
        );
    }

    // Lọc theo thương hiệu
    if (filters.value.brands.length > 0) {
        result = medicineStore.filterByBrands(filters.value.brands);
    }

    // Lọc theo giá
    result = result.filter(item => {
        const price = item.originalPrice || 0;
        return price >= filters.value.priceRange[0] && price <= filters.value.priceRange[1];
    });

    // Sắp xếp kết quả
    switch (filters.value.sortBy) {
        case 'name-asc':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            result.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            result.sort((a, b) => (a.originalPrice || 0) - (b.originalPrice || 0));
            break;
        case 'price-desc':
            result.sort((a, b) => (b.originalPrice || 0) - (a.originalPrice || 0));
            break;
        case 'popularity':
            result.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
            break;
        case 'newest':
            // Giả sử có một thuộc tính createdAt hoặc id mới hơn thì lớn hơn
            result.sort((a, b) => b.id - a.id);
            break;
    }

    return result;
});

const totalPages = computed(() => {
    return Math.ceil(filteredMedicines.value.length / medicinesPerPage.value);
});

const paginatedMedicines = computed(() => {
    const startIndex = (currentPage.value - 1) * medicinesPerPage.value;
    const endIndex = startIndex + medicinesPerPage.value;
    const result = filteredMedicines.value.slice(startIndex, endIndex);
    return result;
});

const getCategoryCount = (categoryId) => {
    if (!medicineStore.normalizedMedicines) return 0;
    return medicineStore.normalizedMedicines.filter(item =>
        item.categories.some(category => category.id === categoryId)
    ).length;
};

const getBrandCount = (brandId) => {
    if (!medicineStore.normalizedMedicines) return 0;
    return medicineStore.normalizedMedicines.filter(item =>
        item.brandName && item.medicine?.brandId === brandId
    ).length;
};

const resetFilters = () => {
    filters.value = {
        search: '',
        categories: [],
        brands: [],
        priceRange: [...priceRange.value],
        prescription: 'all',
        sortBy: 'name-asc'
    };
    currentPage.value = 1;
};

const applyFilters = () => {
    currentPage.value = 1;
};

const goToPage = (page) => {
    currentPage.value = page;
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

// Hàm AI - Tải gợi ý cá nhân hóa
const loadPersonalizedRecommendations = async () => {
    if (!isLoggedIn.value || !authStore.user) return;

    try {
        personalizedProducts.value = await recommendationService.getPersonalizedRecommendations(
            authStore.user.id,
            medicineStore.normalizedMedicines,
            4
        );

        if (personalizedProducts.value.length > 0) {
            showPersonalized.value = true;
        }
    } catch (error) {
        console.error('Lỗi khi lấy gợi ý cá nhân hóa:', error);
        showNotification("Không thể tải gợi ý cá nhân hóa", "error");
    }
};

// Thêm phương thức để làm mới dữ liệu gợi ý
const refreshRecommendations = async () => {
    try {
        // Xóa cache để lấy dữ liệu mới
        recommendationService.clearCache();

        // Tải lại các gợi ý
        if (isLoggedIn.value && authStore.user) {
            await loadPersonalizedRecommendations();
        }

        // Tải lại xu hướng
        trendingProducts.value = await recommendationService.getTrendingProducts(
            medicineStore.normalizedMedicines,
            4
        );

        showNotification("Đã làm mới dữ liệu gợi ý", "success");
    } catch (error) {
        console.error('Lỗi khi làm mới dữ liệu gợi ý:', error);
        showNotification("Không thể làm mới dữ liệu gợi ý", "error");
    }
};

const addToCart = async (item) => {
    if (!item || item.outOfStock) {
        showNotification(item.outOfStock
            ? `Sản phẩm ${item.name} đã hết hàng`
            : "Sản phẩm không đủ thông tin để thêm vào giỏ hàng",
            item.outOfStock ? "warning" : "error");
        return;
    }

    if (!isLoggedIn.value) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?')) {
            router.push('/login');
        }
        return;
    }

    cartStore.syncWithAuthStore();

    let patientId = null;
    try {
        patientId = await authService.getDataPatient(authStore.$state.user.id);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bệnh nhân:', error);
    }

    const rawData = item.rawData;

    const originalMedicine = rawData || medicineStore.comprehensiveMedicines.find(m => m.medicine.id === item.id);
    if (!originalMedicine) {
        showNotification("Không thể thêm sản phẩm vào giỏ hàng do thiếu thông tin", "error");
        return;
    }

    const medicine = originalMedicine.medicine;

    const added = await cartStore.addToCart(
        medicine,
        1,
        patientId
    );

    if (added) {
        // Theo dõi hoạt động thêm vào giỏ hàng
        if (isLoggedIn.value && authStore.user) {
            recommendationService.trackUserActivity(
                authStore.user.id,
                'purchase',
                {
                    medicineId: item.id,
                    count: 1
                }
            );
        }
        showNotification(`Đã thêm ${item.name} vào giỏ hàng`, "success");
    } else {
        showNotification("Không thể thêm sản phẩm vào giỏ hàng", "error");
    }
};

const addToWishlist = async (item) => {
    if (!item) {
        showNotification("Không thể thêm sản phẩm vào danh sách yêu thích", "error");
        return;
    }

    if (!isLoggedIn.value) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích. Đăng nhập ngay?')) {
            router.push('/login');
        }
        return;
    }

    wishlistStore.syncWithAuthStore();

    let patientId = null;
    try {
        patientId = await authService.getDataPatient(authStore.$state.user.id);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bệnh nhân:', error);
    }

    // Sử dụng dữ liệu gốc từ trường rawData để đảm bảo tương thích với logic WishlistStore
    const rawData = item.rawData;
    const originalMedicine = rawData || medicineStore.comprehensiveMedicines.find(m => m.medicine.id === item.id);
    if (!originalMedicine) {
        showNotification("Không thể thêm sản phẩm vào danh sách yêu thích do thiếu thông tin", "error");
        return;
    }

    if (isInWishlist(item)) {
        const removed = wishlistStore.removeFromWishlist(item.id, item.attributeId);
        if (removed) {
            showNotification(`Đã xóa ${item.name} khỏi danh sách yêu thích`, "info");
        }
    } else {
        const medicine = originalMedicine.medicine;
        const added = await wishlistStore.addToWishlist(medicine, patientId);
        if (added) {
            // Theo dõi hoạt động thêm vào wishlist
            if (isLoggedIn.value && authStore.user) {
                recommendationService.trackUserActivity(
                    authStore.user.id,
                    'wishlist',
                    {
                        medicineId: item.id
                    }
                );
            }
            showNotification(`Đã thêm ${item.name} vào danh sách yêu thích`, "success");
        } else {
            showNotification("Không thể thêm sản phẩm vào danh sách yêu thích", "error");
        }
    }
};

// Theo dõi thay đổi trạng thái đăng nhập
watch(() => authStore.isAuthenticated, (newValue) => {
    if (newValue) {
        cartStore.syncWithAuthStore();
        wishlistStore.syncWithAuthStore();

        // Nếu đăng nhập thì lấy gợi ý cá nhân hóa
        if (authStore.user) {
            loadPersonalizedRecommendations();
        }
    } else {
        // Nếu đăng xuất thì ẩn gợi ý cá nhân
        showPersonalized.value = false;
    }
});

// Theo dõi thay đổi trường tìm kiếm
watch(() => filters.value.search, (newVal, oldVal) => {
    if (newVal && newVal.length >= 3 && newVal !== oldVal && isLoggedIn.value && authStore.user) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            recommendationService.trackUserActivity(
                authStore.user.id,
                'search',
                { query: newVal }
            );
        }, 1000); // Đợi 1 giây sau khi người dùng ngừng gõ
    }
});

// Xử lý khi component unmount
onBeforeUnmount(() => {
    // Nếu người dùng đã bắt đầu xem một sản phẩm
    if (productViewStartTime.value > 0 && viewedProductId.value && isLoggedIn.value && authStore.user) {
        const viewDuration = Math.floor((Date.now() - productViewStartTime.value) / 1000);

        // Chỉ ghi nhận nếu xem ít nhất 5 giây
        if (viewDuration >= 5) {
            recommendationService.trackUserActivity(
                authStore.user.id,
                'view',
                {
                    medicineId: viewedProductId.value,
                    duration: viewDuration,
                    timestamp: productViewStartTime.value
                }
            );
        }
    }

    // Xóa timeout nếu có
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
});

onMounted(async () => {
    try {
        // Tải dữ liệu từ localStorage nếu người dùng đã đăng nhập
        if (isLoggedIn.value && authStore.user) {
            await recommendationService.loadUserHistoryFromStorage(authStore.user.id);
        }

        await Promise.all([
            brandStore.fetchBrands(),
            categoryStore.fetchCategories(),
            medicineStore.fetchComprehensiveMedicineList()
        ]);

        if (medicineStore.normalizedMedicines.length > 0) {
            filters.value.priceRange = [...priceRange.value];

            // Lấy sản phẩm xu hướng
            trendingProducts.value = await recommendationService.getTrendingProducts(
                medicineStore.normalizedMedicines,
                4
            );

            // Nếu đã đăng nhập, lấy gợi ý cá nhân hóa
            if (isLoggedIn.value) {
                await loadPersonalizedRecommendations();
            }
        }

        cartStore.syncWithAuthStore();
        wishlistStore.syncWithAuthStore();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        showNotification("Có lỗi xảy ra khi tải dữ liệu", "error");
    }
});
</script>
<style scoped>
/* Thiết lập chung */
.shop-section {
    padding: 80px 0;
    background: #f9f9f9;
}

.section-title h2 {
    color: #223a66;
    font-weight: 700;
    margin-bottom: 10px;
}

/* Hệ thống thông báo */
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

/* Sidebar */
.shop-sidebar {
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.sidebar-widget {
    padding: 25px;
    border-bottom: 1px solid #f0f0f0;
}

.sidebar-widget:last-child {
    border-bottom: none;
}

.sidebar-widget h4 {
    font-size: 18px;
    color: #223a66;
    margin-bottom: 15px;
    font-weight: 600;
}

.widget-content {
    margin-top: 15px;
}

/* Widget tìm theo triệu chứng */
.symptom-search-widget textarea {
    resize: none;
    margin-bottom: 10px;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    font-size: 15px;
    width: 100%;
}

.btn-search-symptom {
    background-color: #223a66;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-search-symptom:hover {
    background-color: #192e4f;
}

.btn-search-symptom:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
}

/* Checkbox lọc */
.filter-checkbox {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.filter-checkbox input {
    margin-right: 10px;
}

.filter-checkbox label {
    color: #6F8BA4;
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.filter-checkbox label span {
    color: #a0a0a0;
    font-size: 14px;
}

/* Thanh trượt khoảng giá */
.price-range {
    padding: 10px 0;
}

.price-values {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.range-slider {
    position: relative;
    height: 5px;
    background: #e9ecef;
    border-radius: 5px;
    margin: 15px 0;
}

.range-slider input {
    position: absolute;
    width: 100%;
    height: 5px;
    top: 0;
    background: none;
    pointer-events: none;
    -webkit-appearance: none;
}

.range-slider input::-webkit-slider-thumb {
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background: #e12454;
    cursor: pointer;
    pointer-events: auto;
    -webkit-appearance: none;
}

.price-inputs {
    display: flex;
    gap: 10px;
}

.price-inputs .form-group {
    flex: 1;
}

.price-inputs input {
    width: 100%;
    padding: 8px;
    border: 1px solid #e9ecef;
    border-radius: 5px;
}

/* Nút đặt lại */
.btn-reset-filters {
    background-color: #f8f9fa;
    color: #6F8BA4;
    border: 1px solid #e9ecef;
    padding: 10px 15px;
    border-radius: 5px;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-reset-filters:hover {
    background-color: #e9ecef;
}

/* Thanh công cụ trên cùng */
.shop-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
}

.results-count {
    color: #6F8BA4;
}

.results-count span {
    color: #223a66;
    font-weight: 600;
}

.sort-options {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sort-options label {
    color: #6F8BA4;
}

.sort-options select {
    padding: 8px 30px 8px 10px;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    color: #223a66;
    background-color: white;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236F8BA4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    cursor: pointer;
}

.view-options {
    display: flex;
    gap: 5px;
}

.view-options button {
    border: 1px solid #e9ecef;
    background: white;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: #6F8BA4;
    cursor: pointer;
    transition: all 0.3s;
}

.view-options button.active {
    background-color: #e12454;
    color: white;
    border-color: #e12454;
}

/* Phần gợi ý AI */
.ai-recommendations-section,
.recommendation-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    padding: 25px;
    margin-bottom: 30px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header h3 {
    color: #223a66;
    font-size: 22px;
    margin: 0;
}

.btn-close-recommendations {
    background: none;
    border: none;
    color: #6F8BA4;
    font-size: 20px;
    cursor: pointer;
}

.ai-loading,
.ai-no-results {
    text-align: center;
    padding: 30px 0;
}

.ai-loading p,
.ai-no-results p {
    color: #6F8BA4;
    margin-top: 15px;
}

.ai-no-results i {
    font-size: 50px;
    color: #a0aec0;
}

.ai-explanation {
    border-left: 4px solid #223a66;
    background-color: #f8f9fa;
}

/* Badge nhãn sản phẩm */
.badge-ai,
.badge-personal,
.badge-trending,
.badge-new,
.badge-sale,
.badge-rx {
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: white;
}

.badge-ai {
    background-color: #223a66;
}

.badge-personal {
    background-color: #8a2be2;
}

.badge-trending {
    background-color: #ff6b6b;
}

.badge-new {
    background-color: #223a66;
}

.badge-sale {
    background-color: #e12454;
}

.badge-rx {
    background-color: #f5a623;
}

/* Hiển thị sản phẩm dạng lưới/danh sách */
.product-container {
    margin-bottom: 30px;
}

.grid-view {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.list-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.recommendation-section .grid-view {
    grid-template-columns: repeat(4, 1fr);
}

/* Card sản phẩm */
.product-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.3s;
    position: relative;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.grid-view .product-card {
    display: flex;
    flex-direction: column;
}

.list-view .product-card {
    display: flex;
    flex-direction: row;
}

.product-badges {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.product-image {
    position: relative;
    overflow: hidden;
}

.grid-view .product-image {
    height: 200px;
}

.list-view .product-image {
    width: 200px;
    min-width: 200px;
    height: 100%;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
}

.product-card:hover .product-image img {
    transform: scale(1.05);
}

/* Các nút tương tác */
.product-actions {
    position: absolute;
    bottom: -50px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    transition: bottom 0.3s;
}

.product-card:hover .product-actions {
    bottom: 0;
}

.product-actions button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-quick-view {
    background-color: white;
    color: #223a66;
}

.btn-add-wishlist {
    background-color: white;
    color: #e12454;
}

.btn-add-cart {
    background-color: #e12454;
    color: white;
}

.btn-quick-view:hover,
.btn-add-wishlist:hover {
    background-color: #223a66;
    color: white;
}

.btn-add-cart:hover {
    background-color: #c01d4e;
}

.btn-add-cart:disabled {
    background-color: #f8f9fa;
    color: #6F8BA4;
    cursor: not-allowed;
}

.btn-add-wishlist.in-wishlist {
    background-color: #ffebee;
    color: #e12454;
    border-color: #e12454;
}

.product-actions .btn-add-wishlist.in-wishlist {
    background-color: #e12454;
    color: white;
}

/* Thông tin sản phẩm */
.product-info {
    padding: 20px;
}

.grid-view .product-info {
    flex: 1;
}

.list-view .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.product-category {
    font-size: 13px;
    color: #6F8BA4;
    margin-bottom: 5px;
}

.product-title {
    font-size: 18px;
    margin-bottom: 5px;
    font-weight: 600;
}

.product-title a {
    color: #223a66;
    text-decoration: none;
}

.product-title a:hover {
    color: #e12454;
}

.product-price {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.original-price {
    color: #6F8BA4;
    text-decoration: line-through;
    font-size: 14px;
}

.current-price {
    color: #e12454;
    font-weight: 600;
    font-size: 18px;
}

/* Đánh giá sản phẩm */
.product-rating {
    justify-content: center;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.stars {
    color: #f5a623;
}

.rating-count {
    color: #6F8BA4;
    font-size: 13px;
}

.product-description {
    color: #6F8BA4;
    font-size: 14px;
    margin-bottom: 15px;
    display: none;
}

.list-view .product-description {
    display: block;
}

.product-actions-list {
    display: none;
    gap: 10px;
    margin-top: auto;
}

.list-view .product-actions-list {
    display: flex;
}

.product-actions-list .btn-add-cart {
    flex: 1;
    height: 40px;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
}

.product-actions-list .btn-add-wishlist {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    height: 40px;
    border-radius: 5px;
    background-color: transparent;
    border: 1px solid #e9ecef;
    color: #6F8BA4;
    padding: 0 15px;
    font-size: 14px;
}

.product-actions-list .btn-add-wishlist:hover {
    background-color: #f8f9fa;
    color: #e12454;
}

/* Trạng thái trống */
.empty-results {
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    padding: 50px;
    text-align: center;
}

.empty-results i {
    font-size: 60px;
    color: #e9ecef;
    margin-bottom: 20px;
}

.empty-results h3 {
    color: #223a66;
    margin-bottom: 10px;
}

.empty-results p {
    color: #6F8BA4;
    margin-bottom: 20px;
}

/* Phân trang */
.pagination-container {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 30px;
}

.pagination-number,
.pagination-arrow {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e9ecef;
    background-color: white;
    color: #6F8BA4;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.pagination-number.active {
    background-color: #e12454;
    color: white;
    border-color: #e12454;
}

.pagination-number:hover:not(.active),
.pagination-arrow:hover:not(:disabled) {
    background-color: #f8f9fa;
}

.pagination-arrow:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Trạng thái loading và lỗi */
.loading-container,
.error-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    padding: 40px;
    text-align: center;
    margin-bottom: 30px;
}

.loading-container p,
.error-container p {
    color: #6F8BA4;
    margin: 15px 0;
}

/* Responsive */
@media (max-width: 1199px) {
    .recommendation-section .grid-view {
        grid-template-columns: repeat(2, 1fr);
    }

    .grid-view {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 991px) {
    .shop-topbar {
        flex-wrap: wrap;
    }

    .results-count {
        width: 100%;
        margin-bottom: 15px;
    }

    .list-view .product-image {
        width: 150px;
        min-width: 150px;
    }
}

@media (max-width: 767px) {
    .grid-view {
        grid-template-columns: 1fr;
    }

    .recommendation-section .grid-view {
        grid-template-columns: 1fr;
    }

    .list-view .product-card {
        flex-direction: column;
    }

    .list-view .product-image {
        width: 100%;
        height: 200px;
    }

    .shop-topbar {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .view-options {
        margin-left: auto;
    }
}

@media (max-width: 576px) {
    .shop-section {
        padding: 50px 0;
    }

    .pagination-container {
        flex-wrap: wrap;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .notification-container {
        width: calc(100% - 40px);
        max-width: none;
        left: 20px;
        right: 20px;
    }
}
</style>