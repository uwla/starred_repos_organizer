import { Button, Modal, Form } from "react-bootstrap";
import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import { Repo } from "../types";
import "./RepoSelect.css";

interface Props {
    repos: Repo[];
    onSelect: (repos: Repo[]) => void;
    title: string;
}

interface RepoCheckbox {
    repo: Repo;
    checked: boolean;
}

const mapChecked = (r: Repo) => ({ repo: r, checked: true } as RepoCheckbox);

function RepoSelect(props: Props) {
    const { repos, onSelect, title } = props;
    const [checkboxes, setCheckboxes] = useState(repos.map(mapChecked));
    const [search, setSearch] = useState("");

    // Use Effect is likely not needed
    useEffect(() => setCheckboxes(repos.map(mapChecked)), [repos]);

    // We suppose that, after hiding the modal, the repos prop is set to empty.
    const handleHide = () => onSelect([]);

    // Confirm the user has selected the added topics;
    const handleSubmit = () => {
        const filtered = checkboxes.filter((c: RepoCheckbox) => c.checked);
        const repos = filtered.map((r: RepoCheckbox) => r.repo);
        onSelect(repos);
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const toggleChecked = (index: number) => {
        checkboxes[index].checked = !checkboxes[index].checked;
        setCheckboxes([...checkboxes]);
    };

    return (
        <Modal show={repos.length > 0} onHide={handleHide}>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="search repository by name.."
                        onChange={handleInput}
                    />
                </div>
                <div className="select-menu">
                    {checkboxes
                        .filter((checkbox: RepoCheckbox) => {
                            const { full_name, name } = checkbox.repo;
                            const toSearch = [full_name, name];
                            return toSearch.some((item: String) =>
                                item.includes(search)
                            );
                        })
                        .map((checkbox: RepoCheckbox, index: number) => {
                            const { repo, checked } = checkbox;
                            const { url, full_name } = repo;
                            const cssId = `repo-add-${index}`;
                            return (
                                <div key={index} className="select-checkbox">
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => toggleChecked(index)}
                                        id={cssId}
                                    />
                                    <label htmlFor={cssId}>
                                        <a href={url}>{full_name}</a>
                                    </label>
                                </div>
                            );
                        })}
                    <div className="select-menu-empty">No topic found.</div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleHide}>
                    CANCEL
                </Button>
                <Button onClick={handleSubmit}>
                    CONFIRM
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default RepoSelect;
