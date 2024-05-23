import { useEffect, useState } from "react";
import { Repo, ViewProps } from "../types";
import "./ViewByTopics.css";

function ViewByTopics(props: ViewProps) {
    const {
        repos,
        sortFn,
        onEdit,
        onRefresh,
        onDelete,
        onTopicClicked,
        Display,
    } = props;

    const [map, setMap] = useState({} as { [key: string]: Repo[] });

    function updateMap() {
        const newMap = {} as { [key: string]: Repo[] };
        repos.forEach((repo) => {
            repo.topics.forEach((topic) => {
                if (!newMap[topic]) {
                    newMap[topic] = [repo];
                } else {
                    newMap[topic].push(repo);
                }
            });
        });
        setMap(newMap);
    }

    useEffect(() => {
        updateMap();
        console.log("updated...");
    }, [repos]);

    return (
        <div className="topic-view">
            {Object.keys(map).sort().map((topic) => (
                <section key={topic}>
                    <h2>{topic}</h2>
                    <Display
                        repos={map[topic].sort(sortFn)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onRefresh={onRefresh}
                        onTopicClicked={onTopicClicked}
                    />
                </section>
            ))}
        </div>
    );
}

export default ViewByTopics;
