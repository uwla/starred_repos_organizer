import {
    Settings as IconGear,
    Download as IconDownload,
    Upload as IconUpload,
} from "@mui/icons-material";
import { Dropdown } from "react-bootstrap";
import "./Menu.css";
import { Repo } from "../types";
import exportFromJSON from "export-from-json";

interface Props {
    repos: Repo[];
}

function Menu(props: Props) {
    const { repos } = props;

    const handleDownload = () => {
        const data = { repos };
        const fileName = "starred-repos";
        const exportType = exportFromJSON.types.json;
        exportFromJSON({ data, fileName, exportType });
    };

    return (
        <Dropdown id="menu">
            <Dropdown.Toggle variant="light">
                <IconGear />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item>
                    <IconUpload /> IMPORT
                </Dropdown.Item>
                <Dropdown.Item onClick={handleDownload}>
                    <IconDownload /> EXPORT
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default Menu;
