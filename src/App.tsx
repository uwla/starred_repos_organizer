import { Card, CardHeader, CardContent, Container, Stack } from "@mui/material";
import './App.css'

function App() {
    return (
        <>
            <Container>
                <h1>GIT STARRED REPOS</h1>
                <Stack direction="row" spacing={2}>
                    <Card>
                        <CardHeader title="React" />
                        <CardContent>React is a UI components library.</CardContent>
                    </Card>
                    <Card>
                        <CardHeader title="Vue" />
                        <CardContent>Vue is a web framework.</CardContent>
                    </Card>
                </Stack>
            </Container>
        </>
    );
}

export default App;
