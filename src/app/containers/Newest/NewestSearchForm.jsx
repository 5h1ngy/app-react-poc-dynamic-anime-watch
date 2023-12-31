import _ from "lodash";
import React, { useEffect, useState } from 'react';

import SearchForm from 'gcomponents/SearchFormTodo';
import { parseStatusLabel, parseTypesLabel } from "app/common";

function NewestSearchForm({ actions, state }) {
    const { searchForm, statuses, types } = state;
    const [searchFormTags, setSearchFormTags] = useState([])

    useEffect(() => {
        if (types.length === 0 && statuses.length === 0) {
            actions.newest.getStatuses();
            actions.newest.getTypes();
        } else {
            setSearchFormTags([
                {
                    label: 'Stato',
                    labelColor: '#F6E05E',
                    values: statuses.map(status => ({
                        label: parseStatusLabel(status),
                        value: status,
                        onClick: (payload) => actions.newest.setStatus(payload),
                        active: _.includes(searchForm.statuses, status),
                    }))
                },
                {
                    label: 'Tipo',
                    labelColor: '#B794F4',
                    values: types.map(type => ({
                        label: parseTypesLabel(type),
                        value: type,
                        onClick: (payload) => actions.newest.setType(payload),
                        active: _.includes(searchForm.types, type),
                    }))
                }
            ])
        }
    }, [statuses, types, searchForm, actions.newest]);

    return (<SearchForm tags={searchFormTags} />)
}

export default NewestSearchForm