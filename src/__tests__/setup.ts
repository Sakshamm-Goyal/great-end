// Test setup for Bun
import { expect } from 'bun:test';

// Mock window object for tests
Object.defineProperty(global, 'window', {
  value: {
    localStorage: {
      getItem: (key: string) => null,
      setItem: (key: string, value: string) => {},
      removeItem: (key: string) => {},
      clear: () => {},
      length: 0,
      key: (index: number) => null
    },
    indexedDB: {
      open: () => ({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: {
          createObjectStore: () => ({
            add: () => {},
            get: () => ({ onsuccess: null, onerror: null }),
            put: () => {},
            delete: () => {},
            clear: () => {}
          }),
          transaction: () => ({
            objectStore: () => ({
              add: () => {},
              get: () => ({ onsuccess: null, onerror: null }),
              put: () => {},
              delete: () => {},
              clear: () => {}
            })
          })
        }
      })
    },
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {}
    }),
    navigator: {
      clipboard: {
        writeText: (text: string) => Promise.resolve()
      }
    }
  },
  writable: true
});

// Mock document
Object.defineProperty(global, 'document', {
  value: {
    documentElement: {
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    },
    body: {
      appendChild: () => {},
      removeChild: () => {},
      insertBefore: () => {},
      replaceChild: () => {},
      nodeType: 1, // ELEMENT_NODE
      tagName: 'BODY',
      parentNode: null,
      childNodes: [],
      firstChild: null,
      lastChild: null,
      nextSibling: null,
      previousSibling: null,
      ownerDocument: global.document
    },
    head: {
      appendChild: () => {},
      removeChild: () => {}
    },
    getElementsByTagName: (tagName: string) => {
      if (tagName === 'head') {
        return [{ appendChild: () => {}, removeChild: () => {} }];
      }
      return [];
    },
    createElement: (tagName: string) => ({
      setAttribute: () => {},
      appendChild: () => {},
      removeChild: () => {},
      style: {
        cssText: ''
      },
      styleSheet: null,
      nodeType: 1, // ELEMENT_NODE
      tagName: tagName.toUpperCase(),
      parentNode: null,
      childNodes: [],
      firstChild: null,
      lastChild: null,
      nextSibling: null,
      previousSibling: null,
      ownerDocument: global.document,
      // Add properties that React Testing Library checks
      getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      querySelector: () => null,
      querySelectorAll: () => [],
      getAttribute: () => null,
      hasAttribute: () => false,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => false
      }
    }),
    createTextNode: (text: string) => ({
      textContent: text,
      nodeValue: text
    })
  },
  writable: true
});

// Mock the isValidContainer function that React Testing Library uses
Object.defineProperty(global, 'isValidContainer', {
  value: (container: any) => {
    return container && 
           typeof container === 'object' && 
           container.nodeType === 1 && 
           container.tagName;
  },
  writable: true
});

// Mock console for tests
global.console = {
  ...console,
  log: () => {},
  warn: () => {},
  error: () => {}
};

// Mock sonner module
const mockToast = {
  success: () => {},
  error: () => {},
  message: () => {}
};

// Mock modules
global.mockModules = {
  'sonner': {
    toast: mockToast
  },
  'lucide-react': {
    CalendarDays: () => 'div',
    CalendarPlus2: () => 'div',
    Clock: () => 'div',
    ChartGantt: () => 'div',
    RollerCoaster: () => 'div',
    Sunset: () => 'div',
    Coffee: () => 'div',
    Music: () => 'div',
    Gamepad2: () => 'div',
    BookOpen: () => 'div',
    Camera: () => 'div',
    Utensils: () => 'div',
    ShoppingBag: () => 'div',
    Dumbbell: () => 'div',
    Heart: () => 'div',
    Home: () => 'div',
    Car: () => 'div',
    Plane: () => 'div',
    MapPin: () => 'div',
    Star: () => 'div',
    Search: () => 'div',
    Filter: () => 'div',
    Plus: () => 'div',
    X: () => 'div',
    Edit: () => 'div',
    Trash2: () => 'div',
    Save: () => 'div',
    Download: () => 'div',
    Upload: () => 'div',
    Settings: () => 'div',
    User: () => 'div',
    LogOut: () => 'div',
    Menu: () => 'div',
    ChevronDown: () => 'div',
    ChevronUp: () => 'div',
    ChevronLeft: () => 'div',
    ChevronRight: () => 'div',
    Check: () => 'div',
    AlertCircle: () => 'div',
    Info: () => 'div',
    HelpCircle: () => 'div',
    ExternalLink: () => 'div',
    Copy: () => 'div',
    Share: () => 'div',
    Mail: () => 'div',
    Phone: () => 'div',
    MessageCircle: () => 'div',
    ThumbsUp: () => 'div',
    ThumbsDown: () => 'div',
    Heart: () => 'div',
    Bookmark: () => 'div',
    Flag: () => 'div',
    Eye: () => 'div',
    EyeOff: () => 'div',
    Lock: () => 'div',
    Unlock: () => 'div',
    Shield: () => 'div',
    Key: () => 'div',
    Bell: () => 'div',
    BellOff: () => 'div',
    Volume2: () => 'div',
    VolumeX: () => 'div',
    Play: () => 'div',
    Pause: () => 'div',
    Stop: () => 'div',
    SkipBack: () => 'div',
    SkipForward: () => 'div',
    Repeat: () => 'div',
    Shuffle: () => 'div',
    Maximize: () => 'div',
    Minimize: () => 'div',
    RotateCcw: () => 'div',
    RotateCw: () => 'div',
    RefreshCw: () => 'div',
    RefreshCcw: () => 'div',
    Loader: () => 'div',
    Loader2: () => 'div',
    Spinner: () => 'div'
  }
};

// Export expect for use in tests
export { expect };
