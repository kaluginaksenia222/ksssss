# Субтитры по нарезке заказчика (робот da Vinci): по 2 слова, все с маленькой буквы, без знаков в конце.
# Запуск: python3 -I scripts/pages2.py transcript.json > src/v3/transcript.ts
import json, re, sys
d = json.load(open(sys.argv[1]))
ws = []
for seg in d['segments']:
    for w in seg['words']:
        t = w['w'].strip()
        if t in ('–', '—', '-'):
            continue
        if t.startswith('-') and ws:
            ws[-1]['t'] += t; ws[-1]['e'] = w['e']; continue
        ws.append(dict(t=t, s=w['s'], e=w['e']))
FIX = {'Давенчин.': 'да Винчи.', 'Давенчи.': 'да Винчи.', 'Давинчи.': 'да Винчи.', 'депрессивной': 'подготовку к', 'готовительской': 'подготовку к', 'Все': 'И', 'немного': 'на него', 'еще': 'ещё', 'нас': 'нас'}
out, i = [], 0
while i < len(ws):
    w = ws[i]; nxt = ws[i + 1]['t'] if i + 1 < len(ws) else ''
    w['t'] = re.sub(r'^([Лл])[еи]посакц', lambda m: m.group(1) + 'ипосакц', FIX.get(w['t'], w['t']))
    # «на отсленнике УГНК.» → «но в клинике УГМК»
    if w['t'] == 'на' and nxt.startswith(('отсленник', 'сленник')):
        out.append(dict(t='но', s=w['s'], e=w['e'])); out.append(dict(t='в клинике', s=ws[i + 1]['s'], e=ws[i + 1]['e'])); i += 2; continue
    if w['t'].startswith('УГ') and len(w['t']) <= 5:
        out.append(dict(t='УГМК', s=w['s'], e=w['e'])); i += 1; continue
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
print('export type Word = {text: string; start: number; end: number};')
print('export type Page = {words: Word[]};\n')
print('export const PAGES: Page[] = [')
for p in pages:
    items = [f"{{text: {json.dumps(w['t'].rstrip(',.?!').lower().replace('угмк', 'УГМК'), ensure_ascii=False)}, start: {w['s']:.2f}, end: {w['e']:.2f}}}" for w in p]
    print('  {words: [' + ', '.join(items) + ']},')
print('];')
