import {
    Chip,
    Card,
    CardActions,
    CardHeader,
    CardContent,
    Container,
    Stack,
    Link,
} from "@mui/material";
import {
    Star as IconStar,
    GitHub as IconGitHub,
    HomeOutlined as IconHome,
} from "@mui/icons-material";
import { orange } from "@mui/material/colors";
import data from "./assets/data/sample_stars_github.json";
import "./App.css";

interface StarredRepo {
    full_name: string;
    name: string;
    description: string;
    topics: Array<string>;
    html_url: string;
    homepage: string;
    lang: string;
    created: string;
    last_push: string;
    last_update: string;
    forked: boolean;
    archived: boolean;
    template: boolean;
    owner: string;
    owner_url: string;
    owner_img: string;
    owner_type: string;
    stars: number;
}

function App() {
    const repos = data as StarredRepo[];

    const cards = repos.map((repo: StarredRepo, index) => {
        const topics = [...repo.topics].sort();

        const cardTopics = topics.map((topic: string) => {
            return (
                <Chip
                    key={topic}
                    label={topic}
                    size="small"
                    variant="outlined"
                    color="primary"
                />
            );
        });

        return (
            <Card key={index} variant="outlined">
                <CardHeader title={repo.name} subheader={repo.full_name} />
                <Stack direction="row" className="repo-details" mt="2">
                    <Link href={repo.html_url} underline="hover">
                        <IconGitHub fontSize="small"/>
                        <span>GitHub</span>
                    </Link>
                    {repo.homepage && (
                        <>
                            <Link href={repo.homepage} underline="hover">
                                <IconHome fontSize="small" />
                                <span>Website</span>
                            </Link>
                        </>
                    )}
                    <div>
                        <IconStar sx={{ color: orange[500] }} fontSize="small" />
                        <span>{repo.stars}</span>
                    </div>
                </Stack>
                <CardContent>{repo.description}</CardContent>

                <CardActions>
                    <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        {cardTopics}
                    </Stack>
                </CardActions>
            </Card>
        );
    });

    return (
        <>
            <Container maxWidth="md">
                <h1>GIT STARRED REPOS</h1>
                <Stack spacing={3}>{cards}</Stack>
            </Container>
        </>
    );
}

export default App;
