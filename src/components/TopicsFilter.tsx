import { useState } from "react";
import { Button, Stack } from "@mui/material";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

interface Props {
    topics: string[];
    selected: string[];
    onSubmit: (topics: string[]) => void;
    onSelect: (val: any) => void;
}

function TopicsFilter(props: Props) {
    const { topics, selected, onSelect, onSubmit } = props;
    const options = topics.map((t: string) => ({ value: t, label: t }));

    function handleClick() {
        onSubmit(selected.map((options: any) => options.value));
    }

    return (
        <Stack direction="row" spacing={1}>
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
            <Button color="primary" variant="contained" onClick={handleClick}>
                OK
            </Button>
        </Stack>
    );
}

export default TopicsFilter;
