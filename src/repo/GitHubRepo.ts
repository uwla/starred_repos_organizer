import { Repo, RepoProvider, RepoKey } from "../types";
import axios, { AxiosInstance, AxiosResponse } from "axios";

const apiClient = axios.create({
    baseURL: "https://api.github.com",
}) as AxiosInstance;

type ResponseData = { [key: string]: never };

// Array used to map response object to our data structure.
const mapKeys = {
    "archived": "archived",
    "created_at": "created_at",
    "description": "description",
    "fork": "forked",
    "forks_count": "forks",
    "full_name": "full_name",
    "homepage": "homepage",
    "html_url": "html_url",
    "is_template": "template",
    "language": "lang",
    "license.spdx_id": "license",
    "name": "name",
    "owner.login": "owner",
    "owner.type": "owner_type",
    "pushed_at": "last_push",
    "stargazers_count": "stars",
    "topics": "topics",
    "updated_at": "last_update",
} as { [key: string]: RepoKey };

const parseResponse = (data: ResponseData): Repo => {
    const repo = {} as Repo;
    for (const key in mapKeys) {
        let val : never = data[key];

        if (key.includes(".")) {
            val = data as never;
            for (const k of key.split(".")) {
                val = val[k]
                if (val == null) break;
            }
        }

        repo[mapKeys[key]] = val as never;
    }
    return repo;
};

const GitHubRepo: RepoProvider = {
    async getRepo(url: string): Promise<Repo> {
        const match = url.match(/github.com\/([^/]+)\/([^/?#]+)/);
        if (match == null) {
            throw new Error("GitHub repository URL is ill-formed.");
        }

        const userName = match[1];
        const repoName = match[2];
        let repo = {} as Repo;
        await apiClient
            .get(`/repos/${userName}/${repoName}`)
            .then((response: AxiosResponse) => {
                repo = parseResponse(response.data as ResponseData);
            });
        return repo;
    },

    async getReposFromUser(userName: string): Promise<Repo[]> {
        const repos = [] as Repo[];
        let data = [] as ResponseData[];
        let page = 1;
        const perPage = 100;
        const baseEndpoint = `/users/${userName}/starred?per_page=${perPage}`;
        let endpoint = "";

        // Due to GitHub API's limit of 100 items per page, we need to fetch
        // data per page until there are no more pages.
        do {
            endpoint = `${baseEndpoint}&page=${page}`;
            await apiClient.get(endpoint).then((response: AxiosResponse) => {
                data = response.data as ResponseData[];
                repos.push(...data.map(parseResponse));
            });
            page += 1;
        } while (data.length == perPage);

        return repos;
    },
};

export default GitHubRepo;
