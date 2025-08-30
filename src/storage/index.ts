import { StorageDriver } from "../types"
import localStorageDriver from "./localStorageDriver"
import mockDriver from "./mockDriver"
import restApiDriver from "./restApiDriver"

const STORAGE_DRIVER = import.meta.env.VITE_STORAGE_DRIVER

let storageDriver = {} as StorageDriver

switch (STORAGE_DRIVER) {
    case "mock":
        storageDriver = mockDriver
        break
    case "rest":
        storageDriver = restApiDriver
        break
    case "local":
    default:
        storageDriver = localStorageDriver
}

export default storageDriver
