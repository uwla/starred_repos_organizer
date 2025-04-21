import { Button, Modal, Form, Nav } from "react-bootstrap";
import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import './TopicSelect.css'

interface Props {
    show: boolean;
    topics: string[];
    allowedTopics: string[];
    onConfirmSelection: (topics: string[]) => void;
    onUpdateAllowedList: (topics: string[]) => void;
    onHide: () => void;
}

interface TopicCheckbox {
    topic: string;
    checked: boolean;
}

const mapChecked = (t: string) =>
    ({ topic: t, checked: true } as TopicCheckbox);

function TopicSelect(props: Props) {
    const { show, topics, allowedTopics, onConfirmSelection, onUpdateAllowedList, onHide } = props;
    const [checkboxes, setCheckboxes] = useState(topics.map(mapChecked));
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState("edit");
    const [allowedList, setAllowedList] = useState(allowedTopics.join("\n"));

    // Use Effect is likely not needed
    useEffect(() => {
        setCheckboxes(topics.map(mapChecked))
        setAllowedList(allowedTopics.join("\n"));
    }, [allowedTopics, topics]);

    // Confirm the user has selected the added topics;
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
    };

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const toggleChecked = (topic: string) => {
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
                <Nav variant="tabs" defaultActiveKey={tab} className="mb-3" >
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
                </Nav>
                {tab === "edit" && (
                    <>
                        <p>
                            Uncheck topics to delete them. Checked topics will remain.
                        </p>
                        <div className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="search topic..."
                                onChange={handleInput}
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
                ) }
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
