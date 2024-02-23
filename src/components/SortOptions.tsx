import { ChangeEvent } from "react";
import { Form, Stack } from "react-bootstrap";
import './SortOptions.css'

interface Props {
    values: string[];
    onSelect: (value: string) => void;
}

function SortOptions(props: Props) {
    const { values, onSelect } = props;

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onSelect(e.target.value);
    };

    return (
        <Stack direction="horizontal" className="sort-options">
            <p>Sort by:</p>
            <Form.Select onChange={handleChange} >
                {values.map((value: string) => {
                    return (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    );
                })}
            </Form.Select>
        </Stack>
    );
}

export default SortOptions;
