import { Repo, SelectOption } from "./types";

const optionsToTopics = (topics: SelectOption[]): string[] =>
    topics.map((topic: SelectOption) => topic.value);

const topicsToOptions = (topics: string[]): SelectOption[] =>
    topics.map((topic: string) => ({ value: topic, label: topic }));

const uniqueRepos = (repos: Repo[]): Repo[] => {
    let unique = [...repos] as Repo[];

    // Extract URLs to detect duplicate repositories.
    const urls = {} as { [key: string]: boolean };
    unique.forEach((r: Repo) => (urls[r.url as string] = false));

    // Reverse order so the most recently added repos will prevail.
    unique.reverse();

    // Prevent duplicated repos by applying a URL filter.
    unique = unique.filter((r: Repo) => {
        const url = r.url;
        if (urls[url] == true) return false;
        urls[url] = true;
        return true;
    });

    // Re-reverse to cancel the first reverse.
    unique.reverse();

    // Return result.
    return unique;
};

const randomId = () => Math.random().toString().slice(2, 8);

const assignId = (repo: Repo) => ({ ...repo, id: randomId() });

const extractDomain = (url: string) =>
    url.replace(/(https?:\/\/)?([\w\d.]+\.[\w\d]+)\/?.*/, "$2");

const addRepo = (repos: Repo[], repo: Repo) => uniqueRepos([...repos, repo]);

const addRepos = (repos: Repo[], reposToAdd: Repo[]) =>
    uniqueRepos([...repos, ...reposToAdd]);

const updateRepo = (repos: Repo[], repo: Repo) => {
    const index = repos.findIndex((r: Repo) => r.id === repo.id);
    if (index === -1) throw new Error("[UTILS] repo does not exist");
    repos.splice(index, 1, repo);
    return uniqueRepos(repos);
};

const updateRepos = (repos: Repo[], reposToUpdate: Repo[]) => {
    const id2repo = {} as { [key: string]: Repo };

    reposToUpdate.forEach((r: Repo) => {
        id2repo[r.id] = r;
    });

    repos.forEach((repo: Repo, index: number) => {
        const { id } = repo;
        if (id2repo[id] !== undefined) {
            repos[index] = id2repo[id];
        }
    });

    return uniqueRepos(repos);
};

const delRepo = (repos: Repo[], repo: Repo | string) => {
    const id = typeof repo === "string" ? (repo as string) : (repo as Repo).id;
    return repos.filter((r: Repo) => r.id !== id);
};

const delRepos = (repos: Repo[], reposToDel: Repo[] | string[]) => {
    if (reposToDel.length < 0) return repos;
    const ids = {} as { [key: string]: boolean };
    const idsToDel =
        typeof reposToDel[0] === "string"
            ? (reposToDel as string[])
            : (reposToDel as Repo[]).map((r) => r.id);
    idsToDel.forEach((id: string) => (ids[id] = true));
    return repos.filter((r: Repo) => !ids[r.id]);
};

export {
    addRepo,
    addRepos,
    delRepo,
    delRepos,
    updateRepo,
    updateRepos,
    assignId,
    extractDomain,
    optionsToTopics,
    randomId,
    topicsToOptions,
    uniqueRepos,
};
