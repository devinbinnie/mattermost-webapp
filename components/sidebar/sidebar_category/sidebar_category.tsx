// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarChannel from '../sidebar_channel';
import Constants, {A11yCustomEventTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

type Props = {
    category: any;
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;
    actions: {
        setCollapsedState: (categoryId: string, isCollapsed: boolean) => void;
    };
};

type State = {
    isCollapsed: boolean;
};

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();
        this.state = {
            isCollapsed: props.category.collapsed,
        };
    }

    componentDidMount() {
        // Refs can be null when this component is shallowly rendered for testing
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.addEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.categoryTitleRef.current.addEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    componentWillUnmount() {
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.removeEventListener(A11yCustomEventTypes.ACTIVATE, this.handleA11yActivateEvent);
            this.categoryTitleRef.current.removeEventListener(A11yCustomEventTypes.DEACTIVATE, this.handleA11yDeactivateEvent);
        }
    }

    handleA11yActivateEvent = () => {
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.addEventListener('keydown', this.handleA11yKeyDown);
        }
    }

    handleA11yDeactivateEvent = () => {
        if (this.categoryTitleRef.current) {
            this.categoryTitleRef.current.removeEventListener('keydown', this.handleA11yKeyDown);
        }
    }

    handleA11yKeyDown = (e: KeyboardEvent) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleCollapse();
        }
    }

    renderChannel = (channelId: string) => {
        const {isCollapsed} = this.state;

        return (
            <SidebarChannel
                channelId={channelId}
                setChannelRef={this.props.setChannelRef}
                getChannelRef={this.props.getChannelRef}
                isCategoryCollapsed={isCollapsed}
            />
        );
    }

    handleCollapse = () => {
        const {category} = this.props;
        const {isCollapsed} = this.state;
        this.props.actions.setCollapsedState(category.id, !isCollapsed);
        this.setState({isCollapsed: !isCollapsed}); // TODO: Won't be necessary after it's in redux
    }

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
    }

    render() {
        const {category} = this.props;
        const {isCollapsed} = this.state;

        const channels = category.channel_ids.map(this.renderChannel);

        let directMessagesModalButton;
        if (category.id === 'direct') {
            directMessagesModalButton = (
                <button
                    className='SidebarChannelGroupHeader_addButton'
                    onClick={this.handleOpenDirectMessagesModal}
                >
                    <i className='icon-plus'/>
                </button>
            );
        }

        return (
            <div className='SidebarChannelGroup'>
                <div className='SidebarChannelGroupHeader'>
                    <button
                        ref={this.categoryTitleRef}
                        className='SidebarChannelGroupHeader_groupButton a11y__section'
                        style={{display: 'flex'}}
                        onClick={this.handleCollapse}
                    >
                        <i className={`icon icon-chevron-down ${isCollapsed ? 'icon-rotate-minus-90' : ''}`}/>
                        <div>
                            {category.display_name}
                        </div>
                        {directMessagesModalButton}
                    </button>
                </div>
                <div className='SidebarChannelGroup_content'>
                    <ul
                        role='list'
                        className='NavGroupContent'
                    >
                        {channels}
                    </ul>
                </div>
            </div>
        );
    }
}
