import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { medicineService } from '@user/services/MedicineService';
import { Medicine } from '@models/Medicine';
import { MedicineCategory } from '@models/MedicineCategory';
import { Attribute } from '@models/Attribute';
import { Discount } from '@models/Discount';
import { Review } from '@models/Review';

export interface ComprehensiveMedicine {
  medicine: Medicine;
  discount: Discount[];
  reviews: Review[];
}

export interface NormalizedMedicine {
  id: number;
  name: string;
  mainImageUrl: string | null;
  categoryNames: string;
  brandName: string;
  originalPrice: number;
  discountedPrice: number;
  hasDiscount: boolean;
  outOfStock: boolean;
  popularity?: number;
  categories: MedicineCategory[];
  attributes: Attribute[];
  description: string;
  discount: Discount[];
  reviews: Review[];
}

export const useMedicineStore = defineStore('medicine', () => {
  const comprehensiveMedicines = ref<ComprehensiveMedicine[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedMedicineId = ref<number | null>(null);

  const selectedMedicine = computed(() => {
    if (!selectedMedicineId.value) return null;
    return comprehensiveMedicines.value.find(m => m.medicine.id === selectedMedicineId.value) || null;
  });

  const normalizedMedicines = computed(() => {
    return comprehensiveMedicines.value.map(normalizeMedicine);
  });
  
  const selectedNormalizedMedicine = computed(() => {
    if (!selectedMedicine.value) return null;
    return normalizeMedicine(selectedMedicine.value);
  });

  function normalizeMedicine(item: ComprehensiveMedicine): NormalizedMedicine {
    const medicine = item.medicine;

    const attribute = medicine.attributes && medicine.attributes.length > 0 
      ? medicine.attributes[0] 
      : null;

    const discountInfo = item.discount && item.discount.length > 0 
      ? item.discount[0] 
      : null;

    const medias = medicine.medias || [];
    const mainImage = medias.find(m => m.mainImage === true);
    const imageUrl = mainImage?.mediaUrl || (medias.length > 0 ? medias[0].mediaUrl : null);
    const originalPrice = attribute?.priceOut || 0;
    const discountPercentage = discountInfo?.discountPercentage || 0;
    const discountedPrice = originalPrice * (1 - discountPercentage / 100);
    const quantity = attribute?.stock || 0;
    const categories = medicine.categories || [];
    const categoryNames = categories.map(c => c.name).join(', ');
    const brandName = medicine.brand?.name || '';
      
    return {
      id: medicine.id || 0,
      name: medicine.name || 'Sản phẩm không tên',
      mainImageUrl: imageUrl,
      categoryNames,
      brandName,
      originalPrice,
      discountedPrice,
      hasDiscount: discountPercentage > 0,
      outOfStock: quantity <= 0,
      categories,
      attributes: medicine.attributes || [],
      description: medicine.description || '',
      discount: item.discount || [],
      reviews: item.reviews || []
    };
  }

  /**
   * Lấy danh sách thuốc đầy đủ
   */
  async function fetchComprehensiveMedicineList() {
    loading.value = true;
    error.value = null;
    comprehensiveMedicines.value = [];

    try {
      const medicines = await medicineService.getAllMedicines();

      if (!medicines || medicines.length === 0) {
        console.log('Không tìm thấy thuốc');
        return [];
      }
      
      // Lấy thông tin chi tiết cho tất cả thuốc một cách song song
      const comprehensiveList = await Promise.all(
        medicines.map(medicine => getComprehensiveMedicineData(medicine))
      );
      
      comprehensiveMedicines.value = comprehensiveList;
      return comprehensiveList;
    } catch (err) {
      error.value = 'Không thể tải danh sách thuốc';
      console.error(error.value, err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Lấy thông tin chi tiết của một loại thuốc theo ID
   */
  async function fetchComprehensiveMedicineById(medicineId: number): Promise<ComprehensiveMedicine | null> {
    loading.value = true;
    error.value = null;
    selectedMedicineId.value = medicineId;

    try {
      // Kiểm tra nếu đã có trong store
      const existingMedicine = comprehensiveMedicines.value.find(item => item.medicine.id === medicineId);
      
      if (existingMedicine) {
        return existingMedicine;
      }
      
      const medicine = await medicineService.getMedicineById(medicineId);

      if (!medicine) {
        error.value = `Không tìm thấy thuốc với ID ${medicineId}`;
        return null;
      }
      
      const comprehensiveMedicine = await getComprehensiveMedicineData(medicine);
      
      // Cập nhật state - thêm mới hoặc cập nhật nếu đã tồn tại
      const index = comprehensiveMedicines.value.findIndex(item => item.medicine.id === medicineId);
      
      if (index >= 0) {
        comprehensiveMedicines.value[index] = comprehensiveMedicine;
      } else {
        comprehensiveMedicines.value.push(comprehensiveMedicine);
      }
      
      return comprehensiveMedicine;
    } catch (err) {
      error.value = `Không thể tải thông tin thuốc`;
      console.error(error.value, err);
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Lấy dữ liệu đầy đủ cho một loại thuốc (dùng nội bộ)
   */
  async function getComprehensiveMedicineData(medicine: Medicine): Promise<ComprehensiveMedicine> {
    try {
      // Lấy song song discount và review để tối ưu hiệu suất
      const [discount, reviews] = await Promise.all([
        medicineService.getDiscountsByMedicineId(medicine.id ?? 0),
        medicineService.getReviewMedicineById(medicine.id ?? 0)
      ]);
      
      return {
        medicine,
        discount: discount || [],
        reviews: reviews || [],
      };
    } catch (error) {
      console.error(`Lỗi khi lấy dữ liệu chi tiết cho thuốc ${medicine.id}:`, error);
      return {
        medicine,
        discount: [],
        reviews: [],
      };
    }
  }

  /**
   * Lọc theo danh mục
   */
  function filterByCategory(categoryId: string | number) {
    return normalizedMedicines.value.filter(med => {
      return med.categories.some(category => 
        category.id.toString() === categoryId.toString()
      );
    });
  }

  /**
   * Tìm kiếm thuốc theo tên
   */
  function searchByName(term: string) {
    if (!term.trim()) return normalizedMedicines.value;
    
    const searchTerm = term.toLowerCase().trim();
    return normalizedMedicines.value.filter(med => 
      med.name.toLowerCase().includes(searchTerm)
    );
  }

  return {
    // State
    comprehensiveMedicines,
    loading,
    error,
    selectedMedicineId,
    
    // Getters
    selectedMedicine,
    normalizedMedicines,
    selectedNormalizedMedicine,
    
    // Actions
    fetchComprehensiveMedicineList,
    fetchComprehensiveMedicineById,
    filterByCategory,
    searchByName
  };
});