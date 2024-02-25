import {
    Settings as IconGear,
    Download as IconDownload,
    Upload as IconUpload,
    Delete as IconDelete,
} from "@mui/icons-material";
import { Button, Dropdown, Modal } from "react-bootstrap";
import "./Menu.css";
import { Repo } from "../types";
import exportFromJSON from "export-from-json";
import { useFilePicker } from "use-file-picker";
import { SelectedFiles } from "use-file-picker/types";
import { useState } from "react";

interface Props {
    repos: Repo[];
    onImport: (repos: Repo[]) => void;
    onDeleteAll: () => Promise<void>;
}

function Menu(props: Props) {
    const { repos, onImport, onDeleteAll } = props;
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
    const handleDownload = () => {
        const data = { repos };
        const fileName = "starred-repos";
        const exportType = exportFromJSON.types.json;
        exportFromJSON({ data, fileName, exportType });
    };

    const showModal = () => setShowConfirmDelete(true);
    const hideModal = () => setShowConfirmDelete(false);

    const handleDeleteAll = () => {
        onDeleteAll().then(hideModal);
    };

    return (
        <>
            <Dropdown id="menu" align="end">
                <Dropdown.Toggle variant="light">
                    <IconGear />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item as="button" onClick={openFilePicker}>
                        <IconUpload /> IMPORT
                    </Dropdown.Item>
                    <Dropdown.Item as="button" onClick={handleDownload}>
                        <IconDownload /> EXPORT
                    </Dropdown.Item>
                    <Dropdown.Item as="button" onClick={showModal}>
                        <IconDelete /> DELETE ALL
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <Modal show={showConfirmDelete} onHide={hideModal}>
                <Modal.Header>
                    <Modal.Title>DELETE ALL</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you really want to delete all starred repositories?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleDeleteAll}>
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
