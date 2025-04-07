<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import FormDialog from '@admin/components/FormDialog.vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

// Services
import { Medicines } from '@admin/stores/admin/Medicines';
import { Brands } from '@admin/stores/admin/Brands';
import { MedicineMediaService } from '@admin/stores/admin/MedicineMedia';
import { MedicineCategoryService } from '@admin/stores/admin/MedicineCategory';
import { Categories } from '@admin/stores/admin/Categories';

const props = defineProps({
    modelValue: Boolean,
    data: {
        type: Object,
        default: () => ({
            id: 0,
            code: '',
            name: '',
            description: '',
            brandId: 0,
            origin: '',
            categoryIds: []
        })
    }
});

const emit = defineEmits(['update:modelValue', 'refreshList']);

const formVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const isSubmitting = ref(false);
const toast = useToast();

// Dropdown options
const brands = ref([]);
const categories = ref([]);

// Quản lý nhiều ảnh
const uploadedFiles = ref([]);
const uploadedFilePaths = ref([]);
const mainImageIndex = ref(0);
const fileUploadInput = ref(null);

// Trạng thái chỉnh sửa
const isEditMode = computed(() => props.data && props.data.id > 0);
watch(formVisible, (newValue) => {
    // Kiểm tra form được mở và có ID để chỉnh sửa
    if (newValue && props.data && props.data.id > 0) {
        // Reset các giá trị
        uploadedFiles.value = [];
        uploadedFilePaths.value = [];
        mainImageIndex.value = 0;

        loadMedicineDetails();
    }
});
onMounted(async () => {
    try {
        const [brandResponse, categoryResponse] = await Promise.all([Brands.getBrands(), Categories.getCategories()]);

        brands.value = brandResponse.data.map((brand) => ({
            label: brand.name,
            value: brand.id
        }));

        categories.value = categoryResponse.data.map((category) => ({
            label: category.name,
            value: category.id
        }));
    } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải dữ liệu',
            life: 3000
        });
    }
});

const loadMedicineDetails = async () => {
    try {
        // Lấy thông tin chi tiết thuốc
        const medicineDetailResponse = await Medicines.getMedicineById(props.data.id);

        // Lấy ảnh của thuốc
        const medicineMediaResponse = await MedicineMediaService.getMedicineMediaByMedicineId(props.data.id);

        // Lấy danh mục của thuốc
        const medicineCategoryResponse = await MedicineCategoryService.getMedicineCategories(props.data.id);

        // Xử lý thông tin thuốc
        if (medicineDetailResponse.data) {
            props.data.code = medicineDetailResponse.data.code;
            props.data.name = medicineDetailResponse.data.name;
            props.data.description = medicineDetailResponse.data.description || '';
            props.data.brandId = medicineDetailResponse.data.brandId;
            props.data.origin = medicineDetailResponse.data.origin || '';
        }

        // Xử lý danh mục
        // Lấy categoryId từ các bản ghi medicine_categories
        props.data.categoryIds = medicineCategoryResponse.data.map((category) => category.categoryId);

        // Xử lý ảnh
        const mediaFiles = medicineMediaResponse.data.map((media) => {
            const processedUrl = media.mediaUrl.startsWith('http') ? media.mediaUrl : `http://localhost:8080/uploads/medicines/${media.mediaUrl}`;

            return {
                id: media.id,
                url: processedUrl,
                isMain: media.mainImage
            };
        });

        // Reset các giá trị
        uploadedFiles.value = [];
        uploadedFilePaths.value = [];

        // Thêm các ảnh đã có
        mediaFiles.forEach((media, index) => {
            uploadedFilePaths.value.push(media.url);
            if (media.isMain) {
                mainImageIndex.value = index;
            }
        });

        // Log để kiểm tra
        console.log('Selected Category IDs:', props.data.categoryIds);
    } catch (error) {
        console.error('Error loading medicine details:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể tải chi tiết thuốc',
            life: 3000
        });
    }
};
const triggerFileUpload = () => {
    if (fileUploadInput.value) {
        fileUploadInput.value.click();
    }
};

const onFileSelect = (event) => {
    const files = event.target.files;
    Array.from(files).forEach((file) => {
        uploadedFiles.value.push(file);
        uploadedFilePaths.value.push(URL.createObjectURL(file));
    });
};

const removeImage = (index) => {
    uploadedFiles.value.splice(index, 1);
    uploadedFilePaths.value.splice(index, 1);

    // Điều chỉnh chỉ số ảnh chính nếu cần
    if (mainImageIndex.value >= uploadedFiles.value.length) {
        mainImageIndex.value = 0;
    }
};

const setMainImage = (index) => {
    mainImageIndex.value = index;
};



const saveAll = async () => {
    try {
        // Validate thông tin thuốc
        if (!props.data.code || !props.data.name || !props.data.brandId) {
            toast.add({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: 'Vui lòng nhập đầy đủ thông tin thuốc',
                life: 3000
            });
            return;
        }

        isSubmitting.value = true;

        // Bước 1: Lưu thông tin thuốc (giữ nguyên phần này)
        let medicineId;
        if (isEditMode.value) {
            try {
                const medicinePayload = {
                    id: props.data.id,
                    code: props.data.code,
                    name: props.data.name,
                    description: props.data.description || '',
                    brandId: props.data.brandId,
                    origin: props.data.origin || ''
                };

                medicineId = props.data.id;

                const medicineResponse = await Medicines.insertMedicine(medicinePayload);
                const savedMedicine = medicineResponse.data;
                medicineId = savedMedicine ? savedMedicine.id : props.data.id;

                console.log('Updated Medicine ID:', medicineId);
            } catch (updateError) {
                medicineId = props.data.id;
            }
        } else {
            const medicinePayload = {
                id: 0,
                code: props.data.code,
                name: props.data.name,
                description: props.data.description || '',
                brandId: props.data.brandId,
                origin: props.data.origin || ''
            };

            console.log('Sending CREATE payload:', medicinePayload);

            const medicineResponse = await Medicines.insertMedicine(medicinePayload);
            const savedMedicine = medicineResponse.data;
            medicineId = savedMedicine ? savedMedicine.id : null;

            console.log('Created Medicine ID:', medicineId);
        }

        // Bước 2: Xử lý ảnh
        if (isEditMode.value) {
            // Lấy danh sách ảnh hiện tại
            const currentImagesResponse = await MedicineMediaService.getMedicineMediaByMedicineId(medicineId);
            const currentImages = currentImagesResponse.data;
            
            // Theo dõi các ảnh đã tồn tại cần giữ lại và các ảnh cần xóa
            const existingImageUrls = currentImages.map(img => {
                return img.mediaUrl.startsWith('http') 
                    ? img.mediaUrl 
                    : `http://localhost:8080/uploads/medicines/${img.mediaUrl}`;
            });
            
            const keepImageIndices = [];
            
            // Xác định các ảnh cần giữ lại (là ảnh đã tồn tại trong hệ thống)
            uploadedFilePaths.value.forEach((path, index) => {
                if (path.startsWith('http')) {
                    const pathIndex = existingImageUrls.findIndex(url => url === path);
                    if (pathIndex !== -1) {
                        keepImageIndices.push({
                            pathIndex: index,
                            imageData: currentImages[pathIndex]
                        });
                    }
                }
            });
            
            // Xác định và xóa các ảnh không còn được sử dụng
            for (const img of currentImages) {
                const imgUrl = img.mediaUrl.startsWith('http') 
                    ? img.mediaUrl 
                    : `http://localhost:8080/uploads/medicines/${img.mediaUrl}`;
                
                const stillExists = uploadedFilePaths.value.some(path => path === imgUrl);
                
                if (!stillExists) {
                    console.log(`Deleting image ID: ${img.id}, URL: ${imgUrl}`);
                    await MedicineMediaService.deleteMedicineMedia(img.id);
                }
            }
            
            // Cập nhật trạng thái ảnh chính cho các ảnh giữ lại
            for (const item of keepImageIndices) {
                const isMain = item.pathIndex === mainImageIndex.value;
                
                // Chỉ cập nhật nếu trạng thái ảnh chính thay đổi
                if (isMain !== item.imageData.mainImage) {
                    const mediaFormData = new FormData();
                    const mediaPayload = {
                        id: item.imageData.id,
                        medicineId: medicineId,
                        mainImage: isMain,
                        mediaUrl: item.imageData.mediaUrl
                    };
                    
                    mediaFormData.append('media', JSON.stringify(mediaPayload));
                    await MedicineMediaService.saveOrUpdateMedicineMedia(mediaFormData);
                }
            }
        }
        
        // Thêm các ảnh mới (chỉ xử lý file mới)
        for (let i = 0; i < uploadedFiles.value.length; i++) {
            // Kiểm tra nếu là file mới (không phải URL đã tồn tại)
            if (uploadedFiles.value[i] instanceof File) {
                const mediaFormData = new FormData();
                const mediaPayload = {
                    id: 0,
                    medicineId: medicineId,
                    mainImage: i === mainImageIndex.value
                };
                
                console.log(`Uploading new image ${i+1}/${uploadedFiles.value.length}, main: ${i === mainImageIndex.value}`);
                mediaFormData.append('media', JSON.stringify(mediaPayload));
                mediaFormData.append('file', uploadedFiles.value[i]);
                
                await MedicineMediaService.saveOrUpdateMedicineMedia(mediaFormData);
            }
        }

        // Bước 3: Xử lý danh mục (giữ nguyên phần này)
        if (isEditMode.value) {
            // Lấy các bản ghi medicine_categories cũ
            const oldCategoryResponse = await MedicineCategoryService.getMedicineCategories(props.data.id);

            // Lấy danh sách categoryId từ API
            const oldCategoryIds = oldCategoryResponse.data.map((category) => category.categoryId);

            // Xác định các danh mục được chọn
            const selectedCategoryIds = props.data.categoryIds;

            // Xác định các bản ghi medicine_categories cần xóa
            const categoriesToRemove = oldCategoryResponse.data.filter((category) => !selectedCategoryIds.includes(category.categoryId));

            // Xóa các bản ghi medicine_categories không còn được chọn
            for (const categoryToRemove of categoriesToRemove) {
                await MedicineCategoryService.deleteMedicineCategory(categoryToRemove.id);
            }

            // Thêm các danh mục mới
            const newCategories = selectedCategoryIds.filter((categoryId) => !oldCategoryIds.includes(categoryId));

            for (const newCategoryId of newCategories) {
                await MedicineCategoryService.saveMedicineCategory({
                    id: 0,
                    medicineId: medicineId,
                    categoryId: newCategoryId
                });
            }
        } else {
            // Chế độ tạo mới
            if (props.data.categoryIds && props.data.categoryIds.length > 0) {
                for (const categoryId of props.data.categoryIds) {
                    await MedicineCategoryService.saveMedicineCategory({
                        id: 0,
                        medicineId: medicineId,
                        categoryId: categoryId
                    });
                }
            }
        }

        toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã lưu thông tin thuốc đầy đủ',
            life: 3000
        });

        emit('refreshList');
        closeForm();
    } catch (error) {
        console.error('Error saving medicine:', error);
        toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể lưu thông tin thuốc',
            life: 3000
        });
    } finally {
        isSubmitting.value = false;
    }
};

const closeForm = () => {
    formVisible.value = false;
    uploadedFiles.value = [];
    uploadedFilePaths.value = [];
    mainImageIndex.value = 0;
};
</script>

<template>
    <FormDialog :visible="formVisible" :title="isEditMode ? 'Cập nhật thuốc' : 'Thêm thuốc mới'" :loading="isSubmitting" @save="saveAll" @cancel="closeForm" @hide="closeForm">
        <div class="flex flex-col gap-4">
            <div class="text-xl font-bold mb-3">Thông tin thuốc</div>

            <div class="flex flex-col gap-1 w-full">
                <label for="code" class="font-semibold">Mã thuốc:</label>
                <InputText id="code" v-model="props.data.code" placeholder="Nhập mã thuốc" class="w-full" />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="name" class="font-semibold">Tên thuốc:</label>
                <InputText id="name" v-model="props.data.name" placeholder="Nhập tên thuốc" class="w-full" />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="description" class="font-semibold">Mô tả:</label>
                <Textarea id="description" v-model="props.data.description" placeholder="Nhập mô tả thuốc" class="w-full" rows="3" autoResize />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="brandId" class="font-semibold">Thương hiệu:</label>
                <Dropdown id="brandId" v-model="props.data.brandId" :options="brands" optionLabel="label" optionValue="value" placeholder="Chọn thương hiệu" class="w-full" />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="origin" class="font-semibold">Xuất xứ:</label>
                <InputText id="origin" v-model="props.data.origin" placeholder="Nhập xuất xứ" class="w-full" />
            </div>

            <!-- Hình ảnh thuốc -->
            <div class="text-xl font-bold mb-3 mt-4">Hình ảnh thuốc</div>

            <div class="flex flex-col gap-1 w-full">
                <label for="medicineImages" class="font-semibold">Tải ảnh:</label>
                <div class="flex items-center gap-2">
                    <Button icon="pi pi-images" label="Chọn ảnh" @click="triggerFileUpload" class="p-button-outlined" />
                    <input type="file" ref="fileUploadInput" multiple accept="image/*" class="hidden" @change="onFileSelect" />
                    <small class="text-gray-500"> {{ uploadedFiles.length }} ảnh đã chọn </small>
                </div>

                <div v-if="uploadedFilePaths.length > 0" class="mt-4 grid grid-cols-4 gap-4">
                    <div v-for="(path, index) in uploadedFilePaths" :key="index" class="relative">
                        <img :src="path" alt="Ảnh thuốc" class="w-full h-32 object-cover rounded" @error="$event.target.src = 'https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'" />
                        <div class="absolute top-2 right-2 flex gap-2">
                            <Button icon="pi pi-star" :severity="index === mainImageIndex ? 'success' : 'secondary'" class="p-button-rounded p-button-sm" @click="setMainImage(index)" tooltip="Đặt làm ảnh chính" />
                            <Button icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-sm" @click="removeImage(index)" tooltip="Xóa ảnh" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Danh mục thuốc -->
            <div class="text-xl font-bold mb-3 mt-4">Danh mục thuốc</div>
            <div class="flex flex-col gap-1 w-full">
                <label for="categoryId" class="font-semibold">Danh mục:</label>
                <MultiSelect id="categories" v-model="props.data.categoryIds" :options="categories" optionLabel="label" optionValue="value" placeholder="Chọn danh mục" class="w-full" />
            </div>
        </div>
    </FormDialog>
</template>
