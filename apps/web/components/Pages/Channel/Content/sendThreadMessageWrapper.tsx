import React from 'react';
import { SerializedThread } from '@linen/types';
import { SerializedMessage } from '@linen/types';
import { SerializedUser } from '@linen/types';
import { SerializedAccount } from '@linen/types';
import debounce from '@linen/utilities/debounce';
import { StartSignUpFn } from 'contexts/Join';
import { createMessageImitation } from './utilities/message';
import { UploadedFile } from '@linen/types';
import * as api from 'utilities/requests';

const debouncedSendThreadMessage = debounce(
  ({
    message,
    files,
    communityId,
    channelId,
    threadId,
    imitationId,
  }: {
    message: string;
    files: UploadedFile[];
    communityId: string;
    channelId: string;
    threadId: string;
    imitationId: string;
  }) => {
    return api.createMessage({
      body: message,
      files,
      accountId: communityId,
      channelId,
      threadId,
      imitationId,
    });
  },
  100
);
export function sendThreadMessageWrapper({
  currentUser,
  allUsers,
  setUploads,
  setThreads,
  currentThreadId,
  currentCommunity,
  startSignUp,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  setUploads: any;
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  currentThreadId: string | undefined;
  currentCommunity: SerializedAccount;
  startSignUp?: StartSignUpFn;
}) {
  return async ({
    message,
    files,
    channelId,
    threadId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    threadId: string;
  }) => {
    if (!currentUser) {
      startSignUp?.({
        communityId: currentCommunity.id,
        onSignIn: {
          run: sendThreadMessageWrapper,
          init: {
            allUsers,
            setThreads,
            currentThreadId,
            currentCommunity,
          },
          params: {
            message,
            channelId,
            threadId,
          },
        },
      });
      return;
    }
    const imitation: SerializedMessage = createMessageImitation({
      message,
      threadId,
      files,
      author: currentUser,
      mentions: allUsers,
    });
    setUploads([]);
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === currentThreadId) {
          return {
            ...thread,
            messages: [...thread.messages, imitation],
          };
        }
        return thread;
      });
    });

    return debouncedSendThreadMessage({
      message,
      communityId: currentCommunity.id,
      files,
      channelId,
      threadId,
      imitationId: imitation.id,
    }).then(
      ({
        message,
        imitationId,
      }: {
        message: SerializedMessage;
        imitationId: string;
      }) => {
        setThreads((threads) => {
          return threads.map((thread) => {
            if (thread.id === currentThreadId) {
              const messageId = message.id;
              const index = thread.messages.findIndex(
                (message: SerializedMessage) => message.id === messageId
              );
              if (index >= 0) {
                return thread;
              }
              return {
                ...thread,
                messages: [
                  ...thread.messages.filter(
                    (message: SerializedMessage) => message.id !== imitationId
                  ),
                  message,
                ],
              };
            }
            return thread;
          });
        });
      }
    );
  };
}
