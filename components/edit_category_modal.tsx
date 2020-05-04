// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import QuickInput from 'components/quick_input';
import {localizeMessage} from 'utils/utils';

import './category_modal.scss';

type Props = {
    modalHeaderText: string;
    editButtonText: string;
    onHide: () => void;
    editCategory: (categoryName: string) => void;
};

type State = {
    categoryName: string;
}

export default class EditCategoryModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            categoryName: '',
        };
    }

    handleClear = () => {
        this.setState({categoryName: ''});
    }

    handleChange = (e: any) => {
        this.setState({categoryName: e.target.value});
    }

    handleCancel = () => {
        this.handleClear();
        this.props.onHide();
    }

    handleConfirm = () => {
        this.props.editCategory(this.state.categoryName);
        this.props.onHide();
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal edit-category'
                show={true}
                onHide={this.props.onHide}
                onExited={this.props.onHide}
                enforceFocus={true}
                restoreFocus={true}
                role='dialog'
                aria-labelledby='editCategoryModalLabel'
            >
                <Modal.Header
                    closeButton={true}
                />
                <form>
                    <Modal.Body>
                        <div className='edit-category__header'>
                            <h1 id='editCategoryModalLabel'>
                                {this.props.modalHeaderText}
                            </h1>
                        </div>
                        <div className='edit-category__body'>
                            <QuickInput
                                autoFocus={true}
                                className='form-control filter-textbox'
                                type='text'
                                value={this.state.categoryName}
                                placeholder={localizeMessage('edit_category_modal.placeholder', 'Choose a category name')}
                                clearable={true}
                                onClear={this.handleClear}
                                onChange={this.handleChange}
                                maxlength={22}
                            />
                            <span className='edit-category__helpText'>
                                <FormattedMessage
                                    id='edit_category_modal.helpText'
                                    defaultMessage='You can drag channels into categories to organize your sidebar.'
                                />
                            </span>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='edit_category__button cancel'
                            onClick={this.handleCancel}
                        >
                            <FormattedMessage
                                id='edit_category_modal.cancel'
                                defaultMessage='Cancel'
                            />
                        </button>
                        <button
                            type='submit'
                            className={classNames('edit_category__button create', {
                                disabled: !this.state.categoryName,
                            })}
                            onClick={this.handleConfirm}
                            disabled={!this.state.categoryName}
                        >
                            {this.props.editButtonText}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }
}
