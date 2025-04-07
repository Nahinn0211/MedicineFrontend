import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { doctorService } from '@user/services/DoctorService';
import { DoctorProfile } from '@models/DoctorProfile';
import { userService } from '@user/services/UserService';

export const useDoctorStore = defineStore('doctor', () => {
    const doctors = ref<DoctorProfile[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const selectedSpecialization = ref('all');
    const hasDoctors = computed(() => doctors.value.length > 0);
    const specializations = computed(() => {
        const uniqueSpecializations = new Set<string>();
        uniqueSpecializations.add('all');
        doctors.value.forEach(doctor => {
            if (doctor.specialization && doctor.specialization.trim() !== '') {
                uniqueSpecializations.add(doctor.specialization);
            }
        });

        return Array.from(uniqueSpecializations).map(value => {
            return {
                id: value.toLowerCase().replace(/\s+/g, '-'),
                name: value === 'all' ? 'All Department' : value
            };
        });
    });

    // Đã sửa đổi phương thức filteredDoctors
    const filteredDoctors = computed(() => {
        if (selectedSpecialization.value === 'all') {
            return doctors.value;
        }

        // Tìm chuyên khoa được chọn trong danh sách specializations
        const selectedSpec = specializations.value.find(spec =>
            spec.id === selectedSpecialization.value
        );

        if (!selectedSpec) {
            console.error("Không tìm thấy chuyên khoa đã chọn:", selectedSpecialization.value);
            return []; // Trả về mảng rỗng nếu không tìm thấy
        }

        return doctors.value.filter(doctor =>
            doctor.specialization &&
            doctor.specialization === selectedSpec.name
        );
    });

    async function fetchAllDoctors() {
        try {
            isLoading.value = true;
            error.value = null;
            const doctorData = await doctorService.getAllDoctors();

            if (!doctorData) {
                doctors.value = [];
                error.value = 'Không thể tải danh sách bác sĩ';
                return;
            }
            const userData = await userService.getAllUsers();

            if (!userData) {
                console.error('Không thể tải danh sách người dùng');
                doctors.value = doctorData.map(doctor => ({
                    ...doctor,
                    user: undefined
                }));
                return;
            }
            doctors.value = doctorData.map(doctor => {
                const userInfo = userData.find(user => user.id === doctor.userId);
                return {
                    ...doctor,
                    user: userInfo
                };
            });

        } catch (err: any) {
            error.value = err.message || 'Đã xảy ra lỗi khi tải danh sách bác sĩ';
            console.error('Error in fetchAllDoctors:', err);
            doctors.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchDoctorById(id: number) {
        try {
            isLoading.value = true;
            error.value = null;
            const doctor = await doctorService.getDoctorById(id);

            if (!doctor) {
                return null;
            }
            const user = doctor.userId ? await userService.getUserById(doctor.userId) : undefined;
            const doctorWithUser: DoctorProfile = {
                ...doctor,
                user: user || undefined
            };

            return doctorWithUser;

        } catch (err: any) {
            error.value = err.message || `Đã xảy ra lỗi khi tải thông tin bác sĩ ID=${id}`;
            console.error(`Error in fetchDoctorById(${id}):`, err);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    function setSelectedSpecialization(specialization: string) {
        console.log('Chuyên khoa được chọn:', specialization); // Thêm log để debug
        selectedSpecialization.value = specialization;
    }

    return {
        doctors,
        isLoading,
        error,
        selectedSpecialization,
        hasDoctors,
        specializations,
        filteredDoctors,
        fetchAllDoctors,
        fetchDoctorById,
        setSelectedSpecialization
    };
});