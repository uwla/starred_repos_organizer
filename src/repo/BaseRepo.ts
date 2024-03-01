import { Repo, ResponseData, ResponseKeyMapper } from "../types";
import axios, { AxiosInstance } from "axios";
import { extractDomain } from "../utils";

abstract class BaseRepo {
    apiClient: AxiosInstance;
    domain: string;

    constructor(baseURL: string, baseDomain: string = "") {
        this.apiClient = axios.create({ baseURL });
        if (baseDomain === "") baseDomain = extractDomain(baseURL);
        this.domain = baseDomain;
    }

    abstract responseDataMapper(): ResponseKeyMapper;

    parseResponse(data: ResponseData): Repo {
        const map = this.responseDataMapper();
        const repo = {} as Repo;
        for (const key in map) {
            let val: never = data[key];

            if (key.includes(".")) {
                val = data as never;
                for (const k of key.split(".")) {
                    val = val[k];
                    if (val == null) break;
                }
            }

            repo[map[key]] = val as never;
        }
        return repo;
    }

    extractRepoFullNameFromUrl(url: string): string[] {
        const match = url.match(/[\d\w.]+\.[\d\w]+\/([^/]+)\/([^/?#]+)/i);
        if (match == null) {
            throw new Error("Repository URL is ill-formed.");
        }

        const userName = match[1];
        const repoName = match[2];
        return [userName, repoName];
    }

    matchURL(url: string): boolean {
        return url.match(RegExp(`^(https?://)?${this.domain}/`)) != null;
    }
}

export default BaseRepo;
