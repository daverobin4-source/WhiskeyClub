/* icons.js — Wellness & Whiskey icon set.
   Single-stroke, 24×24, currentColor. Mirrors the Dabble icon style
   (1.7px effective stroke, rounded joins). Render via <Icon name size/>. */
(function () {
  var S = 'currentColor';
  var IC = {
    /* ---- nav ---------------------------------------------------------- */
    glass: '<path d="M6.4 4.5h11.2l-1.05 13a2.6 2.6 0 0 1-2.59 2.4h-3.92a2.6 2.6 0 0 1-2.59-2.4L6.4 4.5Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M7.1 11.7c2.4 1.1 7.4 1.1 9.8 0" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/>',
    'glass-fill': '<path d="M6.4 4.5h11.2l-1.05 13a2.6 2.6 0 0 1-2.59 2.4h-3.92a2.6 2.6 0 0 1-2.59-2.4L6.4 4.5Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M7.0 11.2c2.5 1.25 7.5 1.25 10 0l-.62 6.0a2.6 2.6 0 0 1-2.59 2.4h-3.92a2.6 2.6 0 0 1-2.59-2.4L7.0 11.2Z" fill="' + S + '" stroke="none"/>',
    trophy: '<path d="M7 4.5h10v3.2a5 5 0 0 1-10 0V4.5Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M7 6H4.6v1.4A3 3 0 0 0 7 10.3M17 6h2.4v1.4A3 3 0 0 1 17 10.3" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/><path d="M12 12.7v3.4M8.8 19.5h6.4M9.6 19.5l.5-3.4h3.8l.5 3.4" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    'trophy-fill': '<path d="M7 4.5h10v3.2a5 5 0 0 1-10 0V4.5Z" fill="' + S + '"/><path d="M7 6H4.6v1.4A3 3 0 0 0 7 10.3M17 6h2.4v1.4A3 3 0 0 1 17 10.3" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/><path d="M12 12.7v3.4M8.8 19.5h6.4M9.6 19.5l.5-3.4h3.8l.5 3.4" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    bottle: '<path d="M10 3.2h4M10.4 3.2v3.0c0 .7-.25 1-0.8 1.6C8.4 9 8 9.9 8 11.2v6.6A2.2 2.2 0 0 0 10.2 20h3.6A2.2 2.2 0 0 0 16 17.8v-6.6c0-1.3-.4-2.2-1.6-3.4-.55-.6-.8-.9-.8-1.6v-3" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13.2h8" stroke="' + S + '" stroke-width="1.7"/>',
    'bottle-fill': '<path d="M10 3.2h4M10.4 3.2v3.0c0 .7-.25 1-0.8 1.6C8.4 9 8 9.9 8 11.2v6.6A2.2 2.2 0 0 0 10.2 20h3.6A2.2 2.2 0 0 0 16 17.8v-6.6c0-1.3-.4-2.2-1.6-3.4-.55-.6-.8-.9-.8-1.6v-3" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13.4h8v4.4A2.2 2.2 0 0 1 13.8 20h-3.6A2.2 2.2 0 0 1 8 17.8v-4.4Z" fill="' + S + '"/>',
    chat: '<path d="M20 11.5c0 3.9-3.58 7-8 7-1 0-1.96-.16-2.84-.45L4 19.5l1.2-3.3C4.45 15.1 4 13.36 4 11.5c0-3.9 3.58-7 8-7s8 3.1 8 7Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 11.3h6M9 14h3.8" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/>',
    'chat-fill': '<path d="M20 11.5c0 3.9-3.58 7-8 7-1 0-1.96-.16-2.84-.45L4 19.5l1.2-3.3C4.45 15.1 4 13.36 4 11.5c0-3.9 3.58-7 8-7s8 3.1 8 7Z" fill="' + S + '"/>',

    /* ---- score categories -------------------------------------------- */
    aroma: '<path d="M5 17c2.5-1.2 2.5-3.4 0-4.6M9 18.4c3.6-1.7 3.6-5.1 0-6.8M13 19c4.8-2.2 4.8-6.8 0-9" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/><circle cx="17.5" cy="6.5" r="2.2" fill="none" stroke="' + S + '" stroke-width="1.7"/>',
    taste: '<path d="M12 3.2c3.4 4.2 5.4 7 5.4 9.8a5.4 5.4 0 1 1-10.8 0c0-2.8 2-5.6 5.4-9.8Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.4 13.4c0 1.6 1.1 2.9 2.6 3.2" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/>',
    finish: '<path d="M13.5 2.5c.6 2.6-.8 3.6-2 5-1.4 1.6-2.7 3-2.7 5.4a5.2 5.2 0 0 0 10.4 0c0-1.2-.5-2.3-1-3 .1 1.3-.7 2-1.4 2.2.6-1.8-.4-4-1.5-5.4-1-1.3-1.8-2.6-.8-4.2Z" fill="none" stroke="' + S + '" stroke-width="1.6" stroke-linejoin="round"/>',

    /* ---- ui ----------------------------------------------------------- */
    clock: '<circle cx="12" cy="12" r="8.4" fill="none" stroke="' + S + '" stroke-width="1.7"/><path d="M12 7.6V12l3 1.8" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    pin: '<path d="M12 21c4-4.2 6-7.4 6-10.2A6 6 0 0 0 6 10.8C6 13.6 8 16.8 12 21Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10.6" r="2.3" fill="none" stroke="' + S + '" stroke-width="1.7"/>',
    calendar: '<rect x="4" y="5.4" width="16" height="14.6" rx="2.4" fill="none" stroke="' + S + '" stroke-width="1.7"/><path d="M4 9.4h16M8 3.4v3.4M16 3.4v3.4" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/>',
    flame: '<path d="M13.4 2.5c.7 3-.9 4.2-2.3 5.8-1.6 1.8-3.1 3.4-3.1 6.1a6 6 0 0 0 12 0c0-1.4-.6-2.7-1.2-3.5.1 1.5-.8 2.3-1.6 2.6.7-2-.5-4.6-1.7-6.2-1.2-1.5-2.1-3-.9-4.8Z" fill="' + S + '" stroke="none"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="' + S + '" stroke-width="2" stroke-linecap="round"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="' + S + '" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    'check-circle': '<circle cx="12" cy="12" r="8.6" fill="' + S + '"/><path d="M8.2 12.2l2.6 2.6L16 9.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="M9 5l7 7-7 7" fill="none" stroke="' + S + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    'chevron-down': '<path d="M5 9l7 7 7-7" fill="none" stroke="' + S + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="' + S + '" stroke-width="2" stroke-linecap="round"/>',
    heart: '<path d="M12 20C6.6 16.2 4 13 4 9.6 4 7.1 6 5.2 8.4 5.2c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2C18 5.2 20 7.1 20 9.6 20 13 17.4 16.2 12 20Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/>',
    'heart-fill': '<path d="M12 20C6.6 16.2 4 13 4 9.6 4 7.1 6 5.2 8.4 5.2c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2C18 5.2 20 7.1 20 9.6 20 13 17.4 16.2 12 20Z" fill="' + S + '"/>',
    sparkle: '<path d="M12 3l1.7 5.1L19 9.8l-4.5 2.7L13 18l-1-4.6L7 12l4.3-1.4L12 3Z" fill="' + S + '"/>',
    medal: '<circle cx="12" cy="14" r="5.4" fill="none" stroke="' + S + '" stroke-width="1.7"/><path d="M9 9.4 7 3.4h4l1.4 3.4M15 9.4l2-6h-4l-1.4 3.4" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 11.6l.9 1.8 2 .3-1.45 1.4.34 2-1.79-.95-1.79.95.34-2L9.1 13.7l2-.3.9-1.8Z" fill="' + S + '" stroke="none"/>',
    arrow: '<path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="' + S + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    send: '<path d="M4.5 12 19.5 5l-4.2 14.2-3.4-5.9-5.4-1.3Z" fill="' + S + '" stroke="none"/>',
    user: '<circle cx="12" cy="8.4" r="3.8" fill="none" stroke="' + S + '" stroke-width="1.7"/><path d="M4.8 20c.7-3.7 3.6-5.8 7.2-5.8s6.5 2.1 7.2 5.8" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/>',
    info: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="' + S + '" stroke-width="1.7"/><path d="M12 11v5.2M12 7.8h.01" fill="none" stroke="' + S + '" stroke-width="2" stroke-linecap="round"/>',
    bag: '<path d="M6.4 8h11.2l.9 11.2a1.6 1.6 0 0 1-1.6 1.7H7.1a1.6 1.6 0 0 1-1.6-1.7L6.4 8Z" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="' + S + '" stroke-width="1.7" stroke-linecap="round"/>',
    star: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.2 5.8L12 16.7 6.8 19.3l1.2-5.8-4.3-4 5.8-.7L12 3.5Z" fill="' + S + '" stroke="none"/>',
    up: '<path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="' + S + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    down: '<path d="M12 5v13M6 13l6 6 6-6" fill="none" stroke="' + S + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  window.Icon = function Icon(props) {
    var name = props.name, size = props.size || 22, color = props.color || 'currentColor';
    var sw = props.strokeWidth;
    var inner = IC[name];
    if (!inner) return null;
    var st = Object.assign({ width: size, height: size, display: 'inline-block', color: color, flexShrink: 0, lineHeight: 0 }, props.style || {});
    return React.createElement('span', {
      style: st,
      dangerouslySetInnerHTML: { __html: '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" style="display:block">' + inner + '</svg>' }
    });
  };
  window.WW_ICON_NAMES = Object.keys(IC);
})();
