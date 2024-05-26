import { Repo, RepoKey, SelectOption } from "./types";

const optionsToTopics = (topics: SelectOption[]): string[] =>
    topics.map((topic: SelectOption) => topic.value);

const topicsToOptions = (topics: string[]): SelectOption[] =>
    topics.map((topic: string) => ({ value: topic, label: topic }));

const extractTopics = (repos: Repo[]): string[] => {
    let topics = repos.map((item: Repo) => item.topics).flat();
    topics = [...new Set(topics)];
    topics.sort();
    return topics;
}
const uniqueRepos = (repos: Repo[]): Repo[] => {
    let unique = [] as Repo[];
    const urls = {} as { [key: string]: number };

    // Prevent duplicated repos by applying a URL filter.
    repos.forEach((r: Repo) => {
        const url = r.url;
        if (urls[url] === undefined) {
            urls[url] = unique.length;
            unique.push(r);
            return;
        }
        const ind = urls[url];

        // preserve locally modified attributes
        if (unique[ind].modified) {
            r.topics = unique[ind].topics;
            r.id = unique[ind].id;
        }
        unique[ind] = r;
    });

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

/* -------------------------------------------------------------------------- */
// filter
function filterRepo(repo: Repo, normalizedQuery: string) {
    const searchableKeys = [
        "full_name",
        "description",
        "topics",
        "lang",
    ] as RepoKey[];

    for (const key of searchableKeys) {
        const field = repo[key];
        let hasMatch = false;

        // Search string field by checking if the value includes the query.
        if (typeof field === "string") {
            hasMatch = field.toLowerCase().includes(normalizedQuery);
        }

        // Search array field by checking if any value includes the query.
        if (Array.isArray(field)) {
            hasMatch = field.some((val: string) =>
                val.toLowerCase().includes(normalizedQuery)
            );
        }

        if (hasMatch) return true;
    }
    return false;
}

function filterBySearch(repos: Repo[], search: string) {
    if (search == "") return repos;
    const normalizedQuery = search.toLowerCase();
    return repos.filter((repo: Repo) => filterRepo(repo, normalizedQuery));
}

function filterByTopics(repos: Repo[], topics: string[]) {
    if (topics.length == 0) return repos;

    // whether we want repos without topics
    const emptyTopics = topics[0] === "-- none --";

    return repos.filter((repo: Repo) => {
        // if we want empty topics, filter the repo which has no topic
        if (emptyTopics) {
            return repo.topics.length === 0;
        }

        return topics.every((topic: string) => repo.topics.includes(topic));
    });
}

function applyFilters(repos: Repo[], search: string, topics: string[]) {
    return filterByTopics(filterBySearch(repos, search), topics);
}

export {
    addRepo,
    addRepos,
    delRepo,
    delRepos,
    updateRepo,
    updateRepos,
    applyFilters,
    assignId,
    extractDomain,
    optionsToTopics,
    randomId,
    topicsToOptions,
    uniqueRepos,
    extractTopics
};
