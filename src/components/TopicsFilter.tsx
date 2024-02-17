import { Button, Stack } from "react-bootstrap";
import makeAnimated from "react-select/animated";
import Select, { MultiValue } from "react-select";
import { SelectOption } from "../App";

const animatedComponents = makeAnimated();

interface Props {
    topics: string[];
    selected: SelectOption[];
    onSubmit: (topics: string[]) => void;
    onSelect: (val: MultiValue<SelectOption>) => void;
}

function TopicsFilter(props: Props) {
    const { topics, selected, onSelect, onSubmit } = props;
    const options = topics.map((t: string) => ({ value: t, label: t }));

    function handleClick() {
        onSubmit(selected.map((options: SelectOption) => options.value));
    }

    return (
        <Stack direction="horizontal" gap={2}>
            <div style={{ flexGrow: "1" }}>
                <Select
                    options={options}
                    value={selected}
                    onChange={onSelect}
                    isMulti
                    isSearchable
                    placeholder="search by topic..."
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                />
            </div>
            <Button variant="primary" onClick={handleClick}>
                FILTER
            </Button>
        </Stack>
    );
}

export default TopicsFilter;
