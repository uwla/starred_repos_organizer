import {
    Settings as IconGear,
    Download as IconDownload,
    Upload as IconUpload,
    Delete as IconDelete,
    Fullscreen as IconFullscreen,
} from "@mui/icons-material";
import { Dropdown } from "react-bootstrap";
import { useState } from "react";
import exportFromJSON from "export-from-json";
import { useFilePicker } from "use-file-picker";
import { SelectedFiles } from "use-file-picker/types";
import { Repo } from "../types";
import "./Menu.css";
import RepoSelect from "./RepoSelect";

interface Props {
    repos: Repo[];
    filtered: Repo[];
    onImport: (repos: Repo[]) => void;
    onDelete: (repos: Repo[]) => Promise<void>;
    onToggleExpand: () => void;
    sortFn: (a: Repo, b: Repo) => number;
}

function Menu(props: Props) {
    const { repos, filtered, onImport, onDelete, onToggleExpand, sortFn } =
        props;
    const [toDelete, setToDelete] = useState([] as Repo[]);
    const [toExport, setToExport] = useState([] as Repo[]);

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
        setToExport([]);
        if (repos.length === 0) return;
        const data = { repo: repos };
        const date = (new Date())
            .toISOString()
            .replace('T', '_')
            .replace(/\..*$/, '');
        const fileName = "starred-repos_" + date;
        const exportType = exportFromJSON.types.json;
        exportFromJSON({ data, fileName, exportType });
    };

    const hideModal = () => setToDelete([]);
    const handleDelete = (repos: Repo[]) => onDelete(repos).then(hideModal);

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
                        <Dropdown.Item onClick={() => setToExport(repos)}>
                            <IconDownload /> EXPORT
                        </Dropdown.Item>
                    )}
                    {filtered.length > 0 && filtered.length < repos.length && (
                        <Dropdown.Item onClick={() => setToExport(filtered)}>
                            <IconDownload /> EXPORT FILTERED
                        </Dropdown.Item>
                    )}
                    {repos.length > 0 && (
                        <Dropdown.Item onClick={() => setToDelete(repos)}>
                            <IconDelete /> DELETE ALL
                        </Dropdown.Item>
                    )}
                    {filtered.length > 0 && filtered.length < repos.length && (
                        <Dropdown.Item onClick={() => setToDelete(filtered)}>
                            <IconDelete /> DELETE FILTERED
                        </Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={onToggleExpand}>
                        <IconFullscreen /> EXPAND
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            <RepoSelect
                title="CONFIRM REPOSITORIES TO DELETE"
                repos={toDelete.sort(sortFn)}
                onSelect={handleDelete}
            />

            <RepoSelect
                title="CONFIRM REPOSITORIES TO EXPORT"
                repos={toExport.sort(sortFn)}
                onSelect={handleDownload}
            />
        </>
    );
}

export default Menu;
