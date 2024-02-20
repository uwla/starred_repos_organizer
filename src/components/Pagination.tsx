import "./Pagination.css";

import { ChangeEvent, MouseEvent } from "react";
import TablePagination from "@mui/material/TablePagination";

interface Props {
    count: number;
    page: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

export default function Pagination(props: Props) {
    const { count, perPage, page, onPageChange, onPerPageChange } = props;

    function handleChangePage(
        _event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) {
        onPageChange(newPage);
    }

    function handleChangeRowsPerPage(event: ChangeEvent<HTMLInputElement>) {
        const value = parseInt(event.target.value, 10);
        onPageChange(0);
        onPerPageChange(value);
    }

    return (
        <>
            {count > 0 && (
                <TablePagination
                    className="repo-pagination"
                    component="div"
                    count={count}
                    page={page}
                    onPageChange={handleChangePage}
                    labelRowsPerPage={`Showing ${perPage} items:`}
                    rowsPerPage={perPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </>
    );
}
