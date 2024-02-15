import { Repo, RepoProvider, RepoKey } from "./Repo";
import axios, { AxiosInstance, AxiosResponse } from "axios";

const apiClient = axios.create({
    baseURL: "https://api.github.com",
}) as AxiosInstance;

const GitHubRepo: RepoProvider = {
    async getRepo(url: string): Promise<Repo> {
        const match = url.match(/github.com\/([^/]+)\/([^/?#]+)/);
        if (match == null) {
            throw new Error("GitHub repository URL is ill-formed.");
        }

        const userName = match[1];
        const repoName = match[2];
        const repo = {} as Repo;

        // Array used to map response object to our data structure.
        const mapKeys = {
            full_name: "full_name",
            name: "name",
            description: "description",
            topics: "topics",
            html_url: "html_url",
            homepage: "homepage",
            language: "lang",
            license: "license",
            created_at: "created_at",
            pushed_at: "last_push",
            updated_at: "last_update",
            fork: "forked",
            forks_count: "forks",
            archived: "archived",
            template: "template",
            owner: "owner",
            owner_type: "owner_type",
            stargazers_count: "stars",
        } as { [key: string]: RepoKey };

        await apiClient
            .get(`/repos/${userName}/${repoName}`)
            .then((response: AxiosResponse) => {
                const data = response.data as { [key: string]: never };
                for (const key in mapKeys) {
                    repo[mapKeys[key]] = data[key];
                }
            });
        return repo;
    },

    async getReposFromUser(userName: string): Promise<Repo[]> {
        const repos = [] as Repo[];
        let data = [] as Repo[];
        let page = 1;
        const perPage = 100;
        const baseEndpoint = `/users/${userName}/starred?per_page=${perPage}`;
        let endpoint = "";

        // Due to GitHub API's limit of 100 items per page, we need to fetch
        // data per page until there are no more pages.
        do {
            endpoint = `${baseEndpoint}&page=${page}`;
            await apiClient.get(endpoint).then((response: AxiosResponse) => {
                data = response.data as Repo[];
                repos.push(...data);
            });
            page += 1;
        } while (data.length == perPage);

        return repos;
    },
};

export default GitHubRepo;
