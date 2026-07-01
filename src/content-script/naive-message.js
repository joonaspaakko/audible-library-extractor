import { createDiscreteApi, lightTheme } from 'naive-ui';

const { message } = createDiscreteApi(['message'], {
  configProviderProps: { theme: lightTheme },
});

export default message;
