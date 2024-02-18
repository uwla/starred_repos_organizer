import makeAnimated from "react-select/animated";
import Select, { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable"
import { SelectOption } from "../types";
import { topicsToOptions } from "../utils";

const animatedComponents = makeAnimated();

interface Props {
    topics: string[];
    selected: SelectOption[];
    creatable?: boolean;
    onSelect: (val: MultiValue<SelectOption>) => void;
}

function TopicsFilter(props: Props) {
    const { creatable, topics, selected, onSelect } = props;
    const options = topicsToOptions(topics);

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
