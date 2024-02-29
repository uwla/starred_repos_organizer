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

export {
    assignId,
    optionsToTopics,
    randomId,
    topicsToOptions,
    uniqueRepos,
};
