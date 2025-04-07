<template>
    <section class="section clients">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-7">
                    <div class="section-title text-center">
                        <h2>Các thương hiệu cộng tác</h2>
                        <div class="divider mx-auto my-4"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div v-if="brandStore.loading" class="text-center">
                <p>Đang tải thương hiệu...</p>
            </div>
            <div v-else-if="brandStore.error" class="text-center text-danger">
                <p>{{ brandStore.error }}</p>
            </div>
            <div v-else class="row clients-logo">
                <div 
                    v-for="brand in brandStore.brands" 
                    :key="brand.id" 
                    class="col-lg-2 col-md-3 col-sm-4 col-6 mb-4"
                >
                    <div class="client-thumb text-center">
                        <img 
                            :src="brand.image" 
                            :alt="brand.name" 
                            class="img-fluid"
                            :title="brand.name"
                        >
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useBrandStore } from '@user/stores/BrandStore';
import { onMounted } from 'vue';
const brandStore = useBrandStore();
onMounted(() => {
    brandStore.fetchBrands();
});
</script>

<style scoped>
.client-thumb {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 120px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    transition: transform 0.3s ease;
}

.client-thumb:hover {
    transform: scale(1.05);
}

.client-thumb img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
}
</style>