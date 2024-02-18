import { SelectOption } from "./types";

export const optionsToTopics = (topics: SelectOption[]): string[] =>
    topics.map((topic: SelectOption) => topic.value);

export const topicsToOptions = (topics: string[]): SelectOption[] =>
    topics.map((topic: string) => ({ value: topic, label: topic }));
