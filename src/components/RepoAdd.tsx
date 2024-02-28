import { Button, Form, Modal } from "react-bootstrap";
import { useState } from "react";
import { Repo } from "../types";
import RepoProvider from "../repo";
import "./RepoAdd.css";

interface Props {
    onAdd: (repo: Repo) => Promise<boolean>;
    onAddMany: (repos: Repo[]) => Promise<boolean>;
}

const getRepo = async (url: string) => {
    const provider = RepoProvider.determineProvider(url);
    return RepoProvider.getRepo(url, provider);
};

const getUserStarredRepos = async (url: string) => {
    const provider = RepoProvider.determineProvider(url);
    return RepoProvider.getUserStarredRepos(url, provider);
};

function RepoAdd(props: Props) {
    const { onAdd, onAddMany } = props;
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");

    const handleClick = () => setOpen(true);

    const handleHide = () => setOpen(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleSubmit = () => {
        // Callback to add single repository.
        const callbackSingle = () => getRepo(url).then(onAdd);

        // Callback to add many repositories at once.
        const callbackMany = () => getUserStarredRepos(url).then(onAddMany);

        // actual callback.
        const callback = RepoProvider.isUserProfileUrl(url)
            ? callbackMany
            : callbackSingle;

        // perform the callback and show a status popup message.
        callback().then((status: boolean) => {
            if (status) {
                setUrl("");
                handleHide();
            }
        });
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
        </>
    );
}

export default RepoAdd;
