import { Stack } from "react-bootstrap";
import { Repo } from "../types";
import RepoCard from "./RepoCard";

interface Props {
    repos: Repo[];
    onEdit: (repo: Repo) => void;
    onRefresh: (repo: Repo) => void;
    onDelete: (repo: Repo) => void;
    onTopicClicked: (topic: string) => void;
}

function RepoList(props: Props) {
    const { repos, onEdit, onDelete, onRefresh, onTopicClicked } = props;
    return (
        <Stack gap={3}>
            {repos.map((repo: Repo) => {
                return (
                    <RepoCard
                        repo={repo}
                        key={repo.id}
                        onTopicClicked={onTopicClicked}
                        onRefresh={onRefresh}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                );
            })}
        </Stack>
    );
}

export default RepoList;
