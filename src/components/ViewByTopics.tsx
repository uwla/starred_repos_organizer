import { useEffect, useState } from "react"
import { NoTopicsType, Repo, ViewProps } from "../types"
import "./ViewByTopics.css"
import { Accordion } from "react-bootstrap"

function ViewByTopics(props: ViewProps) {
    const {
        repos,
        topics,
        sortFn,
        onEdit,
        onRefresh,
        onDelete,
        onTopicClicked,
        Display,
    } = props

    const [map, setMap] = useState({} as { [key: string]: Repo[] })
    const [currentTopic, setCurrentTopic] = useState("")

    function updateMap() {
        const newMap = {} as { [key: string]: Repo[] }
        repos.forEach(repo => {
            let topics = repo.topics
            if (topics.length === 0) {
                topics = [NoTopicsType]
            }
            topics.forEach(topic => {
                if (!newMap[topic]) {
                    newMap[topic] = []
                }
                newMap[topic].push(repo)
            })
        })
        setMap(newMap)
    }

    useEffect(() => {
        updateMap()
    }, [repos])

    return (
        <Accordion
            className="topic-view"
            onSelect={t => setCurrentTopic(t as string)}
        >
            {Object.keys(map)
                .filter(t => !(topics.length > 0 && !topics.includes(t)))
                .sort()
                .map(topic => (
                    <Accordion.Item
                        key={topic}
                        eventKey={topic}
                    >
                        <Accordion.Header>
                            {topic} ({map[topic].length})
                        </Accordion.Header>
                        <Accordion.Body>
                            {currentTopic === topic && (
                                <Display
                                    repos={map[topic].sort(sortFn)}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onRefresh={onRefresh}
                                    onTopicClicked={onTopicClicked}
                                />
                            )}
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
        </Accordion>
    )
}

export default ViewByTopics
