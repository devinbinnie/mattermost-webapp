// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {createSelector} from 'reselect';

import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {GlobalState} from 'mattermost-redux/types/store';
import {UserProfile} from 'mattermost-redux/types/users';

import {RecommendedNextSteps, Preferences} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import CompleteProfileStep from './steps/complete_profile_step';

export type StepComponentProps = {
    id: string;
    currentUser: UserProfile;
    onSkip: (id: string) => void;
    onFinish: (id: string) => void;
}

export type StepType = {
    id: string;
    title: string;
    component: React.ComponentType<StepComponentProps>;
}

export const Steps: StepType[] = [
    {
        id: RecommendedNextSteps.COMPLETE_PROFILE,
        title: localizeMessage('next_steps_view.titles.completeProfile', 'Complete your profile'),
        component: CompleteProfileStep,
    },
    {
        id: RecommendedNextSteps.TEAM_SETUP,
        title: localizeMessage('next_steps_view.titles.teamSetup', 'Name your team'),
        component: CompleteProfileStep,
    },
    {
        id: RecommendedNextSteps.INVITE_MEMBERS,
        title: localizeMessage('next_steps_view.titles.inviteMembers', 'Invite members to the team'),
        component: CompleteProfileStep,
    },
];

const getCategory = makeGetCategory();
export const showNextSteps = createSelector(
    (state: GlobalState) => getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
    (stepPreferences) => {
        const checkPref = (step: StepType) => stepPreferences.some((pref) => pref.name === step.id && pref.value);
        return !Steps.every(checkPref);
    }
);
