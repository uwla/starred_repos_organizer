import {
    DarkMode as IconDarkMode,
    Delete as IconDelete,
    Download as IconDownload,
    Fullscreen as IconFullscreen,
    Refresh as IconRefresh,
    Settings as IconGear,
    Upload as IconUpload,
} from "@mui/icons-material";
import { Dropdown } from "react-bootstrap";
import { useEffect, useState } from "react";
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
    onRefresh: (repos: Repo[]) => Promise<void>;
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
        onRefresh,
        onToggleExpand,
        onToggleTheme,
        sortFn,
    } = props;

    const [toDelete, setToDelete] = useState([] as Repo[]);
    const [toExport, setToExport] = useState([] as Repo[]);
    const [hasFilters, setHasFilters] = useState(false)

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
    function handleDownload(repos: Repo[]) {
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
    }

    function hideModal() {
        setToDelete([])
    }

    function handleDelete(repos: Repo[]) {
        onDelete(repos).then(hideModal)
    }

    useEffect(() => {
        setHasFilters(filtered.length > 0 && filtered.length < repos.length)
    }, [filtered, repos])

    return (
        <>
            <Dropdown id="menu" align="end">
                <Dropdown.Toggle variant="light">
                    <IconGear />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={openFilePicker}>
                        <IconUpload />
                        <span>IMPORT</span>
                    </Dropdown.Item>
                    {repos.length > 0 && (
                        <Dropdown.Item onClick={() => setToExport(repos)}>
                            <IconDownload />
                            <span>{hasFilters ? 'EXPORT ALL' : 'EXPORT'}</span>
                        </Dropdown.Item>
                    )}
                    {hasFilters && (
                        <Dropdown.Item onClick={() => setToExport(filtered)}>
                            <IconDownload />
                            <span>EXPORT FILTERED</span>
                        </Dropdown.Item>
                    )}
                    {repos.length > 0 && (
                        <Dropdown.Item onClick={() => setToDelete(repos)}>
                            <IconDelete />
                            <span>{hasFilters ? 'DELETE ALL' : 'DELETE'}</span>
                        </Dropdown.Item>
                    )}
                    {hasFilters && (
                        <Dropdown.Item onClick={() => setToDelete(filtered)}>
                            <IconDelete />
                            <span>DELETE FILTERED</span>
                        </Dropdown.Item>
                    )}
                    {repos.length > 0 && (
                        <Dropdown.Item onClick={() => onRefresh(repos)}>
                            <IconRefresh />
                            <span>{hasFilters ? 'REFRESH ALL' : 'REFRESH'}</span>
                        </Dropdown.Item>
                    )}
                    {hasFilters && (
                        <Dropdown.Item onClick={() => onRefresh(filtered)}>
                            <IconRefresh />
                            <span>REFRESH FILTERED</span>
                        </Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={onToggleTheme}>
                        <IconDarkMode />
                        <span>DARK / LIGHT</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={onToggleExpand}>
                        <IconFullscreen />
                        <span>EXPAND</span>
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
