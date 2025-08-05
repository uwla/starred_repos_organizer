import axios, { AxiosResponse } from "axios";
import type { StorageDriver, Repo, Topic, TopicAliases } from "../types";

const client = axios.create({ baseURL: "http://localhost:3000/" });

const restApiDriver: StorageDriver = {
    async fetchRepos() {
        return client
            .get("/repo")
            .then((response: AxiosResponse) => response.data as Repo[]);
    },
    async createRepo(repo: Repo) {
        return client
            .post("/repo", repo)
            .then((response: AxiosResponse) => response.data as Repo);
    },
    async createMany(repos: Repo[]) {
        return client
            .post("/repos", repos)
            .then((response: AxiosResponse) => response.data as Repo[]);
    },
    async updateRepo(repo: Repo) {
        return client
            .post(`/repo/${repo.id}`, repo)
            .then((response: AxiosResponse) => response.data as Repo);
    },
    async updateMany(repos: Repo[]) {
        return client
            .put('/repos', repos)
            .then((response: AxiosResponse) => response.data as Repo[]);
    },
    async deleteRepo(repo: Repo) {
        let responseStatus = false;
        await client
            .delete(`/repo/${repo.id}`)
            .then(() => (responseStatus = true))
            .catch(() => (responseStatus = false));
        return responseStatus;
    },
    async deleteMany(repos: Repo[]) {
        const ids = repos.map((r: Repo) => r.id);
        let responseStatus = false;
        await client
            .post('/repos', { _method: 'delete', ids })
            .then(() => (responseStatus = true))
            .catch(() => (responseStatus = false));
        return responseStatus;
    },
    async getAllowedTopics() {
        const topics = (await client.get('/topics/allowed')).data
        return topics as string[]
    },
    async setAllowedTopics(topics: Topic[]) {
        let responseStatus = false
        await client
            .post('/topics/allowed', { topics })
            .then(() => responseStatus = true)
            .catch(() => responseStatus = false)
        return responseStatus
    },
    async getTopicAliases() {
        const aliases = (await client.get('/topics/aliases')).data
        return aliases as TopicAliases
    },
    async setTopicAliases(aliases: TopicAliases) {
        let responseStatus = false
        await client
            .post('/topics/aliases', { topics: aliases })
            .then(() => responseStatus = true)
            .catch(() => responseStatus = false)
        return responseStatus
    }
};

export default restApiDriver;
