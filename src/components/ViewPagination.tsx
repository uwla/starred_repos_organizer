import { ViewProps } from "../types";
import SettingsManager from "../settings";
import { useEffect, useState } from "react";
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

    const defaultPerPage = Number(SettingsManager.get('perPage')) || 20;
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(defaultPerPage);

    function handlePageChange(page: number) {
        setPage(page);
    }

    function handlePerPageChange(newPerPage: number) {
        if (perPage === newPerPage) {
            return
        }

        const firstEntryIndex = 1 + (page ) * perPage
        let newPage = Math.ceil(firstEntryIndex / newPerPage)
        newPage = Math.max(0, newPage - 1) // because index starts from 0

        setPage(newPage);
        setPerPage(newPerPage);
        SettingsManager.set('perPage', String(newPerPage));
    }

    useEffect(() => {
        setPage(0)
    }, [repos])

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
