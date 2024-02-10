import { Button, Stack, TextField } from "@mui/material";
import { Search as IconSearch } from "@mui/icons-material";
import { useState } from "react";

interface Props {
    onSubmit: (query: string) => void;
}

function SearchFilter(props: Props) {
    const { onSubmit } = props;
    let [searchInput, setSearchInput] = useState("");

    function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchInput(event.target.value);
    }

    function handleClick() {
        onSubmit(searchInput);
    }

    return (
        <>
            <Stack direction="row" spacing={0.5}>
                <TextField
                    id="search-input"
                    label="Search"
                    variant="outlined"
                    sx={{ flexGrow: "1" }}
                    onChange={handleInput}
                />
                <Button color="info" variant="outlined" onClick={handleClick}>
                    <IconSearch />
                </Button>
            </Stack>
        </>
    );
}

export default SearchFilter;
