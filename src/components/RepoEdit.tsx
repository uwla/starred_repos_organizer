import { ChangeEvent, FormEvent, useState } from "react"

import { Button, Form, Modal } from "react-bootstrap"
import { MultiValue } from "react-select"

import { Repo, SelectOption } from "../types"
import { optionsToTopics, topicsToOptions } from "../utils"
import "./RepoEdit.css"
import TopicFilter from "./TopicFilter"

interface Props {
    repo: Repo
    topics: string[]
    onUpdate: (repo: Repo) => Promise<boolean>
    onHide: () => void
}

function RepoEdit(props: Props) {
    const { topics, onHide, onUpdate, repo } = props
    const [repoName, setRepoName] = useState(repo.name)
    const [repoUrl, setRepoUrl] = useState(repo.url)
    const [repoTopics, setRepoTopics] = useState(
        topicsToOptions(repo.topics || [])
    )

    // useEffect(() => {
    //     setRepoName(props.repo.name);
    //     setRepoUrl(props.repo.url);
    //     setRepoTopics(topicsToOptions(props.repo.topics || []));
    // }, [repo]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const localRepo = {
            ...repo,
            topics: optionsToTopics(repoTopics),
            name: repoName,
            url: repoUrl,
        }
        onUpdate(localRepo)
    }

    return (
        <Modal
            size="lg"
            show={true}
            onHide={onHide}
        >
            <Modal.Header>
                <Modal.Title>EDIT REPO</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form
                    id="edit-repo"
                    onSubmit={handleSubmit}
                >
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
                        <TopicFilter
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
                <Button
                    variant="danger"
                    onClick={onHide}
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
    )
}

export default RepoEdit
