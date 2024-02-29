import { AxiosResponse } from "axios";
import { Repo, RepoProvider, ResponseData, ResponseKeyMapper } from "../types";
import GitHubRepo from "./GitHubRepo";

class CodebergRepo extends GitHubRepo implements RepoProvider {
    constructor(baseURL = "https://codeberg.org/api/v1") {
        super(baseURL);
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
    // async getUserStarredRepos(userName: string): Promise<Repo[]>
}

export default CodebergRepo;
