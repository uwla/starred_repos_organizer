import { useState } from "react";
import { Button, Stack } from "@mui/material";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

interface Props {
    topics: string[];
    selected: string[];
    onSelect: (topics: string[]) => void;
}

function TopicsFilter(props: Props) {
    const { topics, selected, onSelect } = props;
    const options = topics.map((t: string) => ({ value: t, label: t }));
    const [value, setVal] = useState(
        selected.map((t: any) => ({
            value: t,
            label: t,
        }))
    );

    function handleChange(newValue: any) {
        setVal(newValue);
    }

    function handleClick() {
        onSelect(value.map((options: any) => options.value));
    }

    return (
        <Stack direction="row" spacing={1}>
            <div style={{ flexGrow: "1" }}>
                <Select
                    options={options}
                    value={value}
                    onChange={handleChange}
                    isMulti
                    isSearchable
                    placeholder="search by topic..."
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                />
            </div>
            <Button color="primary" variant="contained" onClick={handleClick}>
                OK
            </Button>
        </Stack>
    );
}

export default TopicsFilter;
