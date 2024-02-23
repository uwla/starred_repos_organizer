import { Repo, ResponseData, ResponseKeyMapper, SelectOption } from "./types";

const optionsToTopics = (topics: SelectOption[]): string[] =>
    topics.map((topic: SelectOption) => topic.value);

const topicsToOptions = (topics: string[]): SelectOption[] =>
    topics.map((topic: string) => ({ value: topic, label: topic }));

const uniqueRepos = (repos: Repo[]): Repo[] => {
    let unique = [...repos] as Repo[];

    // Extract URLs to detect duplicate repositories.
    const urls = {} as { [key: string]: boolean };
    unique.forEach((r: Repo) => (urls[r.html_url as string] = false));

    // Reverse order so the most recently added repos will prevail.
    unique.reverse();

    // Prevent duplicated repos by applying a URL filter.
    unique = unique.filter((r: Repo) => {
        const url = r.html_url;
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

const parseResponse = (data: ResponseData, map: ResponseKeyMapper): Repo => {
    const repo = {} as Repo;
    for (const key in map) {
        let val: never = data[key];

        if (key.includes(".")) {
            val = data as never;
            for (const k of key.split(".")) {
                val = val[k];
                if (val == null) break;
            }
        }

        repo[map[key]] = val as never;
    }
    return repo;
};

export {
    assignId,
    optionsToTopics,
    parseResponse,
    randomId,
    topicsToOptions,
    uniqueRepos,
};
