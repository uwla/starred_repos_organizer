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
    Edit as EditIcon,
    Undo as UndoIcon,
} from "@mui/icons-material";
import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import { MultiValue } from "react-select";
import {
    Menu,
    RepoAdd,
    RepoEdit,
    RepoList,
    RepoGrid,
    RepoSelect,
    SearchFilter,
    TopicFilter,
    TopicSelect,
    Footer,
    Select,
    Notification,
    ViewPagination,
    ViewByTopics,
} from "./components";
import {
    optionsToTopics,
    uniqueRepos,
    extractTopics,
    applyFilters,
} from "./utils";
import { Repo, SelectOption } from "./types";
import storageDriver from "./storage";
import RepoProvider from "./repo";
import "./App.css";

/* -------------------------------------------------------------------------- */
// Main

const shouldShowDemoMsg =
    process.env.NODE_ENV == "demo" && localStorage.getItem("repos") == null;

function App() {
    // state
    const [deletedRepos, setDeletedRepos] = useState([] as Repo[]);
    const [Display, setDisplay] = useState(() => RepoGrid);
    const [editing, setEditing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [appClasses, setAppClasses] = useState("");
    const [filteredRepos, setFilteredRepos] = useState([] as Repo[]);
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
    const [View, setView] = useState(() => ViewPagination);

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
        });
    }

    /* ---------------------------------------------------------------------- */
    // internal handlers

    function toggleAppWidth() {
        if (appClasses === "") setAppClasses("full-width");
        else setAppClasses("");
    }

    function handleSearch(text: string) {
        setSearchQuery(text);
        const plainTopics = optionsToTopics(selectedTopics);
        setFilteredRepos(applyFilters(repos, text, plainTopics));
    }

    function handleSelect(topics: SelectOption[]) {
        setSelectedTopics(topics);
        const plainTopics = optionsToTopics(topics);
        setFilteredRepos(applyFilters(repos, searchQuery, plainTopics));
    }

    function handleSelectDisplay(value: string) {
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
    }

    function getSortFn(sortBy: string) {
        switch (sortBy) {
            case "":
                return function (a: Repo, b: Repo) {
                    return (a.index || 0) - (b.index || 0);
                };
            case "stars":
                return function (a: Repo, b: Repo) {
                    return (b.stars || 0) - (a.stars || 0);
                };
            case "name":
                return function (a: Repo, b: Repo) {
                    return a.name.localeCompare(b.name);
                };
            case "forks":
                return function (a: Repo, b: Repo) {
                    return (b.forks || 0) - (a.forks || 0);
                };
            default:
                throw Error("unknown sort option");
        }
    }

    function updateStateRepos(newRepos: Repo[]) {
        setRepos(newRepos);
        setFilteredRepos(newRepos);
        setTopics(extractTopics(newRepos));
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
        if (repos.length === 0) return;
        await storageDriver
            .deleteMany(repos)
            .then(fetchData)
            .then(() => setSuccessMsg(`${repos.length} repos deleted`));
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
            {/* DEMO MESSAGE INFO */}
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

            <Container id="app" className={appClasses}>
                {/* <!-- HEADER --> */}
                <h1>STARRED REPOS</h1>

                {/* <!-- OPTIONS --> */}
                <Menu
                    repos={repos}
                    filtered={filteredRepos}
                    sortFn={getSortFn(sortBy)}
                    onImport={confirmAddMany}
                    onDelete={handleDeleteMany}
                    onToggleExpand={toggleAppWidth}
                />

                {/* <!-- TOPIC FILTER & TOPIC EDITOR --> */}
                {topics.length > 0 && (
                    <Stack className="stack-filter">
                        <TopicFilter
                            topics={topics}
                            selected={selectedTopics}
                            onSelect={(value: MultiValue<SelectOption>) =>
                                handleSelect(value as SelectOption[])
                            }
                        />
                        <Button onClick={() => setPickingTopics(true)}>
                            <EditIcon />
                        </Button>
                    </Stack>
                )}

                {/* <!-- SEARCH --> */}
                <SearchFilter onSubmit={handleSearch} />
                {searchQuery && <p>Search results for "{searchQuery}"</p>}

                {/* DISPLAY OPTIONS */}
                <Stack gap={4} direction="horizontal">
                    <Select
                        text="Sort by:"
                        values={["", "stars", "name", "forks"]}
                        onSelect={handleSort}
                    />
                    <Select
                        text="View as:"
                        values={["grid", "list"]}
                        onSelect={handleSelectDisplay}
                    />
                    <Stack direction="horizontal">
                        <Checkbox
                            onChange={(_, v) => {
                                if (v) setView(() => ViewByTopics);
                                else setView(() => ViewPagination);
                            }}
                        />
                        <span>Group by topic</span>
                    </Stack>

                    {/* SPACER */}
                    <div className="flex-grow"></div>

                    {/* ADD BUTTON */}
                    <RepoAdd onAdd={handleAddItem} onAddMany={confirmAddMany} />
                </Stack>

                {/* MAIN VIEW */}
                <View
                    repos={filteredRepos}
                    sortFn={getSortFn(sortBy)}
                    Display={Display}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                    onTopicClicked={handleTopicClicked}
                />

                {/* MODAL SELECT REPOSITORIES */}
                <RepoSelect
                    title="ADD REPOSITORIES"
                    repos={reposToAdd}
                    onSelect={handleAddMany}
                />

                {/* MODAL EDIT REPOSITORIES */}
                {editing && (
                    <RepoEdit
                        topics={topics}
                        repo={editingRepo}
                        onHide={() => setEditing(false)}
                        onUpdate={(repo) => handleUpdate(repo, true)}
                    />
                )}

                {/* MODAL EDIT TOPICS */}
                <TopicSelect
                    show={pickingTopics}
                    topics={topics}
                    onHide={() => setPickingTopics(false)}
                    onConfirmSelection={handleTopicsPicking}
                />

                {/* NOTIFICATION TOASTS */}
                <ToastContainer
                    className="toasts"
                    containerPosition="fixed"
                    position="bottom-start"
                >
                    <Notification
                        variant="success"
                        message={successMsg}
                        onClose={() => setSuccessMsg("")}
                    />
                    <Notification
                        variant="danger"
                        message={errorMsg}
                        onClose={() => setErrorMsg("")}
                    />
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
            </Container>

            {/* <!-- FOOTER --> */}
            <Footer />
        </>
    );
}

export default App;
