import Cookies from 'js-cookie';
import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { useAuthStore } from './auth/useAuthStore';
import { Voucher } from '@models/Voucher';
import { voucherService } from '@user/services/VoucherService';
import { recommendationService } from '@user/services/RecommendationService';

interface CartItem {
  patientId?: number | null;
  name: string;
  medicineId: number;
  price: number;
  imageUrl: string;
  quantity: number;
  brandName?: string;
  attributeId: number;
  rawData?: any;
}

// Kiểu dữ liệu cho giỏ hàng dạng map
interface CartMap {
  [key: string]: CartItem;
}

// Kiểu dữ liệu cho UserCart
interface UserCart {
  userId: number | null;
  items: CartMap;
  voucher: Voucher | null;
}

// Tên và thời hạn cookie
const CART_COOKIE_NAME = 'user_cart';
const COOKIE_EXPIRES_DAYS = 30;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 giờ

export const useCartStore = defineStore('cart', () => {
  // Khởi tạo giỏ hàng với cấu trúc dạng map
  const userCart = ref<UserCart>({
    userId: null,
    items: {},
    voucher: null,
  });

  const isLoading = ref<boolean>(false);
  const voucherError = ref<string | null>(null);
  const isApplyingVoucher = ref<boolean>(false);

  // Cache cho dữ liệu giỏ hàng từ API
  const cartDataCache = ref<{
    data: any;
    expiry: number;
  } | null>(null);

  // Xóa giỏ hàng và xóa cookie
  const clearCartAndRemoveCookie = async (): Promise<void> => {
    // Xóa dữ liệu từ cache và cookie
    userCart.value.items = {};
    userCart.value.voucher = null;
    voucherError.value = null;
    cartDataCache.value = null;

    if (userCart.value.userId !== null) {
      const cookieName = `${CART_COOKIE_NAME}_${userCart.value.userId}`;
      Cookies.remove(cookieName);
    }
  };

  // Tính toán giảm giá từ voucher
  const voucherDiscount = computed(() => {
    if (!userCart.value.voucher) return 0;

    const subtotal = Object.values(userCart.value.items).reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    if (userCart.value.voucher.voucherPercentage != null) {
      const discount = subtotal * (userCart.value.voucher.voucherPercentage / 100);
      if (userCart.value.voucher.minimumOrderValue && discount > userCart.value.voucher.minimumOrderValue) {
        return userCart.value.voucher.minimumOrderValue;
      }
      return discount;
    }

    return 0;
  });

  // Tính tổng giá sau khi giảm giá
  const totalAfterDiscount = computed(() => {
    const subtotal = Object.values(userCart.value.items).reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    return subtotal - voucherDiscount.value;
  });

  // Danh sách items dạng array để hiển thị
  const cartItems = computed(() => {
    return Object.entries(userCart.value.items).map(([key, item]) => {
      return {
        key,
        ...item
      };
    });
  });

  // Lưu giỏ hàng vào cookie
  const saveCartToCookie = (userId: number | null, items: CartMap) => {
    if (userId === null) return;

    const cookieName = `${CART_COOKIE_NAME}_${userId}`;
    const cartData = {
      items: items,
      voucher: userCart.value.voucher,
      timestamp: Date.now()
    };

    try {
      Cookies.set(cookieName, JSON.stringify(cartData), {
        expires: COOKIE_EXPIRES_DAYS,
        sameSite: 'Lax'
      });
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng vào cookie:', error);

      // Nếu kích thước quá lớn, thử lưu chỉ dữ liệu cần thiết
      try {
        const minimalItems = Object.entries(items).reduce((acc, [key, item]) => {
          acc[key] = {
            quantity: item.quantity,
            medicineId: item.medicineId,
            attributeId: item.attributeId
          };
          return acc;
        }, {});

        Cookies.set(cookieName, JSON.stringify({
          items: minimalItems,
          timestamp: Date.now()
        }), {
          expires: COOKIE_EXPIRES_DAYS,
          sameSite: 'Lax'
        });
      } catch (fallbackError) {
        console.error('Không thể lưu giỏ hàng vào cookie:', fallbackError);
      }
    }
  };

  // Tải giỏ hàng từ cookie
  const loadCartFromCookie = (userId: number) => {
    isLoading.value = true;
    try {
      const cookieName = `${CART_COOKIE_NAME}_${userId}`;
      const savedCart = Cookies.get(cookieName);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        userCart.value.items = parsedCart.items || {};
        userCart.value.voucher = parsedCart.voucher || null;
      } else {
        userCart.value.items = {};
        userCart.value.voucher = null;
      }
    } catch (error) {
      console.error(`Lỗi khi đọc giỏ hàng của user ${userId} từ cookie:`, error);
      const cookieName = `${CART_COOKIE_NAME}_${userId}`;
      Cookies.remove(cookieName);
      userCart.value.items = {};
      userCart.value.voucher = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Đồng bộ hóa giỏ hàng giữa cookie và server
  const syncCartWithServer = async (userId: number) => {
    if (!userId) return;

    isLoading.value = true;
    try {
      // Kiểm tra cache
      const now = Date.now();
      if (cartDataCache.value && cartDataCache.value.expiry > now) {
        // Sử dụng dữ liệu từ cache nếu còn hạn
        mergeServerCartWithLocalCart(cartDataCache.value.data);
        return;
      }

      // Giả lập lấy dữ liệu giỏ hàng từ server (bạn sẽ thay thế bằng API thực tế)
      const serverCart = await fetchUserCartFromServer(userId);

      // Lưu vào cache
      cartDataCache.value = {
        data: serverCart,
        expiry: now + CACHE_EXPIRY
      };

      // Kết hợp dữ liệu từ server với dữ liệu local
      mergeServerCartWithLocalCart(serverCart);
    } catch (error) {
      console.error('Lỗi khi đồng bộ hóa giỏ hàng với server:', error);
      // Nếu có lỗi, sử dụng dữ liệu từ cookie
      loadCartFromCookie(userId);
    } finally {
      isLoading.value = false;
    }
  };

  // Hàm giả lập để lấy giỏ hàng từ server (bạn sẽ thay thế bằng API thực tế)
  const fetchUserCartFromServer = async (userId: number): Promise<any> => {
    // TODO: Implement actual API call to fetch user cart
    return {
      userId,
      items: [],
      voucher: null
    };
  };

  // Kết hợp dữ liệu giỏ hàng từ server với dữ liệu local
  const mergeServerCartWithLocalCart = (serverCartData) => {
    if (!serverCartData || !serverCartData.items) return;

    const localItems = { ...userCart.value.items };
    const mergedItems = {};

    // Kết hợp các item từ server
    serverCartData.items.forEach(item => {
      const cartKey = `${item.medicineId}_${item.attributeId}`;

      mergedItems[cartKey] = {
        medicineId: item.medicineId,
        attributeId: item.attributeId,
        name: item.medicine?.name || item.name,
        price: item.price,
        imageUrl: item.imageUrl || getImageUrl(item.medicine),
        quantity: item.quantity,
        brandName: item.medicine?.brand?.name || item.brandName,
        patientId: item.patientId,
        rawData: item.medicine
      };
    });

    // Kết hợp với các item từ local (ưu tiên local nếu trùng)
    Object.keys(localItems).forEach(key => {
      if (!mergedItems[key]) {
        mergedItems[key] = localItems[key];
      } else {
        // Cập nhật số lượng nếu có sự khác biệt
        mergedItems[key].quantity = Math.max(mergedItems[key].quantity, localItems[key].quantity);
      }
    });

    // Cập nhật voucher
    if (serverCartData.voucher && !userCart.value.voucher) {
      userCart.value.voucher = serverCartData.voucher;
    }

    // Cập nhật giỏ hàng
    userCart.value.items = mergedItems;
  };

  // Hàm trích xuất URL hình ảnh từ dữ liệu thuốc
  const getImageUrl = (medicine) => {
    if (!medicine) return '';

    // Kiểm tra nhiều trường hợp để lấy URL hình ảnh
    if (medicine.media && medicine.media.length > 0) {
      const mainImage = medicine.media.find(img => img.mainImage === true);
      return mainImage ? mainImage.mediaUrl : medicine.media[0].mediaUrl;
    }

    // Thêm các trường hợp kiểm tra khác
    if (medicine.medias && medicine.medias.length > 0) {
      const mainImage = medicine.medias.find(img => img.mainImage === true);
      return mainImage ? mainImage.mediaUrl : medicine.medias[0].mediaUrl;
    }

    if (medicine.image) return medicine.image;
    if (medicine.imageUrl) return medicine.imageUrl;

    return '';
  };

  // Thiết lập userId và tải giỏ hàng tương ứng
  const setUserId = async (userId: number | null) => {
    // Lưu giỏ hàng hiện tại trước khi chuyển đổi user (nếu có)
    if (userCart.value.userId !== null && Object.keys(userCart.value.items).length > 0) {
      saveCartToCookie(userCart.value.userId, userCart.value.items);

      // Đồng bộ với server nếu có kết nối
      try {
        await syncCartToServer(userCart.value.userId, userCart.value.items);
      } catch (error) {
        console.error('Lỗi khi đồng bộ giỏ hàng lên server:', error);
      }
    }

    // Cập nhật userId mới
    userCart.value.userId = userId;

    // Tải giỏ hàng của userId mới (nếu có)
    if (userId !== null) {
      await syncCartWithServer(userId);
    } else {
      // Nếu không có userId, xóa giỏ hàng
      userCart.value.items = {};
      userCart.value.voucher = null;
      cartDataCache.value = null;
    }
  };

  // Đồng bộ giỏ hàng từ local lên server
  const syncCartToServer = async (userId: number, items: CartMap) => {
    if (!userId) return;

    try {
      const cartItems = Object.entries(items).map(([key, item]) => ({
        medicineId: item.medicineId,
        attributeId: item.attributeId,
        quantity: item.quantity,
        patientId: item.patientId
      }));
    } catch (error) {
      console.error('Lỗi khi đồng bộ giỏ hàng lên server:', error);
    }
  };
  // Áp dụng voucher
  const applyVoucher = async (voucherCode: string): Promise<{ success: boolean; message: string }> => {
    if (!userCart.value.userId) {
      return { success: false, message: 'Vui lòng đăng nhập để sử dụng voucher' };
    }

    try {
      voucherError.value = null;
      isApplyingVoucher.value = true;

      // Gọi API để kiểm tra voucher có hợp lệ không
      const voucher = await voucherService.getVoucherByCode(voucherCode);

      if (!voucher) {
        voucherError.value = 'Mã voucher không tồn tại';
        return { success: false, message: 'Mã voucher không tồn tại' };
      }

      // Kiểm tra các điều kiện của voucher
      const currentDate = new Date();
      const endDate = new Date(voucher.endDate);

      // Kiểm tra hạn sử dụng
      if (voucher.endDate && endDate < currentDate) {
        voucherError.value = 'Mã voucher đã hết hạn';
        return { success: false, message: 'Mã voucher đã hết hạn' };
      }

      // Kiểm tra số lượng
      if (voucher.stock == 0) {
        voucherError.value = 'Mã voucher đã hết lượt sử dụng';
        return { success: false, message: 'Mã voucher đã hết lượt sử dụng' };
      }

      // Lưu voucher vào giỏ hàng
      userCart.value.voucher = voucher;

      // Đồng bộ lên server
      if (userCart.value.userId) {
        try {
          await syncCartToServer(userCart.value.userId, userCart.value.items);
        } catch (error) {
          console.error('Lỗi khi đồng bộ voucher lên server:', error);
        }
      }

      return {
        success: true,
        message: `Đã áp dụng mã giảm giá ${voucher.code} thành công`
      };
    } catch (error) {
      console.error('Lỗi khi áp dụng voucher:', error);
      voucherError.value = 'Có lỗi xảy ra khi áp dụng mã giảm giá';
      return { success: false, message: 'Có lỗi xảy ra khi áp dụng mã giảm giá' };
    } finally {
      isApplyingVoucher.value = false;
    }
  };

  // Xóa voucher
  const removeVoucher = async (): Promise<void> => {
    userCart.value.voucher = null;
    voucherError.value = null;

    // Đồng bộ lên server
    if (userCart.value.userId) {
      try {
        await syncCartToServer(userCart.value.userId, userCart.value.items);
      } catch (error) {
        console.error('Lỗi khi xóa voucher trên server:', error);
      }
    }
  };

  // Đồng bộ với AuthStore
  const syncWithAuthStore = async () => {
    const authStore = useAuthStore();

    if (authStore.isAuthenticated && authStore.user?.id) {
      if (userCart.value.userId !== authStore.user.id) {
        await setUserId(authStore.user.id);
      }
    } else {
      await setUserId(null);
    }
  };

  // Khởi tạo giỏ hàng
  const initializeCart = async () => {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated && authStore.user?.id) {
      await setUserId(authStore.user.id);
    } else {
      await setUserId(null);
    }
  };

  // Theo dõi thay đổi của items để lưu vào cookie và đồng bộ với server
  watch(() => userCart.value.items, async (newItems) => {
    if (userCart.value.userId !== null) {
      saveCartToCookie(userCart.value.userId, newItems);

      // Đồng bộ với server nếu đã đăng nhập
      try {
        await syncCartToServer(userCart.value.userId, newItems);
      } catch (error) {
        console.error('Lỗi khi đồng bộ giỏ hàng lên server:', error);
      }
    }
  }, { deep: true });

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (medicine: any, quantity: number = 1, patientId?: number): Promise<boolean> => {
    try {
      console.log(medicine);
      if (userCart.value.userId === null) {
        console.error('Không thể thêm vào giỏ hàng: Chưa đăng nhập');
        return false;
      }

      // Kiểm tra tính hợp lệ của dữ liệu
      if (!medicine || !medicine.attributes || medicine.attributes.length === 0) {
        console.error('Dữ liệu thuốc không hợp lệ', medicine);
        return false;
      }

      // Tìm ảnh chính 
      let mainImageUrl = '';
      if (medicine.medias && medicine.medias.length > 0) {
        const mainImage = medicine.medias.find(media => media.mainImage);
        mainImageUrl = mainImage ? mainImage.mediaUrl : medicine.medias[0].mediaUrl;
      } else if (medicine.media && medicine.media.length > 0) {
        const mainImage = medicine.media.find(media => media.mainImage);
        mainImageUrl = mainImage ? mainImage.mediaUrl : medicine.media[0].mediaUrl;
      }

      // Fallback nếu không tìm thấy ảnh
      mainImageUrl = mainImageUrl || '/placeholder-medicine.png';

      const medicineId = medicine.id;
      const firstAttribute = medicine.attributes[0];
      const cartKey = `${medicineId}_${firstAttribute.id}`;

      // Nếu đã có trong giỏ hàng, tăng số lượng
      if (userCart.value.items[cartKey]) {
        userCart.value.items[cartKey].quantity += quantity;
      } else {
        // Tạo item mới
        userCart.value.items[cartKey] = {
          medicineId,
          patientId: patientId || null,
          name: medicine.name,
          price: firstAttribute.priceOut,
          imageUrl: mainImageUrl,
          quantity: quantity,
          brandName: medicine.brand?.name || 'Không rõ',
          attributeId: firstAttribute.id,
          rawData: medicine
        };
      }

      console.log('Chi tiết giỏ hàng sau khi thêm:', userCart.value);

      // Theo dõi hoạt động này cho hệ thống gợi ý
      if (userCart.value.userId) {
        recommendationService.trackUserActivity(
          userCart.value.userId,
          'purchase',
          {
            medicineId,
            count: quantity
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      return false;
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (medicineId: number, attributeId: number): Promise<boolean> => {
    try {
      if (userCart.value.userId === null) {
        console.error('Không thể xóa khỏi giỏ hàng: Chưa đăng nhập');
        return false;
      }

      const cartKey = `${medicineId}_${attributeId}`;

      if (userCart.value.items[cartKey]) {
        delete userCart.value.items[cartKey];
        return true;
      }

      return false;
    } catch (error) {
      console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
      return false;
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (medicineId: number, attributeId: number, newQuantity: number): Promise<boolean> => {
    try {
      if (userCart.value.userId === null) {
        console.error('Không thể cập nhật giỏ hàng: Chưa đăng nhập');
        return false;
      }

      const cartKey = `${medicineId}_${attributeId}`;

      if (userCart.value.items[cartKey]) {
        if (newQuantity > 0) {
          userCart.value.items[cartKey].quantity = newQuantity;
        } else {
          delete userCart.value.items[cartKey];
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      return false;
    }
  };

  // Kiểm tra sản phẩm có trong giỏ hàng không
  const isInCart = (medicineId: number, attributeId: number): boolean => {
    if (userCart.value.userId === null) return false;

    const cartKey = `${medicineId}_${attributeId}`;
    return !!userCart.value.items[cartKey];
  };

  // Lấy tổng số lượng sản phẩm trong giỏ hàng
  const getCartCount = (): number => {
    return Object.values(userCart.value.items).reduce((total, item) => total + item.quantity, 0);
  };

  // Lấy tổng giá trị giỏ hàng
  const getTotalPrice = (): number => {
    return Object.values(userCart.value.items).reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return {
    userCart,
    cartItems,
    isLoading,
    voucherError,
    isApplyingVoucher,
    voucherDiscount,
    totalAfterDiscount,
    setUserId,
    initializeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
    clearCartAndRemoveCookie,
    getCartCount,
    getTotalPrice,
    syncWithAuthStore,
    applyVoucher,
    removeVoucher,
    syncCartWithServer
  };
});