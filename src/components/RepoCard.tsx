import {
    IconType,
    SiAwesomelists,
    SiC,
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
    Delete as IconDelete,
    Edit as IconEdit,
    AltRoute as IconForks,
    Settings as IconGear,
    HomeOutlined as IconHome,
    Star as IconStar,
} from "@mui/icons-material";
import { Chip } from "@mui/material";
import { orange } from "@mui/material/colors";
import { Card, Dropdown, Stack } from "react-bootstrap";
import { Repo } from "../types";
import "./RepoCard.css";

interface Props {
    repo: Repo;
    onTopicClick: (topic: string) => void;
    onDelete: () => void;
    onEdit: () => void;
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
    shell: SiGnubash,
    svelte: SiSvelte,
    typescript: SiTypescript,
    vim: SiVim,
    vue: SiVuedotjs
} as { [key: string]: IconType };

function RepoCard(props: Props) {
    const { repo, onTopicClick, onEdit, onDelete } = props;
    const topics = [...repo.topics].sort();

    // Tactic to avoid nested JSX.
    const repoTopics = topics.map((topic: string) => {
        return (
            <Chip
                key={topic}
                label={topic}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ borderRadius: ".25em" }}
                onClick={() => onTopicClick(topic)}
            />
        );
    });

    // Tactic to avoid nested JSX.
    const repoLinks = [];
    if (repo.url.includes("github.com")) {
        repoLinks.push(
            <Card.Link key="1" href={repo.url}>
                <IconGitHub fontSize="small" />
                <span>GitHub</span>
            </Card.Link>
        );
    } else if (repo.url.includes("gitlab.com")) {
        repoLinks.push(
            <Card.Link key="1" href={repo.url}>
                <IconGitLab fontSize="small" />
                <span>GitLab</span>
            </Card.Link>
        );
    }

    if (repo.homepage != "" && repo.homepage != null) {
        repoLinks.push(
            <Card.Link key="2" href={repo.homepage}>
                <IconHome fontSize="small" />
                <span>Website</span>
            </Card.Link>
        );
    }

    repoLinks.push(
        <div key="3">
            <IconStar sx={{ color: orange[500] }} fontSize="small" />
            <span>{repo.stars}</span>
        </div>
    );

    if (typeof repo.forks == "number") {
        repoLinks.push(
            <div key="4">
                <IconForks fontSize="small" />
                <span>{repo.forks}</span>
            </div>
        );
    }

    const lang = (repo.lang || "").toLowerCase();
    if (languageIcons[lang]) {
        const LanguageIcon = languageIcons[lang];
        repoLinks.push(
            <div key="5">
                <LanguageIcon />
            </div>
        );
    }

    if (repo.topics.includes("awesome") || repo.topics.includes("awesome-list")) {
        repoLinks.push(
            <div key="6">
                <SiAwesomelists />
            </div>
        );
    }

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
                    {repoLinks}
                </Stack>
            </Card.Body>
            {topics.length > 0 && (
                <Card.Footer>
                    <Stack className="repo-topics">{repoTopics}</Stack>
                </Card.Footer>
            )}
        </Card>
    );
}

export default RepoCard;
