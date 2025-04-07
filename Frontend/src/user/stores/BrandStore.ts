import { Brand } from '@models/Brand'
import { brandService } from '@user/services/BrandService'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBrandStore = defineStore('brand', () => {
  // State
  const brands = ref<Brand[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const brandList = computed(() => brands.value)

  // Actions
  async function fetchBrands() {
    loading.value = true
    error.value = null
    try {
      brands.value = await brandService.getAllBrands() || []
    } catch (err) {
      error.value = 'Failed to fetch brands'
      console.error(err)
      brands.value = []
    } finally {
      loading.value = false
    }
  }

  // Reset method
  function $reset() {
    brands.value = []
    loading.value = false
    error.value = null
  }

  return { 
    brands, 
    brandList,
    loading, 
    error, 
    fetchBrands, 
    $reset
  }
})