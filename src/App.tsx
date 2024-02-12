/* eslint-disable prefer-const */
import { useState } from "react";
import { Container, Stack } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import RepoItem from "./components/RepoItem";
import SearchFilter from "./components/SearchFilter";
import Pagination from "./components/Pagination";
import data from "./assets/data/sample_stars_github.json";
import "./App.css";

export interface Repo {
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
}

function filterRepo(repo: Repo, normalizedQuery: string) {
    const searchableKeys = [
        "full_name",
        "description",
        "topics",
        "lang",
    ] as string[];

    for (const key of searchableKeys) {
        const field = (repo as any)[key];
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

function filterRepos(repos: Repo[], search: string) {
    if (search == "") return repos;
    const normalizedQuery = search.toLowerCase();
    return repos.filter((repo: Repo) => filterRepo(repo, normalizedQuery));
}

function App() {
    const repos = data as Repo[];

    let [searchQuery, setSearchQuery] = useState("");
    let [filteredRepos, setFilteredRepos] = useState(
        filterRepos(repos, searchQuery)
    );

    let [reposPerPage, setReposPerPage] = useState(10);
    let [page, setPage] = useState(0);
    let visibleRepos = filteredRepos.slice(page, 10);
    let initialCards = visibleRepos.map((r: Repo) => (
        <RepoItem key={r.full_name} {...r} />
    ));
    let [cards, setCards] = useState(initialCards);

    function handlePageChange(page: number) {
        setPage(page);
        const start = page * reposPerPage;
        const end = start + reposPerPage;
        visibleRepos = filteredRepos.slice(start, end);
        setCards(
            visibleRepos.map((r: Repo) => <RepoItem key={r.full_name} {...r} />)
        );
    }

    function handlePerPageChange(perPage: number) {
        let page = 0;
        setPage(page);
        setReposPerPage(perPage);
        const start = page * reposPerPage;
        const end = start + reposPerPage;
        visibleRepos = filteredRepos.slice(start, end);
        setCards(
            visibleRepos.map((r: Repo) => <RepoItem key={r.full_name} {...r} />)
        );
    }

    function handleSearch(text: string) {
        setSearchQuery(text);
        filteredRepos = filterRepos(repos, text);
        setFilteredRepos(filteredRepos);
        page = 0;
        setPage(0);
        const start = page * reposPerPage;
        const end = start + reposPerPage;
        visibleRepos = filteredRepos.slice(start, end);
        cards = visibleRepos.map((r: Repo) => (
            <RepoItem key={r.full_name} {...r} />
        ));
        setCards(cards);
    }

    return (
        <>
            <CssBaseline />
            <Container maxWidth="md" id="app">
                <h1>STARRED REPOS</h1>
                <SearchFilter onSubmit={handleSearch} />
                {searchQuery && <p>Search results for "{searchQuery}"</p>}
                <Pagination
                    page={page}
                    count={filteredRepos.length}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
                <br />
                <Stack spacing={3}>{cards}</Stack>
            </Container>
        </>
    );
}

export default App;
