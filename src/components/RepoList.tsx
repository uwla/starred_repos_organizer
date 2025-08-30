import { Stack } from "react-bootstrap"
import { DisplayProps, Repo } from "../types"
import RepoCard from "./RepoCard"

function RepoList(props: DisplayProps) {
    const { repos, onEdit, onDelete, onRefresh, onTopicClicked } = props
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
                )
            })}
        </Stack>
    )
}

export default RepoList
