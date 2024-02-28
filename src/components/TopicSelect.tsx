import { Button, Modal } from "react-bootstrap";
import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";

interface Props {
    show: boolean;
    topics: string[];
    onConfirmSelection: (topics: string[]) => void;
    onHide: () => void;
}

interface TopicCheckbox {
    topic: string;
    checked: boolean;
}

const mapChecked = (t: string) =>
    ({ topic: t, checked: true } as TopicCheckbox);

function RepoSelect(props: Props) {
    const { show, topics, onConfirmSelection, onHide} = props;
    const [checkboxes, setCheckboxes] = useState(topics.map(mapChecked));

    // Use Effect is likely not needed
    useEffect(() => setCheckboxes(topics.map(mapChecked)), [topics]);

    // Confirm the user has selected the added topics;
    const handleSubmit = () => {
        const filtered = checkboxes.filter((c: TopicCheckbox) => c.checked);
        const topics = filtered.map((r: TopicCheckbox) => r.topic);
        onConfirmSelection(topics);
    };

    const toggleChecked = (index: number) => {
        checkboxes[index].checked = !checkboxes[index].checked;
        setCheckboxes([...checkboxes]);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header>
                <Modal.Title>MANAGE TOPICS</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Uncheck topics to delete them. Checked topics will remain.</p>
                <div className="select-menu">
                    {checkboxes.map(
                        (checkbox: TopicCheckbox, index: number) => {
                            const { topic, checked } = checkbox;
                            const cssId = `topic-checkbox-${index}`;
                            return (
                                <div key={index}>
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => toggleChecked(index)}
                                        id={cssId}
                                    />
                                    <label htmlFor={cssId}>
                                        {topic}
                                    </label>
                                </div>
                            );
                        }
                    )}
                </div>
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

export default RepoSelect;
