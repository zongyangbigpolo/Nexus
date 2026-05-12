export function getMockPage(pageId = '112233', space = 'APP', title = 'Sample Page') {
  return {
    id: pageId,
    type: 'page',
    status: 'current',
    title,
    space: { key: space, name: 'Example Space' },
    version: { number: 1 },
    body: {
      storage: {
        representation: 'storage',
        value: '<h1>Sample Page</h1><p>Generic mock content for evaluation.</p>'
      }
    },
    _links: {
      webui: `https://example.atlassian.net/wiki/spaces/${space}/pages/${pageId}`
    }
  };
}
