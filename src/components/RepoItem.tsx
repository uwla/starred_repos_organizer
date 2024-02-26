import {
    SiGithub as IconGitHub,
    SiGitlab as IconGitLab,
} from "@icons-pack/react-simple-icons";
import {
    Delete as IconDelete,
    Edit as IconEdit,
    Settings as IconGear,
    HomeOutlined as IconHome,
    Star as IconStar,
} from "@mui/icons-material";
import { Chip } from "@mui/material";
import { orange } from "@mui/material/colors";
import { Card, Dropdown, Stack } from "react-bootstrap";

import { Repo } from "../types";
import "./RepoItem.css";

interface Props {
    repo: Repo;
    onTopicClick: (topic: string) => void;
    onDelete: () => void;
    onEdit: () => void;
}

function RepoItem(props: Props) {
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
    if (repo.html_url.includes("github.com")) {
        repoLinks.push(
            <Card.Link key="1" href={repo.html_url}>
                <IconGitHub fontSize="small" />
                <span>GitHub</span>
            </Card.Link>
        );
    } else if (repo.html_url.includes("gitlab.com")) {
       repoLinks.push(
            <Card.Link key="1" href={repo.html_url}>
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

                <Stack direction="horizontal" gap={2} className="repo-details">
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

export default RepoItem;
