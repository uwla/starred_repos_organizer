import { Button, Stack, Form } from "react-bootstrap";
import { Search as IconSearch } from "@mui/icons-material";
import { useState } from "react";

interface Props {
    onSubmit: (query: string) => void;
}

function SearchFilter(props: Props) {
    const { onSubmit } = props;
    const [searchInput, setSearchInput] = useState("");

    function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchInput(event.target.value);
    }

    function handleClick() {
        onSubmit(searchInput);
    }

    function handleKey(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            onSubmit(searchInput);
        }
    }

    return (
        <>
            <Stack direction="horizontal" gap={2}>
                <Form.Control
                    type="text"
                    id="search-input"
                    onChange={handleInput}
                    onKeyDown={handleKey}
                    placeholder="Search..."
                ></Form.Control>
                <Button variant="primary" onClick={handleClick}>
                    <IconSearch />
                </Button>
            </Stack>
        </>
    );
}

export default SearchFilter;
