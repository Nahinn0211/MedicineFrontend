<template>
    <div class="about-page">
        <section class="hero-section">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-6">
                        <div class="hero-content">
                            <h1>THAPV Pharmacity</h1>
                            <p>Đồng hành cùng sức khỏe, chăm sóc từng trải nghiệm</p>
                            <div class="hero-cta">
                                <a href="#mission" class="btn btn-main btn-round-full">
                                    Tìm hiểu thêm
                                    <i class="icofont-simple-right ml-2"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="hero-image">
                            <img src="https://media.istockphoto.com/id/1437830105/vi/anh/%E1%BA%A3nh-c%E1%BA%AFt-x%C3%A9n-c%E1%BB%A7a-m%E1%BB%99t-n%E1%BB%AF-y-t%C3%A1-n%E1%BA%AFm-tay-b%E1%BB%87nh-nh%C3%A2n-cao-c%E1%BA%A5p-c%E1%BB%A7a-c%C3%B4-%E1%BA%A5y-h%E1%BB%97-tr%E1%BB%A3-b%C3%A1c-s%C4%A9-gi%C3%BAp-%C4%91%E1%BB%A1-b%E1%BB%87nh-nh%C3%A2n.jpg?s=612x612&w=0&k=20&c=PCXy2LlpWOiUwmMKiXUbPaLcw5hrxo4koQ4RaK_lwhI="
                                alt="THAPV Pharmacity" class="img-fluid">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="mission" class="mission-section">
            <div class="container">
                <div class="row">
                    <div class="col-lg-6">
                        <div class="mission-image">
                            <img src="https://media.istockphoto.com/id/1413031831/vi/anh/b%C3%A1c-s%C4%A9-y-khoa-gi%E1%BB%AF-h%C3%ACnh-tr%C3%A1i-tim-m%C3%A0u-%C4%91%E1%BB%8F-trong-tay-%E1%BA%A3nh-ch%E1%BB%A9ng-kho%C3%A1n-kh%C3%A1i-ni%E1%BB%87m-y-t%E1%BA%BF.jpg?s=612x612&w=0&k=20&c=-q7xzjY7C4jwGHCDOiQ9huezQUqpjmeVg_yclkq1ZOA="
                                alt="Sứ mệnh THAPV" class="img-fluid">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="mission-content">
                            <h2>Sứ Mệnh Của Chúng Tôi</h2>
                            <p>THAPV Pharmacity ra đời với mục tiêu cung cấp giải pháp y tế toàn diện, kết nối bệnh nhân
                                với các dịch vụ chăm sóc sức khỏe chất lượng cao. Chúng tôi không chỉ là một trang web
                                bán thuốc, mà còn là người đồng hành tin cậy trong hành trình chăm sóc sức khỏe của bạn.
                            </p>
                            <ul class="mission-highlights">
                                <li>
                                    <i class="icofont-medical-cross"></i>
                                    Cung cấp thuốc chính hãng, chất lượng
                                </li>
                                <li>
                                    <i class="icofont-doctor"></i>
                                    Tư vấn y tế trực tuyến chuyên nghiệp
                                </li>
                                <li>
                                    <i class="icofont-prescription"></i>
                                    Hỗ trợ quản lý đơn thuốc điện tử
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="values-section">
            <div class="container">
                <h2 class="text-center mb-5">Giá Trị Cốt Lõi</h2>
                <div class="row">
                    <div class="col-lg-4 col-md-6" v-for="(value, index) in coreValues" :key="index">
                        <div class="value-card">
                            <div class="value-icon">
                                <i :class="value.icon"></i>
                            </div>
                            <h3>{{ value.title }}</h3>
                            <p>{{ value.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="team-section">
            <div class="container">
                <h2 class="text-center mb-5">Đội Ngũ Chuyên Nghiệp</h2>
                <div>
                    <div class="row">
                        <div class="col-lg-4 col-md-6" v-for="(member, index) in teamMembers.slice(0, 3)" :key="index">
                            <div class="team-member">
                                <div class="member-image">
                                    <img :src="member.image" :alt="member.name">
                                </div>
                                <div class="member-info">
                                    <h3>{{ member.name }}</h3>
                                    <p>{{ member.role }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row" v-if="teamMembers.length > 2">
                        <div class="col-2"></div>
                        <div class="col-4" v-for="(member, index) in teamMembers.slice(3, 5)" :key="index + 2">
                            <div class="team-member">
                                <div class="member-image">
                                    <img :src="member.image" :alt="member.name">
                                </div>
                                <div class="member-info">
                                    <h3>{{ member.name }}</h3>
                                    <p>{{ member.role }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-2"></div>
                    </div>
                </div>
            </div>
        </section>

        <section class="commitment-section">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-6">
                        <div class="commitment-content">
                            <h2>Cam Kết Của Chúng Tôi</h2>
                            <ul>
                                <li>An toàn - Uy tín - Chuyên nghiệp</li>
                                <li>Bảo mật thông tin khách hàng</li>
                                <li>Hỗ trợ khách hàng 24/7</li>
                                <li>Luôn cập nhật công nghệ y tế mới nhất</li>
                            </ul>
                            <a href="/contact" class="btn btn-main btn-round-full mt-4">
                                Liên Hệ Chúng Tôi
                                <i class="icofont-simple-right ml-2"></i>
                            </a>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="commitment-image">
                            <img src="https://vinbigdata.com/wp-content/uploads/2022/07/xu-ly-du-lieu-hinh-anh-y-te-.jpg"
                                alt="Cam kết THAPV" class="img-fluid">
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// Team member images (replace with actual paths)
import teamMember1 from '@/assets/user/images/team/1.jpg';
import teamMember4 from '@/assets/user/images/team/2.jpg';
import teamMember3 from '@/assets/user/images/team/3.jpg';
import teamMember2 from '@/assets/user/images/team/4.jpg';
import teamMember5 from '@/assets/user/images/team/5.png';

const coreValues = ref([
    {
        icon: 'icofont-safety',
        title: 'An Toàn',
        description: 'Đảm bảo chất lượng và an toàn cho mọi sản phẩm thuốc'
    },
    {
        icon: 'icofont-like',
        title: 'Tin Cậy',
        description: 'Xây dựng niềm tin qua từng trải nghiệm khách hàng'
    },
    {
        icon: 'icofont-heart-beat',
        title: 'Chăm Sóc',
        description: 'Luôn đặt sức khỏe và trải nghiệm của bạn lên hàng đầu'
    }
]);

const teamMembers = ref([
    {
        name: 'Lê Nam Anh',
        role: 'Giám Đốc Điều Hành',
        image: teamMember1
    },
    {
        name: 'Trần Đức Thịnh',
        role: 'Trưởng Khoa Điều Dưỡng',
        image: teamMember2
    },
    {
        name: 'Nguyễn Tiến Phúc',
        role: 'Giám Đốc Nhân Sự',
        image: teamMember3
    },
    {
        name: 'Khổng Khánh Vân',
        role: 'Trưởng Khoa Dược',
        image: teamMember4
    },
    {
        name: 'Lương Minh Hiếu',
        role: 'Chuyên Gia Y Tế',
        image: teamMember5
    }
]);
</script>

<style scoped>
.about-page {
    background-color: #f4f9fd;
}

.hero-section {
    padding: 100px 0;
    background-color: #ffffff;
}

.hero-content h1 {
    color: #223a66;
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 20px;
}

.hero-content p {
    color: #6f8ba4;
    font-size: 18px;
    margin-bottom: 30px;
}

.hero-image img {
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.mission-section,
.commitment-section {
    padding: 80px 0;
    background-color: #f9f9f9;
}

.mission-content h2,
.commitment-content h2 {
    color: #223a66;
    margin-bottom: 20px;
}

.mission-highlights {
    list-style: none;
    padding: 0;
    margin-top: 30px;
}

.mission-highlights li {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    color: #6f8ba4;
}

.mission-highlights li i {
    color: #e12454;
    margin-right: 15px;
    font-size: 24px;
}

.values-section {
    padding: 80px 0;
    background-color: #ffffff;
}

.value-card {
    text-align: center;
    padding: 30px;
    background-color: #f9f9f9;
    border-radius: 10px;
    margin-bottom: 30px;
    transition: transform 0.3s ease;
}

.value-card:hover {
    transform: translateY(-10px);
}

.value-icon i {
    font-size: 50px;
    color: #e12454;
    margin-bottom: 20px;
}

.team-section {
    padding: 80px 0;
    background-color: #f4f9fd;
}

.team-member {
    text-align: center;
    margin-bottom: 30px;
}

.member-image img {
    width: 250px;
    height: 250px;
    object-fit: cover;
    border-radius: 50%;
    border: 5px solid #e12454;
}

.member-info h3 {
    color: #223a66;
    margin-top: 15px;
}

.member-info p {
    color: #6f8ba4;
}

.btn-main {
    background-color: #e12454;
    color: white;
    padding: 12px 25px;
    border-radius: 30px;
    transition: background-color 0.3s ease;
}

.btn-main:hover {
    background-color: #c11a4a;
}
</style>