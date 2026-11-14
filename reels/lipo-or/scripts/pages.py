# Из расшифровки делает src/v3/transcript.ts: субтитры по 2 слова, без знаков препинания в конце.
# Запуск: python3 -I scripts/pages.py transcript.json > src/v3/transcript.ts
import json, re, sys
d = json.load(open(sys.argv[1]))
ws = []
for seg in d['segments']:
    for w in seg['words']:
        t = w['w'].strip()
        if t in ('–', '—', '-'):
            continue
        if t.startswith('-') and ws:  # «откуда -то» → «откуда-то»
            ws[-1]['t'] += t; ws[-1]['e'] = w['e']; continue
        ws.append(dict(t=t, s=w['s'], e=w['e']))
for w in ws:
    w['t'] = re.sub(r'^([Лл])[еи]посакц', lambda m: m.group(1) + 'ипосакц', w['t'].rstrip(',.?!'))
WORD = {'конюля': 'канюля', 'вести': 'ввести', 'отцов': 'отсос', 'отца': 'отсоса', 'отсоса': 'отсоса', 'объем': 'объём',
        'трех': 'трёх', 'разобьем': 'разобьём', 'ультразву': 'ультразвук', 'фигурок': 'фигуры'}
out = []
i = 0
while i < len(ws):
    w = ws[i]; t = w['t']; nxt = ws[i + 1]['t'] if i + 1 < len(ws) else ''
    if t == 'из' and nxt.startswith(('буткет', 'блитк', 'бытк', 'будк')):
        out.append(dict(t='избыток', s=w['s'], e=ws[i + 1]['e'])); i += 2; continue
    if t == 'так' and nxt == 'же':
        out.append(dict(t='также', s=w['s'], e=ws[i + 1]['e'])); i += 2; continue
    # «разобьём вибрацией» — распознаётся по-разному (вибразвуком, вибрационную липосакцию)
    if out and out[-1]['t'] == 'разобьём' and t.startswith('вибр'):
        e = ws[i + 1]['e'] if nxt.startswith('липосакц') else w['e']
        out.append(dict(t='вибрацией', s=w['s'], e=e)); i += 2 if nxt.startswith('липосакц') else 1; continue
    w['t'] = WORD.get(t, t); out.append(w); i += 1
out[0]['t'] = out[0]['t'][:1].upper() + out[0]['t'][1:]
# концы предложений (по смыслу речи) — по словам
ENDS = {'похудения', 'напомнить', 'фигуры', 'видов', 'отсос', 'отсоса', 'убирать', 'вибрационная', 'ультразвуковая'}
lipo_end = {2, 4, 7, 9}  # какие по счёту «липосакцию/липосакции» заканчивают фразу
n = 0
phrases, cur = [], []
for w in out:
    cur.append(w)
    end = w['t'] in ENDS
    if w['t'].startswith('липосакци') or w['t'].startswith('Липосакци'):
        n += 1
        end = end or (w['t'] in ('липосакции', 'липосакцию') and n in lipo_end)
    if end:
        phrases.append(cur); cur = []
if cur: phrases.append(cur)
pages = []
for ph in phrases:
    pages += [ph[i:i + 2] for i in range(0, len(ph), 2)]
print('// Расшифровка голоса (Whisper small) с исправленными терминами.')
print('// По 2 слова на экране, без знаков препинания в конце.')
print('export type Word = {text: string; start: number; end: number};')
print('export type Page = {words: Word[]};\n')
print('export const PAGES: Page[] = [')
for p in pages:
    items = [f"{{text: {json.dumps(w['t'], ensure_ascii=False)}, start: {w['s']:.2f}, end: {w['e']:.2f}}}" for w in p]
    print('  {words: [' + ', '.join(items) + ']},')
print('];')
