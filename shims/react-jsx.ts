// Runtime bridge: forwards JSX factory calls to Steam's React instance.
const R = () => (window as any).__condenser.core.React!;
export const Fragment = () => R().Fragment;

function jsxFactory(type: any, props: any, key?: any) {
  return R().createElement(type, key !== undefined ? { ...props, key } : props);
}

export const jsx    = jsxFactory;
export const jsxs   = jsxFactory;
export const jsxDEV = (type: any, props: any, key?: any) => jsxFactory(type, props, key);
