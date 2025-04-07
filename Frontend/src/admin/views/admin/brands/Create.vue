<script setup>
import { ref, computed, defineProps, defineEmits, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import FormDialog from '@admin/components/FormDialog.vue';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import { Brands } from '@admin/services/admin/Brands';

const props = defineProps({
    modelValue: Boolean,
    data: {
        type: Object,
        default: () => ({
            name: '',
            file: ''
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
const brands = ref([]);
const selectedBrand = ref(null);
const uploadedFile = ref(null);
const uploadedFilePath = ref('');
const isEditMode = computed(() => !!props.data.id);

const fetchBrands = async () => {
    try {
        const response = await Brands.getBrands();
        brands.value = response.data.map((brand) => ({
            label: brand.name,
            value: brand.id
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thương hiệu:', error);
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lấy danh sách thương hiệu', life: 3000 });
    }
};

watch(formVisible, (newVal) => {
    if (newVal) {
        selectedBrand.value = brands.value.find((b) => b.value === props.data.brandId) || null;

        if (isEditMode.value && props.data.image) {
            if (props.data.image.startsWith('http')) {
                uploadedFilePath.value = props.data.image;
            } else {
                uploadedFilePath.value = `http://localhost:8080/uploads/brands/${props.data.image}`;
            }
        }
    }
});

onMounted(fetchBrands);

const closeForm = () => {
    uploadedFile.value = null;
    uploadedFilePath.value = '';
    formVisible.value = false;
};

const onUpload = (event) => {
    const [file] = event.files;
    uploadedFile.value = file;

    props.data.image = file.name;

    if (file) {
        uploadedFilePath.value = URL.createObjectURL(file);
    }

    toast.add({ severity: 'info', summary: 'Thành công', detail: 'Đã tải ảnh lên', life: 3000 });
};

const onSelect = (event) => {
    const [file] = event.files;
    if (file) {
        uploadedFile.value = file;
        props.data.image = file.name;
        uploadedFilePath.value = URL.createObjectURL(file);
    }
};

const onClear = () => {
    uploadedFile.value = null;
    props.data.image = '';
    uploadedFilePath.value = '';
};

const saveBrands = async () => {
    try {
        if (!props.data.name || props.data.name.trim() === '') {
            toast.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập tên thương hiệu', life: 3000 });
            return;
        }

        isSubmitting.value = true;

        const formData = new FormData();
        const brandData = {
            name: props.data.name
        };
        if (isEditMode.value) {
            brandData.id = props.data.id;
        }

        formData.append('brand', JSON.stringify(brandData));

        if (uploadedFile.value) {
            formData.append('file', uploadedFile.value);
        }

        const result = await Brands.updateBrands(formData);

        toast.add({
            severity: 'success',
            summary: 'Thành Công',
            detail: isEditMode.value ? 'Đã cập nhật thương hiệu thành công' : 'Đã thêm thương hiệu thành công',
            life: 3000
        });

        emit('refreshList');
        closeForm();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lưu thương hiệu: ' + (error.response?.data?.message || error.message), life: 3000 });
        console.error('Lỗi khi lưu thương hiệu:', error);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <FormDialog :visible="formVisible" :title="isEditMode ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'" :loading="isSubmitting" @save="saveBrands" @cancel="closeForm" @hide="closeForm">
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1 w-full">
                <label for="brandName" class="font-semibold">Tên thương hiệu:</label>
                <InputText id="brandName" v-model="props.data.name" placeholder="Nhập tên thương hiệu" class="w-full" />
            </div>

            <div class="flex flex-col gap-1 w-full">
                <label for="image" class="font-semibold">Ảnh thương hiệu:</label>
                <FileUpload ref="fileUpload" mode="basic" name="file" accept="image/*" :maxFileSize="1000000" @upload="onUpload" @select="onSelect" @clear="onClear" :auto="true" chooseLabel="Chọn ảnh" />

                <div v-if="props.data.image || uploadedFilePath" class="mt-2">
                    <div class="mt-2">
                        <img :src="uploadedFilePath" alt="Ảnh xem trước" class="max-w-full h-auto max-h-40 rounded border" @error="$event.target.src = 'https://placehold.co/100x100/EEE/999?text=Lỗi+Ảnh'" />
                    </div>
                </div>
            </div>
        </div>
    </FormDialog>
</template>
