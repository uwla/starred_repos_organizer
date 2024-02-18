/* eslint-disable prefer-const */
import { FormEvent, useEffect, useState } from "react";
import { Button, Container, Form, Modal, Stack } from "react-bootstrap";
import { MultiValue } from "react-select";
import apiClient from "./Api";
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
    const [repoEditing, setRepoEditing] = useState({} as Repo);
    const [topicsEditing, setTopicsEditing] = useState([] as SelectOption[]);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        await apiClient.fetchRepos().then((repos: Repo[]) => {
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
        handleSelect([...selectedTopics, { label: topic, value: topic }]);
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

    function handleSelect(topics: SelectOption[]) {
        setSelectedTopics(topics);
        setPage(0);
        const plainTopics = getPlainTopics(topics);
        setFilteredRepos(applyFilters(repos, searchQuery, plainTopics));
    }

    async function handleAddItem(repo: Repo) {
        return await apiClient
            .createRepo(repo)
            .then((repo) => {
                const newRepos = [repo, ...repos];
                setRepos(newRepos);
                setFilteredRepos(newRepos);
                setPage(0);
                setSearchQuery("");
                return true;
            })
            .catch(() => {
                // TODO: handle error properly
                return false;
            });
    }

    async function handleAddMany(manyRepos: Repo[]) {
        return await apiClient
            .createMany(manyRepos)
            .then((created) => {
                const newRepos = [...created, ...repos];
                setRepos(newRepos);
                setFilteredRepos(newRepos);
                setPage(0);
                setSearchQuery("");
                return true;
            })
            .catch(() => {
                // TODO: handle error properly
                return false;
            });
    }

    async function handleDelete(repo: Repo) {
        await apiClient.deleteRepo(repo).then((status: boolean) => {
            if (status) {
                const filterDeleted = (r: Repo) => r.id != repo.id;
                setRepos(repos.filter(filterDeleted));
                setFilteredRepos(filteredRepos.filter(filterDeleted));
            } else {
                // TODO: handle failure
            }
        });
    }

    async function handleEdit(r: Repo) {
        setRepoEditing({ ...r });
        setTopicsEditing(r.topics.map((t: string) => ({ value: t, label: t })));
        setEditing(true);
    }

    async function handleUpdate() {
        const repo = { ...repoEditing };
        repo.topics = getPlainTopics(topicsEditing);
        await apiClient.updateRepo(repo).then((updated: Repo) => {
            // Update local repos.
            let index = repos.findIndex((r: Repo) => (r.id == updated.id));
            repos.splice(index, 1, updated);
            setRepos(repos);

            // Updated local filtered repos.
            index = filteredRepos.findIndex((r: Repo) => r.id == updated.id);
            filteredRepos.splice(index, 1, updated);
            setFilteredRepos(filteredRepos);

            // TODO: show success toaster
            setEditing(false);
        });
    }

    /* ---------------------------------------------------------------------- */
    // render logic
    return (
        <>
            <Container id="app">
                <h1>STARRED REPOS</h1>
                <SearchFilter onSubmit={handleSearch} />
                <br />
                <TopicsFilter
                    topics={topics}
                    selected={selectedTopics}
                    onSelect={(value: MultiValue<SelectOption>) =>
                        handleSelect(value as SelectOption[])
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
                <AddItem onAdd={handleAddItem} onAddMany={handleAddMany} />
                <br />
                <br />
                <Stack gap={3}>
                    {filteredRepos
                        .slice(page * perPage, (page + 1) * perPage)
                        .map((repo: Repo) => {
                            return (
                                <RepoItem
                                    key={repo.id}
                                    repo={repo}
                                    onTopicClick={handleTopicClicked}
                                    onDelete={() => handleDelete(repo)}
                                    onEdit={() => handleEdit(repo)}
                                />
                            );
                        })}
                </Stack>
                <Modal
                    size="lg"
                    show={editing}
                    onHide={() => setEditing(false)}
                >
                    <Modal.Header>
                        <Modal.Title>EDIT REPO</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form
                            id="edit-repo"
                            onSubmit={(e: FormEvent<HTMLFormElement>) => {
                                e.preventDefault();
                                handleUpdate();
                            }}
                        >
                            <Form.Group controlId="edit-repo-name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={repoEditing.name}
                                />
                            </Form.Group>
                            <Form.Group controlId="edit-repo-url">
                                <Form.Label>URL</Form.Label>
                                <Form.Control
                                    type="url"
                                    defaultValue={repoEditing.html_url}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Topics</Form.Label>
                                <TopicsFilter
                                    topics={topics}
                                    selected={topicsEditing}
                                    onSelect={(val: MultiValue<SelectOption>) =>
                                        setTopicsEditing(val as SelectOption[])
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="danger"
                            onClick={() => setEditing(false)}
                        >
                            CANCEL
                        </Button>
                        <Button
                            variant="primary"
                            form="edit-repo"
                            type="submit"
                        >
                            UPDATE
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
}

export default App;
export type { SelectOption };
