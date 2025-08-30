import { DisplayProps, Repo } from "../types"
import RepoCard from "./RepoCard"
import "./RepoGrid.css"

function RepoGrid(props: DisplayProps) {
    const { repos, onEdit, onDelete, onRefresh, onTopicClicked } = props
    return (
        <div className="repo-grid">
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
        </div>
    )
}

export default RepoGrid
