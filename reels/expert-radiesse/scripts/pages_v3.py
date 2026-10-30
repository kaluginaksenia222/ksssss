# Из расшифровки делает src/v3/transcript.ts: субтитры по 2 слова, без знаков препинания в конце.
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
fix = {'рамборка': 'прям ложки', 'специальных': 'специальные', 'намешают': 'нам мешают', 'радиост,': 'Радиесс,', 'проникан': 'проникает', 'смаз-лифтинг,': 'SMAS-лифтинг,'}
for w in out: w['t'] = fix.get(w['t'], w['t'])
# Исправление из двух слов делим обратно на два слова, время делим пополам
split_out = []
for w in out:
    parts = w['t'].split(' ')
    if len(parts) == 2:
        mid = (w['s'] + w['e']) / 2
        split_out += [dict(t=parts[0], s=w['s'], e=mid), dict(t=parts[1], s=mid, e=w['e'])]
    else:
        split_out.append(w)
out = split_out
res = []
for i, w in enumerate(out):
    if w['t'] == 'За' and i + 1 < len(out) and out[i + 1]['t'] == 'что':
        out[i + 1]['s'] = w['s']; out[i + 1]['t'] = 'Чего'; continue
    # «рамборка в специальных» — ошибка распознавания: на самом деле «прям ложки специальные»
    if w['t'] == 'в' and i + 1 < len(out) and out[i + 1]['t'] == 'специальные':
        continue
    res.append(w)
# Фразы по знакам препинания, затем куски по 2 слова
phrases, cur = [], []
for w in res:
    cur.append(w)
    if w['t'][-1] in ',.?!':
        phrases.append(cur); cur = []
if cur: phrases.append(cur)
pages = []
for ph in phrases:
    pages += [ph[i:i+2] for i in range(0, len(ph), 2)]
for p_ in pages:
    for w in p_:
        w['t'] = w['t'].rstrip(',.?!')
hl = set()
accent = set()
print('// Расшифровка голоса (Whisper small) с исправленными терминами.')
print('// По 2 слова на экране, без знаков препинания в конце.')
print('export type Word = {text: string; start: number; end: number};')
print('export type Page = {words: Word[]};\n')
print('export const PAGES: Page[] = [')
for p in pages:
    items = []
    for w in p:
        extra = ''
        items.append(f"{{text: {json.dumps(w['t'], ensure_ascii=False)}, start: {w['s']:.2f}, end: {w['e']:.2f}{extra}}}")
    print('  {words: [' + ', '.join(items) + ']},')
print('];')
