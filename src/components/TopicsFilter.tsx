import { Button, Stack } from "react-bootstrap";
import makeAnimated from "react-select/animated";
import Select, { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable"
import { SelectOption } from "../App";

const animatedComponents = makeAnimated();

interface Props {
    topics: string[];
    selected: SelectOption[];
    creatable?: boolean;
    onSelect: (val: MultiValue<SelectOption>) => void;
}

function TopicsFilter(props: Props) {
    const { creatable, topics, selected, onSelect } = props;
    const options = topics.map((t: string) => ({ value: t, label: t }));

    const SelectComponent = creatable ? CreatableSelect : Select;

    return (
        <SelectComponent
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
