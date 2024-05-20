import {
    Alert,
    Button,
    Container,
    Form,
    Stack,
    Toast,
    ToastContainer,
} from "react-bootstrap";
import {
    Close as CloseIcon,
    Edit as EditIcon,
    GitHub as GitHubIcon,
    Undo as UndoIcon,
} from "@mui/icons-material";
import { ReactNode, useEffect, useState } from "react";
import { MultiValue } from "react-select";
import {
    Menu,
    Pagination,
    RepoAdd,
    RepoEdit,
    RepoList,
    RepoGrid,
    RepoSelect,
    SearchFilter,
    SortOptions,
    TopicFilter,
} from "./components";
import { optionsToTopics, uniqueRepos } from "./utils";
import { Repo, RepoKey, SelectOption } from "./types";
import storageDriver from "./storage";
import "./App.css";
import RepoProvider from "./repo";
import TopicSelect from "./components/TopicSelect";

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
    const [Display, setDisplay] = useState(() => RepoList);
    const [editing, setEditing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [filteredRepos, setFilteredRepos] = useState([] as Repo[]);
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [editingRepo, setEditingRepo] = useState({} as Repo);
    const [pickingTopics, setPickingTopics] = useState(false);
    const [repos, setRepos] = useState([] as Repo[]);
    const [reposToAdd, setReposToAdd] = useState([] as Repo[]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([] as SelectOption[]);
    const [showDemoMsg, setShowDemoMsg] = useState(shouldShowDemoMsg);
    const [successMsg, setSuccessMsg] = useState("");
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

    function handleSelectDisplay(event: React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value;
        switch (value) {
            case "grid":
                setDisplay(() => RepoGrid);
                break;
            case "list":
                setDisplay(() => RepoList);
                break;
            default:
                break;
        }
    }

    function handleTopicClicked(topic: string) {
        const plainTopics = optionsToTopics(selectedTopics);
        if (plainTopics.includes(topic)) return;
        handleSelect([...selectedTopics, { label: topic, value: topic }]);
    }

    function handleSort(value: string) {
        setSortBy(value);
        setRepos(sortRepos([...repos], value));
        setFilteredRepos(sortRepos([...filteredRepos], value));
    }

    function sortRepos(repos: Repo[], sortBy: string) {
        let cmp: (a: Repo, b: Repo) => number;

        switch (sortBy) {
            case "":
                cmp = (a: Repo, b: Repo) => a.index - b.index;
                break;
            case "stars":
                cmp = (a: Repo, b: Repo) => (b.stars || 0) - (a.stars || 0);
                break;
            case "name":
                cmp = (a: Repo, b: Repo) => a.name.localeCompare(b.name);
                break;
            case "forks":
                cmp = (a: Repo, b: Repo) => (b.forks || 0) - (a.forks || 0);
                break;
            default:
                throw Error("unknown sort option");
        }

        return repos.sort(cmp);
    }

    function updateStateRepos(newRepos: Repo[]) {
        newRepos = sortRepos(newRepos, sortBy);
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
                updateStateRepos([repo, ...repos]);
                setSuccessMsg("Repository added");
                return true;
            })
            .catch(() => {
                setErrorMsg("Failed to add repository");
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
                updateStateRepos(uniqueRepos([...created, ...repos]));
                setSuccessMsg("Repositories added");
                return true;
            })
            .catch(() => {
                setErrorMsg("Failed to add repositories");
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
                setErrorMsg("Failed to delete repository");
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
        setEditingRepo(r);
        setEditing(true);
    }

    async function handleUpdate(repo: Repo, modified = false) {
        // this marks the repo to be updated as been locally modified.
        repo.modified = modified;

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
                setSuccessMsg("Repo updated");
                return true;
            })
            .catch(() => {
                setErrorMsg("Failed to updated repository");
                return false;
            });
    }

    async function handleRefresh(repo: Repo) {
        // Get the updated version of the repository.
        const updated = await RepoProvider.getRepo(repo.url);

        if (repo.modified) {
            // Preserve the topics, which may have been overwritten locally.
            updated.topics = repo.topics;
        }

        // preserve original id
        updated.id = repo.id;

        // Then, update it.
        handleUpdate(updated);
    }

    async function handleTopicsPicking(selectedTopics: string[]) {
        if (selectedTopics.length === topics.length) {
            setPickingTopics(false);
            return;
        }
        const topicsDict = {} as { [key: string]: boolean };
        selectedTopics.forEach((t: string) => (topicsDict[t] = true));
        const filterTopics = (topic: string) => topicsDict[topic];
        repos.forEach((r: Repo) => {
            const newTopics = r.topics.filter(filterTopics);
            if (newTopics.length !== r.topics.length) {
                r.topics = newTopics;
                r.modified = true;
            }
        });

        storageDriver
            .updateMany(repos)
            .then(updateStateRepos)
            .then(() => setPickingTopics(false));
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
                <Stack className="stack-filter">
                    <TopicFilter
                        topics={topics}
                        selected={selectedTopics}
                        onSelect={(value: MultiValue<SelectOption>) =>
                            handleSelect(value as SelectOption[])
                        }
                    />
                    {topics.length > 0 && (
                        <Button onClick={() => setPickingTopics(true)}>
                            <EditIcon />
                        </Button>
                    )}
                </Stack>
                {searchQuery && <p>Search results for "{searchQuery}"</p>}
                <RepoSelect
                    repos={reposToAdd}
                    onConfirmSelection={handleAddMany}
                />
                <Stack gap={4} direction="horizontal">
                    <SortOptions
                        values={["", "stars", "name", "forks"]}
                        onSelect={handleSort}
                    />
                    <Stack direction="horizontal" className="sort-options">
                        <p>View as </p>
                        <Form.Select onChange={handleSelectDisplay}>
                            <option value="list">List</option>
                            <option value="grid">Grid</option>
                        </Form.Select>
                    </Stack>
                </Stack>
                <RepoAdd onAdd={handleAddItem} onAddMany={confirmAddMany} />
                <Pagination
                    page={page}
                    perPage={perPage}
                    count={filteredRepos.length}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
                <Display
                    repos={filteredRepos.slice(
                        page * perPage,
                        (page + 1) * perPage
                    )}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                    onTopicClicked={handleTopicClicked}
                />
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
                    <Toast
                        id="success-msg"
                        show={successMsg != ""}
                        autohide={true}
                        delay={5000}
                        onClose={() => setSuccessMsg("")}
                    >
                        <Alert
                            variant="success"
                            dismissible={true}
                            onClose={() => setSuccessMsg("")}
                        >
                            {successMsg}
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
                <TopicSelect
                    show={pickingTopics}
                    topics={topics}
                    onHide={() => setPickingTopics(false)}
                    onConfirmSelection={handleTopicsPicking}
                />
                <RepoEdit
                    topics={topics}
                    repo={editingRepo}
                    editing={editing}
                    onHide={() => setEditing(false)}
                    onUpdate={(repo) => handleUpdate(repo, true)}
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
