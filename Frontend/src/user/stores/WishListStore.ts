import Cookies from 'js-cookie';
import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { useAuthStore } from './auth/useAuthStore';

interface WishlistItem {
    patientId?: number | null;
    name: string;
    medicineId: number;
    brandName?: string;
    price: number;
    imageUrl: string;
    attributeId: number;
    rawData?: any;
}

interface WishlistMap {
    [key: string]: WishlistItem;
}

interface UserWishlist {
    userId: number | null;
    items: WishlistMap;
}

const WISHLIST_COOKIE_NAME = 'user_wishlist';
const COOKIE_EXPIRES_DAYS = 30;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 giờ

export const useWishlistStore = defineStore('wishlist', () => {
    const userWishlist = ref<UserWishlist>({
        userId: null,
        items: {}
    });
    
    const isLoading = ref<boolean>(false);
    
    // Cache cho dữ liệu wishlist từ API
    const wishlistDataCache = ref<{
        data: any;
        expiry: number;
    } | null>(null);
    
    const wishlistItems = computed(() => {
        return Object.entries(userWishlist.value.items).map(([key, item]) => {
            return {
                key,
                ...item
            };
        });
    });
    
    // Xóa wishlist và xóa cookie
    const clearWishlistAndRemoveCookie = async (): Promise<void> => {
        // Xóa dữ liệu từ cache và cookie
        userWishlist.value.items = {};
        wishlistDataCache.value = null;

        if (userWishlist.value.userId !== null) {
            const cookieName = `${WISHLIST_COOKIE_NAME}_${userWishlist.value.userId}`;
            Cookies.remove(cookieName);
        }
    };
    
    // Lưu wishlist vào cookie
    const saveWishlistToCookie = (userId: number | null, items: WishlistMap) => {
        if (userId === null) return;
        
        const cookieName = `${WISHLIST_COOKIE_NAME}_${userId}`;
        const wishlistData = {
            items: items,
            timestamp: Date.now()
        };
        
        try {
            Cookies.set(cookieName, JSON.stringify(wishlistData), {
                expires: COOKIE_EXPIRES_DAYS,
                sameSite: 'Lax'
            });
        } catch (error) {
            console.error('Lỗi khi lưu wishlist vào cookie:', error);
            
            // Nếu kích thước quá lớn, thử lưu chỉ dữ liệu cần thiết
            try {
                const minimalItems = Object.entries(items).reduce((acc, [key, item]) => {
                    acc[key] = {
                        medicineId: item.medicineId,
                        attributeId: item.attributeId,
                        name: item.name
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
                console.error('Không thể lưu wishlist vào cookie:', fallbackError);
            }
        }
    };

    // Tải wishlist từ cookie
    const loadWishlistFromCookie = (userId: number) => {
        isLoading.value = true;
        try {
            const cookieName = `${WISHLIST_COOKIE_NAME}_${userId}`;
            const savedWishlist = Cookies.get(cookieName);
            
            if (savedWishlist) {
                const parsedWishlist = JSON.parse(savedWishlist);
                userWishlist.value.items = parsedWishlist.items || {};
            } else {
                userWishlist.value.items = {};
            }
        } catch (error) {
            console.error(`Lỗi khi đọc wishlist của user ${userId} từ cookie:`, error);
            const cookieName = `${WISHLIST_COOKIE_NAME}_${userId}`;
            Cookies.remove(cookieName);
            userWishlist.value.items = {};
        } finally {
            isLoading.value = false;
        }
    };

    // Đồng bộ hóa wishlist giữa cookie và server
    const syncWishlistWithServer = async (userId: number) => {
        if (!userId) return;

        isLoading.value = true;
        try {
            // Kiểm tra cache
            const now = Date.now();
            if (wishlistDataCache.value && wishlistDataCache.value.expiry > now) {
                // Sử dụng dữ liệu từ cache nếu còn hạn
                mergeServerWishlistWithLocalWishlist(wishlistDataCache.value.data);
                return;
            }

            // Giả lập lấy dữ liệu wishlist từ server (bạn sẽ thay thế bằng API thực tế)
            const serverWishlist = await fetchUserWishlistFromServer(userId);

            // Lưu vào cache
            wishlistDataCache.value = {
                data: serverWishlist,
                expiry: now + CACHE_EXPIRY
            };

            // Kết hợp dữ liệu từ server với dữ liệu local
            mergeServerWishlistWithLocalWishlist(serverWishlist);
        } catch (error) {
            console.error('Lỗi khi đồng bộ hóa wishlist với server:', error);
            // Nếu có lỗi, sử dụng dữ liệu từ cookie
            loadWishlistFromCookie(userId);
        } finally {
            isLoading.value = false;
        }
    };

    // Hàm giả lập để lấy wishlist từ server (bạn sẽ thay thế bằng API thực tế)
    const fetchUserWishlistFromServer = async (userId: number): Promise<any> => {
        // TODO: Implement actual API call to fetch user wishlist
        return {
            userId,
            items: []
        };
    };

    // Kết hợp dữ liệu wishlist từ server với dữ liệu local
    const mergeServerWishlistWithLocalWishlist = (serverWishlistData) => {
        if (!serverWishlistData || !serverWishlistData.items) return;

        const localItems = { ...userWishlist.value.items };
        const mergedItems = {};

        // Kết hợp các item từ server
        serverWishlistData.items.forEach(item => {
            const wishlistKey = `${item.medicineId}_${item.attributeId}`;

            mergedItems[wishlistKey] = {
                medicineId: item.medicineId,
                attributeId: item.attributeId,
                name: item.medicine?.name || item.name,
                price: item.price,
                imageUrl: item.imageUrl || getImageUrl(item.medicine),
                brandName: item.medicine?.brand?.name || item.brandName,
                patientId: item.patientId,
                rawData: item.medicine
            };
        });

        // Kết hợp với các item từ local (ưu tiên local nếu trùng)
        Object.keys(localItems).forEach(key => {
            if (!mergedItems[key]) {
                mergedItems[key] = localItems[key];
            }
        });

        // Cập nhật wishlist
        userWishlist.value.items = mergedItems;
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

        return '/assets/images/product-placeholder.jpg';
    };

    // Thiết lập userId và tải wishlist tương ứng
    const setUserId = async (userId: number | null) => {
        // Lưu wishlist hiện tại trước khi chuyển đổi user (nếu có)
        if (userWishlist.value.userId !== null && Object.keys(userWishlist.value.items).length > 0) {
            saveWishlistToCookie(userWishlist.value.userId, userWishlist.value.items);

            // Đồng bộ với server nếu có kết nối
            try {
                await syncWishlistToServer(userWishlist.value.userId, userWishlist.value.items);
            } catch (error) {
                console.error('Lỗi khi đồng bộ wishlist lên server:', error);
            }
        }

        // Cập nhật userId mới
        userWishlist.value.userId = userId;

        // Tải wishlist của userId mới (nếu có)
        if (userId !== null) {
            await syncWishlistWithServer(userId);
        } else {
            // Nếu không có userId, xóa wishlist
            userWishlist.value.items = {};
            wishlistDataCache.value = null;
        }
    };

    // Đồng bộ wishlist từ local lên server
    const syncWishlistToServer = async (userId: number, items: WishlistMap) => {
        if (!userId) return;

        try {
            const wishlistItems = Object.entries(items).map(([key, item]) => ({
                medicineId: item.medicineId,
                attributeId: item.attributeId,
                patientId: item.patientId
            }));
            
            // TODO: Implement actual API call to sync wishlist to server
            // await apiService.syncWishlist(userId, wishlistItems);
            
            console.log('Đồng bộ wishlist lên server:', wishlistItems);
        } catch (error) {
            console.error('Lỗi khi đồng bộ wishlist lên server:', error);
            throw error;
        }
    };

    // Đồng bộ với AuthStore
    const syncWithAuthStore = async () => {
        const authStore = useAuthStore();

        if (authStore.isAuthenticated && authStore.user?.id) {
            if (userWishlist.value.userId !== authStore.user.id) {
                await setUserId(authStore.user.id);
            }
        } else {
            await setUserId(null);
        }
    };

    // Khởi tạo wishlist
    const initializeWishlist = async () => {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated && authStore.user?.id) {
            await setUserId(authStore.user.id);
        } else {
            await setUserId(null);
        }
    };

    // Theo dõi thay đổi của items để lưu vào cookie và đồng bộ với server
    watch(() => userWishlist.value.items, async (newItems) => {
        if (userWishlist.value.userId !== null) {
            saveWishlistToCookie(userWishlist.value.userId, newItems);

            // Đồng bộ với server nếu đã đăng nhập
            try {
                await syncWishlistToServer(userWishlist.value.userId, newItems);
            } catch (error) {
                console.error('Lỗi khi đồng bộ wishlist lên server:', error);
            }
        }
    }, { deep: true });

    // Thêm sản phẩm vào wishlist
    const addToWishlist = async (medicine: any, patientId?: number): Promise<boolean> => {
        try {
            
            if (userWishlist.value.userId === null) {
                console.error('Không thể thêm vào wishlist: Chưa đăng nhập');
                return false;
            }
            const medicineId = medicine.id;
            const attributeId = medicine.attributes[0].id;
            const wishlistKey = `${medicineId}_${attributeId}`;

            if (userWishlist.value.items[wishlistKey]) {
                console.log("Sản phẩm đã có trong wishlist");
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

            // Tạo item mới
            userWishlist.value.items[wishlistKey] = {
                medicineId,
                patientId: patientId || null,
                name: medicine.name,
                price: medicine.attributes[0].priceOut,
                imageUrl: mainImageUrl,
                brandName: medicine.brand.name,
                attributeId: medicine.attributes[0].id,
                rawData: medicine
            };

            console.log('Chi tiết wishlist sau khi thêm:', userWishlist.value);
            return true;
        } catch (error) {
            console.error('Lỗi khi thêm vào wishlist:', error);
            return false;
        }
    };

    // Xóa sản phẩm khỏi wishlist
    const removeFromWishlist = async (medicineId: number, attributeId: number): Promise<boolean> => {
        try {
            if (userWishlist.value.userId === null) {
                console.error('Không thể xóa khỏi wishlist: Chưa đăng nhập');
                return false;
            }

            const wishlistKey = `${medicineId}_${attributeId}`;

            if (userWishlist.value.items[wishlistKey]) {
                delete userWishlist.value.items[wishlistKey];
                return true;
            }

            return false;
        } catch (error) {
            console.error('Lỗi khi xóa khỏi wishlist:', error);
            return false;
        }
    };

    // Kiểm tra sản phẩm có trong wishlist không
    const isInWishlist = (medicineId: number, attributeId?: number): boolean => {
        if (userWishlist.value.userId === null) return false;
        
        // Nếu không cung cấp attributeId, kiểm tra bất kỳ item nào có medicineId
        if (attributeId === undefined) {
            return Object.keys(userWishlist.value.items).some(key => 
                key.startsWith(`${medicineId}_`)
            );
        }
        
        const wishlistKey = `${medicineId}_${attributeId}`;
        return !!userWishlist.value.items[wishlistKey];
    };

    // Lấy tổng số sản phẩm trong wishlist
    const getWishlistCount = (): number => {
        return Object.keys(userWishlist.value.items).length;
    };

    return {
        userWishlist,
        wishlistItems,
        isLoading,
        setUserId,
        initializeWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlistAndRemoveCookie,
        getWishlistCount,
        syncWithAuthStore,
        syncWishlistWithServer
    };
});