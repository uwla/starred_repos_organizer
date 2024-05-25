import { useEffect, useState } from "react";
import { Repo, ViewProps } from "../types";
import "./ViewByTopics.css";
import { Accordion } from "react-bootstrap";

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
            let topics = repo.topics;
            if (topics.length === 0) {
                topics = ["~~ none ~~"];
            }
            topics.forEach((topic) => {
                if (!newMap[topic]) {
                    newMap[topic] = [];
                }
                newMap[topic].push(repo);
            });
        });
        setMap(newMap);
    }

    useEffect(() => {
        updateMap();
    }, [repos]);

    return (
        <div className="topic-view">
            {Object.keys(map)
                .sort()
                .map((topic) => (
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item key={topic} eventKey="0">
                            <Accordion.Header>
                                {topic} ({map[topic].length})
                            </Accordion.Header>
                            <Accordion.Body>
                                <Display
                                    repos={map[topic].sort(sortFn)}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onRefresh={onRefresh}
                                    onTopicClicked={onTopicClicked}
                                />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                ))}
        </div>
    );
}

export default ViewByTopics;
