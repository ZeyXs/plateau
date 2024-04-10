import axios from 'axios';
const BASE_URL = import.meta.env.PROD ? "https://plateau-api.zeyx.dev" : 'http://localhost:4000';

export default axios.create({
    baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});
