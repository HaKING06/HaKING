(() => {
    const supported = ['tr', 'en', 'es', 'ru', 'de', 'fr', 'jp', 'cn', 'pt', 'it', 'kr', 'ar', 'hi', 'bn', 'nl', 'pl', 'sv', 'vi', 'el', 'th'];
    const aliases = { ja: 'jp', zh: 'cn', ko: 'kr' };
    const byTimezone = {
        'Europe/Istanbul': 'tr', 'Asia/Tokyo': 'jp', 'Asia/Shanghai': 'cn', 'Asia/Hong_Kong': 'cn',
        'Asia/Seoul': 'kr', 'Europe/Madrid': 'es', 'America/Mexico_City': 'es', 'America/Bogota': 'es',
        'Europe/Moscow': 'ru', 'Asia/Dubai': 'ar', 'Asia/Riyadh': 'ar', 'Africa/Cairo': 'ar',
        'Europe/Paris': 'fr', 'Europe/Berlin': 'de', 'Europe/Rome': 'it', 'Europe/Lisbon': 'pt',
        'America/Sao_Paulo': 'pt', 'Asia/Kolkata': 'hi', 'Asia/Dhaka': 'bn', 'Europe/Amsterdam': 'nl',
        'Europe/Warsaw': 'pl', 'Europe/Stockholm': 'sv', 'Asia/Ho_Chi_Minh': 'vi',
        'Europe/Athens': 'el', 'Asia/Bangkok': 'th'
    };
    const normalize = value => {
        const primary = String(value || '').toLowerCase().split('-')[0];
        const code = aliases[primary] || primary;
        return supported.includes(code) ? code : null;
    };
    let saved = null;
    try { saved = normalize(localStorage.getItem('haking.language')); } catch (_) {}
    const preferred = (Array.isArray(navigator.languages) ? navigator.languages : [])
        .concat(navigator.language || [])
        .map(normalize)
        .find(Boolean);
    let timezone = '';
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) {}
    const language = normalize(new URLSearchParams(location.search).get('lang')) || saved || preferred || byTimezone[timezone] || 'en';
    document.documentElement.dataset.initialLang = language;
    document.documentElement.lang = ({ jp: 'ja', cn: 'zh-CN', kr: 'ko' })[language] || language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
})();
