```
 Users                                                                              Topics
+---+--------------------------+-------------------+-------------------+           +---+--------+
|id | user                     | conversationKey   | conversationRef   |           |id | name   |
+----------------------------------------------------------------------+           +------------+
| 1 |jane.doe@megacoorp.com    | xxxx-xxx-xxxx     |  { ... }          |           | 1 | banana |
| 2 |jhon.smith@contractor.com | yyyy-yyy-yyyy     |  { ... }          |           | 2 | orange |
|   |                          |                   |                   |           | 3 | apple  |
+-^-+--------------------------+-------------------+-------------------+           |   |        |
  |                                                                                +-^-+--------+
  |                                                                                  |
  |                                                                                  |
  |                                          Subscriptions                           |
  |                                         +----------------+----------------+      |
  +-----------------------------------------+ userId         | topicId        +------+
                                            +---------------------------------+
                                            |  1  [[jane]]   |  1  [[banana]] |
                                            |  2  [[jhon]]   |  1  [[banana]] |
                                            |  2  [[jhon]]   |  3  [[apple]]  |
                                            |  1  [[jane]]   |  2  [[orange]] |
                                            |                |                |
                                            +----------------+----------------+

```
