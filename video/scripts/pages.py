# Из расшифровки делает src/data/transcript.ts: субтитры по 2 слова, без знаков препинания.
# Запуск: python3 -I pages.py <transcript.json> > ../src/data/transcript.ts
# ПОД КАЖДОЕ ВИДЕО: поправить словарь fix (ошибки распознавания терминов),
# блок склейки/удаления слов и набор accent (слово рукописным шрифтом).
import json, sys, math
d = json.load(open(sys.argv[1]))
ws = [dict(t=w['w'].strip(), s=w['s'], e=w['e']) for seg in d['segments'] for w in seg['words']]
out = []
for w in ws:
    if w['t'].startswith('-') and out:
        out[-1]['t'] += w['t']; out[-1]['e'] = w['e']; continue
    out.append(w)
fix = {'блюпропластику,': 'блефаропластику,', 'блюпропластики,': 'блефаропластики,', 'два-три': 'два–три',
       'хлорг-эксиден': 'хлоргексидин', 'популярное': 'артериальное', 'отеки,': 'отёки,', 'еще': 'ещё'}
for w in out: w['t'] = fix.get(w['t'], w['t'])
res = []
for i, w in enumerate(out):
    if w['t'] == 'В' and out[i+1]['t'] == 'кофе':
        out[i+1]['s'] = w['s']; out[i+1]['t'] = 'Кофе'; continue
    if w['t'] == 'более':
        out[i+1]['s'] = w['s']; continue
    res.append(w)
# Фразы по знакам препинания, затем куски не длиннее 2 слов
phrases, cur = [], []
for w in res:
    cur.append(w)
    if w['t'][-1] in ',.':
        phrases.append(cur); cur = []
if cur: phrases.append(cur)
pages = []
for ph in phrases:
    pages += [ph[i:i+2] for i in range(0, len(ph), 2)]
for p_ in pages:
    for w in p_:
        w['t'] = w['t'].rstrip(',.')
hl = set()
accent = {'мягче'}
print('// Расшифровка голоса (Whisper small) с исправленными терминами.')
print('// Не больше 2 слов на экране, без знаков препинания. accent — рукописный акцентный шрифт.')
print('export type Word = {text: string; start: number; end: number; accent?: boolean};')
print('export type Page = {words: Word[]};\n')
print('export const PAGES: Page[] = [')
for p in pages:
    items = []
    for w in p:
        extra = ', accent: true' if w['t'] in accent else ''
        items.append(f"{{text: {json.dumps(w['t'], ensure_ascii=False)}, start: {w['s']:.2f}, end: {w['e']:.2f}{extra}}}")
    print('  {words: [' + ', '.join(items) + ']},')
print('];')
