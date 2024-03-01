import { Repo, RepoProvider } from "../types";
import GiteaRepo from "./GiteaRepo";
import GitHubRepo from "./GitHubRepo";
import GitLabRepo from "./GitLabRepo";

const providers = [
    // new GiteaRepo("codeberg.org"), // codeberg
    new GitHubRepo(),
    new GitLabRepo(),
] as RepoProvider[];

const RepoProvider = {
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

    async getRepo(url: string, provider: RepoProvider | null): Promise<Repo> {
        url = RepoProvider.sanitizeUrl(url);
        if (provider === null) provider = RepoProvider.determineProvider(url);
        return provider.getRepo(url);
    },

    async getUserStarredRepos(
        url: string,
        provider: RepoProvider
    ): Promise<Repo[]> {
        url = RepoProvider.sanitizeUrl(url);
        const userName = url.replace(/.*\//, "");
        return provider.getUserStarredRepos(userName);
    },
};

export default RepoProvider;
export { GitHubRepo, GiteaRepo, GitLabRepo };
