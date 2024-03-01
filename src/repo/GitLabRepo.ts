import { AxiosResponse } from "axios";
import { Repo, RepoProvider, ResponseData, ResponseKeyMapper } from "../types";
import BaseRepo from "./BaseRepo";

class GitLabRepo extends BaseRepo implements RepoProvider {
    constructor(domain = "gitlab.com") {
        const baseURL = `https://${domain}/api/v4`
        super(baseURL);
    }

    responseDataMapper(): ResponseKeyMapper {
        return {
            archived: "archived",
            created_at: "created_at",
            description: "description",
            fork: "forked",
            forks_count: "forks",
            path_with_namespace: "full_name",
            homepage: "homepage",
            web_url: "url",
            is_template: "template",
            "license.nickname": "license",
            name: "name",
            "namespace.full_path": "owner",
            "namespace.kind": "owner_type",
            pushed_at: "last_push",
            star_count: "stars",
            topics: "topics",
            updated_at: "last_update",
        };
    }

    async getRepo(url: string): Promise<Repo> {
        const [userName, repoName] = this.extractRepoFullNameFromUrl(url);
        let repo = {} as Repo;

        // Get main details.
        await this.apiClient
            .get(`/projects/${userName}%2F${repoName}?license=yes`)
            .then((response: AxiosResponse) => {
                repo = this.parseResponse(response.data as ResponseData);
            });

        // Get repository's main language.
        await this.apiClient
            .get(`/projects/${userName}%2F${repoName}/languages`)
            .then((response: AxiosResponse) => {
                const data = response.data as ResponseData;
                const percentages = Object.values(data);
                const maxPercentage = Math.max(...percentages);
                const mainLanguage = Object.keys(data).find((key: string) => {
                    return data[key] == maxPercentage;
                }) as string;
                repo.lang = mainLanguage;
            });

        return repo;
    }

    async getUserStarredRepos(userName: string): Promise<Repo[]> {
        const repos = [] as Repo[];
        const endpoint = `/users/${userName}/starred_projects`;

        await this.apiClient.get(endpoint).then((response: AxiosResponse) => {
            const data = response.data as ResponseData[];
            repos.push(...data.map(this.parseResponse));
        });

        return repos;
    }
}

export default GitLabRepo;
