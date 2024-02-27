/* eslint-disable @typescript-eslint/no-var-requires */
import { StorageDriver } from "../types";
import localStorageDriver from "./localStorageDriver";
import mockDriver from "./mockDriver";
import restApiDriver from "./restApiDriver";

const STORAGE_DRIVER =
    typeof process !== "undefined" ? process.env.REACT_APP_STORAGE_DRIVER : "";

let apiClient = {} as StorageDriver;

switch (STORAGE_DRIVER) {
    case "mock":
        apiClient = mockDriver;
        break;
    case "rest":
        apiClient = restApiDriver;
        break;
    case "local":
    default:
        apiClient = localStorageDriver;
}

export default apiClient;
