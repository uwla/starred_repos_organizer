import {
    Settings as IconGear,
    Download as IconDownload,
    Upload as IconUpload,
    Delete as IconDelete,
    Fullscreen as IconFullscreen,
    DarkMode as IconDarkMode,
} from "@mui/icons-material";
import { Dropdown } from "react-bootstrap";
import { useState } from "react";
import exportFromJSON from "export-from-json";
import { useFilePicker } from "use-file-picker";
import { SelectedFiles } from "use-file-picker/types";
import type { JsonData, Repo, Topic, TopicAliases } from "../types";
import "./Menu.css";
import RepoSelect from "./RepoSelect";
import { now } from "../utils";

interface Props {
    repos: Repo[];
    topicsAllowed: Topic[];
    topicAliases: TopicAliases;
    filtered: Repo[];
    onImport: (data: JsonData) => void;
    onDelete: (repos: Repo[]) => Promise<void>;
    onToggleExpand: () => void;
    onToggleTheme: () => void;
    sortFn: (a: Repo, b: Repo) => number;
}

function Menu(props: Props) {
    const {
        repos,
        filtered,
        topicsAllowed,
        topicAliases,
        onImport,
        onDelete,
        onToggleExpand,
        onToggleTheme,
        sortFn,
    } = props;
    const [toDelete, setToDelete] = useState([] as Repo[]);
    const [toExport, setToExport] = useState([] as Repo[]);

    // Handles importing files.
    const { openFilePicker } = useFilePicker({
        accept: ".json",
        multiple: false,
        onFilesSuccessfullySelected: (files: SelectedFiles<string>) => {
            const rawData = JSON.parse(files.filesContent[0].content);
            const data = {
                date: rawData.date || now(),
                repos: rawData.repos || rawData.repo, // compability with older versions
                topics_allowed: rawData.topics_allowed || [],
                topic_aliases: rawData.topic_aliases || [],
            }
            onImport(data);
        },
    });

    // Handles exporting files.
    const handleDownload = (repos: Repo[]) => {
        if (repos.length === 0) return;
        setToExport([]);
        const data: JsonData = {
            date: now(),
            repos: repos,
            topics_allowed: topicsAllowed,
            topic_aliases: topicAliases,
        };
        const date = now()
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
                    <Dropdown.Item onClick={onToggleTheme}>
                        <IconDarkMode /> DARK / LIGHT
                    </Dropdown.Item>
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
