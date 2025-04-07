<template>
    <section class="contact-section">
        <div class="container">
            <div class="row">
                <div class="col-lg-5">
                    <div class="contact-info">
                        <h2 class="title-color">Liên hệ với chúng tôi</h2>
                        <p class="mb-4">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ ngay để được tư
                            vấn.</p>

                        <div class="contact-details">
                            <div class="contact-item">
                                <i class="icofont-location-pin"></i>
                                <div>
                                    <h4>Địa chỉ</h4>
                                    <p>285 Đội Cấn, Ba Đình, Hà Nội</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <i class="icofont-phone"></i>
                                <div>
                                    <h4>Điện thoại</h4>
                                    <p>1900 6789</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <i class="icofont-email"></i>
                                <div>
                                    <h4>Email</h4>
                                    <p>support@thapvpharmacity.com</p>
                                </div>
                            </div>
                        </div>

                        <div class="contact-social mt-4">
                            <h4>Kết nối với chúng tôi</h4>
                            <div class="social-links">
                                <a href="#" class="facebook"><i class="icofont-facebook"></i></a>
                                <a href="#" class="twitter"><i class="icofont-twitter"></i></a>
                                <a href="#" class="instagram"><i class="icofont-instagram"></i></a>
                                <a href="#" class="linkedin"><i class="icofont-linkedin"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-7">
                    <div class="google-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924408763309!2d105.8164289743391!3d21.035710387541616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0d6e603741%3A0x208a848932ac2109!2sAptech%20Computer%20Education!5e0!3m2!1sen!2s!4v1742709074804!5m2!1sen!2s"
                            width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>

                    <div class="contact-form mt-5">
                        <h3 class="mb-4">Gửi tin nhắn cho chúng tôi</h3>
                        <form @submit.prevent="submitForm">
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input type="text" class="form-control" placeholder="Họ và tên" v-model="name"
                                            required>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <input type="email" class="form-control" placeholder="Email" v-model="email"
                                            required>
                                    </div>
                                </div>
                                <div class="col-lg-12">
                                    <div class="form-group">
                                        <input type="text" class="form-control" placeholder="Chủ đề" v-model="subject"
                                            required>
                                    </div>
                                </div>
                                <div class="col-lg-12">
                                    <div class="form-group">
                                        <textarea class="form-control" rows="6" placeholder="Nội dung tin nhắn"
                                            v-model="message" required></textarea>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-main btn-round-full">Gửi tin nhắn</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';

// Form data
const name = ref('');
const email = ref('');
const subject = ref('');
const message = ref('');

// Form submission handler
const submitForm = () => {
    // TODO: Implement actual form submission logic
    console.log('Form submitted', {
        name: name.value,
        email: email.value,
        subject: subject.value,
        message: message.value
    });

    // Reset form after submission
    name.value = '';
    email.value = '';
    subject.value = '';
    message.value = '';

    // Optional: Show success message or handle response
    alert('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
};
</script>

<style scoped>
.contact-section {
    padding: 80px 0;
    background-color: #f9f9f9;
}

.title-color {
    color: #223a66;
    font-weight: 700;
    margin-bottom: 20px;
}

.contact-info p {
    color: #6f8ba4;
    line-height: 1.6;
}

.contact-details {
    margin-top: 30px;
}

.contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.contact-item i {
    font-size: 40px;
    color: #e12454;
    margin-right: 20px;
}

.contact-item h4 {
    color: #223a66;
    margin-bottom: 5px;
}

.contact-item p {
    color: #6f8ba4;
    margin: 0;
}

.contact-social .social-links {
    display: flex;
    gap: 15px;
    margin-top: 15px;
}

.contact-social .social-links a {
    color: #6f8ba4;
    font-size: 24px;
    transition: color 0.3s ease;
}

.contact-social .social-links a:hover {
    color: #e12454;
}

.contact-form {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.contact-form h3 {
    color: #223a66;
}

.form-group {
    margin-bottom: 20px;
}

.form-control {
    border: 1px solid #ddd;
    padding: 12px 15px;
    border-radius: 4px;
}

.btn-main {
    background-color: #e12454;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 30px;
    transition: background-color 0.3s ease;
}

.btn-main:hover {
    background-color: #c11a4a;
}

.google-map {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>