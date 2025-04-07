import { Service } from '@models/Service'
import { serviceService } from '@user/services/ServiceService'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const userServiceStore = defineStore('service', () => {
  // State
  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const serviceList = computed(() => services.value)

  // Actions
  async function fetchServices() {
    loading.value = true
    error.value = null
    try {
      services.value = await serviceService.getAllServices()
    } catch (err) {
      error.value = 'Failed to fetch services'
      console.error(err)
      services.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchServiceById(id: number): Promise<Service | null> {
    loading.value = true
    error.value = null
    try {
      const existingService = services.value.find(service => service.id === id)
      
      if (existingService) {
        return existingService
      }
      
      const service = await serviceService.getServiceById(id)
      
      if (!service) {
        error.value = `Không tìm thấy dịch vụ với ID ${id}`
        return null
      }
      
      return service
    } catch (err: any) {
      error.value = err.message || `Lỗi khi tải thông tin dịch vụ ID=${id}`
      console.error(`Error in fetchServiceById(${id}):`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Reset method
  function $reset() {
    services.value = []
    loading.value = false
    error.value = null
  }

  return { 
    services, 
    serviceList,
    loading, 
    error, 
    fetchServices,
    fetchServiceById, 
    $reset
  }
})