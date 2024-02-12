import { useState, MouseEvent, ChangeEvent } from "react";
import TablePagination from "@mui/material/TablePagination";

interface Props {
    count: number;
    page: number,
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

export default function Pagination(props: Props) {
    const { count, page, onPageChange, onPerPageChange } = props;
    const [rowsPerPage, setRowsPerPage] = useState(10);

    function handleChangePage(
        _event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) {
        onPageChange(newPage);
    }

    function handleChangeRowsPerPage(event: ChangeEvent<HTMLInputElement>) {
        const value = parseInt(event.target.value, 10);
        setRowsPerPage(value);
        onPageChange(0);
        onPerPageChange(value);
    }

    return (
        <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={handleChangePage}
            labelRowsPerPage={`Showing ${rowsPerPage} items:`}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    );
}
