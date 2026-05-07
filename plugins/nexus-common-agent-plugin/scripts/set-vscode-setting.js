const fs = require('fs');
const os = require('os');
const path = require('path');

function stripBom(raw) {
    return raw.replace(/^\uFEFF/u, '');
}

function getSettingsPath() {
    const productDir = process.env.SPA_VSCODE_PRODUCT_DIR || process.argv[2] || 'Code';

    if (process.platform === 'win32') {
        return path.join(process.env.APPDATA || '', productDir, 'User', 'settings.json');
    }

    if (process.platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', productDir, 'User', 'settings.json');
    }

    return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), productDir, 'User', 'settings.json');
}

function stripJsonComments(raw) {
    let result = '';
    let inString = false;
    let inLineComment = false;
    let inBlockComment = false;
    let escapeNext = false;

    for (let index = 0; index < raw.length; index++) {
        const char = raw[index];
        const next = raw[index + 1];

        if (inLineComment) {
            if (char === '\n') {
                inLineComment = false;
                result += char;
            }
            continue;
        }

        if (inBlockComment) {
            if (char === '*' && next === '/') {
                inBlockComment = false;
                index++;
            }
            continue;
        }

        if (inString) {
            result += char;
            if (escapeNext) {
                escapeNext = false;
            } else if (char === '\\') {
                escapeNext = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            result += char;
            continue;
        }

        if (char === '/' && next === '/') {
            inLineComment = true;
            index++;
            continue;
        }

        if (char === '/' && next === '*') {
            inBlockComment = true;
            index++;
            continue;
        }

        result += char;
    }

    return result;
}

function stripTrailingCommas(raw) {
    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let index = 0; index < raw.length; index++) {
        const char = raw[index];

        if (inString) {
            result += char;
            if (escapeNext) {
                escapeNext = false;
            } else if (char === '\\') {
                escapeNext = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            result += char;
            continue;
        }

        if (char === ',') {
            let lookahead = index + 1;
            while (lookahead < raw.length && /\s/.test(raw[lookahead])) {
                lookahead++;
            }

            if (raw[lookahead] === '}' || raw[lookahead] === ']') {
                continue;
            }
        }

        result += char;
    }

    return result;
}

function parseSettings(raw) {
    const normalizedRaw = stripBom(raw);

    if (!normalizedRaw.trim()) {
        return { parsed: {}, normalizedText: '' };
    }

    const normalizedText = stripTrailingCommas(stripJsonComments(normalizedRaw));
    return {
        parsed: JSON.parse(normalizedText),
        normalizedText
    };
}

function getDefaultSettingsPath() {
    const candidates = [
        path.resolve(__dirname, '..', '.vscode', 'settings.json'),
        path.resolve(__dirname, '..', '..', '.vscode', 'settings.json'),
        path.resolve(__dirname, '..', '..', '..', '.vscode', 'settings.json')
    ];

    return candidates.find((candidate) => fs.existsSync(candidate));
}

function deepEqual(left, right) {
    if (left === right) {
        return true;
    }

    if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
        return false;
    }

    const leftIsArray = Array.isArray(left);
    const rightIsArray = Array.isArray(right);
    if (leftIsArray !== rightIsArray) {
        return false;
    }

    if (leftIsArray) {
        if (left.length !== right.length) {
            return false;
        }

        for (let index = 0; index < left.length; index++) {
            if (!deepEqual(left[index], right[index])) {
                return false;
            }
        }

        return true;
    }

    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    if (leftKeys.length !== rightKeys.length) {
        return false;
    }

    for (let index = 0; index < leftKeys.length; index++) {
        const key = leftKeys[index];
        if (key !== rightKeys[index]) {
            return false;
        }

        if (!deepEqual(left[key], right[key])) {
            return false;
        }
    }

    return true;
}

function isSameValue(left, right) {
    return deepEqual(left, right);
}

function formatValue(value, propertyIndent) {
    const json = JSON.stringify(value, null, 2);
    const lines = json.split('\n');

    if (lines.length === 1) {
        return json;
    }

    return [lines[0], ...lines.slice(1).map((line) => propertyIndent + line)].join('\n');
}

function skipTrivia(raw, index) {
    let cursor = index;

    while (cursor < raw.length) {
        const char = raw[cursor];
        const next = raw[cursor + 1];

        if (/\s/.test(char)) {
            cursor++;
            continue;
        }

        if (char === '/' && next === '/') {
            cursor += 2;
            while (cursor < raw.length && raw[cursor] !== '\n') {
                cursor++;
            }
            continue;
        }

        if (char === '/' && next === '*') {
            cursor += 2;
            while (cursor < raw.length && !(raw[cursor] === '*' && raw[cursor + 1] === '/')) {
                cursor++;
            }
            cursor += 2;
            continue;
        }

        break;
    }

    return cursor;
}

function readStringEnd(raw, start) {
    let cursor = start + 1;
    let escapeNext = false;

    while (cursor < raw.length) {
        const char = raw[cursor];
        if (escapeNext) {
            escapeNext = false;
        } else if (char === '\\') {
            escapeNext = true;
        } else if (char === '"') {
            return cursor;
        }
        cursor++;
    }

    throw new Error('Unterminated string literal in settings file.');
}

function findValueEnd(raw, start) {
    let cursor = start;
    let objectDepth = 0;
    let arrayDepth = 0;
    let inString = false;
    let escapeNext = false;

    while (cursor < raw.length) {
        const char = raw[cursor];
        const next = raw[cursor + 1];

        if (inString) {
            if (escapeNext) {
                escapeNext = false;
            } else if (char === '\\') {
                escapeNext = true;
            } else if (char === '"') {
                inString = false;
            }
            cursor++;
            continue;
        }

        if (char === '"') {
            inString = true;
            cursor++;
            continue;
        }

        if (char === '/' && next === '/') {
            break;
        }

        if (char === '/' && next === '*') {
            break;
        }

        if (char === '{') {
            objectDepth++;
        } else if (char === '}') {
            if (objectDepth === 0 && arrayDepth === 0) {
                break;
            }
            objectDepth--;
        } else if (char === '[') {
            arrayDepth++;
        } else if (char === ']') {
            arrayDepth--;
        } else if (char === ',' && objectDepth === 0 && arrayDepth === 0) {
            break;
        }

        cursor++;
    }

    while (cursor > start && /\s/.test(raw[cursor - 1])) {
        cursor--;
    }

    return cursor;
}

function findTopLevelProperties(raw) {
    const properties = new Map();
    const rootStart = raw.indexOf('{');
    const rootEnd = raw.lastIndexOf('}');

    if (rootStart === -1 || rootEnd === -1 || rootEnd <= rootStart) {
        throw new Error('Settings file is not a JSON object.');
    }

    let cursor = rootStart + 1;
    while (cursor < rootEnd) {
        cursor = skipTrivia(raw, cursor);
        if (cursor >= rootEnd) {
            break;
        }

        if (raw[cursor] !== '"') {
            break;
        }

        const keyStart = cursor;
        const keyEnd = readStringEnd(raw, keyStart);
        const key = JSON.parse(raw.slice(keyStart, keyEnd + 1));
        const propertyStart = raw.lastIndexOf('\n', keyStart - 1) + 1;

        cursor = skipTrivia(raw, keyEnd + 1);
        if (raw[cursor] !== ':') {
            throw new Error(`Malformed settings property: ${key}`);
        }

        const valueStart = skipTrivia(raw, cursor + 1);
        const valueEnd = findValueEnd(raw, valueStart);
        const afterValue = skipTrivia(raw, valueEnd);
        const hasComma = raw[afterValue] === ',';
        const propertyEnd = hasComma ? afterValue + 1 : afterValue;
        const propertyIndent = raw.slice(propertyStart, keyStart);

        properties.set(key, {
            propertyStart,
            propertyEnd,
            valueStart,
            valueEnd,
            propertyIndent,
            hasComma
        });

        cursor = propertyEnd;
    }

    return { properties, rootEnd };
}

function upsertSetting(raw, key, value, propertyMap, rootEnd) {
    const entry = propertyMap.get(key);
    if (entry) {
        const formattedValue = formatValue(value, entry.propertyIndent);
        const nextRaw = `${raw.slice(0, entry.valueStart)}${formattedValue}${raw.slice(entry.valueEnd)}`;
        return nextRaw;
    }

    const indent = propertyMap.size > 0
        ? Array.from(propertyMap.values())[0].propertyIndent
        : '  ';
    const formattedValue = formatValue(value, indent);
    const newProperty = `${indent}"${key}": ${formattedValue}`;
    const beforeClose = raw.slice(0, rootEnd);
    const insertAt = beforeClose.replace(/\s*$/u, '').length;
    const closeSuffix = raw.slice(rootEnd);

    if (propertyMap.size === 0) {
        return `${beforeClose.slice(0, insertAt)}\n${newProperty}\n${closeSuffix}`;
    }

    return `${beforeClose.slice(0, insertAt)},\n${newProperty}${beforeClose.slice(insertAt)}${closeSuffix}`;
}

function applySettings(raw, defaultSettings, currentSettings) {
    let nextRaw = stripBom(raw).trim() ? stripBom(raw) : '{}';
    const updatedKeys = [];

    for (const [key, value] of Object.entries(defaultSettings)) {
        if (isSameValue(currentSettings[key], value)) {
            continue;
        }

        const { properties, rootEnd } = findTopLevelProperties(nextRaw);
        nextRaw = upsertSetting(nextRaw, key, value, properties, rootEnd);
        currentSettings[key] = value;
        updatedKeys.push(key);
    }

    return { nextRaw, updatedKeys };
}

function main() {
    const defaultSettingsPath = getDefaultSettingsPath();
    if (!defaultSettingsPath) {
        throw new Error('Could not locate plugin default settings file.');
    }

    const settingsPath = getSettingsPath();
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });

    const defaultRaw = fs.readFileSync(defaultSettingsPath, 'utf8');
    const defaultSettings = parseSettings(defaultRaw).parsed;
    const raw = fs.existsSync(settingsPath) ? fs.readFileSync(settingsPath, 'utf8') : '';
    const parsedSettings = parseSettings(raw).parsed;
    const { nextRaw, updatedKeys } = applySettings(raw, defaultSettings, parsedSettings);

    if (updatedKeys.length === 0) {
        console.log(JSON.stringify({
            continue: true,
            systemMessage: 'Plugin default settings are already applied.'
        }));
        return;
    }

    fs.writeFileSync(settingsPath, `${nextRaw.replace(/\s*$/u, '')}${os.EOL}`, 'utf8');

    console.log(JSON.stringify({
        continue: true,
        systemMessage: `Applied plugin default settings: ${updatedKeys.join(', ')}`
    }));
}

try {
    main();
} catch (error) {
    console.log(JSON.stringify({
        continue: true,
        systemMessage: `Failed to apply plugin default settings: ${error instanceof Error ? error.message : String(error)}`
    }));
    process.exit(0);
}
