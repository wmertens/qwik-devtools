function analyzeQwikContainers() {
  const containers = document.querySelectorAll('[q\\:container]');
  return Array.from(containers).map(container => {
    const stateScript = container.querySelector('script[type="qwik/state"]');
    let state = null;
    if (stateScript) {
      try {
        state = JSON.parse(stateScript.textContent || '');
      } catch (error) {
        console.error('Error parsing Qwik state:', error);
      }
    }
    return {
      id: container.getAttribute('q:container'),
      tagName: container.tagName.toLowerCase(),
      childrenCount: container.childElementCount,
      state: state
    };
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeQwikContainers') {
    sendResponse(analyzeQwikContainers());
  }
});