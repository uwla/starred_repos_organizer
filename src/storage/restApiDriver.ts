import axios, { AxiosResponse } from "axios";
import { StorageDriver, Repo } from "../types";

const client = axios.create({ baseURL: "http://localhost:3000/repo" });

const restApiDriver: StorageDriver = {
    async fetchRepos() {
        return client
            .get("/")
            .then((response: AxiosResponse) => response.data as Repo[]);
    },
    async createRepo(repo: Repo) {
        return client
            .post("/", repo)
            .then((response: AxiosResponse) => response.data as Repo);
    },
    async createMany(repos: Repo[]) {
        return client
            .post("/", repos)
            .then((response: AxiosResponse) => response.data as Repo[]);
    },
    async updateRepo(repo: Repo) {
        return client
            .post(`/${repo.id}`, repo)
            .then((response: AxiosResponse) => response.data as Repo);
    },
    async updateMany(repos: Repo[]) {
        return client
            .post(`/`, { repos, _method: "PUT" })
            .then((response: AxiosResponse) => response.data as Repo[]);
    },
    async deleteRepo(repo: Repo) {
        let responseStatus = false;
        await client
            .delete(`/${repo.id}`)
            .then(() => (responseStatus = true))
            .catch(() => (responseStatus = false));
        return responseStatus;
    },
    async deleteMany(repos: Repo[]) {
        const ids = repos.map((r: Repo) => r.id);
        let responseStatus = false;
        await client
            .post("/", { _method: "delete", ids })
            .then(() => (responseStatus = true))
            .catch(() => (responseStatus = false));
        return responseStatus;
    },
};

export default restApiDriver;
