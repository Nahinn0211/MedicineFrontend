import { defineStore } from 'pinia';
import { Categories } from '@admin/services/admin/Medicines';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        isLoading: false,
        form: { visible: false }
    }),

    actions: {
        async fetchCategories() {
            this.isLoading = true;
            try {
                const response = await Categories.getCategories();
                this.categories = response.data;
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                this.isLoading = false;
            }
        }
    }
});
