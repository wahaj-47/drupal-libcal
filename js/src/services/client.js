import axios from "axios"

const client = axios.create({
    baseURL: window.location.origin,
    timeout: 10000
})

client.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
)

export default client