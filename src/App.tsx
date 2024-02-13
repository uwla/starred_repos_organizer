/* eslint-disable prefer-const */
import { useState } from "react";
import { Container, Stack } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import RepoItem from "./components/RepoItem";
import SearchFilter from "./components/SearchFilter";
import TopicsFilter from "./components/TopicsFilter";
import Pagination from "./components/Pagination";
import data from "./assets/data/sample_stars_github.json";
import "./App.css";
import { MultiValue } from "react-select";

/* -------------------------------------------------------------------------- */
// types

type Repo = {
    full_name: string;
    name: string;
    description: string;
    topics: Array<string>;
    html_url: string;
    homepage: string;
    lang: string;
    created: string;
    last_push: string;
    last_update: string;
    forked: boolean;
    archived: boolean;
    template: boolean;
    owner: string;
    owner_url: string;
    owner_img: string;
    owner_type: string;
    stars: number;
};

type RepoKey = keyof Repo;

type SelectOption = {
    label: string;
    value: string;
};

/* -------------------------------------------------------------------------- */
// Utilities

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
    return repos.filter((repo: Repo) => {
        return topics.every((topic: string) => repo.topics.includes(topic));
    });
}

function applyFilters(repos: Repo[], search: string, topics: string[]) {
    return filterByTopics(filterBySearch(repos, search), topics);
}

function getTopics() {
    // get the topics
    let topics = (data as Repo[]).map((item: Repo) => item.topics).flat();

    // sort
    topics.sort();

    // remove duplicates
    topics = [...new Set(topics)];

    return topics;
}

/* -------------------------------------------------------------------------- */
// Main

// data constants
const repos = data as Repo[];
const topics = getTopics();

function App() {
    // state
    const [selectedTopics, setSelectedTopics] = useState([] as SelectOption[]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredRepos, setFilteredRepos] = useState(repos);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(0);

    /* ---------------------------------------------------------------------- */
    // internal handlers

    const getPlainTopics = (topics: SelectOption[]): string[] =>
        topics.map((topic: SelectOption) => topic.value);

    function handleTopicClicked(topic: string) {
        const plainTopics = getPlainTopics(selectedTopics);
        if (plainTopics.includes(topic)) return;
        setSelectedTopics([...selectedTopics, { label: topic, value: topic }]);
    }

    function handlePageChange(page: number) {
        setPage(page);
    }

    function handlePerPageChange(perPage: number) {
        setPage(0);
        setPerPage(perPage);
    }

    function handleSearch(text: string) {
        setSearchQuery(text);
        setFilteredRepos(
            applyFilters(repos, text, getPlainTopics(selectedTopics))
        );
    }

    function handleSelect(topics: string[]) {
        setPage(0);
        setFilteredRepos(applyFilters(repos, searchQuery, topics));
    }

    /* ---------------------------------------------------------------------- */
    // render logic
    return (
        <>
            <CssBaseline />
            <Container maxWidth="md" id="app">
                <h1>STARRED REPOS</h1>
                <SearchFilter onSubmit={handleSearch} />
                <br />
                <TopicsFilter
                    topics={topics}
                    selected={selectedTopics}
                    onSubmit={handleSelect}
                    onSelect={(value: MultiValue<SelectOption>) =>
                        setSelectedTopics(value as SelectOption[])
                    }
                />
                <br />
                {searchQuery && <p>Search results for "{searchQuery}"</p>}
                <Pagination
                    page={page}
                    count={filteredRepos.length}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
                <br />
                <Stack spacing={3}>
                    {filteredRepos
                        .slice(page * perPage, (page + 1) * perPage)
                        .map((repo: Repo) => {
                            return (
                                <RepoItem
                                    repo={repo}
                                    onTopicClick={handleTopicClicked}
                                    key={repo.full_name}
                                />
                            );
                        })}
                </Stack>
            </Container>
        </>
    );
}

export default App;
export type { Repo, SelectOption };
