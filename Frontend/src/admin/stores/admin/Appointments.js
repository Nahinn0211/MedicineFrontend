import { sendDelete, sendGet, sendPost, sendPut } from '@admin/services/axios';

export const Appointments = {
  getHeaders() {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  },
   async getAppointmentsByIdDoctor() {
    return await sendGet("http://localhost:8080/api/appointments/doctor/me"
       
    );
  },
};