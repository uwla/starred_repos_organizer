import { ViewProps } from "../types";
import { useState } from "react";
import Pagination from "./Pagination";

function ViewPagination(props: ViewProps) {
    const {
        repos,
        sortFn,
        onEdit,
        onRefresh,
        onDelete,
        onTopicClicked,
        Display,
    } = props;

    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(20);

    function handlePageChange(page: number) {
        setPage(page);
    }

    function handlePerPageChange(perPage: number) {
        setPage(0);
        setPerPage(perPage);
    }

    return (
        <>
            {/* TOP PAGINATION */}
            <Pagination
                page={page}
                perPage={perPage}
                count={repos.length}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
            />

            {/* ITEMS */}
            <Display
                repos={[...repos]
                    .sort(sortFn)
                    .slice(page * perPage, (page + 1) * perPage)}
                onEdit={onEdit}
                onDelete={onDelete}
                onRefresh={onRefresh}
                onTopicClicked={onTopicClicked}
            />

            {/* BOTTOM PAGINATION */}
            <Pagination
                page={page}
                perPage={perPage}
                count={repos.length}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
            />
        </>
    );
}

export default ViewPagination;
