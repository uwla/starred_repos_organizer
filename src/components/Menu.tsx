import {
    Settings as IconGear,
    Download as IconDownload,
    Upload as IconUpload,
    Delete as IconDelete,
} from "@mui/icons-material";
import { Button, Dropdown, Modal } from "react-bootstrap";
import { useState } from "react";
import exportFromJSON from "export-from-json";
import { useFilePicker } from "use-file-picker";
import { SelectedFiles } from "use-file-picker/types";
import { Repo } from "../types";
import "./Menu.css";

interface Props {
    repos: Repo[];
    filtered: Repo[];
    onImport: (repos: Repo[]) => void;
    onDelete: (repos: Repo[]) => Promise<void>;
}

function Menu(props: Props) {
    const { repos, filtered, onImport, onDelete } = props;
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [toDelete, setToDelete] = useState(repos);

    // Handles importing files.
    const { openFilePicker } = useFilePicker({
        accept: ".json",
        multiple: false,
        onFilesSuccessfullySelected: (files: SelectedFiles<string>) => {
            const data = JSON.parse(files.filesContent[0].content);
            const importedRepos = data.repo as Repo[];
            onImport(importedRepos);
        },
    });

    // Handles exporting files.
    const handleDownload = (repos: Repo[]) => {
        const data = { repo: repos };
        const fileName = "starred-repos";
        const exportType = exportFromJSON.types.json;
        exportFromJSON({ data, fileName, exportType });
    };

    const confirmDelete = (repos: Repo[]) => {
        setToDelete(repos);
        setShowConfirmDelete(true);
    };

    const hideModal = () => setShowConfirmDelete(false);

    const handleDelete = () => onDelete(toDelete).then(hideModal);

    return (
        <>
            <Dropdown id="menu" align="end">
                <Dropdown.Toggle variant="light">
                    <IconGear />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={openFilePicker}>
                        <IconUpload /> IMPORT
                    </Dropdown.Item>
                    {repos.length > 0 && (
                        <Dropdown.Item onClick={() => handleDownload(repos)}>
                            <IconDownload /> EXPORT
                        </Dropdown.Item>
                    )}
                    {filtered.length > 0 && filtered.length < repos.length && (
                        <Dropdown.Item onClick={() => handleDownload(filtered)}>
                            <IconDownload /> EXPORT FILTERED
                        </Dropdown.Item>
                    )}
                    {repos.length > 0 && (
                        <Dropdown.Item onClick={() => confirmDelete(repos)}>
                            <IconDelete /> DELETE ALL
                        </Dropdown.Item>
                    )}
                    {filtered.length > 0 && filtered.length < repos.length && (
                        <Dropdown.Item onClick={() => confirmDelete(filtered)}>
                            <IconDelete /> DELETE FILTERED
                        </Dropdown.Item>
                    )}
                </Dropdown.Menu>
            </Dropdown>
            <Modal show={showConfirmDelete} onHide={hideModal}>
                <Modal.Header>
                    <Modal.Title>DELETE REPOSITORIES</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you really want to delete {toDelete.length} starred
                    repositories?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleDelete}>
                        YES
                    </Button>
                    <Button variant="success" onClick={hideModal}>
                        NO
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Menu;
