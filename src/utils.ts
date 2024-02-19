import { Repo, ResponseData, ResponseKeyMapper, SelectOption } from "./types";

const optionsToTopics = (topics: SelectOption[]): string[] =>
    topics.map((topic: SelectOption) => topic.value);

const topicsToOptions = (topics: string[]): SelectOption[] =>
    topics.map((topic: string) => ({ value: topic, label: topic }));

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

export { parseResponse, optionsToTopics, topicsToOptions };
