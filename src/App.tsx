import { Card, CardHeader, CardContent, Container, Stack } from "@mui/material";
import "./App.css";
import data from "./assets/data/sample_stars_github.json";

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
        return (
            <Card key={index}>
                <CardHeader title={repo.name} />
                <CardContent>{repo.description}</CardContent>
            </Card>
        );
    });

    return (
        <>
            <Container>
                <h1>GIT STARRED REPOS</h1>
                <Stack >{cards}</Stack>
            </Container>
        </>
    );
}

export default App;
