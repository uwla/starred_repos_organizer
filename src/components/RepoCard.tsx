import {
    IconType,
    SiAwesomelists,
    SiC,
    SiCodeberg as IconCodeberg,
    SiCplusplus,
    SiCsharp,
    SiCss3,
    SiGithub as IconGitHub,
    SiGitlab as IconGitLab,
    SiGnubash,
    SiHtml5,
    SiJavascript,
    SiKotlin,
    SiLua,
    SiPhp,
    SiPowershell,
    SiPython,
    SiRacket,
    SiReact,
    SiRuby,
    SiRust,
    SiSvelte,
    SiTypescript,
    SiVim,
    SiVuedotjs,
} from "@icons-pack/react-simple-icons";
import {
    AltRoute as IconForks,
    Delete as IconDelete,
    Edit as IconEdit,
    HomeOutlined as IconHome,
    Refresh as IconRefresh,
    Settings as IconGear,
    Star as IconStar,
} from "@mui/icons-material";
import { Chip } from "@mui/material";
import { orange } from "@mui/material/colors";
import { Card, Dropdown, Stack } from "react-bootstrap";
import { Repo } from "../types";
import "./RepoCard.css";

interface Props {
    onClickTopic: (topic: string) => void;
    onEdit: () => void;
    onDelete: () => void;
    onRefresh: () => void;
    repo: Repo;
}

const languageIcons = {
    bash: SiGnubash,
    c: SiC,
    "c#": SiCsharp,
    "c++": SiCplusplus,
    css: SiCss3,
    html: SiHtml5,
    javascript: SiJavascript,
    kotlin: SiKotlin,
    lua: SiLua,
    php: SiPhp,
    powershell: SiPowershell,
    python: SiPython,
    racket: SiRacket,
    react: SiReact,
    ruby: SiRuby,
    rust: SiRust,
    svelte: SiSvelte,
    typescript: SiTypescript,
    vim: SiVim,
    vue: SiVuedotjs,
} as { [key: string]: IconType };

function RepoCard(props: Props) {
    const { onClickTopic, onEdit, onDelete, onRefresh, repo } = props;
    const { homepage, forks, stars, url } = repo;
    const topics = [...repo.topics].sort();
    const lang = (repo.lang || "").toLowerCase();
    const LanguageIcon = languageIcons[lang];

    return (
        <Card>
            <Card.Header>
                <Card.Title>{repo.name}</Card.Title>
                <Card.Subtitle>{repo.full_name}</Card.Subtitle>
                <Dropdown className="repo-options" align="end">
                    <Dropdown.Toggle variant="light" id="dropdown-basic">
                        <IconGear fontSize="small" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={onEdit}>
                            <IconEdit fontSize="small" />
                            &nbsp; edit
                        </Dropdown.Item>
                        <Dropdown.Item onClick={onRefresh}>
                            <IconRefresh fontSize="small" />
                            &nbsp; refresh
                        </Dropdown.Item>
                        <Dropdown.Item onClick={onDelete}>
                            <IconDelete fontSize="small" />
                            &nbsp; remove
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Card.Header>
            <Card.Body>
                <Card.Text>{repo.description}</Card.Text>
                <Stack direction="horizontal" gap={3} className="repo-details">
                    {url.includes("codeberg.org/") && (
                        <Card.Link href={url}>
                            <IconCodeberg />
                            <span>Codeberg</span>
                        </Card.Link>
                    )}
                    {url.includes("github.com/") && (
                        <Card.Link href={url}>
                            <IconGitHub />
                            <span>GitHub</span>
                        </Card.Link>
                    )}
                    {url.includes("gitlab.com/") && (
                        <Card.Link href={url}>
                            <IconGitLab />
                            <span>GitLab</span>
                        </Card.Link>
                    )}
                    {homepage && (
                        <Card.Link href={homepage}>
                            <IconHome fontSize="small" />
                            <span>Website</span>
                        </Card.Link>
                    )}
                    {typeof stars === "number" && (
                        <div>
                            <IconStar
                                sx={{ color: orange[500] }}
                                fontSize="small"
                            />
                            <span>{stars}</span>
                        </div>
                    )}
                    {typeof forks === "number" && (
                        <div>
                            <IconForks fontSize="small" />
                            <span>{forks}</span>
                        </div>
                    )}
                    {LanguageIcon && (
                        <div>
                            <LanguageIcon />
                        </div>
                    )}
                    {topics.some((t: string) => t.startsWith("awesome")) && (
                        <div>
                            <SiAwesomelists />
                        </div>
                    )}
                </Stack>
            </Card.Body>
            {topics.length > 0 && (
                <Card.Footer>
                    <Stack className="repo-topics">
                        {topics.map((topic: string) => (
                            <Chip
                                key={topic}
                                label={topic}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ borderRadius: ".25em" }}
                                onClick={() => onClickTopic(topic)}
                            />
                        ))}
                    </Stack>
                </Card.Footer>
            )}
        </Card>
    );
}

export default RepoCard;
