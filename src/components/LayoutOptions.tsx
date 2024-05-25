import { Form, Stack } from "react-bootstrap";

interface Props {
    onSelect: (value: string) => void;
}

function LayoutOptions(props: Props) {
    const { onSelect } = props;

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onSelect(event.target.value);
    }

    return (
        <Stack direction="horizontal" className="sort-options">
            <p>View as</p>
            <Form.Select onChange={handleChange}>
                <option value="grid">Grid</option>
                <option value="list">List</option>
            </Form.Select>
        </Stack>
    );
}

export default LayoutOptions;
