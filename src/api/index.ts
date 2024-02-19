/* eslint-disable @typescript-eslint/no-var-requires */
import mockClient from "./mockClient";
import restClient from "./restClient";

const ENV = process.env.NODE_ENV || "development";

const apiClient = (ENV === 'demo') ? mockClient : restClient;

export default apiClient;
