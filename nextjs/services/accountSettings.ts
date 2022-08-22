import { accounts, MessagesViewType } from '@prisma/client';
import { links } from '../constants/examples';

export type Settings = {
  communityType: string;
  googleAnalyticsId?: string | undefined;
  name: string | null;
  brandColor: string;
  homeUrl: string;
  docsUrl: string;
  logoUrl: string;
  messagesViewType: MessagesViewType;
  communityUrl: string;
  communityInviteUrl: string;
  communityName: string;
};

function buildInviteUrl(account: accounts) {
  if (account.communityInviteUrl) {
    return account.communityInviteUrl;
  } else if (account.discordServerId) {
    return `https://discord.com/channels/${account.discordServerId}`;
  } else {
    return '';
  }
}

export function buildSettings(account: accounts): Settings {
  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const communityType = account.discordServerId ? 'discord' : 'slack';

  const settings = {
    communityUrl: account.communityUrl || '',
    communityInviteUrl: buildInviteUrl(account),
    communityName:
      account.slackDomain ||
      account.discordDomain ||
      account.discordServerId ||
      '',
    name: account.name,
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: account.logoUrl || defaultSettings.logoUrl,
    messagesViewType: account.messagesViewType || MessagesViewType.THREADS,
    ...(account.premium &&
      account.googleAnalyticsId && {
        googleAnalyticsId: account.googleAnalyticsId,
      }),
    communityType: communityType,
    ...(!!account.googleSiteVerification && {
      googleSiteVerification: account.googleSiteVerification,
    }),
  };
  return settings;
}
