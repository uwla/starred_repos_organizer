import { FormEvent, useState } from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    TextField,
} from "@mui/material";
import { Repo } from "../repo/Repo";
import GitHubRepo from "../repo/GitHubRepo";

interface Props {
    onAdd: (repo: Repo) => Promise<boolean>;
    onAddMany: (repos: Repo[]) => Promise<boolean>;
}

// TODO: add support for other sources: GitLab, Gitea, SourceHut, ...
const getRepo = async (url: string) => {
    return GitHubRepo.getRepo(url);
};

// TODO: add support for other sources: GitLab, Gitea, SourceHut, ...
const getUserStarredRepos = async (url: string) => {
    const userName = url.replace(/.*\//, "");
    return GitHubRepo.getReposFromUser(userName);
};

function AddItem(props: Props) {
    const { onAdd, onAddMany } = props;
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [url, setUrl] = useState("");

    const handleClick = () => setOpen(true);

    const handleClose = () => setOpen(false);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // We need to determine if the URL is a repository URL, or if it is a
        // user profile URL. In the later case, we will fetch all of the user's
        // starred repositories.
        const urlPath = url.replace(/(https?:\/\/)?[^/]+/, "");
        const pathArray = urlPath.split("/").filter((str: string) => str != "");

        // callback to add single repository
        const callbackSingle = () =>
            getRepo(url).then((repo: Repo) => onAdd(repo));

        // callback to add many repositories at once
        const callbackMany = () =>
            getUserStarredRepos(url).then((repos: Repo[]) => onAddMany(repos));

        // actual callback.
        const callback = pathArray.length == 1 ? callbackMany : callbackSingle;

        // perform the callback and show a status popup message.
        callback()
            .then((status: boolean) => {
                setStatus(status);
                if (status) setUrl("");
            })
            .catch(() => setStatus(false))
            .finally(() => setShowStatus(true));
    };

    return (
        <>
            <Button variant="contained" color="success" onClick={handleClick}>
                ADD REPO
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: "form",
                    onSubmit: handleSubmit,
                }}
            >
                <DialogTitle>ADD REPOSITORY</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the URL for the repository.
                        <br />
                        If the URL is a user profile, it will add all starred
                        repositories from that user.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        id="repo_url"
                        label="URL"
                        margin="dense"
                        name="repo_url"
                        required
                        type="url"
                        variant="standard"
                        value={url}
                        onChange={handleInput}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={showStatus}
                autoHideDuration={1000}
                onClose={() => setShowStatus(false)}
            >
                <Alert
                    severity={status ? "success" : "error"}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {status ? "Repo added!" : "Something failed..."}
                </Alert>
            </Snackbar>
        </>
    );
}

export default AddItem;
