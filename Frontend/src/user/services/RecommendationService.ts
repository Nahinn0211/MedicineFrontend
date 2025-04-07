// services/RecommendationService.ts
import { Medicine } from '@models/Medicine';
import { NormalizedMedicine } from '@user/stores/MedicineStore';

interface PatientHistory {
  userId: number;
  purchases: {
    medicineId: number;
    count: number;
    timestamp: number;
  }[];
  views: {
    medicineId: number;
    duration: number;
    timestamp: number;
  }[];
  wishlist: number[];
  searches: string[];
}

interface SymptomRecommendation {
  products: NormalizedMedicine[];
  explanation: string;
}

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class RecommendationService {
  private userSimMatrix: Map<number, Map<number, number>> = new Map(); // userId -> otherUserId -> similarity
  private itemSimMatrix: Map<number, Map<number, number>> = new Map(); // itemId -> otherItemId -> similarity
  private userHistoryCache: Map<number, CacheItem<PatientHistory>> = new Map();
  private trendingProductsCache: CacheItem<NormalizedMedicine[]> | null = null;
  private symptomProductsCache: Map<string, CacheItem<SymptomRecommendation>> = new Map();
  
  // Thời gian cache mặc định (1 giờ)
  private readonly DEFAULT_CACHE_DURATION = 3600000;
  
  // Phương pháp Collaborative Filtering - User-based
  private calculateUserSimilarity(userId1: number, userId2: number): number {
    const user1History = this.getUserHistoryFromCache(userId1);
    const user2History = this.getUserHistoryFromCache(userId2);
    
    if (!user1History || !user2History) return 0;
    
    // Tập hợp các sản phẩm đã mua của cả hai người dùng
    const user1Items = new Set(user1History.purchases.map(p => p.medicineId));
    const user2Items = new Set(user2History.purchases.map(p => p.medicineId));
    
    // Đếm số sản phẩm chung
    let commonItems = 0;
    Array.from(user1Items).forEach(itemId => {
      if (user2Items.has(itemId)) {
        commonItems++;
      }
    });
    
    // Tính độ tương đồng cosine đơn giản
    const similarity = commonItems / Math.sqrt(user1Items.size * user2Items.size);
    return similarity || 0;
  }
  
  // Phương pháp Collaborative Filtering - Item-based
  private calculateItemSimilarity(itemId1: number, itemId2: number, medicines: NormalizedMedicine[]): number {
    // Kiểm tra xem đã có trong cache chưa
    const item1Cache = this.itemSimMatrix.get(itemId1);
    if (item1Cache && item1Cache.has(itemId2)) {
      return item1Cache.get(itemId2) || 0;
    }
    
    // Tìm các medicine từ ID
    const item1 = medicines.find(m => m.id === itemId1);
    const item2 = medicines.find(m => m.id === itemId2);
    
    if (!item1 || !item2) return 0;
    
    // Tính độ tương đồng dựa trên danh mục và thương hiệu
    let similarity = 0;
    
    // Nếu cùng thương hiệu, tăng độ tương đồng
    if (item1.brandName === item2.brandName) {
      similarity += 0.5;
    }
    
    // Kiểm tra số lượng danh mục trùng nhau
    const categories1 = new Set(item1.categories.map(c => c.id));
    const categories2 = new Set(item2.categories.map(c => c.id));
    
    let commonCategories = 0;
    Array.from(categories1).forEach(catId => {
      if (categories2.has(catId)) {
        commonCategories++;
      }
    });
    
    // Thêm độ tương đồng dựa trên danh mục
    if (categories1.size > 0 && categories2.size > 0) {
      similarity += 0.5 * (commonCategories / Math.max(categories1.size, categories2.size));
    }
    
    // Lưu kết quả vào cache
    if (!this.itemSimMatrix.has(itemId1)) {
      this.itemSimMatrix.set(itemId1, new Map());
    }
    this.itemSimMatrix.get(itemId1)?.set(itemId2, similarity);
    
    // Đảm bảo cache đối xứng
    if (!this.itemSimMatrix.has(itemId2)) {
      this.itemSimMatrix.set(itemId2, new Map());
    }
    this.itemSimMatrix.get(itemId2)?.set(itemId1, similarity);
    
    return similarity;
  }
  
  // Phương pháp ContentBased (thay thế cho Matrix Factorization)
  private getContentBasedRecommendations(userId: number, allMedicines: NormalizedMedicine[]): number[] {
    const userHistory = this.getUserHistoryFromCache(userId);
    
    if (!userHistory || userHistory.purchases.length === 0) {
      return allMedicines
        .map(m => m.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
    }
    
    const purchasedIds = new Set(userHistory.purchases.map(p => p.medicineId));
    const purchasedItems = allMedicines.filter(m => purchasedIds.has(m.id));
    
    const purchasedCategories = new Set<number>();
    purchasedItems.forEach(item => {
      item.categories.forEach(cat => purchasedCategories.add(cat.id));
    });
    
    // Tính điểm cho từng sản phẩm dựa trên sự tương đồng về danh mục
    const scoredItems = allMedicines
      .filter(m => !purchasedIds.has(m.id)) // Loại bỏ các sản phẩm đã mua
      .map(medicine => {
        // Đếm số danh mục trùng khớp
        const matchedCategories = medicine.categories.filter(
          cat => purchasedCategories.has(cat.id)
        ).length;
        
        // Tính điểm dựa trên tỷ lệ danh mục trùng khớp
        const categoryScore = matchedCategories / medicine.categories.length;
        
        // Xem xét thêm các lượt xem gần đây
        const viewBonus = userHistory.views.some(v => v.medicineId === medicine.id) ? 0.2 : 0;
        
        // Xem xét thêm wishlist
        const wishlistBonus = userHistory.wishlist.includes(medicine.id) ? 0.3 : 0;
        
        // Tính điểm tổng
        const score = categoryScore + viewBonus + wishlistBonus;
        
        return { id: medicine.id, score };
      })
      .sort((a, b) => b.score - a.score) // Sắp xếp theo điểm giảm dần
      .map(item => item.id);
    
    return scoredItems;
  }
  
  // Phương thức lấy lịch sử người dùng từ cache
  private getUserHistoryFromCache(userId: number): PatientHistory | null {
    const cachedItem = this.userHistoryCache.get(userId);
    if (cachedItem && cachedItem.expiry > Date.now()) {
      return cachedItem.data;
    }
    return null;
  }
  
  // Thu thập dữ liệu lịch sử người dùng từ các hành động thực tế
  public trackUserActivity(
    userId: number,
    activityType: 'purchase' | 'view' | 'wishlist' | 'search',
    data: any
  ): void {
    try {
      // Lấy lịch sử hiện tại từ cache hoặc tạo mới
      let userHistory = this.getUserHistoryFromCache(userId);
      
      if (!userHistory) {
        userHistory = {
          userId,
          purchases: [],
          views: [],
          wishlist: [],
          searches: []
        };
      }
      
      // Cập nhật lịch sử tương ứng với loại hoạt động
      switch (activityType) {
        case 'purchase':
          userHistory.purchases.push({
            medicineId: data.medicineId,
            count: data.count || 1,
            timestamp: Date.now()
          });
          break;
        case 'view':
          userHistory.views.push({
            medicineId: data.medicineId,
            duration: data.duration || 0,
            timestamp: Date.now()
          });
          break;
        case 'wishlist':
          if (!userHistory.wishlist.includes(data.medicineId)) {
            userHistory.wishlist.push(data.medicineId);
          }
          break;
        case 'search':
          userHistory.searches.push(data.query);
          break;
      }
      
      // Giới hạn kích thước của mảng để tránh dữ liệu quá lớn
      if (userHistory.purchases.length > 50) {
        userHistory.purchases = userHistory.purchases.slice(-50);
      }
      if (userHistory.views.length > 100) {
        userHistory.views = userHistory.views.slice(-100);
      }
      if (userHistory.searches.length > 30) {
        userHistory.searches = userHistory.searches.slice(-30);
      }
      
      // Lưu vào cache với thời hạn 24 giờ
      this.userHistoryCache.set(userId, {
        data: userHistory,
        expiry: Date.now() + 24 * 60 * 60 * 1000
      });
      
      // Lưu vào localStorage để giữ giữa các phiên
      try {
        const storageKey = `user_history_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(userHistory));
      } catch (e) {
        console.error('Không thể lưu vào localStorage:', e);
      }
      
    } catch (error) {
      console.error('Lỗi khi theo dõi hoạt động người dùng:', error);
    }
  }
  
  // Tải lịch sử người dùng từ localStorage khi khởi động
  public async loadUserHistoryFromStorage(userId: number): Promise<boolean> {
    try {
      const storageKey = `user_history_${userId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const userHistory = JSON.parse(storedData) as PatientHistory;
        this.userHistoryCache.set(userId, {
          data: userHistory,
          expiry: Date.now() + 24 * 60 * 60 * 1000
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Lỗi khi đọc lịch sử từ localStorage:', error);
      return false;
    }
  }
  
  // Lấy gợi ý cá nhân hóa cho người dùng
  public async getPersonalizedRecommendations(
    userId: number,
    medicines: NormalizedMedicine[],
    limit: number = 10
  ): Promise<NormalizedMedicine[]> {
    try {
      if (!userId || medicines.length === 0) {
        return [];
      }
      
      // 1. Kiểm tra xem người dùng có lịch sử không
      const userHistory = this.getUserHistoryFromCache(userId);
      
      // Nếu không có lịch sử trong cache, thử tải từ localStorage
      if (!userHistory) {
        const hasHistory = await this.loadUserHistoryFromStorage(userId);
        // Nếu vẫn không có lịch sử, trả về sản phẩm phổ biến
        if (!hasHistory) {
          return await this.getTrendingProducts(medicines, limit);
        }
      }
      
      // 2. Áp dụng phương pháp Content-Based
      const recommendedItemIds = this.getContentBasedRecommendations(userId, medicines);
      
      // 3. Chuyển ID thành sản phẩm đầy đủ
      const recommendedItems = recommendedItemIds
        .map(id => medicines.find(m => m.id === id))
        .filter(Boolean) as NormalizedMedicine[];
      
      // 4. Giới hạn số lượng sản phẩm trả về
      return recommendedItems.slice(0, limit);
      
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý cá nhân hóa:', error);
      return [];
    }
  }
  
  // Lấy sản phẩm xu hướng (dựa trên đánh giá và số lượng mua)
  public async getTrendingProducts(
    medicines: NormalizedMedicine[],
    limit: number = 10
  ): Promise<NormalizedMedicine[]> {
    try {
      // Kiểm tra bộ nhớ đệm
      if (
        this.trendingProductsCache &&
        this.trendingProductsCache.expiry > Date.now() &&
        this.trendingProductsCache.data.length > 0
      ) {
        return this.trendingProductsCache.data.slice(0, limit);
      }
      
      // Sắp xếp theo số lượng đánh giá và độ phổ biến
      const trendingItems = [...medicines].sort((a, b) => {
        // Trọng số cho các yếu tố khác nhau
        const aReviews = (a.reviews?.length || 0) * 2; // Trọng số cao cho đánh giá
        const bReviews = (b.reviews?.length || 0) * 2;
        
        const aPopularity = a.popularity || 0;
        const bPopularity = b.popularity || 0;
        
        // Kết hợp các yếu tố với trọng số
        const aScore = aReviews + aPopularity;
        const bScore = bReviews + bPopularity;
        
        return bScore - aScore;
      });
      
      // Lưu vào bộ nhớ đệm
      this.trendingProductsCache = {
        data: trendingItems,
        expiry: Date.now() + this.DEFAULT_CACHE_DURATION
      };
      
      return trendingItems.slice(0, limit);
      
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm xu hướng:', error);
      return [];
    }
  }
  
  // Lấy gợi ý dựa trên triệu chứng (sử dụng NLP đơn giản)
  public async getRecommendationsBySymptom(
    symptomDescription: string,
    medicines: NormalizedMedicine[],
    limit: number = 8
  ): Promise<SymptomRecommendation> {
    try {
      // Tạo chuỗi symptomDescription chuẩn hóa để dùng làm key cache
      const normalizedSymptom = symptomDescription.toLowerCase().trim();
      
      // Kiểm tra cache
      const cachedResult = this.symptomProductsCache.get(normalizedSymptom);
      if (cachedResult && cachedResult.expiry > Date.now()) {
        return cachedResult.data;
      }
      
      // Từ khóa triệu chứng phổ biến (trong thực tế, sẽ dùng mô hình NLP)
      const symptomKeywords: Record<string, string[]> = {
        'đau đầu': ['nhức đầu', 'migraine', 'đau nửa đầu', 'đau trán'],
        'đau bụng': ['đau dạ dày', 'đau ruột', 'khó tiêu', 'trướng bụng'],
        'ho': ['ho khan', 'ho có đờm', 'đau họng', 'ho nhiều'],
        'sốt': ['nóng', 'nhiệt độ cao', 'cảm', 'cúm'],
        'tiêu chảy': ['đi ngoài', 'phân lỏng', 'đau bụng', 'rối loạn tiêu hóa'],
        'mệt mỏi': ['uể oải', 'không có năng lượng', 'yếu', 'mệt'],
        'dị ứng': ['ngứa', 'nổi mẩn', 'phát ban', 'khó thở'],
        'mất ngủ': ['khó ngủ', 'mất ngủ', 'thức giấc', 'trằn trọc']
      };
      
      // Tìm các từ khóa phù hợp trong mô tả triệu chứng
      const matchedKeywords: string[] = [];
      
      Object.entries(symptomKeywords).forEach(([symptom, keywords]) => {
        keywords.forEach(keyword => {
          if (normalizedSymptom.includes(keyword.toLowerCase())) {
            if (!matchedKeywords.includes(symptom)) {
              matchedKeywords.push(symptom);
            }
          }
        });
        
        if (normalizedSymptom.includes(symptom.toLowerCase())) {
          if (!matchedKeywords.includes(symptom)) {
            matchedKeywords.push(symptom);
          }
        }
      });
      
      // Nếu không tìm thấy từ khóa nào, trả về sản phẩm phổ biến
      if (matchedKeywords.length === 0) {
        const result = {
          products: await this.getTrendingProducts(medicines, limit),
          explanation: `Chúng tôi không nhận diện được triệu chứng cụ thể từ mô tả của bạn. Đây là một số sản phẩm phổ biến có thể giúp ích.`
        };
        
        // Cache kết quả với thời hạn ngắn hơn (1 giờ)
        this.symptomProductsCache.set(normalizedSymptom, {
          data: result,
          expiry: Date.now() + this.DEFAULT_CACHE_DURATION
        });
        
        return result;
      }
      
      // Tìm sản phẩm có tên hoặc mô tả chứa từ khóa triệu chứng
      const matchedProducts = medicines.filter(medicine => {
        const description = medicine.description?.toLowerCase() || '';
        const name = medicine.name.toLowerCase();
        
        return matchedKeywords.some(keyword => 
          description.includes(keyword.toLowerCase()) || 
          name.includes(keyword.toLowerCase())
        );
      });
      
      // Nếu có quá ít sản phẩm phù hợp, bổ sung thêm sản phẩm phổ biến
      let recommendedProducts = [...matchedProducts];
      
      if (recommendedProducts.length < limit) {
        const trendingProducts = await this.getTrendingProducts(medicines);
        const additionalProducts = trendingProducts.filter(
          product => !recommendedProducts.some(p => p.id === product.id)
        );
        
        recommendedProducts = [
          ...recommendedProducts,
          ...additionalProducts.slice(0, limit - recommendedProducts.length)
        ];
      }
      
      // Cắt số lượng sản phẩm theo giới hạn
      recommendedProducts = recommendedProducts.slice(0, limit);
      
      // Tạo phần giải thích
      const explanation = this.generateExplanation(matchedKeywords, recommendedProducts);
      
      const result = {
        products: recommendedProducts,
        explanation
      };
      
      // Cache kết quả
      this.symptomProductsCache.set(normalizedSymptom, {
        data: result,
        expiry: Date.now() + this.DEFAULT_CACHE_DURATION
      });
      
      return result;
      
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý theo triệu chứng:', error);
      return { products: [], explanation: 'Đã xảy ra lỗi khi phân tích triệu chứng.' };
    }
  }
  
  // Tạo giải thích cho gợi ý theo triệu chứng
  private generateExplanation(keywords: string[], products: NormalizedMedicine[]): string {
    if (keywords.length === 0) {
      return 'Dựa trên mô tả của bạn, chúng tôi đề xuất các sản phẩm phổ biến sau.';
    }
    
    const keywordText = keywords.join(', ');
    
    const brandCounts: Record<string, number> = {};
    products.forEach(product => {
      if (product.brandName) {
        brandCounts[product.brandName] = (brandCounts[product.brandName] || 0) + 1;
      }
    });
    
    // Lấy thương hiệu xuất hiện nhiều nhất
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([brand]) => brand);
    
    let explanation = `Dựa trên triệu chứng "${keywordText}" của bạn, chúng tôi đã tìm thấy ${products.length} sản phẩm phù hợp`;
    
    if (topBrands.length > 0) {
      explanation += ` từ các thương hiệu uy tín như ${topBrands.join(' và ')}`;
    }
    
    explanation += '. Các sản phẩm này được thiết kế để giúp giảm các triệu chứng mà bạn đang gặp phải.';
    
    return explanation;
  }
  
  // Xóa cache để cập nhật dữ liệu
  public clearCache(): void {
    this.trendingProductsCache = null;
    this.symptomProductsCache.clear();
    // Giữ lại userHistoryCache vì đó là dữ liệu người dùng quan trọng
  }
}

// Xuất dưới dạng singleton để sử dụng trong toàn ứng dụng
export const recommendationService = new RecommendationService();