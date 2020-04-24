// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {Channel, ChannelNotifyProps} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import ChannelInviteModal from 'components/channel_invite_modal';
import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';
import Constants, {NotificationLevels, ModalIdentifiers} from 'utils/constants';

type Props = {
    channel: Channel;
    channelLink: string;
    categories: ChannelCategory[];
    currentUserId: string;
    isUnread: boolean;
    isFavorite: boolean;
    isMuted: boolean;
    intl: IntlShape;
    managePublicChannelMembers: boolean;
    managePrivateChannelMembers: boolean;
    closeHandler?: (callback: () => void) => void;
    actions: {
        markChannelAsRead: (channelId: string) => void;
        favoriteChannel: (channelId: string) => void;
        unfavoriteChannel: (channelId: string) => void;
        updateChannelNotifyProps: (userId: string, channelId: string, props: ChannelNotifyProps) => void;
        openModal: (modalData: any) => void;
    };
};

type State = {
    openUp: boolean;
    width: number;
};

class SidebarChannelMenu extends React.PureComponent<Props, State> {
    isLeaving: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
            width: 0,
        };

        this.isLeaving = false;
    }

    markAsRead = () => {
        this.props.actions.markChannelAsRead(this.props.channel.id);
    }

    favoriteChannel = () => {
        this.props.actions.favoriteChannel(this.props.channel.id);
    }

    unfavoriteChannel = () => {
        this.props.actions.unfavoriteChannel(this.props.channel.id);
    }

    unmuteChannel = () => {
        this.props.actions.updateChannelNotifyProps(this.props.currentUserId, this.props.channel.id, {
            mark_unread: NotificationLevels.ALL,
        } as any);
    }

    muteChannel = () => {
        this.props.actions.updateChannelNotifyProps(this.props.currentUserId, this.props.channel.id, {
            mark_unread: NotificationLevels.MENTION,
        } as any);
    }

    moveToCategory = (categoryId: string) => {
        return (id: string) => {
            // TODO
        };
    }

    moveToNewCategory = () => {
        // TODO
    }

    copyLink = () => {
        const channelUrl = this.props.channelLink;

        const clipboard = navigator.clipboard;
        if (clipboard) {
            clipboard.writeText(channelUrl);
        } else {
            const hiddenInput = document.createElement('textarea');
            hiddenInput.value = channelUrl;
            document.body.appendChild(hiddenInput);
            hiddenInput.focus();
            hiddenInput.select();
            document.execCommand('copy');
            document.body.removeChild(hiddenInput);
        }
    }

    handleLeaveChannel = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLeaving || !this.props.closeHandler) {
            return;
        }

        this.isLeaving = true;

        this.props.closeHandler(() => {
            this.isLeaving = false;
        });
    }

    addMembers = () => {
        const {channel, actions} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });
    }

    renderDropdownItems = () => {
        const {intl, isUnread, isFavorite, isMuted, channel, categories} = this.props;

        let markAsRead;
        if (isUnread) {
            markAsRead = (
                <Menu.ItemAction
                    id={`markAsRead-${channel.id}`}
                    onClick={this.markAsRead}
                    icon={<i className='icon-mark-as-unread'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsRead', defaultMessage: 'Mark as Read'})}
                />
            );
        }

        let favorite;
        if (isFavorite) {
            favorite = (
                <Menu.ItemAction
                    id={`unfavorite-${channel.id}`}
                    onClick={this.unfavoriteChannel}
                    icon={<i className='icon-star'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unfavoriteChannel', defaultMessage: 'Unfavorite'})}
                />
            );
        } else {
            favorite = (
                <Menu.ItemAction
                    id={`favorite-${channel.id}`}
                    onClick={this.favoriteChannel}
                    icon={<i className='icon-star-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.favoriteChannel', defaultMessage: 'Favorite'})}
                />
            );
        }

        let muteChannel;
        if (isMuted) {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'});
            if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteConversation', defaultMessage: 'Unmute Conversation'});
            }
            muteChannel = (
                <Menu.ItemAction
                    id={`unmute-${channel.id}`}
                    onClick={this.unmuteChannel}
                    icon={<i className='icon-bell-off-outline'/>}
                    text={muteChannelText}
                />
            );
        } else {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'});
            if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteConversation', defaultMessage: 'Mute Conversation'});
            }
            muteChannel = (
                <Menu.ItemAction
                    id={`mute-${channel.id}`}
                    onClick={this.muteChannel}
                    icon={<i className='icon-bell-outline'/>}
                    text={muteChannelText}
                />
            );
        }

        // TODO: Filter out the current category
        const categoryMenuItems = categories.filter((category) => {
            switch (channel.type) {
            case Constants.OPEN_CHANNEL:
                return category.type !== CategoryTypes.DIRECT_MESSAGES && category.type !== CategoryTypes.PRIVATE;
            case Constants.PRIVATE_CHANNEL:
                return category.type !== CategoryTypes.DIRECT_MESSAGES && category.type !== CategoryTypes.PUBLIC;
            case Constants.DM_CHANNEL:
            case Constants.GM_CHANNEL:
                return category.type !== CategoryTypes.PRIVATE && category.type !== CategoryTypes.PUBLIC;
            default:
                return true;
            }
        }).map((category) => {
            return {
                id: `moveToCategory-${channel.id}-${category.id}`,
                icon: category.type === CategoryTypes.FAVORITES ? (<i className='icon-star-outline'/>) : (<i className='icon-folder-outline'/>),
                direction: 'right' as any,
                text: category.display_name,
                action: this.moveToCategory(category.id),
            } as any;
        });

        categoryMenuItems.push(
            {
                id: 'SidebarChannelMenu-moveToDivider',
                text: (<li className='MenuGroup menu-divider'/>),
            },
            {
                id: `moveToNewCategory-${channel.id}`,
                icon: (<i className='icon-folder-move-outline'/>),
                direction: 'right' as any,
                text: intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.moveToNewCategory', defaultMessage: 'Move to New Category'}),
                action: this.moveToNewCategory,
            },
        );

        let copyLink;
        if (channel.type === Constants.OPEN_CHANNEL) {
            copyLink = (
                <Menu.ItemAction
                    id={`copyLink-${channel.id}`}
                    onClick={this.copyLink}
                    icon={<i className='icon-link-variant'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.copyLink', defaultMessage: 'Copy Link'})}
                />
            );
        }

        let addMembers;
        if ((channel.type === Constants.PRIVATE_CHANNEL && this.props.managePrivateChannelMembers) || (channel.type === Constants.OPEN_CHANNEL && this.props.managePublicChannelMembers)) {
            addMembers = (
                <Menu.ItemAction
                    id={`addMembers-${channel.id}`}
                    onClick={this.addMembers}
                    icon={<i className='icon-account-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.addMembers', defaultMessage: 'Add Members'})}
                />
            );
        }

        let leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveChannel', defaultMessage: 'Leave Channel'});
        if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
            leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveConversation', defaultMessage: 'Close Conversation'});
        }

        let leaveChannel;
        if (channel.name !== Constants.DEFAULT_CHANNEL) {
            leaveChannel = (
                <Menu.Group>
                    <Menu.ItemAction
                        id={`leave-${channel.id}`}
                        onClick={this.handleLeaveChannel}
                        icon={<i className='icon-close'/>}
                        text={leaveChannelText}
                    />
                </Menu.Group>
            );
        }

        return (
            <React.Fragment>
                <Menu.Group>
                    {markAsRead}
                    {favorite}
                    {muteChannel}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemSubMenu
                        id={`moveTo-${channel.id}`}
                        subMenu={categoryMenuItems}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.moveTo', defaultMessage: 'Move to'})}
                        icon={<i className='icon-folder-move-outline'/>}
                        direction='right'
                        openUp={this.state.openUp}
                        xOffset={this.state.width}
                    />
                </Menu.Group>
                <Menu.Group>
                    {copyLink}
                    {addMembers}
                </Menu.Group>
                {leaveChannel}
            </React.Fragment>
        );
    }

    refCallback = (ref: SidebarMenu) => {
        if (ref) {
            this.setState({
                openUp: ref.state.openUp,
                width: ref.state.width,
            });
        }
    }

    render() {
        const {intl, channel} = this.props;

        return (
            <SidebarMenu
                refCallback={this.refCallback}
                id={`SidebarChannelMenu-${channel.id}`}
                ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'})}
            >
                {this.renderDropdownItems()}
            </SidebarMenu>
        );
    }
}

export default injectIntl(SidebarChannelMenu);
