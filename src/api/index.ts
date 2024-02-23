/* eslint-disable @typescript-eslint/no-var-requires */
import { ApiClient } from "../types";
import localStorageClient from "./localStorageClient";
import mockClient from "./mockClient";
import restClient from "./restClient";

const STORAGE_DRIVER =
    typeof process !== "undefined" ? process.env.REACT_APP_STORAGE_DRIVER : "";

let apiClient = {} as ApiClient;

switch (STORAGE_DRIVER) {
    case "mock":
        apiClient = mockClient;
        break;
    case "rest":
        apiClient = restClient;
        break;
    case "local":
    default:
        apiClient = localStorageClient;
}

export default apiClient;
