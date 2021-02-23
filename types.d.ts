/* modules with no declaration file */
declare module "restify-clients";

declare namespace Types {
  /* alias */
  type Activity = import("botbuilder").Activity;
  type ConversationReference = import("botbuilder").ConversationReference;
  type Context = import("botbuilder").TurnContext;

  interface Storage {
    /** @return success flag. Updates the conversationRef if needed. */
    saveConversation: (
      user: string,
      conversation: Partial<ConversationReference>
    ) => Promise<boolean>;

    /** @return null if err */
    getConversation: (
      user: string
    ) => Promise<Partial<ConversationReference> | null>;

    /** @return success flag (independently of actual operation - e.g. already existing entry) */
    registerTopic: (topic: string) => Promise<boolean>;

    /** @return success flag (independently of actual operation - e.g. already existing entry) */
    subscribe: (user: string, topic: string) => Promise<boolean>;

    /** @return null if err */
    getSubscribedTopics: (user: string) => Promise<string[] | null>;

    /** @return null if err */
    getSubscribers: (topic: string) => Promise<string[] | null>;

    listUsers: () => Promise<string[]>;

    listTopics: () => Promise<string[]>;

    /** @return success flag (independently of actual operation - e.g. already existing entry) */
    resetSubscriptions: (user: string) => Promise<boolean>;

    /** @return success flag (independently of actual operation - e.g. already existing entry) */
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
