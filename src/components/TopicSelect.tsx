import { Button, Modal, Form, Nav } from "react-bootstrap";
import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";

import type { Topic, TopicAliases } from '../types.ts'
import './TopicSelect.css'

interface Props {
    show: boolean;
    topics: Topic[];
    allowedTopics: Topic[];
    topicAliases: TopicAliases;
    onConfirmSelection: (topics: Topic[]) => void;
    onUpdateAllowedList: (topics: Topic[]) => void;
    onUpdateTopicAliases: (aliases: TopicAliases) => void;
    onHide: () => void;
}

interface TopicCheckbox {
    topic: Topic;
    checked: boolean;
}

function topicToCheckbox (t: Topic) {
    return {
        topic: t,
        checked: true,
    } as TopicCheckbox;
}

function aliasesToText(aliases: TopicAliases) {
    const reversedAliases: Record<Topic, Topic[]> = {}

    for (const key of Object.keys(aliases)) {
        const value = aliases[key]
        if (reversedAliases[value] === undefined) {
            reversedAliases[value] = []
        }
        reversedAliases[value].push(key)
    }

    let text = ""

    for (const key of Object.keys(reversedAliases)) {
        const lineItems = [key, ...reversedAliases[key]]
        const line = lineItems.join(" ")
        text += line + "\n"
    }

    return text
}

function textToAliases(text: string): TopicAliases {
    const aliases: TopicAliases = {}

    for (const line of text.split("\n")) {
        const topics = line.split(" ")

        if (topics.length < 2) {
            continue
        }

        const mainTopic = topics.shift() as Topic
        for (const topic of topics) {
            aliases[topic] = mainTopic
        }
    }

    return aliases
}
function TopicSelect(props: Props) {
    const {
        show,
        topics,
        allowedTopics,
        topicAliases,
        onConfirmSelection,
        onUpdateAllowedList,
        onUpdateTopicAliases,
        onHide,
    } = props;
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("edit");

    const [allowedList, setAllowedList] = useState(allowedTopics.join("\n"));
    const [checkboxes, setCheckboxes] = useState(topics.map(topicToCheckbox));
    const [aliasText, setAliasText] = useState(aliasesToText(topicAliases))

    useEffect(() => {
        setCheckboxes(topics.map(topicToCheckbox))
    }, [topics]);

    useEffect(() => {
        setAllowedList(allowedTopics.join("\n"));
    }, [allowedTopics]);

    useEffect(() => {
        setAliasText(aliasesToText(topicAliases))
    }, [topicAliases])

    const handleSubmit = () => {
        if (tab === "edit") {
            const filtered = checkboxes.filter((c: TopicCheckbox) => c.checked);
            const topics = filtered.map((r: TopicCheckbox) => r.topic);
            onConfirmSelection(topics);
            return;
        }

        if (tab === "allowed_list") {
            const newAllowedList = allowedList.split("\n")
                .map(str => str.trim())
                .filter(str => str !== "");
            onUpdateAllowedList(newAllowedList);
            return;
        }

        if (tab === "alias_list") {
            const cleanText = aliasText.split("\n")
                .map(str => str.trim())
                .filter(str => str !== "")
                .join("\n");
            onUpdateTopicAliases(textToAliases(cleanText))
            return
        }
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const toggleChecked = (topic: Topic) => {
        const index = checkboxes.findIndex(
            (c: TopicCheckbox) => c.topic === topic
        );
        if (index === -1) return
        checkboxes[index].checked = !checkboxes[index].checked;
        setCheckboxes([...checkboxes]);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header>
                <Modal.Title>MANAGE TOPICS</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Nav
                    defaultActiveKey={tab}
                    variant="tabs"
                    className="mb-3"
                >
                    <Nav.Item
                        onClick={() => setTab("edit")}
                    >
                        <Nav.Link eventKey="edit">
                            MANUAL EDIT
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item
                        onClick={() => setTab("allowed_list")}
                    >
                        <Nav.Link eventKey="allowed_list">
                            ALLOWED LIST
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item
                        onClick={() => setTab("alias_list")}
                    >
                        <Nav.Link eventKey="alias_list">
                            ALIAS LIST
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                {tab === "edit" && (
                    <>
                        <p>Uncheck topics to delete them. Checked topics will remain.</p>
                        <div className="mb-3">
                            <Form.Control
                                onChange={handleInput}
                                placeholder="search topic..."
                                type="text"
                            ></Form.Control>
                        </div>
                        <div className="select-menu">
                            {checkboxes
                                .filter((checkbox: TopicCheckbox) => {
                                    return checkbox.topic.includes(search);
                                })
                                .map((checkbox: TopicCheckbox, index: number) => {
                                    const { topic, checked } = checkbox;
                                    const cssId = `topic-checkbox-${index}`;
                                    return (
                                        <div key={topic} className="select-checkbox">
                                            <Checkbox
                                                checked={checked}
                                                onChange={() => toggleChecked(topic)}
                                                id={cssId}
                                            />
                                            <label htmlFor={cssId}>{topic}</label>
                                        </div>
                                    );
                                })}
                        </div>
                    </>
                )}
                {tab === "allowed_list" && (
                    <div id="allowed-topics">
                        <p>Topics <b>not</b> in this allowed-topics list are <b>deleted</b>.</p>
                        <p>Empty list means <b>all</b> topics are <b>allowed</b>.</p>
                        <p>Insert <b>one topic per line</b>.</p>
                        <Form.Control
                            as="textarea"
                            rows={10}
                            value={allowedList}
                            onChange={(e) => setAllowedList(e.target.value)}
                        ></Form.Control>
                    </div>
                )}
                {tab === "alias_list" && (
                    <div id="alias-list">
                        <p>
                            To avoid duplicated topics you can set
                            aliases to be converted to a main topic.
                            Example:
                        </p>
                        <code className="my-2 py-2 d-block">
                            cli command-line commandline command-line-tool cli-tool
                        </code>
                        <p>
                            Will convert the topics
                            &nbsp;<code>command-line</code>
                            &nbsp;<code>commandline</code>,
                            &nbsp;<code>command-line-tool</code> and
                            &nbsp;<code>cli-tool</code>
                            &nbsp;to <code>cli</code>.
                        </p>
                        <Form.Control
                            as="textarea"
                            rows={10}
                            value={aliasText}
                            onChange={(e) => setAliasText(e.target.value)}
                        ></Form.Control>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onHide}>
                    CANCEL
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                    UPDATE
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default TopicSelect;
