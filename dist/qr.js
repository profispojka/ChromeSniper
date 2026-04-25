"use strict";
(() => {
    const GF_EXP = new Array(512);
    const GF_LOG = new Array(256);
    {
        let x = 1;
        for (let i = 0; i < 256; i++) {
            GF_EXP[i] = x;
            GF_LOG[x] = i;
            x <<= 1;
            if (x & 0x100)
                x ^= 0x11d;
        }
        for (let i = 255; i < 512; i++)
            GF_EXP[i] = GF_EXP[i - 255];
        GF_LOG[0] = 0;
    }
    const gfMul = (a, b) => a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
    const rsGenerator = (degree) => {
        let r = [1];
        for (let i = 0; i < degree; i++) {
            const n = new Array(r.length + 1).fill(0);
            for (let j = 0; j < r.length; j++) {
                n[j] = n[j] ^ r[j];
                n[j + 1] = n[j + 1] ^ gfMul(r[j], GF_EXP[i]);
            }
            r = n;
        }
        return r;
    };
    const rsRemainder = (data, ecLen) => {
        const gen = rsGenerator(ecLen);
        const rem = new Array(ecLen).fill(0);
        for (const b of data) {
            const factor = b ^ rem[0];
            rem.shift();
            rem.push(0);
            if (factor !== 0) {
                for (let i = 0; i < ecLen; i++) {
                    rem[i] = rem[i] ^ gfMul(gen[i + 1], factor);
                }
            }
        }
        return rem;
    };
    const DATA_CW = [
        19, 34, 55, 80, 108, 136, 156, 194, 232, 274,
        324, 370, 428, 461, 523, 589, 647, 721, 795, 861,
        932, 1006, 1094, 1174, 1276, 1370, 1468, 1531, 1631, 1735,
        1843, 1955, 2071, 2191, 2306, 2434, 2566, 2702, 2812, 2956,
    ];
    const EC_CW_PER_BLOCK = [
        7, 10, 15, 20, 26, 18, 20, 24, 30, 18,
        20, 24, 26, 30, 22, 24, 28, 30, 28, 28,
        28, 28, 30, 30, 26, 28, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    ];
    const NUM_BLOCKS = [
        1, 1, 1, 1, 1, 2, 2, 2, 2, 4,
        4, 4, 4, 4, 6, 6, 6, 6, 7, 8,
        8, 9, 9, 10, 12, 12, 12, 13, 14, 15,
        16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
    ];
    const CAP = [
        17, 32, 53, 78, 106, 134, 154, 192, 230, 271,
        321, 367, 425, 458, 520, 586, 644, 718, 792, 858,
        929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732,
        1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953,
    ];
    const ALIGN_POS = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170],
    ];
    const pickVersion = (bytes) => {
        for (let v = 1; v <= 40; v++) {
            if (CAP[v - 1] >= bytes)
                return v;
        }
        throw new Error('Data too long for QR code');
    };
    const buildDataCodewords = (bytes, version) => {
        const totalBits = DATA_CW[version - 1] * 8;
        const lenBits = version <= 9 ? 8 : 16;
        const bits = [];
        const pushBits = (val, n) => {
            for (let i = n - 1; i >= 0; i--)
                bits.push((val >>> i) & 1);
        };
        pushBits(0b0100, 4);
        pushBits(bytes.length, lenBits);
        for (const b of bytes)
            pushBits(b, 8);
        const term = Math.min(4, totalBits - bits.length);
        for (let i = 0; i < term; i++)
            bits.push(0);
        while (bits.length % 8 !== 0)
            bits.push(0);
        const padBytes = [0xec, 0x11];
        let padIdx = 0;
        while (bits.length < totalBits) {
            const pb = padBytes[padIdx % 2];
            for (let i = 7; i >= 0; i--)
                bits.push((pb >>> i) & 1);
            padIdx++;
        }
        const out = [];
        for (let i = 0; i < bits.length; i += 8) {
            let b = 0;
            for (let j = 0; j < 8; j++)
                b = (b << 1) | (bits[i + j] ?? 0);
            out.push(b);
        }
        return out;
    };
    const buildFinalCodewords = (data, version) => {
        const numBlocks = NUM_BLOCKS[version - 1];
        const totalDataCW = DATA_CW[version - 1];
        const ecPerBlock = EC_CW_PER_BLOCK[version - 1];
        const shortLen = Math.floor(totalDataCW / numBlocks);
        const longBlocks = totalDataCW % numBlocks;
        const shortBlocks = numBlocks - longBlocks;
        const dataBlocks = [];
        const ecBlocks = [];
        let pos = 0;
        for (let b = 0; b < numBlocks; b++) {
            const len = b < shortBlocks ? shortLen : shortLen + 1;
            const blk = data.slice(pos, pos + len);
            pos += len;
            dataBlocks.push(blk);
            ecBlocks.push(rsRemainder(blk, ecPerBlock));
        }
        const out = [];
        const maxLen = shortLen + 1;
        for (let i = 0; i < maxLen; i++) {
            for (let b = 0; b < numBlocks; b++) {
                if (i < dataBlocks[b].length)
                    out.push(dataBlocks[b][i]);
            }
        }
        for (let i = 0; i < ecPerBlock; i++) {
            for (let b = 0; b < numBlocks; b++)
                out.push(ecBlocks[b][i]);
        }
        return out;
    };
    const buildGrid = (version) => {
        const size = 17 + version * 4;
        const grid = [];
        const reserved = [];
        for (let r = 0; r < size; r++) {
            grid.push(new Array(size).fill(false));
            reserved.push(new Array(size).fill(false));
        }
        const finder = (x, y) => {
            for (let dy = -1; dy <= 7; dy++) {
                for (let dx = -1; dx <= 7; dx++) {
                    const xx = x + dx, yy = y + dy;
                    if (xx < 0 || xx >= size || yy < 0 || yy >= size)
                        continue;
                    let on = false;
                    if (dx === -1 || dx === 7 || dy === -1 || dy === 7)
                        on = false;
                    else if (dx === 0 || dx === 6 || dy === 0 || dy === 6)
                        on = true;
                    else if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
                        on = true;
                    else
                        on = false;
                    grid[yy][xx] = on;
                    reserved[yy][xx] = true;
                }
            }
        };
        finder(0, 0);
        finder(size - 7, 0);
        finder(0, size - 7);
        for (let i = 8; i < size - 8; i++) {
            grid[6][i] = i % 2 === 0;
            grid[i][6] = i % 2 === 0;
            reserved[6][i] = true;
            reserved[i][6] = true;
        }
        if (version >= 2) {
            const positions = ALIGN_POS[version - 1];
            for (const cy of positions) {
                for (const cx of positions) {
                    if ((cx === 6 && cy === 6) ||
                        (cx === 6 && cy === size - 7) ||
                        (cx === size - 7 && cy === 6))
                        continue;
                    for (let dy = -2; dy <= 2; dy++) {
                        for (let dx = -2; dx <= 2; dx++) {
                            const xx = cx + dx, yy = cy + dy;
                            const on = Math.abs(dx) === 2 || Math.abs(dy) === 2 || (dx === 0 && dy === 0);
                            grid[yy][xx] = on;
                            reserved[yy][xx] = true;
                        }
                    }
                }
            }
        }
        for (let i = 0; i < 9; i++) {
            reserved[8][i] = true;
            reserved[i][8] = true;
        }
        for (let i = 0; i < 8; i++) {
            reserved[size - 1 - i][8] = true;
            reserved[8][size - 1 - i] = true;
        }
        grid[size - 8][8] = true;
        reserved[size - 8][8] = true;
        if (version >= 7) {
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 3; j++) {
                    reserved[size - 11 + j][i] = true;
                    reserved[i][size - 11 + j] = true;
                }
            }
        }
        return { grid, reserved };
    };
    const placeData = (grid, reserved, data) => {
        const size = grid.length;
        let bitIdx = 0;
        let upward = true;
        for (let col = size - 1; col >= 1; col -= 2) {
            if (col === 6)
                col = 5;
            for (let i = 0; i < size; i++) {
                const y = upward ? size - 1 - i : i;
                for (let dx = 0; dx < 2; dx++) {
                    const x = col - dx;
                    if (!reserved[y][x]) {
                        const byte = data[bitIdx >>> 3];
                        const bit = byte === undefined ? 0 : (byte >>> (7 - (bitIdx & 7))) & 1;
                        grid[y][x] = bit === 1;
                        bitIdx++;
                    }
                }
            }
            upward = !upward;
        }
    };
    const MASK_FN = [
        (r, c) => (r + c) % 2 === 0,
        (r) => r % 2 === 0,
        (_r, c) => c % 3 === 0,
        (r, c) => (r + c) % 3 === 0,
        (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
        (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
        (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
        (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
    ];
    const applyMask = (grid, reserved, mask) => {
        const size = grid.length;
        const fn = MASK_FN[mask];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!reserved[r][c] && fn(r, c))
                    grid[r][c] = !grid[r][c];
            }
        }
    };
    const placeFormatInfo = (grid, mask) => {
        const data = (0b01 << 3) | mask;
        let rem = data;
        for (let i = 0; i < 10; i++)
            rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
        const bits = ((data << 10) | rem) ^ 0x5412;
        const size = grid.length;
        const get = (i) => ((bits >>> i) & 1) === 1;
        for (let i = 0; i < 6; i++)
            grid[8][i] = get(i);
        grid[8][7] = get(6);
        grid[8][8] = get(7);
        grid[7][8] = get(8);
        for (let i = 9; i < 15; i++)
            grid[14 - i][8] = get(i);
        for (let i = 0; i < 7; i++)
            grid[size - 1 - i][8] = get(i);
        for (let i = 7; i < 15; i++)
            grid[8][size - 15 + i] = get(i);
    };
    const placeVersionInfo = (grid, version) => {
        if (version < 7)
            return;
        let rem = version;
        for (let i = 0; i < 12; i++)
            rem = (rem << 1) ^ (((rem >>> 11) & 1) * 0x1f25);
        const bits = (version << 12) | rem;
        const size = grid.length;
        for (let i = 0; i < 18; i++) {
            const bit = ((bits >>> i) & 1) === 1;
            const a = Math.floor(i / 3);
            const b = (i % 3) + size - 11;
            grid[a][b] = bit;
            grid[b][a] = bit;
        }
    };
    const maskPenalty = (grid) => {
        const size = grid.length;
        let penalty = 0;
        for (let r = 0; r < size; r++) {
            let h = 1, v = 1;
            for (let c = 1; c < size; c++) {
                if (grid[r][c] === grid[r][c - 1])
                    h++;
                else {
                    if (h >= 5)
                        penalty += 3 + (h - 5);
                    h = 1;
                }
                if (grid[c][r] === grid[c - 1][r])
                    v++;
                else {
                    if (v >= 5)
                        penalty += 3 + (v - 5);
                    v = 1;
                }
            }
            if (h >= 5)
                penalty += 3 + (h - 5);
            if (v >= 5)
                penalty += 3 + (v - 5);
        }
        for (let r = 0; r < size - 1; r++) {
            for (let c = 0; c < size - 1; c++) {
                const v = grid[r][c];
                if (v === grid[r][c + 1] &&
                    v === grid[r + 1][c] &&
                    v === grid[r + 1][c + 1])
                    penalty += 3;
            }
        }
        const pat = [true, false, true, true, true, false, true];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c <= size - 11; c++) {
                let m = true;
                for (let i = 0; i < 7; i++)
                    if (grid[r][c + i] !== pat[i]) {
                        m = false;
                        break;
                    }
                if (!m)
                    continue;
                let trailing = true;
                for (let i = 7; i < 11; i++)
                    if (grid[r][c + i] !== false) {
                        trailing = false;
                        break;
                    }
                if (trailing)
                    penalty += 40;
                let leading = c >= 4;
                if (leading) {
                    for (let i = -4; i < 0; i++)
                        if (grid[r][c + i] !== false) {
                            leading = false;
                            break;
                        }
                }
                if (leading)
                    penalty += 40;
            }
        }
        for (let c = 0; c < size; c++) {
            for (let r = 0; r <= size - 11; r++) {
                let m = true;
                for (let i = 0; i < 7; i++)
                    if (grid[r + i][c] !== pat[i]) {
                        m = false;
                        break;
                    }
                if (!m)
                    continue;
                let trailing = true;
                for (let i = 7; i < 11; i++)
                    if (grid[r + i][c] !== false) {
                        trailing = false;
                        break;
                    }
                if (trailing)
                    penalty += 40;
                let leading = r >= 4;
                if (leading) {
                    for (let i = -4; i < 0; i++)
                        if (grid[r + i][c] !== false) {
                            leading = false;
                            break;
                        }
                }
                if (leading)
                    penalty += 40;
            }
        }
        let dark = 0;
        const total = size * size;
        for (let r = 0; r < size; r++)
            for (let c = 0; c < size; c++)
                if (grid[r][c])
                    dark++;
        const ratio = (dark * 100) / total;
        penalty += Math.floor(Math.abs(ratio - 50) / 5) * 10;
        return penalty;
    };
    const encode = (text) => {
        const bytes = new TextEncoder().encode(text);
        const version = pickVersion(bytes.length);
        const dataCW = buildDataCodewords(bytes, version);
        const finalCW = buildFinalCodewords(dataCW, version);
        const { grid, reserved } = buildGrid(version);
        placeData(grid, reserved, finalCW);
        let bestMask = 0;
        let bestPenalty = Infinity;
        for (let m = 0; m < 8; m++) {
            const trial = grid.map((r) => r.slice());
            applyMask(trial, reserved, m);
            placeFormatInfo(trial, m);
            const p = maskPenalty(trial);
            if (p < bestPenalty) {
                bestPenalty = p;
                bestMask = m;
            }
        }
        applyMask(grid, reserved, bestMask);
        placeFormatInfo(grid, bestMask);
        placeVersionInfo(grid, version);
        return grid;
    };
    window.__dsdQR = {
        encode,
    };
})();
