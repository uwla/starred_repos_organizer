import { AxiosResponse } from "axios";
import { Repo, RepoProvider, ResponseData, ResponseKeyMapper } from "../types";
import BaseRepo from "./BaseRepo";

class GitHubRepo extends BaseRepo implements RepoProvider {
    constructor() {
        super("https://api.github.com", "github.com");
    }

    responseDataMapper(): ResponseKeyMapper {
        return {
            archived: "archived",
            created_at: "created_at",
            description: "description",
            fork: "forked",
            forks_count: "forks",
            full_name: "full_name",
            homepage: "homepage",
            html_url: "url",
            is_template: "template",
            language: "lang",
            "license.spdx_id": "license",
            name: "name",
            "owner.login": "owner",
            "owner.type": "owner_type",
            pushed_at: "last_push",
            stargazers_count: "stars",
            topics: "topics",
            updated_at: "last_update",
        };
    }

    async getRepo(url: string): Promise<Repo> {
        const [userName, repoName] = this.extractRepoFullNameFromUrl(url);
        return this.apiClient
            .get(`/repos/${userName}/${repoName}`)
            .then((response: AxiosResponse) =>
                this.parseResponse(response.data as ResponseData)
            );
    }

    async getUserStarredRepos(userName: string): Promise<Repo[]> {
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
            await this.apiClient
                .get(endpoint)
                .then((response: AxiosResponse) => {
                    data = response.data as ResponseData[];
                    repos.push(...data.map(this.parseResponse));
                });
            page += 1;
        } while (data.length == perPage);

        return repos;
    }
}

export default GitHubRepo;
