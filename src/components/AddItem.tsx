import { useState } from "react";
import { Snackbar } from "@mui/material";
import { Alert, Form, Modal, Button } from "react-bootstrap";

import { Repo } from "../types";
import GitHubRepo from "../repo/GitHubRepo";

interface Props {
    onAdd: (repo: Repo) => Promise<boolean>;
    onAddMany: (repos: Repo[]) => Promise<boolean>;
}

// TODO: add support for GitLab, Gitea, SourceHut, ...
const getRepo = async (url: string) => {
    return GitHubRepo.getRepo(url);
};

// TODO: add support for GitLab, Gitea, SourceHut, ...
const getUserStarredRepos = async (url: string) => {
    const userName = url.replace(/.*\//, "");
    return GitHubRepo.getReposFromUser(userName);
};

function AddItem(props: Props) {
    const { onAdd, onAddMany } = props;
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [url, setUrl] = useState("");

    const handleClick = () => setOpen(true);

    const handleHide = () => setOpen(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleSubmit = () => {
        // We need to determine if the URL is a repository URL, or if it is a
        // user profile URL. In the later case, we will fetch all of the user's
        // starred repositories.
        const urlPath = url.replace(/(https?:\/\/)?[^/]+/, "");
        const pathArray = urlPath.split("/").filter((str: string) => str != "");

        // callback to add single repository
        const callbackSingle = () =>
            getRepo(url).then((repo: Repo) => onAdd(repo));

        // callback to add many repositories at once
        const callbackMany = () =>
            getUserStarredRepos(url).then((repos: Repo[]) => onAddMany(repos));

        // actual callback.
        const callback = pathArray.length == 1 ? callbackMany : callbackSingle;

        // perform the callback and show a status popup message.
        callback()
            .then((status: boolean) => {
                setStatus(status);
                if (status) setUrl("");
            })
            .catch(() => setStatus(false))
            .finally(() => setShowStatus(true));
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleHide}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Add</Button>
                </Modal.Footer>
            </Modal>
            <Snackbar
                open={showStatus}
                autoHideDuration={1000}
                onClose={() => setShowStatus(false)}
            >
                <Alert variant={status ? "success" : "danger"}>
                    {status ? "Repo added!" : "Something failed..."}
                </Alert>
            </Snackbar>
        </>
    );
}

export default AddItem;
