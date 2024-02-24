import {
    Settings as IconGear,
    Download as IconDownload,
    Upload as IconUpload,
} from "@mui/icons-material";
import { Dropdown } from "react-bootstrap";
import "./Menu.css";
import { Repo } from "../types";
import exportFromJSON from "export-from-json";
import { useFilePicker } from "use-file-picker";
import { SelectedFiles } from "use-file-picker/types";

interface Props {
    repos: Repo[];
    onImport: (repos: Repo[]) => void;
}

function Menu(props: Props) {
    const { repos, onImport } = props;

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

    return (
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
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default Menu;
