# Из расшифровки делает src/v2/transcript.ts: субтитры до 4 слов, без знаков препинания в конце.
# Запуск: python3 -I pages.py <transcript.json> > ../src/data/transcript.ts
# ПОД КАЖДОЕ ВИДЕО: поправить словарь fix (ошибки распознавания терминов) и набор hl.
import json, sys, math
d = json.load(open(sys.argv[1]))
ws = [dict(t=w['w'].strip(), s=w['s'], e=w['e']) for seg in d['segments'] for w in seg['words']]
out = []
for w in ws:
    if w['t'].startswith('-') and out:
        out[-1]['t'] += w['t']; out[-1]['e'] = w['e']; continue
    out.append(w)
fix = {'намешают': 'нам мешают', 'радиост,': 'Радиесс,', 'проникан': 'проникает', 'смаз-лифтинг,': 'SMAS-лифтинг,'}
for w in out: w['t'] = fix.get(w['t'], w['t'])
res = []
for i, w in enumerate(out):
    if w['t'] == 'За' and i + 1 < len(out) and out[i + 1]['t'] == 'что':
        out[i + 1]['s'] = w['s']; out[i + 1]['t'] = 'Чего'; continue
    res.append(w)
# Фразы по знакам препинания, затем ровные куски не длиннее 4 слов
phrases, cur = [], []
for w in res:
    cur.append(w)
    if w['t'][-1] in ',.?!':
        phrases.append(cur); cur = []
if cur: phrases.append(cur)
pages = []
for ph in phrases:
    n = -(-len(ph) // 4)
    size = -(-len(ph) // n)
    pages += [ph[i:i+size] for i in range(0, len(ph), size)]
for p_ in pages:
    for w in p_:
        w['t'] = w['t'].rstrip(',.?!')
hl = {'мешают', 'много', 'боятся', 'филлеры', 'нити', 'мешает', 'аппаратные', 'SMAS-лифтинг', 'Радиесс',
      'выводится', 'ложкой', 'остаётся', 'реабилитационный', 'кровоснабжение', 'ложка'}
accent = set()
print('// Расшифровка голоса (Whisper small) с исправленными терминами.')
print('// До 4 слов на экране, без знаков препинания в конце. hl — слово в плашке.')
print('export type Word = {text: string; start: number; end: number; hl?: boolean};')
print('export type Page = {words: Word[]};\n')
print('export const PAGES: Page[] = [')
for p in pages:
    items = []
    for w in p:
        extra = ', hl: true' if w['t'] in hl else ''
        items.append(f"{{text: {json.dumps(w['t'], ensure_ascii=False)}, start: {w['s']:.2f}, end: {w['e']:.2f}{extra}}}")
    print('  {words: [' + ', '.join(items) + ']},')
print('];')
