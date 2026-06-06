import IconFormatTitle    from '~icons/mdi/format-title?raw';
import IconArrowAll       from '~icons/mdi/arrow-all?raw';
import IconHandGrabbing   from '~icons/ph/hand-grabbing?raw';
import IconHandFill       from '~icons/mingcute/hand-fill?raw';
import IconCursorClick    from '~icons/mdi/cursor-default-click?raw';
import IconScroll         from '~icons/mdi/mouse-scroll-wheel?raw';

// NAMED ICON SHORTCUTS
// Pass a shorthand string as icon, or a raw SVG string directly.
export const iconPresets = {
  'text'          : IconFormatTitle,
  'arrows'        : IconArrowAll,
  'hand'          : IconHandGrabbing,
  'grab'          : IconHandGrabbing,
  'hand-fill'     : IconHandFill,
  'cursor-click'  : IconCursorClick,
  'scroll'        : IconScroll,
};

// NAMED COLOR SHORTCUTS
// Pass a name or alias, or a hex/css color directly.
export const colorPresets = {
  'info'    : '#0798f1',
  'blue'    : '#0798f1',
  'warning' : '#fbc03d',
  'orange'  : '#fbc03d',
  'success' : '#2ecc40',
  'green'   : '#2ecc40',
  'error'   : '#f04040',
  'red'     : '#e84848',
  'yellow'  : '#e0aa18',
  'purple'  : '#7c52e8',
  'pink'    : '#e03880',
};

// NOTIFICATION TYPE PRESETS
// type: 'text' sets icon + color automatically. Explicit icon/color still override.
export const typePresets = {
  'text'    : { icon: 'text',   color: 'yellow'  },
  'arrows'  : { icon: 'arrows', color: 'purple'  },
  'drag'    : { icon: 'hand',   color: 'red'     },
  'sort'    : { icon: 'hand',   color: 'red'     },
  'warning' : { color: 'warning', closable: false },
  'info'    : { color: 'info'                    },
  'success' : { color: 'success'                 },
};

export function resolveNotification( opts ) {
  const { type, icon, color } = opts;

  const typeDefaults  = typePresets[ type ] || {};
  const resolvedIcon  = icon  ?? typeDefaults.icon  ?? null;
  const resolvedColor = color ?? typeDefaults.color ?? null;

  // resolve named icon → raw SVG, or pass through if already a raw SVG string
  const finalIcon  = resolvedIcon  ? ( iconPresets[ resolvedIcon ]   ?? resolvedIcon  ) : null;
  // resolve named color → hex, or pass through if already a hex/css value
  const finalColor = resolvedColor ? ( colorPresets[ resolvedColor ] ?? resolvedColor ) : null;

  return { ...typeDefaults, ...opts, icon: finalIcon, color: finalColor };
}
