import CreatableSelect from "react-select/creatable"
import makeAnimated from "react-select/animated";
import Select, { MultiValue } from "react-select";
import { NoTopicsType, SelectOption } from "../types";
import { topicsToOptions } from "../utils";
import './TopicFilter.css'

const animatedComponents = makeAnimated();

interface Props {
    topics: string[];
    selected: SelectOption[];
    creatable?: boolean;
    onSelect: (val: MultiValue<SelectOption>) => void;
}

function TopicFilter(props: Props) {
    const { creatable, topics, selected, onSelect } = props;
    const options = topicsToOptions([...topics, NoTopicsType]);
    const SelectComponent = creatable ? CreatableSelect : Select;

    return (
        <SelectComponent
            className="topic-filter"
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

export default TopicFilter;
