<script setup>
    import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import FormDialog from '@admin/components/FormDialog.vue';
    import Dropdown from 'primevue/dropdown';
    import InputText from 'primevue/inputtext';
    import FileUpload from 'primevue/fileupload';
    import { Categories } from '@admin/services/admin/Categories';
    
    const props = defineProps({
        modelValue: Boolean,
        data: {
            type: Object,
            default: () => ({
                name: '',
                parentId: null,
                image: null
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
    const parentCategories = ref([]);
    const isEditMode = computed(() => !!props.data.id);
    const uploadedFilePath = ref(null);
    const fileUpload = ref(null);
    const selectedFile = ref(null);
    
    const fetchParentCategories = async () => {
        try {
            const response = await Categories.getCategories();
            // Thêm lựa chọn "Không có danh mục cha"
            parentCategories.value = [
                { 
                    id: null, 
                    name: 'Không có danh mục cha' 
                },
                ...response.data.filter(category => category.id !== props.data.id)
            ];
        } catch (error) {
            console.error('Lỗi khi lấy danh sách danh mục:', error);
            toast.add({ 
                severity: 'error', 
                summary: 'Lỗi', 
                detail: 'Không thể lấy danh sách danh mục', 
                life: 3000 
            });
        }
    };
    
    onMounted(() => {
        fetchParentCategories();
        if (props.data.image) {
            uploadedFilePath.value = props.data.image;
        }
    });
    
    const closeForm = () => {
        formVisible.value = false;
    };
    
    const onSelect = (event) => {
        if (event.files && event.files.length > 0) {
            selectedFile.value = event.files[0];
            
            // Tạo URL xem trước
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedFilePath.value = e.target.result;
            };
            reader.readAsDataURL(selectedFile.value);
        }
    };
    
    const onClear = () => {
        uploadedFilePath.value = null;
        props.data.image = null;
        selectedFile.value = null;
    };
    
    const saveCategories = async () => {
        try {
            // Kiểm tra tên danh mục
            if (!props.data.name || props.data.name.trim() === '') {
                toast.add({ 
                    severity: 'warn', 
                    summary: 'Cảnh báo', 
                    detail: 'Vui lòng nhập tên danh mục', 
                    life: 3000 
                });
                return;
            }
    
            isSubmitting.value = true;
    
            // Chuẩn bị dữ liệu category dưới dạng object JavaScript
            const categoryData = {
                name: props.data.name
            };
            
            // Chỉ thêm parentId vào dữ liệu gửi đi nếu nó không phải null
            if (props.data.parentId !== null) {
                categoryData.parent_id = props.data.parentId;
            }
    
            // Nếu đang ở chế độ chỉnh sửa, thêm ID
            if (isEditMode.value) {
                categoryData.id = props.data.id;
            }
            
            // Chuyển đổi object thành chuỗi JSON
            const categoryJson = JSON.stringify(categoryData);
    
            // Chuẩn bị FormData
            const formData = new FormData();
            formData.append('category', categoryJson);
            
            // Thêm file nếu có
            if (selectedFile.value) {
                formData.append('file', selectedFile.value);
            }
    
            // Gọi service để lưu
            const response = await Categories.saveCategory(formData);
            
            toast.add({ 
                severity: 'success', 
                summary: 'Thành Công', 
                detail: isEditMode.value 
                    ? 'Đã cập nhật danh mục thành công' 
                    : 'Đã thêm danh mục thành công', 
                life: 3000 
            });
            
            emit('refreshList');
            closeForm();
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Lỗi', 
                detail: 'Không thể lưu danh mục: ' + (error.response?.data?.message || error.message), 
                life: 3000 
            });
            console.error('Lỗi khi lưu danh mục:', error);
        } finally {
            isSubmitting.value = false;
        }
    };
    </script>
    
    <template>
        <FormDialog 
            :visible="formVisible" 
            :title="isEditMode ? 'Cập nhật danh mục' : 'Thêm danh mục mới'" 
            :loading="isSubmitting" 
            @save="saveCategories" 
            @cancel="closeForm" 
            @hide="closeForm"
        >
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1 w-full">
                    <label for="categoryName" class="font-semibold">Tên danh mục:</label>
                    <InputText 
                        id="categoryName" 
                        v-model="props.data.name" 
                        placeholder="Nhập tên danh mục" 
                        class="w-full" 
                    />
                </div>
                
                <div class="flex flex-col gap-1 w-full">
                    <label for="parentCategory" class="font-semibold">Danh mục cha:</label>
                    <Dropdown 
                        id="parentCategory"
                        v-model="props.data.parentId" 
                        :options="parentCategories"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Chọn danh mục cha"
                        class="w-full"
                    />
                </div>
                <div class="flex flex-col gap-1 w-full">
                    <label for="image" class="font-semibold">Ảnh thương hiệu:</label>
                    <FileUpload 
                        ref="fileUpload" 
                        mode="basic" 
                        name="file" 
                        accept="image/*" 
                        :maxFileSize="1000000" 
                        @select="onSelect" 
                        @clear="onClear" 
                        :auto="false" 
                        chooseLabel="Chọn ảnh" 
                    />
    
                    <div v-if="uploadedFilePath" class="mt-2">
                        <div class="mt-2">
                            <img 
                                :src="uploadedFilePath" 
                                alt="Ảnh xem trước" 
                                class="max-w-full h-auto max-h-40 rounded border" 
                                @error="$event.target.src = 'https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </FormDialog>
    </template>
    
    <style scoped>
    .form-error {
        color: red;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    </style>