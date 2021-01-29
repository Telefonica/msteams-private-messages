# Contributing to msteams-private-messages

Thanks for your interest. You can contribute to this project in several ways:

TODO

### Commit messages

**semantic-release**: We're using [Conventional-Changelog](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) to determine the type release to generate. The [following list](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#type) includes the valid commit messages and the type of release that will be created.

For convenience, this is the reference guide:

 - **feat**: A new feature
 - **fix**: A bug fix
 - **docs**: Documentation only changes
 - **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
 - **refactor**: A code change that neither fixes a bug nor adds a feature
 - **perf**: A code change that improves performance
 - **test**: Adding missing or correcting existing tests
 - **chore**: Changes to the build process or auxiliary tools and libraries

> In order for a feature/fix to be considered a major release, it needs to include the `BREAKING CHANGE:` body in the commit message. Refer the the full list of commit message types [here](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

To revert a commit, the commit message should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>`, where the hash is the SHA of the commit being reverted. **semantic-release** will automatically skip the original and the revert commit from the `CHANGELOG.md` if the release has not been yet created, if not, it will create a new one.

## Testing

### Running Tests

```bash
npm test
```
