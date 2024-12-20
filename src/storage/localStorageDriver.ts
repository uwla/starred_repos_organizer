import { StorageDriver, Repo } from "../types";
import {
    addRepo,
    addRepos,
    assignId,
    delRepo,
    delRepos,
    updateRepo,
    updateRepos,
    keepOnlyRepoTopics,
} from "../utils";
import sampleData from "../../user-data-sample.json";

const getAllowedTopics = () => {
    return JSON.parse(localStorage.getItem("allowed_topics") || "[]");
}

const setAllowedTopics = (topics: string[]) => {
    localStorage.setItem('allowed_topics', JSON.stringify(topics));
}

const filterRepoTopics = (repos: Repo[]) => {
    const allowedTopics = getAllowedTopics();
    if (allowedTopics.length == 0) {
        return repos;
    }
    return keepOnlyRepoTopics(repos, allowedTopics);
}

const getRepos = () =>
    JSON.parse(localStorage.getItem("repos") || "[]") as Repo[];

const setRepos = (repos: Repo[]) => {
    const filteredRepos = filterRepoTopics(repos);
    localStorage.setItem("repos", JSON.stringify(filteredRepos));
}

const isDemo = process.env.NODE_ENV === "demo";
let firstTimeAccess = localStorage.getItem("repos") === null;

const localStorageDriver: StorageDriver = {
    async fetchRepos() {
        // DEMO MODE: load sample data for demo app.
        if (isDemo && firstTimeAccess) {
            setRepos(sampleData.repo as Repo[]);
            firstTimeAccess = false;
        }
        return getRepos();
    },
    async createRepo(repo: Repo) {
        const created = assignId(repo);
        setRepos(addRepo(getRepos(), created));
        return created;
    },
    async createMany(repos: Repo[]) {
        const created = repos.map(assignId);
        setRepos(addRepos(getRepos(), created));
        return created;
    },
    async updateRepo(repo: Repo) {
        setRepos(updateRepo(getRepos(), repo));
        return repo;
    },
    async updateMany(repos: Repo[]) {
        setRepos(updateRepos(getRepos(), repos));
        return repos;
    },
    async deleteRepo(repo: Repo) {
        const oldRepos = getRepos();
        const newRepos = delRepo(oldRepos, repo);
        setRepos(newRepos);
        return oldRepos.length > newRepos.length;
    },
    async deleteMany(repos: Repo[]) {
        const oldRepos = getRepos();
        const newRepos = delRepos(oldRepos, repos);
        setRepos(newRepos);
        return oldRepos.length > newRepos.length;
    },
    async setAllowedTopics(topics: string[]) {
        setAllowedTopics(topics);
        return true
    },
    async getAllowedTopics() {
        return getAllowedTopics();
    },
};

export default localStorageDriver;
