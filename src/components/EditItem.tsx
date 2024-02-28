import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { MultiValue } from "react-select";

import TopicsFilter from "./TopicsFilter";
import { Repo, SelectOption } from "../types";

import { optionsToTopics, topicsToOptions } from "../utils";

interface Props {
    repo: Repo;
    editing: boolean;
    topics: string[];
    onUpdate: (repo: Repo) => Promise<boolean>;
    onHide: () => void;
}

function EditItem(props: Props) {
    const { topics, editing, onHide, onUpdate, repo } = props;
    const [repoName, setRepoName] = useState(repo.name);
    const [repoUrl, setRepoUrl] = useState(repo.url);
    const [repoTopics, setRepoTopics] = useState(
        topicsToOptions(repo.topics || [])
    );

    useEffect(() => {
        setRepoName(props.repo.name);
        setRepoUrl(props.repo.url);
        setRepoTopics(topicsToOptions(props.repo.topics || []));
    }, [props]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const localRepo = {
            ...repo,
            topics: optionsToTopics(repoTopics),
            name: repoName,
            url: repoUrl,
        };
        onUpdate(localRepo);
    }

    return (
        <Modal size="lg" show={editing} onHide={onHide}>
            <Modal.Header>
                <Modal.Title>EDIT REPO</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="edit-repo" onSubmit={handleSubmit}>
                    <Form.Group controlId="edit-repo-name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            defaultValue={repoName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setRepoName(e.target.value)
                            }
                        />
                    </Form.Group>
                    <Form.Group controlId="edit-repo-url">
                        <Form.Label>URL</Form.Label>
                        <Form.Control
                            type="url"
                            defaultValue={repoUrl}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setRepoUrl(e.target.value)
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Topics</Form.Label>
                        <TopicsFilter
                            topics={topics}
                            selected={repoTopics}
                            creatable={true}
                            onSelect={(val: MultiValue<SelectOption>) =>
                                setRepoTopics(val as SelectOption[])
                            }
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={onHide}>
                    CANCEL
                </Button>
                <Button variant="primary" form="edit-repo" type="submit">
                    UPDATE
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditItem;
