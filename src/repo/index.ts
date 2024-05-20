import { Repo, RepoProvider } from "../types";
import GiteaRepo from "./GiteaRepo";
import GitHubRepo from "./GitHubRepo";
import GitLabRepo from "./GitLabRepo";

const GitHub = new GitHubRepo();
const GitLab = new GitLabRepo();
const Gitea = new GiteaRepo();
const CodeBerg = new GiteaRepo("codeberg.org");
CodeBerg.providerSlug = "codeberg";
const providers = [CodeBerg, GitHub, GitLab, Gitea] as RepoProvider[];

const repoProvider = {
    determineProvider(url: string): RepoProvider {
        for (const provider of providers) {
            if (provider.matchURL(url)) return provider;
        }
        throw new Error("provider not found");
    },

    addProvider(provider: RepoProvider) {
        providers.push(provider);
    },

    isUserProfileUrl(url: string) {
        // User profile URL has the format <PROTOCOL>://<DOMAIN>/USER
        // 1. Remove the protocol, which may be empty.
        // 2. Split the remaining URL using the path separator.
        // 3. It is user account if array has only two items (DOMAIN and USER).
        return (
            url
                .replace(/https?:\/\//, "")
                .replace(/\/$/, "")
                .split("/").length === 2
        );
    },

    sanitizeUrl(url: string) {
        return url.replace(/\/$/, "");
    },

    async getRepo(
        url: string,
        provider: RepoProvider | null = null
    ): Promise<Repo> {
        url = repoProvider.sanitizeUrl(url);
        if (provider === null) provider = repoProvider.determineProvider(url);
        return provider.getRepo(url);
    },

    async getUserStarredRepos(
        url: string,
        provider: RepoProvider
    ): Promise<Repo[]> {
        url = repoProvider.sanitizeUrl(url);
        const userName = url.replace(/.*\//, "");
        return provider.getUserStarredRepos(userName);
    },
};

export default repoProvider;
export { GitHubRepo, GiteaRepo, GitLabRepo };
