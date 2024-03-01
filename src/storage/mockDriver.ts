import { StorageDriver, Repo } from "../types";
import data from "../../user-data-sample.json";

const repos = data.repo as Repo[];

const mockDriver: StorageDriver = {
    async fetchRepos() {
        return repos;
    },
    async createRepo(repo: Repo) {
        return repo;
    },
    async createMany(repos: Repo[]) {
        return repos;
    },
    async updateRepo(repo: Repo) {
        return repo;
    },
    async updateMany(repos: Repo[]) {
        return repos;
    },
    async deleteRepo(_: Repo) {
        return true;
    },
    async deleteMany(_: Repo[]) {
        return true;
    },
};

export default mockDriver;
