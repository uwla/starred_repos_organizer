import { ApiClient, Repo } from "../types";
import { assignId, uniqueRepos } from "../utils";
import sampleData from "../../user-data-sample.json";

const getRepos = () =>
    JSON.parse(localStorage.getItem("repos") || "[]") as Repo[];

const setRepos = (repos: Repo[]) =>
    localStorage.setItem("repos", JSON.stringify(repos));

const isDemo = process.env.NODE_ENV === "demo";
const firstTimeAccess = localStorage.getItem("repos") === null;

const localStorageClient: ApiClient = {
    async fetchRepos() {
        // DEMO MODE: load sample data for demo app.
        if (isDemo && firstTimeAccess) {
            setRepos(sampleData.repo as Repo[]);
        }

        return getRepos();
    },
    async createRepo(repo: Repo) {
        const repos = getRepos();
        repos.unshift(assignId(repo));
        setRepos(repos)
        return repo;
    },
    async createMany(repos: Repo[]) {
        const newRepos = uniqueRepos([...repos, ...getRepos()]).map(assignId);
        setRepos(newRepos);
        return repos;
    },
    async updateRepo(repo: Repo) {
        const repos = getRepos();
        const index = repos.findIndex((r: Repo) => r.html_url = repo.html_url);
        if (index === -1)
            throw Error("Repo does not exist yet.");
        repos.splice(index, 1, repo);
        setRepos(repos);
        return repo;
    },
    async deleteRepo(repo: Repo) {
        const repos = getRepos();
        const index = repos.findIndex((r: Repo) => r.html_url = repo.html_url);
        if (index === -1)
            return false
        repos.splice(index, 1);
        setRepos(repos);
        return true;
    },
};

export default localStorageClient;
