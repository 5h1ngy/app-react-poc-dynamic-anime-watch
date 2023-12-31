import React from 'react';
import Pagination from "gcomponents/PaginationTodo";

function NewestPagination({ actions, state }) {
    const { pagination } = state;

    return (<Pagination
        totalItems={pagination.total}
        size={pagination.size}
        offset={pagination.offset}
        onPageChange={(offset) => actions.newest.setPagination({ total: pagination.total, size: pagination.size, offset })}
    />)
}

export default NewestPagination