import { Chip } from "@mui/material";
import { Card, Stack } from "react-bootstrap";
import {
    Star as IconStar,
    GitHub as IconGitHub,
    HomeOutlined as IconHome,
} from "@mui/icons-material";
import { orange } from "@mui/material/colors";

import { Repo } from "../repo/Repo";

interface Props {
    repo: Repo;
    onTopicClick: (topic: string) => void;
}

function RepoItem(props: Props) {
    const { repo, onTopicClick: onTopicClicked } = props;
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
                onClick={() => onTopicClicked(topic)}
            />
        );
    });

    // Tactic to avoid nested JSX.
    const repoLinks = [];
    repoLinks.push(
        <Card.Link key="1" href={repo.html_url}>
            <IconGitHub fontSize="small" />
            <span>GitHub</span>
        </Card.Link>
    );
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

    // const [openMenu, setOpenMenu] = useState(false);

    return (
        <Card>
            <Card.Header>
                <Card.Title>{repo.name}</Card.Title>
                <Card.Subtitle>{repo.full_name}</Card.Subtitle>
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
