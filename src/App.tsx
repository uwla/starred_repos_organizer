/* eslint-disable prefer-const */
import { useEffect, useState } from "react";
import { Container, CssBaseline, Stack } from "@mui/material";
import { MultiValue } from "react-select";
import axios, { AxiosResponse } from "axios";
import RepoItem from "./components/RepoItem";
import AddItem from "./components/AddItem";
import SearchFilter from "./components/SearchFilter";
import TopicsFilter from "./components/TopicsFilter";
import Pagination from "./components/Pagination";
import { Repo, RepoKey } from "./repo/Repo";
import "./App.css";

/* -------------------------------------------------------------------------- */
// types

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

/* -------------------------------------------------------------------------- */
// Main

function App() {
    // state
    const [repos, setRepos] = useState([] as Repo[]);
    const [topics, setTopics] = useState([] as string[]);
    const [selectedTopics, setSelectedTopics] = useState([] as SelectOption[]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredRepos, setFilteredRepos] = useState(repos);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        await axios
            .get("http://localhost:3000/repos")
            .then((response: AxiosResponse) => {
                const repos = response.data as Repo[];
                setRepos(repos);
                setFilteredRepos(repos);

                // for the topics, extra logic is necessary
                // 1. extract topics from repositories
                // 2. remove duplicates
                // 3. sort
                let topics = repos.map((item: Repo) => item.topics).flat();
                topics = [...new Set(topics)];
                topics.sort();
                setTopics(topics);
            });
    }

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

    async function handleAddItem(repo: Repo) {
        const newRepos =[repo, ...repos];
        setRepos(newRepos);
        setFilteredRepos(newRepos);
        setPage(0);
        setSearchQuery("");
        return true;
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
                <AddItem onAdd={handleAddItem} />
                <br />
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
export type { SelectOption };
