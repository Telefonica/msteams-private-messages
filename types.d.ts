/* modules with no declaration file */
declare module 'restify-clients';

declare namespace Types {
  /* alias */
  type Activity = import("botbuilder").Activity;
  type ConversationReference = import("botbuilder").ConversationReference;
  type Context = import("botbuilder").TurnContext;

  interface Storage {
    saveConversation: (
      user: string,
      conversation: Partial<ConversationReference>
    ) => Promise<boolean>;

    getConversation: (
      user: string
    ) => Promise<Partial<ConversationReference> | null>;

    registerTopic: (topic: string) => Promise<boolean>;

    subscribe: (user: string, topic: string) => Promise<boolean>;

    getSubscribedTopics: (user: string) => Promise<string[] | null>;

    getSubscribers: (topic: string) => Promise<string[]>;

    listUsers: () => Promise<string[]>;

    listTopics: () => Promise<string[]>;

    resetSubscriptions: (user: string) => Promise<boolean>;

    removeSubscribers: (topic: string) => Promise<boolean>;
  }

  interface Handlers {
    /* bot-SDK entry point */
    processMessage: (
      req: import("restify").Request,
      res: import("restify").Response
    ) => Promise<void>;
    /* main methods */
    notify: (
      user: string,
      message: string,
      mention?: boolean
    ) => Promise<{ status: number; response: any }>;
    broadcast: (
      topic: string,
      message: string,
      mention?: boolean
    ) => Promise<{ status: number; response: any }>;
    /* debugging */
    getUsers: () => Promise<{ status: number; response: any }>;
    getTopics: () => Promise<{ status: number; response: any }>;
    /* ops */
    createTopic: (topic: string) => Promise<{ status: number; response: any }>;
    forceSubscription: (
      user: string,
      topic: string
    ) => Promise<{ status: number; response: any }>;
  }

  interface ICard {
    title: string;
    text: string;
  }

  interface IButton {
    title: string;
    value: string;
  }

  interface Config {
    cards: {
      welcomeCard: ICard;
      unknownCard: ICard;
      menuCard: {
        title: string;
        checkButton: IButton;
        resetButton: IButton;
        subscriptionButtons: IButton[];
      };
    };
  }
}
