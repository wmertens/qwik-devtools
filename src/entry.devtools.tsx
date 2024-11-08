import { render } from '@builder.io/qwik';
import { QwikCityProvider } from '@builder.io/qwik-city';
import { RouterOutlet } from '@builder.io/qwik-city';
import Root from './root';

render(document.getElementById('app')!, (
  <QwikCityProvider>
    <Root>
      <RouterOutlet />
    </Root>
  </QwikCityProvider>
));