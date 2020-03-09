// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Pluggable from 'plugins/pluggable';

import {trackEvent} from 'actions/diagnostics_actions';
import MoreDirectChannels from 'components/more_direct_channels';
import MoreChannels from 'components/more_channels';
import NewChannelFlow from 'components/new_channel_flow';

import {Constants} from 'utils/constants';

import AddChannelDropdown from './add_channel_dropdown';
import SidebarHeader from './sidebar_header';
import ChannelNavigator from './channel_navigator';
import ChannelFilter from './channel_filter';
import SidebarCategoryList from './sidebar_category_list';

type Props = {
    canCreatePublicChannel: boolean;
    canCreatePrivateChannel: boolean;
};

type State = {
    showDirectChannelsModal: boolean;
    showMoreChannelsModal: boolean;
    showNewChannelModal: boolean;
};

export default class Sidebar extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showDirectChannelsModal: false,
            showMoreChannelsModal: false,
            showNewChannelModal: false,
        };
    }

    showMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: true});
    }

    hideMoreDirectChannelsModal = () => {
        this.setState({showDirectChannelsModal: false});
    }

    showMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: true});
        trackEvent('ui', 'ui_channels_more_public');
    }

    hideMoreChannelsModal = () => {
        this.setState({showMoreChannelsModal: false});
    }

    showNewChannelModal = () => {
        this.setState({showNewChannelModal: true});
    }

    hideNewChannelModal = () => {
        this.setState({showNewChannelModal: false});
    }

    handleOpenMoreDirectChannelsModal = (e: Event) => {
        e.preventDefault();
        if (this.state.showDirectChannelsModal) {
            this.hideMoreDirectChannelsModal();
        } else {
            this.showMoreDirectChannelsModal();
        }
    }

    renderModals = () => {
        let moreDirectChannelsModal;
        if (this.state.showDirectChannelsModal) {
            moreDirectChannelsModal = (
                <MoreDirectChannels
                    onModalDismissed={this.hideMoreDirectChannelsModal}
                    isExistingChannel={false}
                />
            );
        }

        let moreChannelsModal;
        if (this.state.showMoreChannelsModal) {
            moreChannelsModal = (
                <MoreChannels
                    onModalDismissed={this.hideMoreChannelsModal}
                    handleNewChannel={() => {
                        this.hideMoreChannelsModal();
                        this.showNewChannelModal();
                    }}
                    morePublicChannelsModalType={'public'} // TODO: need to incorporate 'private' when showing archived channels: (getConfig(state).ExperimentalViewArchivedChannels === 'true')
                />
            );
        }

        return (
            <React.Fragment>
                <NewChannelFlow
                    show={this.state.showNewChannelModal}
                    canCreatePublicChannel={this.props.canCreatePublicChannel}
                    canCreatePrivateChannel={this.props.canCreatePrivateChannel}
                    channelType={Constants.OPEN_CHANNEL}
                    onModalDismissed={this.hideNewChannelModal}
                />
                {moreDirectChannelsModal}
                {moreChannelsModal}
            </React.Fragment>
        );
    }

    render() {
        return (
            <div id='SidebarContainer'>
                <SidebarHeader/>
                <ChannelNavigator/>
                <div className='SidebarContainer_filterAddChannel'>
                    <ChannelFilter/>
                    <AddChannelDropdown
                        showNewChannelModal={this.showNewChannelModal}
                        showMoreChannelsModal={this.showMoreChannelsModal}
                    />
                </div>
                <Pluggable pluggableName='LeftSidebarHeader'/>
                <SidebarCategoryList handleOpenMoreDirectChannelsModal={this.handleOpenMoreDirectChannelsModal}/>
                {this.renderModals()}
            </div>
        );
    }
}
