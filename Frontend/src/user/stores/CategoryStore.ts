import { Category } from '@models/Category'
import { categoryService } from '@user/services/CategoryService'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const categoryList = computed(() => {
    return categories.value;
  })

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const fetchedCategories = await categoryService.getAllCategories() || []
      categories.value = fetchedCategories;
    } catch (err) {
      error.value = 'Failed to fetch categories'
      console.error('Category fetch error:', err)
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  // Reset method
  function $reset() {
    categories.value = []
    loading.value = false
    error.value = null
  }

  return { 
    categories, 
    categoryList,
    loading, 
    error, 
    fetchCategories, 
    $reset
  }
})