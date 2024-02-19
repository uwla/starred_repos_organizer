import axios, { AxiosResponse } from "axios";
import { ApiClient, Repo } from "../types";

const client = axios.create({ baseURL: "http://localhost:3000/repo" });

const restClient: ApiClient = {
    async fetchRepos() {
        let repos = [] as Repo[];
        await client.get("/").then((response: AxiosResponse) => {
            repos = response.data as Repo[];
            repos.reverse(); // reverse to get the most recent first
        });
        return repos;
    },
    async createRepo(repo: Repo) {
        let created = {} as Repo;
        await client.post("/", repo).then((response: AxiosResponse) => {
            created = response.data as Repo;
        });
        return created;
    },
    async createMany(repos: Repo[]) {
        let created = [] as Repo[];
        await client.post("/", repos).then((response: AxiosResponse) => {
            created = response.data as Repo[];
        });
        return created;
    },
    async updateRepo(repo: Repo) {
        let updated = {} as Repo;
        await client
            .post(`/${repo.id}`, repo)
            .then((response: AxiosResponse) => {
                updated = response.data as Repo;
            });
        return updated;
    },
    async deleteRepo(repo: Repo) {
        let responseStatus = false;
        await client
            .delete(`/${repo.id}`)
            .then(() => (responseStatus = true))
            .catch(() => (responseStatus = false));
        return responseStatus;
    },
};

export default restClient;
