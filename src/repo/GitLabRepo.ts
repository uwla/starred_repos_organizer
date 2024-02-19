import axios, { AxiosResponse } from "axios";
import { Repo, RepoProvider, ResponseData, ResponseKeyMapper } from "../types";
import { parseResponse } from "../utils";

const baseURL = "https://gitlab.com/api/v4";
const apiClient = axios.create({ baseURL });

// Array used to map response object to our data structure.
const map = {
    "archived": "archived",
    "created_at": "created_at",
    "description": "description",
    "fork": "forked",
    "forks_count": "forks",
    "path_with_namespace": "full_name",
    "homepage": "homepage",
    "web_url": "html_url",
    "is_template": "template",
    "license.nickname": "license",
    "name": "name",
    "namespace.full_path": "owner",
    "namespace.kind": "owner_type",
    "pushed_at": "last_push",
    "star_count": "stars",
    "topics": "topics",
    "updated_at": "last_update",
} as ResponseKeyMapper;

const parseGitLabResponse = (data: ResponseData) => parseResponse(data, map);

const GitLabRepo: RepoProvider = {
    async getRepo(url: string): Promise<Repo> {
        const match = url.match(/gitlab.com\/([^/]+)\/([^/?#]+)/);
        if (match == null) {
            throw new Error("GitLab repository URL is ill-formed.");
        }

        const userName = match[1];
        const repoName = match[2];
        let repo = {} as Repo;

        // Get main details
        await apiClient
            .get(`/projects/${userName}%2F${repoName}?license=yes`)
            .then((response: AxiosResponse) => {
                repo = parseGitLabResponse(response.data as ResponseData);
            });

        // Extra logic is needed to get repository's main language.
        await apiClient
            .get(`/projects/${userName}%2F${repoName}/languages`)
            .then((response: AxiosResponse) => {
                const data = response.data as ResponseData;
                const percentages = Object.values(data);
                const maxPercentage = Math.max(...percentages)
                const mainLanguage = Object.keys(data).find((key: string) => {
                    return data[key] == maxPercentage;
                }) as string;
                repo.lang = mainLanguage;
            })

        return repo;
    },

    async getReposFromUser(userName: string): Promise<Repo[]> {
        const repos = [] as Repo[];
        const endpoint = `/users/${userName}/starred_projects`;

        await apiClient.get(endpoint).then((response: AxiosResponse) => {
            const data = response.data as ResponseData[];
            repos.push(...data.map(parseGitLabResponse));
        });

        return repos;
    },
};

export default GitLabRepo;
