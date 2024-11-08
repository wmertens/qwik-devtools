import { component$, useStore, useVisibleTask$, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

const JsonView = component$(({ value, startOpen = true }: { value: unknown, startOpen?: boolean }) => {
  const isOpen = useSignal(startOpen);

  const toggleOpen = $(() => {
    isOpen.value = !isOpen.value;
  });

  const renderValue = (val: unknown) => {
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (val === null) return 'null';
    return 'undefined';
  };

  return (
      typeof value === 'object' && value !== null ? (<>
          <span onClick$={toggleOpen} style="cursor: pointer;">
            {isOpen.value ? '▼' : '▶'} {Array.isArray(value) ? '[]' : '{}'}
          </span>
          {isOpen.value && (
            <div style="margin-left: 20px;">
              {Object.entries(value).map(([key, val]) => (
                <div key={key}>
                  <span>{key}: </span>
                  <JsonView value={val} startOpen={false} />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <span>{renderValue(value)}</span>
      )
  );
});

interface QwikContainer {
  id: string;
  tagName: string;
  childrenCount: number;
  state: any;
}

export default component$(() => {
  const store = useStore<{ containers: QwikContainer[] }>({
    containers: [],
  });

  useVisibleTask$(() => {
    const analyzeContainers = () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        // Chrome extension environment
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab.id) {
            chrome.tabs.sendMessage(
              activeTab.id,
              { action: 'analyzeQwikContainers' },
              (response: QwikContainer[]) => {
                store.containers = response;
              }
            );
          }
        });
      } else {
        // Development environment
        const containers = document.querySelectorAll('[q\\:container]');
        store.containers = Array.from(containers).map(container => {
          const stateScript = container.querySelector('script[type="qwik/state"],script[type="qwik/json"]');
          let state = null;
          if (stateScript) {
            try {
              state = JSON.parse(stateScript.textContent || '');
            } catch (error) {
              console.error('Error parsing Qwik state:', error);
            }
          }
          return {
            id: container.getAttribute('q:container') || '',
            tagName: container.tagName.toLowerCase(),
            childrenCount: container.childElementCount,
            state: state
          };
        });
      }
    };

    analyzeContainers();

    // Re-analyze containers every 5 seconds
    const interval = setInterval(analyzeContainers, 5000);

    return () => clearInterval(interval);
  });

  return (
    <div class="container">
      <h1>
        <span class="highlight">Qwik</span> Containers
      </h1>
      {store.containers.length === 0 ? (
        <p>No Qwik containers found on the page.</p>
      ) : (
        <ul>
          {store.containers.map((container) => (
            <li key={container.id}>
              <strong>ID:</strong> {container.id}
              <br />
              <strong>Tag:</strong> {container.tagName}
              <br />
              <strong>Children:</strong> {container.childrenCount}
              {container.state && (
                <div class="state-inspector">
                  <h3>State:</h3>
                  <JsonView value={container.state} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Qwik DevTools',
};