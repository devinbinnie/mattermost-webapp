// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {CategorySorting} from 'mattermost-redux/types/channel_categories';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {insertWithoutDuplicates} from 'mattermost-redux/utils/array_utils';

import configureStore from 'store';

import {isCategoryCollapsed} from 'selectors/views/channel_sidebar';

import * as Actions from './channel_sidebar';

describe('setCategoryCollapsed', () => {
    test('should save category expanded and category collapsed', () => {
        const category1 = 'category1';
        const initialState = {
            entities: {
                users: {
                    currentUserId: 'user1',
                    profiles: {
                        user1: {},
                    },
                },
            },
        };

        const store = configureStore(initialState);

        store.dispatch(Actions.setCategoryCollapsed(category1, true));

        expect(isCategoryCollapsed(store.getState(), category1)).toBe(true);

        store.dispatch(Actions.setCategoryCollapsed(category1, false));

        expect(isCategoryCollapsed(store.getState(), category1)).toBe(false);
    });
});

describe('adjustTargetIndexForMove', () => {
    const channelIds = ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'];

    const initialState = {
        entities: {
            channelCategories: {
                byId: {
                    category1: {
                        id: 'category1',
                        channel_ids: channelIds,
                        sorting: CategorySorting.Manual,
                    },
                },
            },
            channels: {
                channels: {
                    new: {id: 'new', delete_at: 0},
                    one: {id: 'one', delete_at: 0},
                    twoDeleted: {id: 'twoDeleted', delete_at: 1},
                    three: {id: 'three', delete_at: 0},
                    four: {id: 'four', delete_at: 0},
                    fiveDeleted: {id: 'fiveDeleted', delete_at: 1},
                    six: {id: 'six', delete_at: 0},
                    seven: {id: 'seven', delete_at: 0},
                },
            },
        },
    };

    describe('should place newly added channels correctly in the category', () => {
        const testCases = [
            {
                inChannelIds: ['new', 'one', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['new', 'one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'new', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'new', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'new', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'new', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'new', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'new', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'new', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'new', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'seven', 'new'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven', 'new'],
            },
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            test('at ' + i, async () => {
                const store = configureStore(initialState);

                const targetIndex = testCase.inChannelIds.indexOf('new');

                const newIndex = Actions.adjustTargetIndexForMove(store.getState(), 'category1', ['new'], targetIndex, 'new');

                const actualChannelIds = insertWithoutDuplicates(channelIds, 'new', newIndex);
                expect(actualChannelIds).toEqual(testCase.expectedChannelIds);
            });
        }
    });

    describe('should be able to move channels forwards', () => {
        const testCases = [
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['three', 'one', 'four', 'six', 'seven'],
                expectedChannelIds: ['twoDeleted', 'three', 'one', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['three', 'four', 'one', 'six', 'seven'],
                expectedChannelIds: ['twoDeleted', 'three', 'four', 'one', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['three', 'four', 'six', 'one', 'seven'],
                expectedChannelIds: ['twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'one', 'seven'],
            },
            {
                inChannelIds: ['three', 'four', 'six', 'seven', 'one'],
                expectedChannelIds: ['twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven', 'one'],
            },
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            test('at ' + i, async () => {
                const store = configureStore(initialState);

                const targetIndex = testCase.inChannelIds.indexOf('one');

                const newIndex = Actions.adjustTargetIndexForMove(store.getState(), 'category1', ['one'], targetIndex, 'one');

                const actualChannelIds = insertWithoutDuplicates(channelIds, 'one', newIndex);
                expect(actualChannelIds).toEqual(testCase.expectedChannelIds);
            });
        }
    });

    describe('should be able to move channels backwards', () => {
        const testCases = [
            {
                inChannelIds: ['one', 'three', 'four', 'six', 'seven'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six', 'seven'],
            },
            {
                inChannelIds: ['one', 'three', 'four', 'seven', 'six'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'four', 'seven', 'fiveDeleted', 'six'],
            },
            {
                inChannelIds: ['one', 'three', 'seven', 'four', 'six'],
                expectedChannelIds: ['one', 'twoDeleted', 'three', 'seven', 'four', 'fiveDeleted', 'six'],
            },
            {
                inChannelIds: ['one', 'seven', 'three', 'four', 'six'],
                expectedChannelIds: ['one', 'seven', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six'],
            },
            {
                inChannelIds: ['seven', 'one', 'three', 'four', 'six'],
                expectedChannelIds: ['seven', 'one', 'twoDeleted', 'three', 'four', 'fiveDeleted', 'six'],
            },
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            test('at ' + i, async () => {
                const store = configureStore(initialState);

                const targetIndex = testCase.inChannelIds.indexOf('seven');

                const newIndex = Actions.adjustTargetIndexForMove(store.getState(), 'category1', ['seven'], targetIndex, 'seven');

                const actualChannelIds = insertWithoutDuplicates(channelIds, 'seven', newIndex);
                expect(actualChannelIds).toEqual(testCase.expectedChannelIds);
            });
        }
    });
});

describe('multiSelectChannelTo', () => {
    const channelIds = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];

    const initialState = {
        entities: {
            users: {
                currentUserId: 'user',
            },
            channelCategories: {
                byId: {
                    category1: {
                        id: 'category1',
                        channel_ids: channelIds.map((id) => `category1_${id}`),
                        sorting: CategorySorting.Manual,
                    },
                    category2: {
                        id: 'category2',
                        channel_ids: channelIds.map((id) => `category2_${id}`),
                        sorting: CategorySorting.Manual,
                    },
                },
                orderByTeam: {
                    team1: ['category1', 'category2'],
                },
            },
            channels: {
                channels: {
                    ...channelIds.reduce((init: {[key: string]: Partial<Channel>}, val) => {
                        init[`category1_${val}`] = {id: `category1_${val}`, delete_at: 0};
                        return init;
                    }, {}),
                    ...channelIds.reduce((init: {[key: string]: Partial<Channel>}, val) => {
                        init[`category2_${val}`] = {id: `category2_${val}`, delete_at: 0};
                        return init;
                    }, {}),
                },
                myMembers: {
                    ...channelIds.reduce((init: {[key: string]: Partial<ChannelMembership>}, val) => {
                        init[`category1_${val}`] = {channel_id: `category1_${val}`, user_id: 'user'};
                        return init;
                    }, {}),
                    ...channelIds.reduce((init: {[key: string]: Partial<ChannelMembership>}, val) => {
                        init[`category2_${val}`] = {channel_id: `category2_${val}`, user_id: 'user'};
                        return init;
                    }, {}),
                },
                channelsInTeam: {
                    team1: channelIds.map((id) => `category1_${id}`).concat(channelIds.map((id) => `category2_${id}`)),
                },
            },
            teams: {
                currentTeamId: 'team1',
            },
        },
        views: {
            channelSidebar: {
                selectedChannelIds: [],
                lastSelectedChannel: '',
            },
        },
    };

    test('should select single channel if none are selected', () => {
        const store = configureStore(initialState);

        store.dispatch(Actions.multiSelectChannelTo('category1_five'));

        expect(store.getState().views.channelSidebar.selectedChannelIds).toEqual(['category1_five']);
    });

    test('should select group of channels in ascending order', () => {
        const store = configureStore({
            ...initialState,
            views: {
                channelSidebar: {
                    selectedChannelIds: ['category1_two'],
                    lastSelectedChannel: 'category1_two',
                },
            },
        });

        store.dispatch(Actions.multiSelectChannelTo('category1_seven'));

        expect(store.getState().views.channelSidebar.selectedChannelIds).toEqual(['category1_two', 'category1_three', 'category1_four', 'category1_five', 'category1_six', 'category1_seven']);
    });

    test('should select group of channels in descending order and sort by ascending', () => {
        const store = configureStore({
            ...initialState,
            views: {
                channelSidebar: {
                    selectedChannelIds: ['category1_five'],
                    lastSelectedChannel: 'category1_five',
                },
            },
        });

        store.dispatch(Actions.multiSelectChannelTo('category1_one'));

        expect(store.getState().views.channelSidebar.selectedChannelIds).toEqual(['category1_one', 'category1_two', 'category1_three', 'category1_four', 'category1_five']);
    });

    test('should select group of channels where some other channels were already selected', () => {
        const store = configureStore({
            ...initialState,
            views: {
                channelSidebar: {
                    selectedChannelIds: ['category1_five', 'category2_six', 'category2_three'],
                    lastSelectedChannel: 'category1_five',
                },
            },
        });

        store.dispatch(Actions.multiSelectChannelTo('category1_one'));

        expect(store.getState().views.channelSidebar.selectedChannelIds).toEqual(['category1_one', 'category1_two', 'category1_three', 'category1_four', 'category1_five']);
    });

    test('should select group of channels where some other channels were already selected but in new selection', () => {
        const store = configureStore({
            ...initialState,
            views: {
                channelSidebar: {
                    selectedChannelIds: ['category1_five', 'category1_three', 'category1_one'],
                    lastSelectedChannel: 'category1_five',
                },
            },
        });

        store.dispatch(Actions.multiSelectChannelTo('category1_one'));

        expect(store.getState().views.channelSidebar.selectedChannelIds).toEqual(['category1_one', 'category1_two', 'category1_three', 'category1_four', 'category1_five']);
    });

    test('should select group of channels across categories', () => {
        const store = configureStore({
            ...initialState,
            views: {
                channelSidebar: {
                    selectedChannelIds: ['category1_five'],
                    lastSelectedChannel: 'category1_five',
                },
            },
        });

        store.dispatch(Actions.multiSelectChannelTo('category2_two'));

        expect(store.getState().views.channelSidebar.selectedChannelIds).toEqual(['category1_five', 'category1_six', 'category1_seven', 'category2_one', 'category2_two']);
    });
});
