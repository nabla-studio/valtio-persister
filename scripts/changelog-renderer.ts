import defaultChangelogRenderer from 'nx/release/changelog-renderer';

const changelogRenderer = async ({
  projectGraph,
  commits,
  releaseVersion,
  project,
  entryWhenNoChanges,
  changelogRenderOptions,
  repoSlug,
  conventionalCommitsConfig,
}) => {
  const defaultChangelog = await defaultChangelogRenderer({
    projectGraph,
    commits,
    releaseVersion,
    project,
    entryWhenNoChanges,
    changelogRenderOptions,
    repoSlug,
    conventionalCommitsConfig,
  });

  return defaultChangelog;
};

module.exports = changelogRenderer;
