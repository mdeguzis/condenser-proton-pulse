// Runtime bridge: forwards to Steam's React instance injected by condenser-app.
const g = () => (window as any).__condenser.core.React!;

export default { get: g };
export const useState    = (...a: any[]) => g().useState(...a);
export const useEffect   = (...a: any[]) => g().useEffect(...a);
export const useRef      = (...a: any[]) => g().useRef(...a);
export const useCallback = (...a: any[]) => g().useCallback(...a);
export const useMemo     = (...a: any[]) => g().useMemo(...a);
export const useContext  = (...a: any[]) => g().useContext(...a);
export const useReducer  = (...a: any[]) => g().useReducer(...a);
export const createContext = (...a: any[]) => g().createContext(...a);
export const createElement = (...a: any[]) => g().createElement(...a);
export const forwardRef  = (...a: any[]) => g().forwardRef(...a);
export const memo        = (...a: any[]) => g().memo(...a);
export const Fragment    = () => g().Fragment;
