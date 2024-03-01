import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import RepoProvider, { GiteaRepo, GitLabRepo } from "../repo";
import { Repo } from "../types";
import { extractDomain } from "../utils";
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
    const [showCustomProvider, setShowCustomProvider] = useState(false);
    const [customProviderType, setCustomProviderType] = useState("gitlab");

    const handleClick = () => setOpen(true);

    const handleHide = () => setOpen(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setUrl(value);
        if (value.match(/[\d\w.]+[\d\w]+\/[\w\d]+/)) {
            try {
                RepoProvider.determineProvider(value);
            } catch {
                setShowCustomProvider(true);
            }
        } else if (showCustomProvider) {
            setShowCustomProvider(false);
        }
    };

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setCustomProviderType(value);
    };

    const handleSubmit = () => {
        if (showCustomProvider) {
            const domain = extractDomain(url);
            switch (customProviderType) {
                case "gitlab":
                    RepoProvider.addProvider(new GitLabRepo(domain));
                    break;
                case "gitea":
                    RepoProvider.addProvider(new GiteaRepo(domain));
                    break;
                default:
                    throw new Error("Unknown custom provider");
            }
        }

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
                    {showCustomProvider && (
                        <div className="custom-provider">
                            <p>Select custom provider:</p>
                            <Form.Select onChange={handleSelect}>
                                <option value="gitlab">Gitlab</option>
                                <option value="gitea">Gitea</option>
                            </Form.Select>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleHide}>
                        CANCEL
                    </Button>
                    <Button onClick={handleSubmit}>ADD</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RepoAdd;
