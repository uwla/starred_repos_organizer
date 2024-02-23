import { useState } from "react";
import { Form, Modal, Button } from "react-bootstrap";

import { Repo } from "../types";
import GitHubRepo from "../repo/GitHubRepo";
import GitLabRepo from "../repo/GitLabRepo";
import { Checkbox } from "@mui/material";
import "./AddItem.css";

interface Props {
    onAdd: (repo: Repo) => Promise<boolean>;
    onAddMany: (repos: Repo[]) => Promise<boolean>;
}

interface RepoCheck {
    repo: Repo;
    checked: boolean;
}

// TODO: add support for Gitea, SourceHut, ...
const getRepo = async (url: string) => {
    if (url.includes("github.com")) return GitHubRepo.getRepo(url);
    if (url.includes("gitlab.com")) return GitLabRepo.getRepo(url);
    throw new Error(`No provider for the given url ${url}`);
};

// TODO: add support for Gitea, SourceHut, ...
const getUserStarredRepos = async (url: string) => {
    const userName = url.replace(/.*\//, "");
    if (url.includes("github.com"))
        return GitHubRepo.getReposFromUser(userName);
    if (url.includes("gitlab.com"))
        return GitLabRepo.getReposFromUser(userName);
    throw new Error(`No provider for the given url ${url}`);
};

function AddItem(props: Props) {
    const { onAdd, onAddMany } = props;
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [repos, setRepos] = useState([] as RepoCheck[]);

    const handleClick = () => setOpen(true);

    const handleHide = () => setOpen(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    // Add multiple repositories at once after manual selection.
    const handleAddMultiple = () => {
        const reposToBeAdded = repos
            .filter((r: RepoCheck) => r.checked)
            .map((r: RepoCheck) => r.repo);

        onAddMany(reposToBeAdded).then((status: boolean) => {
            if (status) {
                setRepos([]);
                setUrl("");
            }
        });
    };

    const handleSubmit = () => {
        // When adding repositories in batch mode, the user needs to submit the
        // form twice:
        // 1. To fetch the repositories to be selected.
        // 2. To confirm saving the selected repositories.
        if (repos.length > 0) {
            handleAddMultiple();
            return;
        }

        // If that is not the case, we fetch the repository.

        // We need to determine if the URL is a repository URL, or if it is a
        // user profile URL. In the later case, we will fetch all of the user's
        // starred repositories.
        const urlPath = url.replace(/(https?:\/\/)?[^/]+/, "");
        const pathArray = urlPath.split("/").filter((str: string) => str != "");

        // Callback to add single repository.
        const callbackSingle = () =>
            getRepo(url)
                .then((repo: Repo) => onAdd(repo))
                .then((status: boolean) => {
                    if (status) setUrl("");
                });

        // Callback to add many repositories at once.
        // It does not added then, but renders them for further confirmation.
        const callbackMany = () =>
            getUserStarredRepos(url)
                .then((repos: Repo[]) =>
                    repos.map((r: Repo) => ({ repo: r, checked: true }))
                )
                .then(setRepos);

        // actual callback.
        const callback = pathArray.length == 1 ? callbackMany : callbackSingle;

        // perform the callback and show a status popup message.
        callback();
    };

    const handleChecked = (index: number) => {
        const repo = repos[index];
        repo.checked = !repo.checked;
        setRepos([...repos]);
    };

    return (
        <>
            <Button variant="success" onClick={handleClick}>
                ADD REPO
            </Button>
            <Modal show={open} onHide={handleHide}>
                <Modal.Header>
                    <Modal.Title>ADD REPOSITORY</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        autoFocus
                        id="repo_url"
                        required
                        type="url"
                        value={url}
                        placeholder="Enter URL"
                        onChange={handleInput}
                    />
                    <br />
                    <small>
                        If the URL is from user profile, it will add all starred
                        repositories from that user.
                    </small>
                    {repos.length > 0 && (
                        <>
                            <hr />
                            <div className="repos-to-add">
                                {repos.map((r: RepoCheck, i: number) => {
                                    return (
                                        <div key={r.repo.html_url}>
                                            <Checkbox
                                                checked={r.checked}
                                                onChange={() =>
                                                    handleChecked(i)
                                                }
                                                id={`add-${r.repo.full_name}`}
                                            />
                                            <label
                                                htmlFor={`add-${r.repo.full_name}`}
                                            >
                                                <a href={r.repo.html_url}>
                                                    {r.repo.full_name}
                                                </a>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleHide}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Add</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddItem;
