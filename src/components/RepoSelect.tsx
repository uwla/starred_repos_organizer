import { Button, Modal } from "react-bootstrap";
import { Repo } from "../types";
import { useEffect, useState } from "react";
import { Checkbox } from "@mui/material";

interface Props {
    repos: Repo[];
    onConfirmSelection: (repos: Repo[]) => void;
}

interface RepoCheckbox {
    repo: Repo;
    checked: boolean;
}

const mapChecked = (r: Repo) => ({ repo: r, checked: true } as RepoCheckbox);

function RepoSelect(props: Props) {
    const { repos, onConfirmSelection } = props;
    const [checkboxes, setCheckboxes] = useState(repos.map(mapChecked));

    // Use Effect is likely not needed
    useEffect(() => setCheckboxes(repos.map(mapChecked)), [repos]);

    // We suppose that, after hiding the modal, the repos prop is set to empty.
    const handleHide = () => onConfirmSelection([]);

    // Confirm the user has selected the added topics;
    const handleSubmit = () => {
        const filtered = checkboxes.filter((c: RepoCheckbox) => c.checked);
        const repos = filtered.map((r: RepoCheckbox) => r.repo);
        onConfirmSelection(repos);
    };

    const toggleChecked = (index: number) => {
        checkboxes[index].checked = !checkboxes[index].checked;
        setCheckboxes([...checkboxes]);
    };

    return (
        <Modal show={repos.length > 0} onHide={handleHide}>
            <Modal.Header>
                <Modal.Title>ADD REPOSITORY</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="repos-to-add">
                    {checkboxes.map((checkbox: RepoCheckbox, index: number) => {
                        const { repo, checked } = checkbox;
                        const { html_url, full_name } = repo;
                        const cssId = `add-${index}`;
                        return (
                            <div key={index}>
                                <Checkbox
                                    checked={checked}
                                    onChange={() => toggleChecked(index)}
                                    id={cssId}
                                />
                                <label htmlFor={cssId}>
                                    <a href={html_url}>{full_name}</a>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleHide}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit}>Add</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default RepoSelect;
