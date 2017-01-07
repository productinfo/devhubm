// @flow

import ActionSheet from 'react-native-actionsheet';
import React from 'react';
import Icon from 'react-native-vector-icons/Octicons';
import { Set } from 'immutable';

import Column, { HeaderButton, HeaderButtonText, HeaderButtonsContainer } from './_ColumnWithList';
import NotificationCardContainer from '../../containers/NotificationCardContainer';
import { FullView } from '../cards/__CardComponents';
import { getDateWithHourAndMinuteText, getOwnerAndRepo } from '../../utils/helpers';
import { getParamsToLoadAllNotifications } from '../../sagas/notifications';
import { readNotificationIdsSelector } from '../../selectors';
import type { ActionCreators, GithubRepo } from '../../utils/types';

const buttons = ['Cancel', 'Mark all as read', 'Clear read'];
const BUTTONS = {
  CANCEL: 0,
  MARK_NOTIFICATIONS_AS_READ: 1,
  CLEAR_READ: 2,
};

export default class extends React.PureComponent {
  static contextTypes = {
    store: React.PropTypes.object.isRequired,
  };

  onRefresh = () => {
    const { actions: { updateNotifications } } = this.props;

    const params = getParamsToLoadAllNotifications();
    updateNotifications(params);
  };

  getNotificationIds = () => {
    const { items } = this.props;
    return items.first() === 'string' ? items : items.map(item => item.get('id'));
  }

  getReadNotificationIds = () => {
    const store = this.context.store;
    const state = store.getState();

    const notificationIds = this.getNotificationIds();
    const readNotificationsIds = readNotificationIdsSelector(state);
    return Set(notificationIds).intersect(readNotificationsIds);
  }

  getUnreadNotificationIds = () => {
    const notificationIds = this.getNotificationIds();
    const readNotificationsIds = this.getReadNotificationIds();
    return Set(notificationIds).subtract(readNotificationsIds);
  }

  showActionSheet = () => {
    this.ActionSheet.show();
  };

  handleActionSheetButtonPress = (index) => {
    const { actions } = this.props;

    switch (index) {
      case BUTTONS.MARK_NOTIFICATIONS_AS_READ:
        (() => {
          const notificationIds = this.getUnreadNotificationIds();

          if (notificationIds && notificationIds.size > 0) {
            actions.markNotificationsAsRead({ notificationIds });
          }
        })();

        break;

      case BUTTONS.CLEAR_READ:
        (() => {
          const notificationIds = this.getReadNotificationIds();
          actions.clearNotifications({ notificationIds });
        })();
        break;

      default:
        break;
    }
  };

  props: {
    actions: ActionCreators,
    column: { repo: GithubRepo },
    errors?: ?Array<string>,
    icon?: string,
    items: Array<Object>,
    loading: boolean,
    notificationsDetails: Object,
    radius?: number,
    style?: ?Object,
    readIds: Array<string>,
    title?: string,
    updatedAt: Date,
  };

  renderRow = (notification) => (
    <NotificationCardContainer
      key={`notification-card-${notification.get('id')}`}
      actions={this.props.actions}
      notificationOrNotificationId={notification.get('id')}
      onlyOneRepository={!!this.props.column.get('repo')}
    />
  );

  render() {
    const { column,
      errors,
      icon: _icon,
      items,
      loading,
      style,
      title: _title,
      updatedAt,
      ...props
    } = this.props;

    if (!column) return null;

    const repo = column.get('repo');

    let title = _title;
    if (!title) {
      if (repo) {
        const { repo: repoName } = getOwnerAndRepo(repo.get('full_name') || repo.get('name'));
        title = (repoName || '').toLowerCase();
      }

      if (!title) title = 'notifications';
    }

    let icon = _icon;
    if (!icon) {
      icon = repo ? 'repo' : 'bell';
    }

    const dateFromNowText = getDateWithHourAndMinuteText(updatedAt);
    const refreshText = dateFromNowText ? `Updated ${dateFromNowText}` : '';

    return (
      <FullView style={style}>
        <Column
          errors={errors}
          headerRight={
            <HeaderButtonsContainer>
              <HeaderButton onPress={this.showActionSheet}>
                <HeaderButtonText><Icon name="settings" size={20} /></HeaderButtonText>
              </HeaderButton>
            </HeaderButtonsContainer>
          }
          icon={icon}
          items={items}
          loading={loading}
          title={title}
          renderRow={this.renderRow}
          refreshFn={this.onRefresh}
          refreshText={refreshText}
          {...props}
        />

        <ActionSheet
          ref={(ref) => { this.ActionSheet = ref; }}
          title={title}
          options={buttons}
          cancelButtonIndex={BUTTONS.CANCEL}
          destructiveButtonIndex={BUTTONS.DELETE_COLUMN}
          onPress={this.handleActionSheetButtonPress}
        />
      </FullView>
    );
  }
}