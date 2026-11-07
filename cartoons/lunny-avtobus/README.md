# Лунный автобус — мультсериал для детей (Shorts)

Герои нарисованы кодом: `src/characters.tsx` (енот Тоша, совёнок Бусинка, автобус Тарахтун, тучка Хмурка, Луна, звёзды).

- Shorts №1: композиция `LunnyShort01` (`src/Short01.tsx`), 1080×1920, 33 с.
- Музыка: `python3 -I scripts/lullaby.py public/music/lullaby.wav 33`
- Рендер (браузер из окружения):
  `npx remotion render LunnyShort01 renders/lunny-short01.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
- Громкость под YouTube (−14 LUFS):
  `ffmpeg -i renders/lunny-short01.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k renders/lunny-short01-v1.mp4`
