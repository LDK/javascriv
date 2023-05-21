tinymce.PluginManager.add('writermode', (editor) => {
  let isActive = true;
  const btnLabel = 'Writer Mode';

  editor.ui.registry.addToggleButton('writermode', {
    text: btnLabel,
    icon: 'fullscreen',
    onAction: (api) => {
      editor.execCommand('mceFullScreen');
    },
    onSetup: (api) => {
      return () => {
        // api.setActive(true);

        const intervalCheck = setInterval(() => {
          const matchingElement = document.evaluate(`//*[contains(text(),'${btnLabel}')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          const btn = matchingElement?.closest('button');

          if (!btn) return;

          const isActive = document.querySelector('body').classList.contains('tox-fullscreen');

          if (isActive && !btn.classList.contains('tox-tbtn--enabled')) {
            btn.classList.add('tox-tbtn--enabled');
            clearInterval(intervalCheck);
          } else if (!isActive) {
            btn.classList.remove('tox-tbtn--enabled');
            clearInterval(intervalCheck);
          }
        }, 200);
      };
    },
  });
});
