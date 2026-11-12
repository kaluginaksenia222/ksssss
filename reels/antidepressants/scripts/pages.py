# Из расшифровки делает src/v3/transcript.ts: субтитры по 2 слова, без знаков препинания в конце.
# Запуск: python3 -I scripts/pages.py transcript.json > src/v3/transcript.ts
import json, sys
d = json.load(open(sys.argv[1]))
import re
def norm(t):
    # распознавание пишет «антидепресанты/антидипресанты» по-разному — приводим к норме
    m = re.match(r'^(антид[еи]пр?[еи]сс?ант)(\w*)(.*)$', t, re.I)
    if m:
        ending = {'ов': 'ы'}.get(m.group(2), m.group(2))  # «принимают антидепрессанты, нет»
        t = 'антидепрессант' + ending + m.group(3)
    return {'вернетесь.': 'вернётесь.', 'принимаю': 'Принимая', 'принимают': 'принимают'}.get(t, t)
ws = []
for seg in d['segments']:
    for w in seg['words']:
        t = w['w'].strip()
        if t in ('–', '—', '-'):
            continue
        if t.startswith('-') and ws:  # «как -то» → «как-то»
            ws[-1]['t'] += t; ws[-1]['e'] = w['e']; continue
        ws.append(dict(t=norm(t), s=w['s'], e=w['e']))
# Ошибки распознавания: последовательность слов → исправленные слова (время делится поровну)
fix = [
    (['после', 'операционный'], ['послеоперационный']),
    (['в', 'проведении'], ['проведению']), (['будет', 'мешать'], ['будут', 'мешать']),
    (['принимают', 'пациент.'], ['принимает', 'пациент.']), (['принимают', 'пациент?'], ['принимает', 'пациент.']),
]
out, i = [], 0
while i < len(ws):
    for src, dst in fix:
        if [w['t'] for w in ws[i:i + len(src)]] == src:
            s, e = ws[i]['s'], ws[i + len(src) - 1]['e']
            step = (e - s) / len(dst)
            out += [dict(t=t, s=s + k * step, e=s + (k + 1) * step) for k, t in enumerate(dst)]
            i += len(src)
            break
    else:
        out.append(ws[i]); i += 1
# «Мы» и «выполнили» распознаны с одним временем — сдвигаем
for a, b in zip(out, out[1:]):
    if b['s'] <= a['s']:
        a['e'] = b['s'] = a['s'] + 0.2
phrases, cur = [], []
for w in out:
    cur.append(w)
    if w['t'][-1] in ',.?!':
        phrases.append(cur); cur = []
if cur: phrases.append(cur)
pages = []
for ph in phrases:
    # нечётную фразу делим так, чтобы в конце не оставалось одно слово, если можно
    pages += [ph[i:i + 2] for i in range(0, len(ph), 2)]
print('// Расшифровка голоса (Whisper small) с исправленными терминами.')
print('// По 2 слова на экране, без знаков препинания в конце.')
print('export type Word = {text: string; start: number; end: number};')
print('export type Page = {words: Word[]};\n')
print('export const PAGES: Page[] = [')
for p in pages:
    items = [f"{{text: {json.dumps(w['t'].rstrip(',.?!'), ensure_ascii=False)}, start: {w['s']:.2f}, end: {w['e']:.2f}}}" for w in p]
    print('  {words: [' + ', '.join(items) + ']},')
print('];')
