// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants.jsx';

export function updateActiveSection(newActiveSection) {
    return (dispatch) => {
        const action = {
            type: ActionTypes.UPDATE_ACTIVE_SECTION,
            data: newActiveSection,
        };

        dispatch(action);
    };
}