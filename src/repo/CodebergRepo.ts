import axios, { AxiosResponse } from "axios";
import { Repo, RepoProvider, ResponseData, ResponseKeyMapper } from "../types";
import { parseResponse } from "../utils";

const baseURL = "https://codeberg.org/api/v1";
const apiClient = axios.create({ baseURL });

// Array used to map response object to our data structure.
const map= {
    "archived": "archived",
    "created_at": "created_at",
    "description": "description",
    "fork": "forked",
    "forks_count": "forks",
    "full_name": "full_name",
    "website": "homepage",
    "html_url": "url",
    "is_template": "template",
    "language": "lang",
    "name": "name",
    "owner.login": "owner",
    "pushed_at": "last_push",
    "stars_count": "stars",
    "updated_at": "last_update",
} as ResponseKeyMapper;

const parseCodebergResponse = (data: ResponseData) => parseResponse(data, map);

const CodebergRepo: RepoProvider = {
    async getRepo(url: string): Promise<Repo> {
        const match = url.match(/codeberg.org\/([^/]+)\/([^/?#]+)/);
        if (match == null) {
            throw new Error("Codeberg repository URL is ill-formed.");
        }

        const userName = match[1];
        const repoName = match[2];
        let repo = {} as Repo;
        await apiClient
            .get(`/repos/${userName}/${repoName}`)
            .then((response: AxiosResponse) => {
                repo = parseCodebergResponse(response.data as ResponseData);
            });
        await apiClient
            .get(`/repos/${userName}/${repoName}/topics`)
            .then((response: AxiosResponse) => {
                repo.topics = response.data.topics as string[];
            });
        return repo;
    },

    async getUserStarredRepos(userName: string): Promise<Repo[]> {
        // ! WARNING: IT WON'T WORK WITHOUT AN AUTH TOKEN
        const repos = [] as Repo[];
        let data = [] as ResponseData[];
        let page = 1;
        const perPage = 100;
        const baseEndpoint = `/users/${userName}/starred?per_page=${perPage}`;
        let endpoint = "";

        // Due to Codeberg API's limit of 100 items per page, we need to fetch
        // data per page until there are no more pages.
        do {
            endpoint = `${baseEndpoint}&page=${page}`;
            await apiClient.get(endpoint).then((response: AxiosResponse) => {
                data = response.data as ResponseData[];
                repos.push(...data.map(parseCodebergResponse));
            });
            page += 1;
        } while (data.length == perPage);

        return repos;
    },
};

export default CodebergRepo;
