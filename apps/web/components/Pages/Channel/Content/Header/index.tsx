import React from 'react';
import Dropdown from '@linen/ui/Dropdown';
import Icon from '@linen/ui/Icon';
import StickyHeader from '@linen/ui/StickyHeader';
import styles from './index.module.css';
import { SerializedUser } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiMoreVertical } from '@react-icons/all-files/fi/FiMoreVertical';
import { BsFillGearFill } from '@react-icons/all-files/bs/BsFillGearFill';
import { ShowIntegrationDetail } from 'components/Modals/IntegrationsModal';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { SerializedChannel } from '@linen/types';

interface Props {
  className?: string;
  channel: SerializedChannel;
  children: React.ReactNode;
  currentUser?: SerializedUser;
  handleOpenIntegrations(): void;
  handleOpenMembers(): void;
}

export default function Header({
  className,
  channel,
  children,
  currentUser,
  handleOpenIntegrations,
  handleOpenMembers,
}: Props) {
  const items = [];
  if (channel.type !== 'DM') {
    items.push({
      icon: <BsFillGearFill />,
      label: 'Integrations',
      onClick: handleOpenIntegrations,
    });
  }
  if (channel.type === 'PRIVATE') {
    items.push({
      icon: <FiUsers />,
      label: 'Members',
      onClick: handleOpenMembers,
    });
  }
  return (
    <StickyHeader id="chat-layout-header" className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channel.channelName}
          <ShowIntegrationDetail />
        </div>
        {currentUser && items.length > 0 && (
          <div className={styles.actions}>
            <Dropdown
              button={
                <Icon>
                  <FiMoreVertical />
                </Icon>
              }
              items={items}
            />
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
