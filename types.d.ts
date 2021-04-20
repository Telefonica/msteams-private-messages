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

    removeTopic: (topic: string) => Promise<boolean>;

    /** @return success flag (independently of actual operation - e.g. already existing entry) */
    subscribe: (user: string, topic: string) => Promise<boolean>;

    cancelSubscription: (user: string, topic: string) => Promise<boolean>;

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

  interface NotifyOpts {
    includeMention?: boolean;
  }

  interface BroadcastOpts {
    ensureTopic?: boolean;
  }

  interface TopicObj {
    name: string;
    subscribers: string[];
  }

  interface UserObj {
    user: string;
    subscriptions: string[];
  }

  interface Handlers {
    // --------------
    // main methods
    // --------------

    /** bot-SDK entry point */
    processMessage: (
      req: import("restify").Request,
      res: import("restify").Response
    ) => Promise<void>;

    /** @return conversationKey */
    notify: (
      user: string,
      message: string | Partial<Activity>,
      opts?: NotifyOpts
    ) => Promise<string>;

    /** @return conversationKeys */
    broadcast: (
      topics: string[],
      message: string | Partial<Activity>,
      opts?: BroadcastOpts
    ) => Promise<string[]>;

    // --------------
    // admin methods
    // --------------
    getUsers: () => Promise<string[]>;
    getUser: (user: string) => Promise<UserObj>;
    getTopics: () => Promise<string[]>;
    getTopic: (topic: string) => Promise<TopicObj>;
    createTopic: (topic: string) => Promise<TopicObj>;
    removeTopic: (topic: string) => Promise<string[]>;
    forceSubscription: (user: string, topic: string) => Promise<TopicObj>;
    cancelSubscription: (user: string, topic: string) => Promise<TopicObj>;
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
      welcome: ICard;
      unknown: ICard;
      menu: {
        title: string;
        checkButton: IButton;
        resetButton: IButton;
        listButton: IButton;
      };
    };
  }

  interface InfoFromContext {
    user: string;
    text: string;
    selectedTopics?: {
      subscribeTo: string[];
      unsubscribeFrom: string[];
    };
    conversation: Partial<ConversationReference>;
  }

  interface SubcriptionStatus {
    topic: string;
    subscribed: boolean;
  }
}
