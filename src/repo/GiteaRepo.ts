import { AxiosResponse } from "axios";
import { Repo, RepoProvider, ResponseData, ResponseKeyMapper } from "../types";
import BaseRepo from "./BaseRepo";

class GiteaRepo extends BaseRepo implements RepoProvider {
    constructor(domain: string) {
        const baseURL = `https://${domain}/api/v1`;
        super(baseURL, domain);
    }

    responseDataMapper(): ResponseKeyMapper {
        return {
            archived: "archived",
            created_at: "created_at",
            description: "description",
            fork: "forked",
            forks_count: "forks",
            full_name: "full_name",
            website: "homepage",
            html_url: "url",
            is_template: "template",
            language: "lang",
            name: "name",
            "owner.login": "owner",
            pushed_at: "last_push",
            stars_count: "stars",
            updated_at: "last_update",
        };
    }

    async getRepo(url: string): Promise<Repo> {
        const [userName, repoName] = this.extractRepoFullNameFromUrl(url);
        let repo = {} as Repo;
        await this.apiClient
            .get(`/repos/${userName}/${repoName}`)
            .then((response: AxiosResponse) => {
                repo = this.parseResponse(response.data as ResponseData);
            });
        await this.apiClient
            .get(`/repos/${userName}/${repoName}/topics`)
            .then((response: AxiosResponse) => {
                repo.topics = response.data.topics as string[];
            });
        return repo;
    }

    // ! WARNING: getUserStarredRepos WON'T WORK WITHOUT AN AUTH TOKEN
    async getUserStarredRepos(userName: string): Promise<Repo[]> {
        const repos = [] as Repo[];
        let data = [] as ResponseData[];
        let page = 1;
        const perPage = 100;
        const baseEndpoint = `/users/${userName}/starred?per_page=${perPage}`;
        let endpoint = "";

        // Due to Gitea API's limit of 100 items per page, we need to fetch
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

export default GiteaRepo;
