import axios from "axios"; // axios instanca sa osnovnom adresom

const api = axios.create({
    baseURL:"http://localhost:5000",
})

export default api;