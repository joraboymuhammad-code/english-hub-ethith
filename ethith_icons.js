/**
 * ETHITH / ENGLISH HOUSE — Apple-Grade Handcrafted SVG Icon System & Platform-Wide Button Upgrader
 * Replaces all raw OS emoji stickers across Admin, Teacher & Student UI buttons,
 * sidebar tiles, dashboard cards, toolbars, and modals with crisp, optically balanced
 * duotone SF-style vector icons inside continuous-curvature squircle tiles.
 */
(function () {
  'use strict';

  var SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var SVG_CLOSE = '</svg>';

  // Handcrafted 24x24 optical duotone icon paths (stroke + subtle 18% fill depth layer)
  var ICONS = {
    // Navigation & Dashboard
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2" fill="currentColor" fill-opacity="0.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="currentColor" fill-opacity="0.2"/>',
    spreadsheet: '<rect x="3.5" y="3.5" width="17" height="17" rx="3" fill="currentColor" fill-opacity="0.14"/><path d="M3.5 9.2h17M3.5 14.8h17M9.5 9.2v11.3M15.2 9.2v11.3"/><path d="M6.8 6.4h3.2" stroke-width="2.1"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="currentColor" fill-opacity="0.14"/><path d="M3.5 9.8h17M8 3v3.5M16 3v3.5"/><path d="M9.2 14.8l1.9 1.9 3.8-3.8" stroke-width="2.1"/>',
    card: '<rect x="2.8" y="5.2" width="18.4" height="13.6" rx="3" fill="currentColor" fill-opacity="0.16"/><path d="M2.8 9.6h18.4"/><path d="M6.5 14.5h4.2M15.2 14.5h2.4"/>',
    teacher: '<circle cx="9.2" cy="7.8" r="3.1" fill="currentColor" fill-opacity="0.2"/><path d="M3.5 19.2c.4-3.3 2.7-5.2 5.7-5.2s5.3 1.9 5.7 5.2"/><rect x="14.2" y="4.5" width="6.6" height="6.8" rx="1.6" fill="currentColor" fill-opacity="0.14"/><path d="M16.2 7.2h2.6M16.2 9.3h1.8"/>',
    trophy: '<path d="M7.5 4.2h9v5.3a4.5 4.5 0 0 1-9 0V4.2z" fill="currentColor" fill-opacity="0.22"/><path d="M7.5 6H4.6a1.6 1.6 0 0 0-1.6 1.6v.8a3.6 3.6 0 0 0 3.6 3.6h1"/><path d="M16.5 6h2.9A1.6 1.6 0 0 1 21 7.6v.8a3.6 3.6 0 0 1-3.6 3.6h-1"/><path d="M12 14v4.5M8.2 19.8h7.6"/>',
    book: '<path d="M4.2 5.2A2.2 2.2 0 0 1 6.4 3h11.8a1.6 1.6 0 0 1 1.6 1.6v14.8a1.6 1.6 0 0 1-1.6 1.6H6.4a2.2 2.2 0 0 1-2.2-2.2V5.2z" fill="currentColor" fill-opacity="0.16"/><path d="M8 3v18M11.5 8h5M11.5 11.8h3.8"/><path d="M4.2 17.8h15.6" stroke-opacity="0.45"/>',
    bookOpen: '<path d="M2.8 6.2c2.2-.8 5.2-.7 9.2 1.1 4-1.8 7-1.9 9.2-1.1v12.2c-2.2-.8-5.2-.7-9.2 1.1-4-1.8-7-1.9-9.2-1.1V6.2z" fill="currentColor" fill-opacity="0.16"/><path d="M12 7.3v12.2"/>',
    books: '<rect x="3.5" y="4.5" width="4.6" height="15" rx="1.2" fill="currentColor" fill-opacity="0.2"/><rect x="9.6" y="3.5" width="4.8" height="16" rx="1.2"/><path d="M16.2 5.4l4.1 13.4a1.1 1.1 0 0 1-.8 1.4l-2.3.7a1.1 1.1 0 0 1-1.4-.8L14.5 6.4" fill="currentColor" fill-opacity="0.14"/>',
    laptop: '<rect x="4" y="4.5" width="16" height="11" rx="2.2" fill="currentColor" fill-opacity="0.16"/><path d="M2.2 18.8h19.6"/><path d="M9 10l2 2 4-4" stroke-width="2"/>',
    chat: '<path d="M4 6.2A2.8 2.8 0 0 1 6.8 3.5h10.4A2.8 2.8 0 0 1 20 6.2v7.6a2.8 2.8 0 0 1-2.8 2.8H10l-4.4 3.4a.6.6 0 0 1-1-.48V16.6A2.8 2.8 0 0 1 4 13.8V6.2z" fill="currentColor" fill-opacity="0.18"/><path d="M8.5 8.8h7M8.5 12h4.6"/>',
    bolt: '<path d="M13.4 2.6L4.8 13.2h6.3l-1.3 8.2 9.4-11.2h-6.4l.6-7.6z" fill="currentColor" fill-opacity="0.25"/>',
    crown: '<path d="M3.5 17.5L5.2 7.8l4.4 3.8L12 5.5l2.4 6.1 4.4-3.8 1.7 9.7a1.5 1.5 0 0 1-1.5 1.7H5a1.5 1.5 0 0 1-1.5-1.7z" fill="currentColor" fill-opacity="0.22"/><path d="M5 19.2h14"/>',
    gem: '<path d="M6.5 4.2h11l3.7 5.2L12 20.2 2.8 9.4l3.7-5.2z" fill="currentColor" fill-opacity="0.2"/><path d="M2.8 9.4h18.4M12 20.2L8.4 9.4 12 4.2l3.6 5.2-3.6 10.8z"/>',
    aiBot: '<rect x="4" y="6.5" width="16" height="12.5" rx="4" fill="currentColor" fill-opacity="0.18"/><path d="M12 3.2v3.3M9 12.2v.6M15 12.2v.6" stroke-width="2.2"/><path d="M9.2 15.6c.9.7 1.8 1 2.8 1s1.9-.3 2.8-1"/><path d="M2.2 11.5v2.5M21.8 11.5v2.5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" fill="currentColor" fill-opacity="0.24"/><path d="M18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>',
    briefcase: '<rect x="3" y="7.5" width="18" height="12.5" rx="2.8" fill="currentColor" fill-opacity="0.16"/><path d="M8.5 7.5V5.6A1.8 1.8 0 0 1 10.3 3.8h3.4a1.8 1.8 0 0 1 1.8 1.8v1.9"/><path d="M3 12.5h18M10.5 12.5v2h3v-2"/>',
    graduation: '<path d="M2.5 9.5L12 4.8l9.5 4.7L12 14.2 2.5 9.5z" fill="currentColor" fill-opacity="0.2"/><path d="M6.2 11.5v4.6c0 1.6 2.6 3.1 5.8 3.1s5.8-1.5 5.8-3.1v-4.6M20.5 10v5.5"/>',
    shield: '<path d="M12 3l7.5 3.1v5.6c0 4.6-3.1 8-7.5 9.5-4.4-1.5-7.5-4.9-7.5-9.5V6.1L12 3z" fill="currentColor" fill-opacity="0.18"/><path d="M9.2 12l2 2 3.8-4"/>',

    // Actions & CRUD
    plus: '<circle cx="12" cy="12" r="8.8" fill="currentColor" fill-opacity="0.16"/><path d="M12 8.2v7.6M8.2 12h7.6" stroke-width="2.1"/>',
    edit: '<path d="M14.8 4.4l4.8 4.8-10.2 10.2-5.4 1.2 1.2-5.4L14.8 4.4z" fill="currentColor" fill-opacity="0.18"/><path d="M12.6 6.6l4.8 4.8"/>',
    trash: '<path d="M4.5 6.8h15M9.2 6.8V4.8a1.4 1.4 0 0 1 1.4-1.4h2.8a1.4 1.4 0 0 1 1.4 1.4v2" /><path d="M6.4 6.8l.9 12.1a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8l.9-12.1" fill="currentColor" fill-opacity="0.16"/><path d="M10 11v5.5M14 11v5.5"/>',
    save: '<path d="M5 4h11l3 3v12a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19V5.6A1.6 1.6 0 0 1 5.6 4z" fill="currentColor" fill-opacity="0.16"/><path d="M8 4v4.8h7.2V4M7.8 20.5v-6.2h8.4v6.2"/>',
    transfer: '<path d="M17.2 4.8L20.5 8l-3.3 3.2"/><path d="M4 8h16.2"/><path d="M6.8 19.2L3.5 16l3.3-3.2"/><path d="M20 16H3.8"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.6" fill="currentColor" fill-opacity="0.14"/><path d="M15.8 15.8L20.2 20.2" stroke-width="2.2"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="16.2" rx="2.5" fill="currentColor" fill-opacity="0.16"/><path d="M9 3.2h6a1.2 1.2 0 0 1 1.2 1.2v1.4H7.8V4.4A1.2 1.2 0 0 1 9 3.2z"/><path d="M8.5 10.6h7M8.5 14.4h5"/>',
    note: '<path d="M5 4.2h10.5L19 7.7v11.5a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.2V4.2z" fill="currentColor" fill-opacity="0.16"/><path d="M15 4.2v4h4M8.5 11.5h7M8.5 15.2h4.6"/>',
    download: '<path d="M12 4v11.2M7.8 11.2L12 15.5l4.2-4.3" stroke-width="2.1"/><path d="M4.5 17.5v1.6A1.8 1.8 0 0 0 6.3 20.9h11.4a1.8 1.8 0 0 0 1.8-1.8v-1.6"/>',
    upload: '<path d="M12 15.5V4.2M7.8 8.2L12 4l4.2 4.2" stroke-width="2.1"/><path d="M4.5 17.5v1.6A1.8 1.8 0 0 0 6.3 20.9h11.4a1.8 1.8 0 0 0 1.8-1.8v-1.6"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.8" rx="2.6" fill="currentColor" fill-opacity="0.18"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/><circle cx="12" cy="15.2" r="1.1" fill="currentColor"/>',
    unlock: '<rect x="5" y="10.5" width="14" height="9.8" rx="2.6" fill="currentColor" fill-opacity="0.18"/><path d="M8 10.5V7.8a4 4 0 0 1 7.6-1.6"/>',
    settings: '<circle cx="12" cy="12" r="3.1" fill="currentColor" fill-opacity="0.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 0 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a1.9 1.9 0 0 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 0 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a1.9 1.9 0 0 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 0 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 .9-1.5V3a1.9 1.9 0 0 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5.9H21a1.9 1.9 0 0 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    eye: '<path d="M2.5 12s3.6-6.2 9.5-6.2S21.5 12 21.5 12s-3.6 6.2-9.5 6.2S2.5 12 2.5 12z" fill="currentColor" fill-opacity="0.14"/><circle cx="12" cy="12" r="2.8" fill="currentColor" fill-opacity="0.25"/>',
    check: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M8.2 12.2l2.6 2.6 5.2-5.4" stroke-width="2.2"/>',
    close: '<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.15"/><path d="M9 9l6 6M15 9l-6 6" stroke-width="2.1"/>',
    warning: '<path d="M10.4 4.2L2.8 17.5a1.8 1.8 0 0 0 1.6 2.7h15.2a1.8 1.8 0 0 0 1.6-2.7L13.6 4.2a1.8 1.8 0 0 0-3.2 0z" fill="currentColor" fill-opacity="0.2"/><path d="M12 9.2v4.6M12 17h.01" stroke-width="2.2"/>',
    phone: '<rect x="6.2" y="2.8" width="11.6" height="18.4" rx="2.6" fill="currentColor" fill-opacity="0.16"/><path d="M10.5 17.8h3M10 5.5h4"/>',
    sms: '<rect x="5.5" y="2.8" width="13" height="18.4" rx="2.6" fill="currentColor" fill-opacity="0.16"/><path d="M9 8.5h6M9 12h4.2M10.5 17.8h3"/>',
    chartBar: '<rect x="4" y="12.5" width="3.8" height="7.5" rx="1.2" fill="currentColor" fill-opacity="0.22"/><rect x="10.1" y="7.5" width="3.8" height="12.5" rx="1.2" fill="currentColor" fill-opacity="0.18"/><rect x="16.2" y="4" width="3.8" height="16" rx="1.2"/>',
    chartUp: '<path d="M3.5 19.5h17"/><path d="M4.5 15.2l5-5 3.6 3.4 6.2-7.2" stroke-width="2.1"/><path d="M15.2 6.4h4.1v4.1"/>',
    folder: '<path d="M3.2 7.2A2.2 2.2 0 0 1 5.4 5h4.2l2.1 2.2h6.9a2.2 2.2 0 0 1 2.2 2.2v8.2a2.2 2.2 0 0 1-2.2 2.2H5.4a2.2 2.2 0 0 1-2.2-2.2V7.2z" fill="currentColor" fill-opacity="0.18"/>',
    palette: '<path d="M12 3.2a8.8 8.8 0 0 0 0 17.6h1.6a2.4 2.4 0 0 0 1.8-4 2.2 2.2 0 0 1 1.6-3.6h1.4a3.6 3.6 0 0 0 3.6-3.6c0-3.6-4.4-6.4-10-6.4z" fill="currentColor" fill-opacity="0.16"/><circle cx="7.6" cy="11.4" r="1.1" fill="currentColor"/><circle cx="10.4" cy="7.6" r="1.1" fill="currentColor"/><circle cx="14.8" cy="7.8" r="1.1" fill="currentColor"/>',
    rocket: '<path d="M14.5 4.2c2.8-.6 5.2-.2 5.2-.2s.4 2.4-.2 5.2c-.8 3.6-3.8 6.4-7 7.6l-4.5-4.5c1.2-3.2 4-6.2 6.5-8.1z" fill="currentColor" fill-opacity="0.2"/><path d="M8 12.3L4.8 13l-1.3 3.2 3.2-1.3.7-3.2M11.7 16l-.7 3.2-3.2 1.3 1.3-3.2 3.2-.7"/><circle cx="14.6" cy="9.4" r="1.3" fill="currentColor"/>',
    target: '<circle cx="12" cy="12" r="8.6" fill="currentColor" fill-opacity="0.12"/><circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity="0.16"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/>',
    timer: '<circle cx="12" cy="13.2" r="7.4" fill="currentColor" fill-opacity="0.16"/><path d="M9.5 3h5M12 3v2.8M12 13.2l3-2.6M17.8 7.4l1.4-1.4"/>',
    hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11M7.8 3.5v3.4c0 2.1 2 3.6 4.2 5.1-2.2 1.5-4.2 3-4.2 5.1v3.4M16.2 3.5v3.4c0 2.1-2 3.6-4.2 5.1 2.2 1.5 4.2 3 4.2 5.1v3.4" fill="currentColor" fill-opacity="0.14"/>',
    gift: '<rect x="3.8" y="8.5" width="16.4" height="4" rx="1" fill="currentColor" fill-opacity="0.2"/><path d="M5.2 12.5v7.2a1.5 1.5 0 0 0 1.5 1.5h10.6a1.5 1.5 0 0 0 1.5-1.5v-7.2M12 8.5v12.7"/><path d="M12 8.5H8.8a2.1 2.1 0 1 1 0-4.2c2.2 0 3.2 4.2 3.2 4.2zm0 0h3.2a2.1 2.1 0 1 0 0-4.2C13 4.3 12 8.5 12 8.5z"/>',
    flag: '<path d="M5.5 3.8v16.8M5.5 4.5h11.8l-2.2 4.4 2.2 4.4H5.5" fill="currentColor" fill-opacity="0.2"/>',
    money: '<rect x="3" y="6.2" width="18" height="11.6" rx="2.4" fill="currentColor" fill-opacity="0.16"/><circle cx="12" cy="12" r="2.8" fill="currentColor" fill-opacity="0.2"/><path d="M6.4 9.5h.01M17.6 14.5h.01"/>',
    coin: '<circle cx="12" cy="12" r="8.6" fill="currentColor" fill-opacity="0.2"/><path d="M12 7.2v9.6M14.5 9.6c0-1.1-1.1-1.8-2.5-1.8s-2.5.7-2.5 1.8c0 1.2 1.2 1.6 2.5 2s2.5.8 2.5 2-1.1 1.9-2.5 1.9-2.5-.8-2.5-1.9"/>',
    users: '<circle cx="9.2" cy="8.4" r="3" fill="currentColor" fill-opacity="0.2"/><path d="M3.5 19.2c.5-3.1 2.8-5 5.7-5s5.2 1.9 5.7 5"/><circle cx="16.4" cy="9.2" r="2.3"/><path d="M16.5 14.4c2.1.3 3.7 1.9 4.2 4.6"/>',
    user: '<circle cx="12" cy="8.2" r="3.6" fill="currentColor" fill-opacity="0.2"/><path d="M4.8 19.6c.7-3.6 3.5-5.6 7.2-5.6s6.5 2 7.2 5.6"/>',
    speaker: '<path d="M4.5 9.5h3.8l4.8-4v13l-4.8-4H4.5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" fill="currentColor" fill-opacity="0.2"/><path d="M16.5 8.8a4.5 4.5 0 0 1 0 6.4M19.2 6.2a8 8 0 0 1 0 11.6"/>',
    headphones: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3.2" y="13" width="3.8" height="6.2" rx="1.6" fill="currentColor" fill-opacity="0.2"/><rect x="17" y="13" width="3.8" height="6.2" rx="1.6" fill="currentColor" fill-opacity="0.2"/>',
    scissors: '<circle cx="6.8" cy="7.2" r="2.6" fill="currentColor" fill-opacity="0.18"/><circle cx="6.8" cy="16.8" r="2.6" fill="currentColor" fill-opacity="0.18"/><path d="M9 8.8l10.8 7.4M19.8 7.8L9 15.2"/>',
    ruler: '<path d="M16.2 3.6l4.2 4.2-12.6 12.6-4.2-4.2L16.2 3.6z" fill="currentColor" fill-opacity="0.18"/><path d="M13.4 6.4l1.8 1.8M10.4 9.4l1.8 1.8M7.4 12.4l1.8 1.8"/>',
    bulb: '<path d="M9 17.5h6M10 20.5h4M8.5 14.5C7 13.3 6.2 11.7 6.2 9.8a5.8 5.8 0 1 1 11.6 0c0 1.9-.8 3.5-2.3 4.7-.6.5-1 1.3-1 2.1v.9h-5v-.9c0-.8-.4-1.6-1-2.1z" fill="currentColor" fill-opacity="0.18"/>',
    brain: '<path d="M9.5 4.5a3.5 3.5 0 0 0-3.4 2.8A3.2 3.2 0 0 0 4 10.2a3.3 3.3 0 0 0 1.1 2.5A3.2 3.2 0 0 0 7 18.2a3.3 3.3 0 0 0 5 .4V4.8a2.8 2.8 0 0 0-2.5-.3z" fill="currentColor" fill-opacity="0.18"/><path d="M14.5 4.5a3.5 3.5 0 0 1 3.4 2.8 3.2 3.2 0 0 1 2.1 2.9 3.3 3.3 0 0 1-1.1 2.5 3.2 3.2 0 0 1-1.9 5.5 3.3 3.3 0 0 1-5 .4V4.8a2.8 2.8 0 0 1 2.5-.3z" fill="currentColor" fill-opacity="0.14"/>',
    pin: '<path d="M14.5 4.2l5.3 5.3-2 2-1.8-.6-3.8 3.8.6 2.8-1.6 1.6-3.6-3.6-4.2 4.2 4.2-4.2-3.6-3.6 1.6-1.6 2.8.6 3.8-3.8-.6-1.8 2-2z" fill="currentColor" fill-opacity="0.18"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3.2" fill="currentColor" fill-opacity="0.16"/><circle cx="8.8" cy="8.8" r="1.2" fill="currentColor"/><circle cx="15.2" cy="8.8" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="8.8" cy="15.2" r="1.2" fill="currentColor"/><circle cx="15.2" cy="15.2" r="1.2" fill="currentColor"/>',
    school: '<path d="M3 10.5L12 5l9 5.5M5 10.5v8.8h14v-8.8" fill="currentColor" fill-opacity="0.14"/><path d="M9.8 19.3v-5.2h4.4v5.2M2.5 19.3h19"/>',
    star: '<path d="M12 3.4l2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6-4.4-4.3 6.1-.9L12 3.4z" fill="currentColor" fill-opacity="0.24"/>',
    flame: '<path d="M12.4 2.8c.4 3.4-2.8 5.2-2.8 8.2 0 1.4 1 2.4 2.4 2.4s2.5-1.1 2.4-2.8c2.2 1.5 3.6 3.8 3.6 6.2a6 6 0 1 1-12 0c0-3.8 2.6-6.2 4.3-8.6.9-1.4 1.6-3.2 2.1-5.4z" fill="currentColor" fill-opacity="0.22"/>',
    medal: '<circle cx="12" cy="14.5" r="5.4" fill="currentColor" fill-opacity="0.2"/><path d="M8.5 3.5l2.2 6M15.5 3.5l-2.2 6M12 12.2v4.6"/>',
    cart: '<path d="M3.2 4.5h2.4l2.2 10.2h10.4l2.2-7.5H6.6" fill="currentColor" fill-opacity="0.14"/><circle cx="9.6" cy="19" r="1.4" fill="currentColor"/><circle cx="17" cy="19" r="1.4" fill="currentColor"/>',
    bell: '<path d="M6.2 15.8h11.6l-1.4-2.2V10a4.4 4.4 0 1 0-8.8 0v3.6l-1.4 2.2z" fill="currentColor" fill-opacity="0.18"/><path d="M10.2 18.8a2 2 0 0 0 3.6 0"/>',
    play: '<path d="M7.5 5.4l11.2 6.6-11.2 6.6V5.4z" fill="currentColor" fill-opacity="0.24"/>',
    prev: '<path d="M16.5 5.4L5.3 12l11.2 6.6V5.4z" fill="currentColor" fill-opacity="0.24"/>',
    skip: '<path d="M5.5 5.8l8.8 6.2-8.8 6.2V5.8z" fill="currentColor" fill-opacity="0.22"/><path d="M18 5.8v12.4" stroke-width="2.2"/>',
    arrowRight: '<path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5" stroke-width="2.1"/>',
    arrowLeft: '<path d="M19 12H5M10.5 6.5L5 12l5.5 5.5" stroke-width="2.1"/>',
    arrowsH: '<path d="M7.5 8.5L4 12l3.5 3.5M16.5 8.5L20 12l-3.5 3.5M4.5 12h15"/>',
    home: '<path d="M3.5 10.8L12 3.8l8.5 7V19a1.8 1.8 0 0 1-1.8 1.8H5.3A1.8 1.8 0 0 1 3.5 19v-8.2z" fill="currentColor" fill-opacity="0.16"/><path d="M9.5 20.8v-6.2h5v6.2"/>',
    globe: '<circle cx="12" cy="12" r="8.8" fill="currentColor" fill-opacity="0.14"/><path d="M3.4 12h17.2M12 3.2c2.5 2.4 3.8 5.5 3.8 8.8s-1.3 6.4-3.8 8.8c-2.5-2.4-3.8-5.5-3.8-8.8S9.5 5.6 12 3.2z"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.6" fill="currentColor" fill-opacity="0.14"/><circle cx="8.8" cy="9.2" r="1.6" fill="currentColor"/><path d="M4.2 17.5l5.2-5 3.6 3.4 2.8-2.6 4.2 4.2"/>',
    camera: '<path d="M4 8.2A2.2 2.2 0 0 1 6.2 6h2.2l1.4-2h4.4l1.4 2h2.2A2.2 2.2 0 0 1 20 8.2v9.4a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 17.6V8.2z" fill="currentColor" fill-opacity="0.16"/><circle cx="12" cy="12.8" r="3.2" fill="currentColor" fill-opacity="0.2"/>',
    key: '<circle cx="8.2" cy="14.5" r="4" fill="currentColor" fill-opacity="0.2"/><path d="M11.2 11.5L19.5 3.5M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    mail: '<rect x="3.2" y="5.5" width="17.6" height="13" rx="2.5" fill="currentColor" fill-opacity="0.16"/><path d="M4.2 6.8l7.8 5.8 7.8-5.8"/>',
    link: '<path d="M10 13.8a4.2 4.2 0 0 0 6 .2l2.4-2.4a4.2 4.2 0 0 0-6-6l-1.4 1.4"/><path d="M14 10.2a4.2 4.2 0 0 0-6-.2L5.6 12.4a4.2 4.2 0 0 0 6 6l1.4-1.4"/>',
    radio: '<circle cx="12" cy="12" r="8.2" fill="currentColor" fill-opacity="0.14"/><circle cx="12" cy="12" r="3.6" fill="currentColor"/>',
    checkbox: '<rect x="4" y="4" width="16" height="16" rx="3.2" fill="currentColor" fill-opacity="0.18"/><path d="M8.2 12.2l2.6 2.6 5.2-5.4" stroke-width="2.2"/>',
    dotGreen: '<circle cx="12" cy="12" r="5.5" fill="#10b981" stroke="#34d399" stroke-width="2"/>',
    dotRed: '<circle cx="12" cy="12" r="5.5" fill="#ef4444" stroke="#f87171" stroke-width="2"/>',
    dotAmber: '<circle cx="12" cy="12" r="5.5" fill="#f59e0b" stroke="#fbbf24" stroke-width="2"/>',
    thumbUp: '<path d="M7 11v9H4.5a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 4.5 11H7zm0 0l3.2-6.6a1.8 1.8 0 0 1 3.3.9V9.5h4.8a2 2 0 0 1 2 2.3l-1.1 6.4a2 2 0 0 1-2 1.8H7" fill="currentColor" fill-opacity="0.18"/>',
    heart: '<path d="M12 20.2S4 15.2 4 9.5A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8 3.1c0 5.7-8 10.7-8 10.7z" fill="currentColor" fill-opacity="0.24"/>',
    party: '<path d="M4.5 19.5l4.2-11.2 7 7-11.2 4.2z" fill="currentColor" fill-opacity="0.22"/><path d="M14.2 5.2l1.2-1.8M18.8 9.8l1.8-1.2M17.5 5.8l2-2"/>',
    music: '<path d="M9.5 17.5V6.2l10-2v11.3"/><circle cx="7" cy="17.5" r="2.6" fill="currentColor" fill-opacity="0.22"/><circle cx="17" cy="15.5" r="2.6" fill="currentColor" fill-opacity="0.22"/>',
    cloud: '<path d="M7.2 18.8h10.2a4.2 4.2 0 0 0 .8-8.3A5.8 5.8 0 0 0 6.8 9.2a4.4 4.4 0 0 0 .4 9.6z" fill="currentColor" fill-opacity="0.18"/>',
    call: '<path d="M6.4 4.2h3.1l1.5 4-2 1.6a12 12 0 0 0 5.2 5.2l1.6-2 4 1.5v3.1a1.8 1.8 0 0 1-2 1.8C10.2 18.8 5.2 13.8 4.6 6.2a1.8 1.8 0 0 1 1.8-2z" fill="currentColor" fill-opacity="0.18"/>'
  };

  function ethIcon(name, extraClass) {
    var path = ICONS[name] || ICONS.sparkles;
    return '<span class="eth-svg-ico' + (extraClass ? ' ' + extraClass : '') + '" aria-hidden="true">' + SVG_OPEN + path + SVG_CLOSE + '</span>';
  }

  function ethTile(name, tone, size) {
    var path = ICONS[name] || ICONS.sparkles;
    var cls = 'eth-squircle-tile eth-tile-' + (tone || 'sky') + (size === 'lg' ? ' eth-tile-lg' : '');
    return '<span class="' + cls + '" aria-hidden="true">' + SVG_OPEN + path + SVG_CLOSE + '</span>';
  }

  function ethBookTile(levelTag, tone) {
    var path = '<path d="M4.2 4.8A2.2 2.2 0 0 1 6.4 2.6h11.6a1.6 1.6 0 0 1 1.6 1.6v15.6a1.6 1.6 0 0 1-1.6 1.6H6.4a2.2 2.2 0 0 1-2.2-2.2V4.8z" fill="currentColor" fill-opacity="0.22"/><path d="M8.2 2.6v18.8"/><path d="M11.4 8.2h5.2M11.4 12h3.6"/>';
    return '<span class="eth-squircle-tile eth-tile-lg eth-tile-' + (tone || 'sky') + ' eth-book-tile" aria-hidden="true">' +
      SVG_OPEN + path + SVG_CLOSE +
      '<span class="eth-book-tile-tag">' + levelTag + '</span>' +
    '</span>';
  }

  // Comprehensive Emoji -> Custom SVG Icon Map (covers ALL 95+ UI button stickers across Admin, Teacher & Student)
  var EMOJI_MAP = {
    '📑': 'spreadsheet',
    '📊': 'chartBar',
    '📈': 'chartUp',
    '📅': 'calendar',
    '📆': 'calendar',
    '💳': 'card',
    '👨‍🏫': 'teacher',
    '👩‍🏫': 'teacher',
    '🧑‍🏫': 'teacher',
    '🏆': 'trophy',
    '💻': 'laptop',
    '💬': 'chat',
    '⚡': 'bolt',
    '👑': 'crown',
    '💎': 'gem',
    '🤖': 'aiBot',
    '✨': 'sparkles',
    '💼': 'briefcase',
    '🎓': 'graduation',
    '🛡️': 'shield',
    '🛡': 'shield',
    '📚': 'books',
    '📖': 'bookOpen',
    '📗': 'book',
    '📘': 'book',
    '📙': 'book',
    '📕': 'book',
    '📓': 'book',
    '📝': 'note',
    '📄': 'note',
    '📋': 'clipboard',
    '🗂️': 'folder',
    '🗂': 'folder',
    '📁': 'folder',
    '📂': 'folder',
    '➕': 'plus',
    '✏️': 'edit',
    '✏': 'edit',
    '✍️': 'edit',
    '✍': 'edit',
    '🗑️': 'trash',
    '🗑': 'trash',
    '💾': 'save',
    '🔄': 'transfer',
    '🔁': 'transfer',
    '🔍': 'search',
    '🔎': 'search',
    '📥': 'download',
    '📤': 'upload',
    '🔒': 'lock',
    '🔓': 'unlock',
    '⚙️': 'settings',
    '⚙': 'settings',
    '👁️': 'eye',
    '👁': 'eye',
    '✅': 'check',
    '✔️': 'check',
    '✔': 'check',
    '❌': 'close',
    '⚠️': 'warning',
    '⚠': 'warning',
    '📲': 'sms',
    '📱': 'phone',
    '📞': 'call',
    '☎️': 'call',
    '🎨': 'palette',
    '🚀': 'rocket',
    '🎯': 'target',
    '⏱️': 'timer',
    '⏱': 'timer',
    '⏰': 'timer',
    '⏳': 'hourglass',
    '⌛': 'hourglass',
    '🎁': 'gift',
    '🏁': 'flag',
    '💸': 'money',
    '💵': 'money',
    '💰': 'coin',
    '🪙': 'coin',
    '👥': 'users',
    '👤': 'user',
    '🔊': 'speaker',
    '🔈': 'speaker',
    '🎧': 'headphones',
    '✂️': 'scissors',
    '✂': 'scissors',
    '📐': 'ruler',
    '💡': 'bulb',
    '🧠': 'brain',
    '📌': 'pin',
    '📍': 'pin',
    '🎲': 'dice',
    '🏫': 'school',
    '⭐': 'star',
    '🌟': 'star',
    '🔥': 'flame',
    '🏅': 'medal',
    '🥇': 'medal',
    '🛒': 'cart',
    '🛍️': 'cart',
    '🛍': 'cart',
    '🔔': 'bell',
    '▶': 'play',
    '▶️': 'play',
    '◀': 'prev',
    '◀️': 'prev',
    '⏭️': 'skip',
    '⏭': 'skip',
    '➡': 'arrowRight',
    '➡️': 'arrowRight',
    '⬅': 'arrowLeft',
    '⬅️': 'arrowLeft',
    '↔️': 'arrowsH',
    '↔': 'arrowsH',
    '🏠': 'home',
    '🌐': 'globe',
    '🖼️': 'image',
    '🖼': 'image',
    '📷': 'camera',
    '🔑': 'key',
    '✉️': 'mail',
    '✉': 'mail',
    '📧': 'mail',
    '🔗': 'link',
    '🔘': 'radio',
    '☑️': 'checkbox',
    '☑': 'checkbox',
    '🟢': 'dotGreen',
    '🔴': 'dotRed',
    '🟡': 'dotAmber',
    '👍': 'thumbUp',
    '❤️': 'heart',
    '❤': 'heart',
    '🎉': 'party',
    '🎵': 'music',
    '🎶': 'music',
    '☁️': 'cloud',
    '☁': 'cloud'
  };

  // Build single compiled regex sorted longest-first (so ZWJ & FE0F sequences match whole)
  var emojiKeys = Object.keys(EMOJI_MAP).sort(function (a, b) { return b.length - a.length; });
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var EMOJI_RE = new RegExp(emojiKeys.map(escRe).join('|'), 'g');

  // Target interactive UI controls, buttons, nav items, icon badges, section headings & status pills (never chat messages or inputs!)
  var UI_SELECTOR = [
    'button',
    'a.ap-btn',
    'a[href*=".apk"]',
    '.ap-item',
    '.ap-btn',
    '.neon-badge',
    '.eth-card-icon-box',
    '.eth-tab',
    '.wb-btn',
    '[role="button"]',
    'label[for="ethLuckyFileInputBottom"]',
    '.ap-plan small',
    '.ap-top',
    '.ap-sec h2',
    '#apView h1',
    '#apView h2',
    '#apView h3',
    '.eth-modal-icon-tile'
  ].join(',');

  var SKIP_TAGS = { INPUT: 1, TEXTAREA: 1, SELECT: 1, OPTION: 1, SCRIPT: 1, STYLE: 1, SVG: 1, CANVAS: 1, CODE: 1, PRE: 1 };

  function isInsideProtectedZone(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.closest('#luckysheet, .luckysheet, .chat-msg-text, .eth-chat-bubble, [contenteditable="true"], .eth-no-icon-upgrade')) {
      return true;
    }
    return false;
  }

  function upgradeTextNodesInElement(el) {
    if (!el || el.nodeType !== 1 || isInsideProtectedZone(el)) return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    var n;
    while ((n = walker.nextNode())) {
      var p = n.parentNode;
      if (!p || SKIP_TAGS[p.nodeName] || (p.classList && p.classList.contains('eth-svg-ico'))) continue;
      if (n.nodeValue && EMOJI_RE.test(n.nodeValue)) {
        textNodes.push(n);
      }
      EMOJI_RE.lastIndex = 0;
    }
    for (var i = 0; i < textNodes.length; i++) {
      var tn = textNodes[i];
      var str = tn.nodeValue;
      EMOJI_RE.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var lastIdx = 0;
      var m;
      while ((m = EMOJI_RE.exec(str)) !== null) {
        if (m.index > lastIdx) {
          frag.appendChild(document.createTextNode(str.slice(lastIdx, m.index)));
        }
        var iconKey = EMOJI_MAP[m[0]];
        if (iconKey && ICONS[iconKey]) {
          var span = document.createElement('span');
          span.className = 'eth-svg-ico';
          span.setAttribute('aria-hidden', 'true');
          span.innerHTML = SVG_OPEN + ICONS[iconKey] + SVG_CLOSE;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(m[0]));
        }
        lastIdx = EMOJI_RE.lastIndex;
      }
      if (lastIdx < str.length) {
        frag.appendChild(document.createTextNode(str.slice(lastIdx)));
      }
      if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
    }
  }

  function upgradeRoot(root) {
    var target = root || document.body;
    if (!target || target.nodeType !== 1) return;
    if (target.matches && target.matches(UI_SELECTOR)) {
      upgradeTextNodesInElement(target);
    }
    var nodes = target.querySelectorAll ? target.querySelectorAll(UI_SELECTOR) : [];
    for (var i = 0; i < nodes.length; i++) {
      upgradeTextNodesInElement(nodes[i]);
    }
    // Also upgrade modal/header/card standalone icon squares (border-radius 8px..18px or large emoji badges)
    var divs = target.querySelectorAll ? target.querySelectorAll('div[style*="border-radius:10px"], div[style*="border-radius:12px"], div[style*="border-radius:13px"], div[style*="border-radius:14px"], div[style*="border-radius:16px"], span[style*="font-size:20px"], span[style*="font-size:22px"], span[style*="font-size:24px"], div[style*="text-transform:uppercase"]') : [];
    for (var j = 0; j < divs.length; j++) {
      var d = divs[j];
      if (isInsideProtectedZone(d)) continue;
      if (d.textContent && d.textContent.trim().length > 0 && d.textContent.trim().length <= 42) {
        EMOJI_RE.lastIndex = 0;
        if (EMOJI_RE.test(d.textContent)) {
          upgradeTextNodesInElement(d);
        }
      }
    }
  }

  // Zero-flicker batched MutationObserver so dynamically rendered modals/tabs/tables upgrade immediately
  var pendingRoots = new Set();
  var rafScheduled = false;

  function flushUpgrades() {
    rafScheduled = false;
    pendingRoots.forEach(function (r) { upgradeRoot(r); });
    pendingRoots.clear();
  }

  function startObserver() {
    if (!document.body || window._ethIconObserverStarted) return;
    window._ethIconObserverStarted = true;
    upgradeRoot(document.body);

    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mut = mutations[i];
        if (mut.type === 'childList') {
          for (var k = 0; k < mut.addedNodes.length; k++) {
            var an = mut.addedNodes[k];
            if (an.nodeType === 1 && !an.classList.contains('eth-svg-ico')) {
              pendingRoots.add(an);
            } else if (an.nodeType === 3 && mut.target && mut.target.nodeType === 1) {
              pendingRoots.add(mut.target);
            }
          }
        }
      }
      if (pendingRoots.size > 0 && !rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(flushUpgrades);
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }

  window.ETHITH_ICONS = ICONS;
  window.ethIcon = ethIcon;
  window.ethTile = ethTile;
  window.ethBookTile = ethBookTile;
  window.ETHITH_UPGRADE_UI_ICONS = upgradeRoot;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
