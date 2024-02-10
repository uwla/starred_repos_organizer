import {
    Chip,
    Card,
    CardActions,
    CardHeader,
    CardContent,
    Stack,
    Link,
} from "@mui/material";
import {
    Star as IconStar,
    GitHub as IconGitHub,
    HomeOutlined as IconHome,
} from "@mui/icons-material";
import { orange } from "@mui/material/colors";

import { StarredRepo } from "../App";

function RepoItem(props: StarredRepo) {
    const repo = props;
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
                sx={{ borderRadius: ".25em"}}
            />
        );
    });

    // Tactic to avoid nested JSX.
    const repoLinks = [];
    repoLinks.push(
        <Link href={repo.html_url} underline="hover">
            <IconGitHub fontSize="small" />
            <span>GitHub</span>
        </Link>
    );
    if (repo.homepage) {
        repoLinks.push(
            <Link href={repo.homepage} underline="hover">
                <IconHome fontSize="small" />
                <span>Website</span>
            </Link>
        );
    }
    repoLinks.push(
        <div>
            <IconStar sx={{ color: orange[500] }} fontSize="small" />
            <span>{repo.stars}</span>
        </div>
    );

    return (
        <Card variant="outlined">
            <CardHeader title={repo.name} subheader={repo.full_name} />
            <Stack className="repo-details">
                {repoLinks}
            </Stack>
            <CardContent>
                {repo.description}
            </CardContent>
            <CardActions>
                <Stack className="repo-topics" useFlexGap>
                    {repoTopics}
                </Stack>
            </CardActions>
        </Card>
    );
}

export default RepoItem;
