// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import {testWithConfig} from '../../support/hooks';

const adminSteps = ['complete_profile', 'team_setup', 'invite_members', 'hide'];

describe('Cloud Onboarding - Sysadmin', () => {
    let townSquarePage;
    let sysadmin;

    testWithConfig({
        ServiceSettings: {
            ExperimentalChannelSidebarOrganization: 'default_on',
        },
    });

    before(() => {
        // # Check if with license and has matching database
        cy.apiRequireLicenseForFeature('Cloud');
        cy.requireServerDBToMatch();

        cy.apiInitSetup().then(({team}) => {
            townSquarePage = `/${team.name}/channels/town-square`;
        });

        cy.apiAdminLogin().then((res) => {
            sysadmin = res.user;
        });
    });

    beforeEach(() => {
        // # Login as sysadmin and set all steps to false
        const preference = {
            user_id: sysadmin.id,
            category: 'recommended_next_steps',
            value: 'false',
        };

        cy.apiSaveUserPreference(adminSteps.map((step) => ({...preference, name: step})));
        cy.visit(townSquarePage);
    });

    /*
     *  Happy Path
     */

    it('Cloud Onboarding - Full Flow', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Enter full name
        cy.get('#input_fullName').should('be.visible').clear().type('Theodore Logan');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-CompleteProfileStep__profilePicture').attachFile('mattermost-icon.png');

        // # Click Save profile button
        cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.visible').should('not.be.disabled').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 3 steps complete');

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Enter team name
        cy.get('#input_teamName').should('be.visible').clear().type('Wyld Stallyns');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-TeamProfileStep__teamIcon').attachFile('mattermost-icon.png');

        // # Click Save team button
        cy.findByTestId('TeamProfileStep__saveTeamButton').should('be.visible').should('not.be.disabled').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '2 / 3 steps complete');

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Click Finish button
        cy.findByTestId('InviteMembersStep__finishButton').should('be.visible').should('not.be.disabled').click();

        // * Step counter should show Tips and Next Steps
        cy.get('.SidebarNextSteps .SidebarNextSteps__top').should('contain', 'Tips & Next Steps');
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', 'A few other areas to explore');

        // * Transition screen should be visible
        cy.get('.NextStepsView__transitionView.completed').should('be.visible');

        // * Completed screen should be visible
        cy.get('.NextStepsView__completedView.completed').should('be.visible');
    });

    /*
     *  General functionality
     */

    it('Cloud Onboarding - Switch to next step', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Click the header of the next card
        cy.get('.Card.expanded + .Card button.NextStepsView__cardHeader').should('be.visible').click();

        // * Check to make sure next card is expanded and current card is collapsed
        cy.get('.Card__body:not(.expanded) .CompleteProfileStep').should('exist').should('not.be.visible');
        cy.get('.Card__body.expanded .TeamProfileStep').should('exist').should('be.visible');

        // * Step counter should not increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '0 / 3 steps complete');
    });

    it('Cloud Onboarding - Skip Getting Started', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure first card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Click 'Skip Getting Started'
        cy.get('.NextStepsView__skipGettingStarted button').should('be.visible').click();

        // * Main screen should be out of view and the completed screen should be visible
        cy.get('.NextStepsView__mainView.completed').should('exist');//.should('not.be.visible');
        cy.get('.NextStepsView__completedView.completed').should('be.visible');

        // * Step counter should not increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '0 / 3 steps complete');
    });

    it('Cloud Onboarding - Remove Recommended Next Steps', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure first card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Click the 'x' in the Sidebar Next Steps section
        cy.get('button.SidebarNextSteps__close').should('be.visible').click();

        // * Verify confirmation modal has appeared
        cy.get('.RemoveNextStepsModal').should('be.visible').should('contain', 'Remove Getting Started');

        // # Click 'Remove'
        cy.get('.RemoveNextStepsModal button.GenericModal__button.confirm').should('be.visible').click();

        // * Verify the sidebar section and the main view are gone and the channel view is back
        cy.get('.SidebarNextSteps').should('not.exist');
        cy.get('.app__content:not(.NextStepsView)').should('be.visible');
    });

    /*
     *  Complete Profile Step
     */

    it('Cloud Onboarding - Set full name and profile picture', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Clear full name
        cy.apiPatchUser(sysadmin.id, {first_name: '', last_name: ''}).then(() => {
            // * Check to make sure card is expanded
            cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

            // * Save profile should be disabled
            cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.disabled');

            // # Enter full name
            cy.get('#input_fullName').should('be.visible').clear().type('Theodore Logan');

            // # Select profile picture
            cy.findByTestId('PictureSelector__input-CompleteProfileStep__profilePicture').attachFile('mattermost-icon.png');

            // # Click Save profile button
            cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.visible').should('not.be.disabled').click();

            // * Check to make sure card is collapsed and step is complete
            cy.get('.Card.complete .CompleteProfileStep').should('exist');

            // * Step counter should increment
            cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 3 steps complete');
        });
    });

    it('Cloud Onboarding - Set full name - no name provided', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Clear full name box
        cy.get('#input_fullName').should('be.visible').type('Theodore Logan').clear();

        // * Verify error message is displayed
        cy.get('.CompleteProfileStep__fullName .Input___error span').should('contain', 'Your name can’t be blank');

        // * Save profile should be disabled
        cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.disabled');
    });

    it('Cloud Onboarding - Set profile picture - upload image of wrong type', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Upload file
        cy.findByTestId('PictureSelector__input-CompleteProfileStep__profilePicture').attachFile('saml_users.json');

        // * Verify error message is displayed
        cy.get('.CompleteProfileStep__pictureError').should('contain', 'Photos must be in BMP, JPG or PNG format. Maximum file size is 50MB.');
    });

    /*
     *  Team Profile Step
     */

    it('Cloud Onboarding - Set team name and icon', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Name your team header
        cy.get('button.NextStepsView__cardHeader:contains(Name your team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Enter team name
        cy.get('#input_teamName').should('be.visible').clear().type('Wyld Stallyns');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-TeamProfileStep__teamIcon').attachFile('mattermost-icon.png');

        // # Click Save team button
        cy.findByTestId('TeamProfileStep__saveTeamButton').should('be.visible').should('not.be.disabled').click();

        // * Check to make sure card is collapsed and step is complete
        cy.get('.Card.complete .TeamProfileStep').should('exist');

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 3 steps complete');
    });

    it('Cloud Onboarding - Set team name - no name provided', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Name your team header
        cy.get('button.NextStepsView__cardHeader:contains(Name your team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Clear team name box
        cy.get('#input_teamName').should('be.visible').type('Wyld Stallyns').clear();

        // * Verify error message is displayed
        cy.get('.TeamProfileStep__textInputs .Input___error span').should('contain', 'Team name can’t be blank');

        // * Save team should be disabled
        cy.findByTestId('TeamProfileStep__saveTeamButton').should('be.disabled');
    });

    it('Cloud Onboarding - Set team icon - upload image of wrong type', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Name your team header
        cy.get('button.NextStepsView__cardHeader:contains(Name your team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Upload file
        cy.findByTestId('PictureSelector__input-TeamProfileStep__teamIcon').attachFile('saml_users.json');

        // * Verify error message is displayed
        cy.get('.TeamProfileStep__pictureError').should('contain', 'Photos must be in BMP, JPG or PNG format. Maximum file size is 50MB.');
    });

    /*
     *  Invite Members Step
     */
    it('Cloud Onboarding - Invite members by email', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // * Verify that Send button is disabled until emails are entered
        cy.findByTestId('InviteMembersStep__sendButton').should('be.disabled');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('bill.s.preston@wyldstallyns.com,theodore.logan@wyldstallyns.com,', {force: true});
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('joanna.preston@wyldstallyns.com elizabeth.logan@wyldstallyns.com ', {force: true});

        // # Click Send
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled').click();

        // * Verify that 2 invitations were sent
        cy.get('.InviteMembersStep__invitationResults').should('contain', '4 invitations sent');
    });

    it('Cloud Onboarding - Invite members by email - invalid email', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('bill.s.preston@wyldstallyns.com,theodoreloganwyldstallynscom,', {force: true});

        // # Click Send
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled').click();

        // * Verify that the error message shows
        cy.get('.InviteMembersStep__invitationResults').should('contain', 'One or more email addresses are invalid');
    });

    it('Cloud Onboarding - Invite members by email - enter more than 10 emails', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('a@b.c,b@c.d,c@d.e,d@e.f,e@f.g,f@g.h,g@h.i,h@i.j,i@j.k,j@k.l,k@l.m,', {force: true});

        // * Verify that the error message shows
        cy.get('.InviteMembersStep__invitationResults').should('contain', 'Invitations are limited to 10 email addresses.');

        // * Verify that Send button is disabled until only 10 emails remain
        cy.findByTestId('InviteMembersStep__sendButton').should('be.disabled');

        // # Remove the last email
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('{backspace}');

        // * Verify that Send button is now enabled
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled');
    });
});
