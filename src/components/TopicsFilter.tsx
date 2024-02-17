import { Button, Stack } from "react-bootstrap";
import makeAnimated from "react-select/animated";
import Select, { MultiValue } from "react-select";
import { SelectOption } from "../App";

const animatedComponents = makeAnimated();

interface Props {
    topics: string[];
    selected: SelectOption[];
    onSelect: (val: MultiValue<SelectOption>) => void;
}

function TopicsFilter(props: Props) {
    const { topics, selected, onSelect } = props;
    const options = topics.map((t: string) => ({ value: t, label: t }));

    return (
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
    );
}

export default TopicsFilter;
