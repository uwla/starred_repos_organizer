import {  Container, Stack } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import RepoItem from "./components/RepoItem";
import SearchFilter from "./components/SearchFilter";
import data from "./assets/data/sample_stars_github.json";
import "./App.css";
import { useState } from "react";

export interface StarredRepo {
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

function App() {
    const repos = data as StarredRepo[];

    let [searchQuery, setSearchQuery] = useState("");

    let filteredRepos = repos;
    if (searchQuery != "") {
        let normalizedQuery = searchQuery.toLowerCase();
        filteredRepos = repos.filter((repo: any) => {
            let searchableKeys = [
                "full_name",
                "description",
                "topics",
                "lang",
            ] as string[];

            for (let key of searchableKeys) {
                let hasMatch = false;
                let val = repo[key];

                // Search string field by checking if the value includes the query.
                if (typeof val === "string") {
                    hasMatch = val.toLowerCase().includes(normalizedQuery);
                }

                // Search array field by checking if any value includes the query.
                if (Array.isArray(repo[key])) {
                    hasMatch = val.some((val: string) =>
                        val.toLowerCase().includes(normalizedQuery)
                    );
                }

                if (hasMatch) return true;
            }
            return false;
        });
    }

    const cards = filteredRepos.map((repo: StarredRepo) => {
        return <RepoItem {...repo} />;
    });

    return (
        <>
            <CssBaseline />
            <Container maxWidth="md" id="app">
                <h1>STARRED REPOS</h1>
                <SearchFilter onSubmit={setSearchQuery} />
                {searchQuery && <p>Search results for "{searchQuery}"</p>}
                <br />
                <Stack spacing={3}>{cards}</Stack>
            </Container>
        </>
    );
}

export default App;
