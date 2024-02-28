import {
    Alert,
    Button,
    Container,
    Stack,
    Toast,
    ToastContainer,
} from "react-bootstrap";
import {
    Close as CloseIcon,
    GitHub as GitHubIcon,
    Undo as UndoIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { MultiValue } from "react-select";
import {
    Menu,
    Pagination,
    RepoAdd,
    RepoCard,
    RepoEdit,
    RepoSelect,
    SearchFilter,
    SortOptions,
    TopicFilter,
} from "./components";
import { optionsToTopics } from "./utils";
import { Repo, RepoKey, SelectOption } from "./types";
import storageDriver from "./storage";
import "./App.css";
import RepoProvider from "./repo";

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

function extractTopics(repos: Repo[]): string[] {
    let topics = repos.map((item: Repo) => item.topics).flat();
    topics = [...new Set(topics)];
    topics.sort();
    return topics;
}

/* -------------------------------------------------------------------------- */
// Main

const shouldShowDemoMsg =
    process.env.NODE_ENV == "demo" && localStorage.getItem("repos") == null;

function App() {
    // state
    const [deletedRepos, setDeletedRepos] = useState([] as Repo[]);
    const [editing, setEditing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [filteredRepos, setFilteredRepos] = useState([] as Repo[]);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [repoEditing, setRepoEditing] = useState({} as Repo);
    const [repos, setRepos] = useState([] as Repo[]);
    const [reposToAdd, setReposToAdd] = useState([] as Repo[]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([] as SelectOption[]);
    const [showDemoMsg, setShowDemoMsg] = useState(shouldShowDemoMsg);
    const [topics, setTopics] = useState([] as string[]);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        await storageDriver.fetchRepos().then((repos: Repo[]) => {
            // Assign index to each repo so they can be sorted to the default
            // order later on.
            repos.forEach((repo: Repo, index: number) => (repo.index = index));

            // After assigning the indexes, we can safely update the state.
            setRepos(repos);

            // Update topics.
            setTopics(extractTopics(repos));

            // reset search filters
            setFilteredRepos(repos);
            setSelectedTopics([]);
            setSearchQuery("");
            setPage(0);
        });
    }

    /* ---------------------------------------------------------------------- */
    // internal handlers

    function handlePageChange(page: number) {
        setPage(page);
    }

    function handlePerPageChange(perPage: number) {
        setPage(0);
        setPerPage(perPage);
    }

    function handleSearch(text: string) {
        setSearchQuery(text);
        setPage(0);
        const plainTopics = optionsToTopics(selectedTopics);
        setFilteredRepos(applyFilters(repos, text, plainTopics));
    }

    function handleSelect(topics: SelectOption[]) {
        setSelectedTopics(topics);
        setPage(0);
        const plainTopics = optionsToTopics(topics);
        setFilteredRepos(applyFilters(repos, searchQuery, plainTopics));
    }

    function handleTopicClicked(topic: string) {
        const plainTopics = optionsToTopics(selectedTopics);
        if (plainTopics.includes(topic)) return;
        handleSelect([...selectedTopics, { label: topic, value: topic }]);
    }

    function handleSort(value: string) {
        let cmp: (a: Repo, b: Repo) => number;
        switch (value) {
            case "":
                cmp = (a: Repo, b: Repo) => a.index - b.index;
                break;
            case "stars":
                cmp = (a: Repo, b: Repo) => b.stars - a.stars;
                break;
            case "name":
                cmp = (a: Repo, b: Repo) => a.name.localeCompare(b.name);
                break;
            default:
                throw Error("unknown sort option");
        }

        // Both repository arrays need to be sorted.
        // The filtered repos needs to be sorted because data its content is
        // rendered after basic pagination. It is also necessary the repos to be
        // sorted because the filteredRepos is updated based on it.
        setRepos([...repos].sort(cmp));
        setFilteredRepos([...filteredRepos].sort(cmp));
    }

    function updateRepos(newRepos: Repo[]) {
        setRepos(newRepos);
        setFilteredRepos(newRepos);
        setTopics(extractTopics(newRepos));
        setPage(0);
        setSearchQuery("");
    }

    async function handleAddItem(repo: Repo) {
        if (repos.find((r: Repo) => r.url === repo.url)) {
            setErrorMsg("Repo already added!");
            return false;
        }

        return await storageDriver
            .createRepo(repo)
            .then((repo) => {
                updateRepos([repo, ...repos]);
                return true;
            })
            .catch(() => {
                setErrorMsg("Failed to add repository [Server error]");
                return false;
            });
    }

    async function confirmAddMany(manyRepos: Repo[]) {
        setReposToAdd(manyRepos);
        return true;
    }

    async function handleAddMany(manyRepos: Repo[]) {
        if (manyRepos.length === 0) {
            setReposToAdd([]);
            return;
        }

        return await storageDriver
            .createMany(manyRepos)
            .then((created) => {
                updateRepos([...created, ...repos]);
                return true;
            })
            .catch(() => {
                setErrorMsg("Failed to add repositories [Server error]");
                return false;
            })
            .finally(() => setReposToAdd([]));
    }

    async function handleDelete(repo: Repo) {
        await storageDriver.deleteRepo(repo).then((status: boolean) => {
            if (status) {
                // Update local state.
                const filterDeleted = (r: Repo) => r.id != repo.id;
                const newRepos = repos.filter(filterDeleted);
                setRepos(newRepos);
                setFilteredRepos(filteredRepos.filter(filterDeleted));
                setTopics(extractTopics(newRepos));

                // Cache deleted repos for undo actions.
                deletedRepos.push(repo);
                setDeletedRepos(deletedRepos);
            } else {
                setErrorMsg("Failed to delete repository [Server error]");
            }
        });
    }

    async function handleDeleteMany(repos: Repo[]) {
        await storageDriver.deleteMany(repos).then(fetchData);
    }

    function closeUndoDeleteToast(repo: Repo) {
        setDeletedRepos(deletedRepos.filter((r: Repo) => r.id !== repo.id));
    }

    async function handleUndoDeleted(repo: Repo) {
        closeUndoDeleteToast(repo);
        handleAddItem(repo);
    }

    function handleEdit(r: Repo) {
        setRepoEditing(r);
        setEditing(true);
    }

    async function handleUpdate(repo: Repo) {
        return storageDriver
            .updateRepo(repo)
            .then((updated: Repo) => {
                // Update local repos.
                let index = repos.findIndex((r: Repo) => r.id === updated.id);
                repos.splice(index, 1, updated);
                setRepos([...repos]);

                // Updated local filtered repos.
                index = filteredRepos.findIndex(
                    (r: Repo) => r.id === updated.id
                );
                filteredRepos.splice(index, 1, updated);
                setFilteredRepos([...filteredRepos]);

                // Update topics.
                setTopics(extractTopics(repos));

                // Finish editing
                setEditing(false);

                // indicates updated was successful
                return true;
            })
            .catch(() => {
                setErrorMsg("Failed to updated repository [Server error]");
                return false;
            });
    }

    async function handleRefresh(repo: Repo) {
        // Get the updated version of the repository.
        const updated = await RepoProvider.getRepo(repo.url)

        // Preserve the topics, which may have been overwritten locally.
        updated.topics = repo.topics;

        // Also, we want to make sure the id was not overwritten.
        updated.id = repo.id;

        // Then, update it.
        handleUpdate(updated);
    }

    /* ---------------------------------------------------------------------- */
    // render logic

    return (
        <>
            <Alert
                id="demo-msg"
                variant="warning"
                show={showDemoMsg}
                onClose={() => setShowDemoMsg(false)}
                dismissible
            >
                This app is running on demo mode. Sample data has been loaded.
                Data is saved to local storage and can be exported/imported.
            </Alert>
            <Container id="app">
                <Menu
                    repos={repos}
                    filtered={filteredRepos}
                    onImport={confirmAddMany}
                    onDelete={handleDeleteMany}
                />
                <h1>STARRED REPOS</h1>
                <SearchFilter onSubmit={handleSearch} />
                <TopicFilter
                    topics={topics}
                    selected={selectedTopics}
                    onSelect={(value: MultiValue<SelectOption>) =>
                        handleSelect(value as SelectOption[])
                    }
                />
                {searchQuery && <p>Search results for "{searchQuery}"</p>}
                <SortOptions
                    values={["", "stars", "name"]}
                    onSelect={handleSort}
                />
                <RepoAdd onAdd={handleAddItem} onAddMany={confirmAddMany} />
                <RepoSelect
                    repos={reposToAdd}
                    onConfirmSelection={handleAddMany}
                />
                <Pagination
                    page={page}
                    perPage={perPage}
                    count={filteredRepos.length}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
                <Stack gap={3}>
                    {filteredRepos
                        .slice(page * perPage, (page + 1) * perPage)
                        .map((repo: Repo) => {
                            return (
                                <RepoCard
                                    key={repo.id}
                                    repo={repo}
                                    onClickTopic={handleTopicClicked}
                                    onEdit={() => handleEdit(repo)}
                                    onDelete={() => handleDelete(repo)}
                                    onRefresh={() => handleRefresh(repo)}
                                />
                            );
                        })}
                </Stack>
                <Pagination
                    page={page}
                    perPage={perPage}
                    count={filteredRepos.length}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
                <ToastContainer
                    className="toasts"
                    containerPosition="fixed"
                    position="bottom-start"
                >
                    <Toast
                        id="error-msg"
                        show={errorMsg != ""}
                        autohide={true}
                        delay={5000}
                        onClose={() => setErrorMsg("")}
                    >
                        <Alert
                            variant="danger"
                            dismissible={true}
                            onClose={() => setErrorMsg("")}
                        >
                            {errorMsg}
                        </Alert>
                    </Toast>
                    {deletedRepos.map((r: Repo) => (
                        <Toast
                            key={r.id}
                            autohide
                            delay={3000}
                            onClose={() => closeUndoDeleteToast(r)}
                        >
                            Deleted {r.name}
                            <Button
                                variant="outline-primary"
                                onClick={() => handleUndoDeleted(r)}
                            >
                                <UndoIcon />
                            </Button>
                            <Button
                                variant="outline-dark"
                                className="close"
                                onClick={() => closeUndoDeleteToast(r)}
                            >
                                <CloseIcon />
                            </Button>
                        </Toast>
                    ))}
                </ToastContainer>
                <RepoEdit
                    topics={topics}
                    repo={repoEditing}
                    editing={editing}
                    onHide={() => setEditing(false)}
                    onUpdate={handleUpdate}
                />
            </Container>
            <footer>
                <a href="https://github.com/uwla/repo_stars_organizer">
                    Source Code
                </a>
                <GitHubIcon />
            </footer>
        </>
    );
}

export default App;
