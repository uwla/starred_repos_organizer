import { ProviderSlugs, Repo, ResponseData, ResponseKeyMapper } from "../types";
import axios, { AxiosInstance } from "axios";
import { extractDomain } from "../utils";

interface Props {
    baseURL: string,
    domain?: string,
    providerSlug?: ProviderSlugs,
}

abstract class BaseRepo {
    apiClient: AxiosInstance;
    domain: string;
    providerSlug: ProviderSlugs;

    constructor({baseURL, domain, providerSlug} : Props) {
        this.apiClient = axios.create({ baseURL });
        this.domain = domain || extractDomain(baseURL);
        this.providerSlug = providerSlug || "url";
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

        // Some providers: GitHub, GitLab, Codeberg, Gitea, Gogs, ...
        repo.provider = this.providerSlug;

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
