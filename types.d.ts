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

  type TopicsDictionary = { [topic: string]: string[] };

  interface Handlers {
    /* bot-SDK entry point */
    processMessage: (
      req: import("restify").Request,
      res: import("restify").Response
    ) => Promise<void>;

    /* main methods */

    /** @return conversationKey */
    notify: (
      user: string,
      message: string | Partial<Activity>,
      opts?: NotifyOpts
    ) => Promise<string>;

    /** @return conversationKeys */
    broadcast: (
      topic: string,
      message: string | Partial<Activity>,
      opts?: BroadcastOpts
    ) => Promise<string[]>;

    /* debugging */

    getUsers: () => Promise<string[]>;
    getTopics: () => Promise<TopicsDictionary>;

    /* ops */

    /** @return topics */
    createTopic: (topic: string) => Promise<TopicsDictionary>;
    /** @return topics */
    removeTopic: (topic: string) => Promise<TopicsDictionary>;
    /** @return subscribers */
    forceSubscription: (user: string, topic: string) => Promise<string[]>;
    /** @return subscribers */
    cancelSubscription: (user: string, topic: string) => Promise<string[]>;
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
      topics: {
        title: string;
        subscriptionButton: IButton;
      };
    };
  }
}
