import { Container, Stack } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import RepoItem from "./components/RepoItem";
import data from "./assets/data/sample_stars_github.json";
import "./App.css";

export interface StarredRepo {
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

    const cards = repos.map((repo: StarredRepo) => {
        return <RepoItem {...repo} />
    });

    return (
        <>
            <CssBaseline />
            <Container maxWidth="md" id="app">
                <h1>STARRED REPOS</h1>
                <Stack spacing={3}>{cards}</Stack>
            </Container>
        </>
    );
}

export default App;
