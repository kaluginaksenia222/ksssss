# Субтитры для версии по нарезке заказчика: по 2 слова, все с маленькой буквы, без знаков в конце.
# Запуск: python3 -I scripts/pages2.py transcript2.json > src/v3/transcript2.ts
import json, re, sys
d = json.load(open(sys.argv[1]))
ws = []
for seg in d['segments']:
    for w in seg['words']:
        t = w['w'].strip()
        if t in ('–', '—', '-') or w['s'] > 58.6:  # после «убирать» распознавание выдумывает слова
            continue
        if t.startswith('-') and ws:
            ws[-1]['t'] += t; ws[-1]['e'] = w['e']; continue
        ws.append(dict(t=t, s=w['s'], e=w['e']))
FIX = {'избудки,': 'избыток,', 'вести.': 'ввести.', 'ходит': 'уходит', 'вибразвуком,': 'вибрацией,', 'конюля': 'канюля'}
out, i = [], 0
while i < len(ws):
    w = ws[i]; nxt = ws[i + 1]['t'] if i + 1 < len(ws) else ''
    w['t'] = re.sub(r'^([Лл])[еи]посакц', lambda m: m.group(1) + 'ипосакц', FIX.get(w['t'], w['t']))
    if w['t'] == 'от' and nxt.startswith('куда-то'):
        out.append(dict(t='откуда-то', s=w['s'], e=ws[i + 1]['e'])); i += 2; continue
    if w['t'] == 'в' and nxt.startswith('трёх'):
        i += 1; continue
    out.append(w); i += 1
phrases, cur = [], []
for w in out:
    cur.append(w)
    if w['t'][-1] in ',.?!':
        phrases.append(cur); cur = []
if cur: phrases.append(cur)
pages = []
for ph in phrases:
    pages += [ph[k:k + 2] for k in range(0, len(ph), 2)]
print('// Субтитры по нарезке заказчика (Whisper small + правки). Все с маленькой буквы.')
print("import type {Page} from './transcript';\n")
print('export const PAGES: Page[] = [')
for p in pages:
    items = [f"{{text: {json.dumps(w['t'].rstrip(',.?!').lower(), ensure_ascii=False)}, start: {w['s']:.2f}, end: {w['e']:.2f}}}" for w in p]
    print('  {words: [' + ', '.join(items) + ']},')
print('];')
