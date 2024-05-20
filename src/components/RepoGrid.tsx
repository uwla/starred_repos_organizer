import { Repo } from "../types";
import RepoCard from "./RepoCard";
import './RepoGrid.css'

interface Props {
    repos: Repo[];
    onEdit: (repo: Repo) => void;
    onRefresh: (repo: Repo) => void;
    onDelete: (repo: Repo) => void;
    onTopicClicked: (topic: string) => void;
}

function RepoGrid(props: Props) {
    const { repos, onEdit, onDelete, onRefresh, onTopicClicked } = props;
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
                );
            })}
        </div>
    );
}

export default RepoGrid;
