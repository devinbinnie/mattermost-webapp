// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import classNames from 'classnames';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {Channel} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';
import {localizeMessage} from 'mattermost-redux/utils/i18n_utils';

import {trackEvent} from 'actions/diagnostics_actions';
import OverlayTrigger from 'components/overlay_trigger';
import {DraggingState} from 'types/store';
import Constants, {A11yCustomEventTypes, DraggingStateTypes} from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

import SidebarChannel from '../sidebar_channel';

import SidebarCategoryMenu from './sidebar_category_menu';

type Props = {
    category: ChannelCategory;
    categoryIndex: number;
    channels: Channel[];
    setChannelRef: (channelId: string, ref: HTMLLIElement) => void;
    handleOpenMoreDirectChannelsModal: (e: Event) => void;
    getChannelRef: (channelId: string) => HTMLLIElement | undefined;
    isCollapsed: boolean;
    isNewCategory: boolean;
    draggingState: DraggingState;
    actions: {
        setCategoryCollapsed: (categoryId: string, collapsed: boolean) => void;
    };
};

type State = {
    isMenuOpen: boolean;
    isNewCategory: boolean;
}

export default class SidebarCategory extends React.PureComponent<Props, State> {
    categoryTitleRef: React.RefObject<HTMLButtonElement>;
    newDropBoxRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.categoryTitleRef = React.createRef();
        this.newDropBoxRef = React.createRef();

        this.state = {
            isMenuOpen: false,
            isNewCategory: props.isNewCategory,
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.channels.length !== this.props.channels.length && this.state.isNewCategory) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({isNewCategory: false});
        }

        if (this.props.isCollapsed !== prevProps.isCollapsed && this.newDropBoxRef.current) {
            this.newDropBoxRef.current.classList.add('animating');
        }
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

    renderChannel = (channel: Channel, index: number) => {
        const {isCollapsed, setChannelRef, getChannelRef, category, draggingState} = this.props;

        return (
            <SidebarChannel
                key={channel.id}
                channelIndex={index}
                channelId={channel.id}
                setChannelRef={setChannelRef}
                getChannelRef={getChannelRef}
                isCategoryCollapsed={isCollapsed}
                isCategoryDragged={draggingState.type === DraggingStateTypes.CATEGORY && draggingState.id === category.id}
                isDropDisabled={this.isDropDisabled()}
                isDMCategory={category.type === CategoryTypes.DIRECT_MESSAGES}
            />
        );
    }

    handleCollapse = () => {
        const {category, isCollapsed} = this.props;

        if (isCollapsed) {
            trackEvent('ui', 'ui_sidebar_expand_category');
        } else {
            trackEvent('ui', 'ui_sidebar_collapse_category');
        }

        this.props.actions.setCategoryCollapsed(category.id, !isCollapsed);
    }

    handleSortDirectMessages = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();

        // TODO
    }
    removeAnimation = () => {
        if (this.newDropBoxRef.current) {
            this.newDropBoxRef.current.classList.remove('animating');
        }
    }

    handleOpenDirectMessagesModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        this.props.handleOpenMoreDirectChannelsModal(e.nativeEvent);
    }

    handleMenuToggle = (open: boolean) => {
        this.setState({isMenuOpen: open});
    }

    isDropDisabled = () => {
        const {draggingState, category} = this.props;

        if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            return draggingState.type === DraggingStateTypes.CHANNEL;
        } else if (category.type === CategoryTypes.PUBLIC || category.type === CategoryTypes.PRIVATE) {
            return draggingState.type === DraggingStateTypes.DM;
        }

        return false;
    }

    render() {
        const {category, categoryIndex, isCollapsed, draggingState, channels} = this.props;
        const {isNewCategory} = this.state;

        if (!category) {
            return null;
        }

        if (!isNewCategory && category.type !== CategoryTypes.DIRECT_MESSAGES && (!channels || !channels.length)) {
            return null;
        }

        const renderedChannels = channels.map(this.renderChannel);

        let categoryMenu: JSX.Element;
        let newLabel: JSX.Element;
        let newDropBox: JSX.Element;
        let directMessagesModalButton: JSX.Element;
        let hideArrow = false;
        if (isNewCategory) {
            newLabel = (
                <div className='SidebarCategory_newLabel'>
                    <FormattedMessage
                        id='sidebar_left.sidebar_category.newLabel'
                        defaultMessage='new'
                    />
                </div>
            );

            newDropBox = (
                <div
                    ref={this.newDropBoxRef}
                    className={classNames('SidebarCategory_newDropBox', {
                        collapsed: isCollapsed || (draggingState.type === DraggingStateTypes.CATEGORY && draggingState.id === category.id),
                    })}
                    onTransitionEnd={this.removeAnimation}
                >
                    <i className='icon-hand-right'/>
                    <span className='SidebarCategory_newDropBox-label'>
                        <FormattedMessage
                            id='sidebar_left.sidebar_category.newDropBoxLabel'
                            defaultMessage='Drag channels here...'
                        />
                    </span>
                </div>
            );
        } else if (category.type === CategoryTypes.DIRECT_MESSAGES) {
            const addHelpLabel = localizeMessage('sidebar.createDirectMessage', 'Create new direct message');

            const addTooltip = (
                <Tooltip
                    id='new-group-tooltip'
                    className='hidden-xs'
                >
                    {addHelpLabel}
                </Tooltip>
            );

            const sortHelpLabel = localizeMessage('sidebar.sortByRecency', 'Sort by recency');

            const sortTooltip = (
                <Tooltip
                    id='new-group-tooltip'
                    className='hidden-xs'
                >
                    {sortHelpLabel}
                </Tooltip>
            );

            categoryMenu = (
                <React.Fragment>
                    <button
                        className='SidebarChannelGroupHeader_sortButton'
                        onClick={this.handleSortDirectMessages}
                        aria-label={sortHelpLabel}
                    >
                        <OverlayTrigger
                            delayShow={500}
                            placement='top'
                            overlay={sortTooltip}
                        >
                            <i className='icon-clock-outline'/>
                        </OverlayTrigger>
                    </button>
                    <button
                        className='SidebarChannelGroupHeader_addButton'
                        onClick={this.handleOpenDirectMessagesModal}
                        aria-label={addHelpLabel}
                    >
                        <OverlayTrigger
                            delayShow={500}
                            placement='top'
                            overlay={addTooltip}
                        >
                            <i className='icon-plus'/>
                        </OverlayTrigger>
                    </button>
                </React.Fragment>
            );

            if (!channels || !channels.length) {
                hideArrow = true;
            }
        } else {
            categoryMenu = (
                <SidebarCategoryMenu
                    category={category}
                    onToggle={this.handleMenuToggle}
                />
            );
        }

        let displayName = category.display_name;
        if (category.type !== CategoryTypes.CUSTOM) {
            displayName = localizeMessage(`sidebar.types.${category.type}`, category.display_name);
        }

        return (
            <Draggable
                draggableId={category.id}
                index={categoryIndex}
                disableInteractiveElementBlocking={true}
            >
                {(provided, snapshot) => {
                    return (
                        <div
                            className={classNames('SidebarChannelGroup a11y__section', {
                                dropDisabled: this.isDropDisabled(),
                                menuIsOpen: this.state.isMenuOpen,
                            })}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                        >
                            <Droppable
                                droppableId={category.id}
                                type='SIDEBAR_CHANNEL'
                                isDropDisabled={this.isDropDisabled()}
                            >
                                {(droppableProvided, droppableSnapshot) => {
                                    return (
                                        <div
                                            {...droppableProvided.droppableProps}
                                            ref={droppableProvided.innerRef}
                                            className={classNames({
                                                draggingOverDMCategory: droppableSnapshot.isDraggingOver && category.type === CategoryTypes.DIRECT_MESSAGES,
                                            })}
                                        >
                                            <div className='SidebarChannelGroupHeader'>
                                                <button
                                                    ref={this.categoryTitleRef}
                                                    className={classNames('SidebarChannelGroupHeader_groupButton', {
                                                        draggingOver: droppableSnapshot.isDraggingOver && category.type !== CategoryTypes.DIRECT_MESSAGES,
                                                        dragging: snapshot.isDragging,
                                                    })}
                                                    onClick={this.handleCollapse}
                                                    aria-label={displayName}
                                                >
                                                    <i
                                                        className={classNames('icon icon-chevron-down', {
                                                            'icon-rotate-minus-90': isCollapsed,
                                                            'hide-arrow': hideArrow,
                                                        })}
                                                    />
                                                    <div {...provided.dragHandleProps}>
                                                        {displayName}
                                                    </div>
                                                    {newLabel}
                                                    {directMessagesModalButton}
                                                    {categoryMenu}
                                                </button>
                                            </div>
                                            <div className='SidebarChannelGroup_content'>
                                                <ul
                                                    role='list'
                                                    className='NavGroupContent'
                                                >
                                                    {newDropBox}
                                                    {renderedChannels}
                                                    {category.type === CategoryTypes.DIRECT_MESSAGES ? null : droppableProvided.placeholder}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                }}
                            </Droppable>
                        </div>
                    );
                }}
            </Draggable>
        );
    }
}
