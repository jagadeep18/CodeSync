import axios, { AxiosInstance } from "axios"

const wandboxBaseUrl = "https://wandbox.org/api"

const instance: AxiosInstance = axios.create({
    baseURL: wandboxBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
})

export default instance
