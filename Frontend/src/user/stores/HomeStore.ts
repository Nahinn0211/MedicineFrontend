import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { HomeService } from '@user/services/HomeService';
import { Medicine } from '@models/Medicine';
import { medicineService } from '@user/services/MedicineService';
import { Discount } from '@models/Discount';
import { Review } from '@models/Review';
interface ComprehensiveMedicine {
  medicine: Medicine;
  discount: Discount[];
  review: Review[];
}

export const useHomeStore = defineStore('home', () => {
  const bestSellingMedicines = ref<ComprehensiveMedicine[]>([]);
  const newestMedicines = ref<ComprehensiveMedicine[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const slidesToShow = ref(3);
  const hasBestSellingMedicines = computed(() => bestSellingMedicines.value.length > 0);
  const hasNewestMedicines = computed(() => newestMedicines.value.length > 0);
  async function getComprehensiveMedicineData(medicine: Medicine): Promise<ComprehensiveMedicine> {
    try {
      const [discount, review] = await Promise.all([
        medicineService.getDiscountsByMedicineId(medicine.id ?? 0),
        medicineService.getReviewMedicineById(medicine.id ?? 0)
      ]);
      
      return {
        medicine,
        discount: discount || [],
        review: review || [],
      };
    } catch (error) {
      console.error(`Lỗi khi lấy dữ liệu chi tiết cho thuốc ${medicine.id}:`, error);
      return {
        medicine,
        discount: [],
        review: [],
      };
    }
  }

  async function fetchBestSellingMedicines() {
    try {
      isLoading.value = true;
      error.value = null;
      
      const basicMedicines = await HomeService.getBestSellingMedicine();
      if (!basicMedicines || basicMedicines.length === 0) {
        bestSellingMedicines.value = [];
        return;
      }
      
      const comprehensiveList = await Promise.all(
        basicMedicines.map(medicine => getComprehensiveMedicineData(medicine))
      );
      
      bestSellingMedicines.value = comprehensiveList;
    } catch (err: any) {
      error.value = err.message || 'Đã xảy ra lỗi khi tải danh sách sản phẩm bán chạy nhất';
      console.error('Error in fetchBestSellingMedicines:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // Phương thức lấy thuốc mới nhất
  async function fetchNewestMedicines() {
    try {
      isLoading.value = true;
      error.value = null;
      
      const basicMedicines = await HomeService.getNewestMedicine();
      if (!basicMedicines || basicMedicines.length === 0) {
        newestMedicines.value = [];
        return;
      }
      
      const comprehensiveList = await Promise.all(
        basicMedicines.map(medicine => getComprehensiveMedicineData(medicine))
      );
      
      newestMedicines.value = comprehensiveList;
    } catch (err: any) {
      error.value = err.message || 'Đã xảy ra lỗi khi tải danh sách sản phẩm mới nhất';
      console.error('Error in fetchNewestMedicines:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // Return public API
  return {
    // State
    bestSellingMedicines,
    newestMedicines,
    isLoading,
    error,
    slidesToShow,
    
    // Computed
    hasBestSellingMedicines,
    hasNewestMedicines,
    
    // Methods
    fetchBestSellingMedicines,
    fetchNewestMedicines,
  };
});