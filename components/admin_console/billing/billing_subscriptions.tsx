// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import AlertBanner from 'components/alert_banner';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import OverlayTrigger from 'components/overlay_trigger';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import upgradeMattermostCloudImage from 'images/upgrade-mattermost-cloud-image.svg';
import privateCloudImage from 'images/private-cloud-image.svg';

import './billing_subscriptions.scss';

type Props = {

};

const upgradeMattermostCloud = () => (
    <div className='UpgradeMattermostCloud'>
        <div className='UpgradeMattermostCloud__image'>
            <img src={upgradeMattermostCloudImage}/>
        </div>
        <div className='UpgradeMattermostCloud__title'>
            <FormattedMessage
                id='admin.billing.subscription.upgradeMattermostCloud.title'
                defaultMessage='Need more users?'
            />
        </div>
        <div className='UpgradeMattermostCloud__description'>
            <FormattedMarkdownMessage
                id='admin.billing.subscription.upgradeMattermostCloud.description'
                defaultMessage='The free tier is **limited to 10 users.** Get access to more users, teams and other great features'
            />
        </div>
        <button className='UpgradeMattermostCloud__upgradeButton'>
            <FormattedMessage
                id='admin.billing.subscription.upgradeMattermostCloud.upgradeButton'
                defaultMessage='Upgrade Mattermost Cloud'
            />
        </button>
    </div>
);

const privateCloudCard = () => (
    <div className='PrivateCloudCard'>
        <div className='PrivateCloudCard__text'>
            <div className='PrivateCloudCard__text-title'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.title'
                    defaultMessage='Looking for a high-trust private cloud?'
                />
            </div>
            <div className='PrivateCloudCard__text-description'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.description'
                    defaultMessage='If you need software with dedicated, single-tenant architecture, Mattermost Private Cloud (Beta) is the solution for high-trust collaboration.'
                />
            </div>
            <button className='PrivateCloudCard__contactSales'>
                <FormattedMessage
                    id='admin.billing.subscription.privateCloudCard.contactSales'
                    defaultMessage='Contact Sales'
                />
            </button>
        </div>
        <div className='PrivateCloudCard__image'>
            <img src={privateCloudImage}/>
        </div>
    </div>
);

const BillingSubscriptions: React.FC<Props> = () => {
    const testTooltipLeft = (
        <Tooltip
            id='BillingSubscriptions__testTooltip'
            className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-left'
        >
            <div className='BillingSubscriptions__tooltipTitle'>
                {'Seat count overages'}
            </div>
            <div className='BillingSubscriptions__tooltipMessage'>
                {'Prolonged overages may result in additional charges. See how billing works'}
            </div>
        </Tooltip>
    );

    const testTooltipRight = (
        <Tooltip
            id='BillingSubscriptions__testTooltip'
            className='BillingSubscriptions__tooltip BillingSubscriptions__tooltip-right'
        >
            <div className='BillingSubscriptions__tooltipTitle'>
                {'What are partial charges?'}
            </div>
            <div className='BillingSubscriptions__tooltipMessage'>
                {'Users who have not been enabled for the full duration of the month are charged at a prorated monthly rate.'}
            </div>
        </Tooltip>
    );

    const [showDanger, setShowDanger] = useState(true);
    const [showWarning, setShowWarning] = useState(true);
    const [showInfo, setShowInfo] = useState(true);

    return (
        <div className='wrapper--fixed BillingSubscriptions'>
            <FormattedAdminHeader
                id='admin.billing.subscription.title'
                defaultMessage='Subscriptions'
            />
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    {showDanger &&
                        <AlertBanner
                            mode='danger'
                            title='Test Danger Title'
                            message='This is a test danger message'
                            onDismiss={() => setShowDanger(false)}
                        />
                    }
                    {showWarning &&
                        <AlertBanner
                            mode='warning'
                            title='Test Warning Title'
                            message='This is a test warning message'
                            onDismiss={() => setShowWarning(false)}
                        />
                    }
                    {showInfo &&
                        <AlertBanner
                            mode='info'
                            title='Test Info Title'
                            message='This is a test info message'
                            onDismiss={() => setShowInfo(false)}
                        />
                    }
                    <div
                        className='BillingSubscriptions__topWrapper'
                        style={{marginTop: '20px'}}
                    >
                        <div style={{border: '1px solid #000', width: '568px'}}>
                            {'Plan Details Card'}
                            <OverlayTrigger
                                delayShow={500}
                                placement='bottom'
                                overlay={testTooltipLeft}
                            >
                                <button>{'Left Side Test Button'}</button>
                            </OverlayTrigger>
                            <OverlayTrigger
                                delayShow={500}
                                placement='bottom'
                                overlay={testTooltipRight}
                            >
                                <button>{'Right Side Test Button'}</button>
                            </OverlayTrigger>
                        </div>
                        {upgradeMattermostCloud()}
                    </div>
                    {privateCloudCard()}
                </div>
            </div>
        </div>
    );
};

export default BillingSubscriptions;
