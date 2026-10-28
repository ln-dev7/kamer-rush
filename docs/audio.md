# Audio catalog and rights

The public build fetches `public/audio/catalog.json` locally; its recording paths are null, so it works with subtitles and synthesized effects without missing-file requests. No cloud TTS, streaming, API key or account is used at runtime. Audio starts after a gesture. Settings expose master/effects/voice/music volume, subtitles and mute. Map/settings/pause freeze playback. A single voice element prevents simultaneous speech. Engine and horn use original Web Audio synthesis.

40 original lines, four synthetic voices, ten clips each, 63.06 seconds total: ElevenLabs Eleven v3, Ali Alioum, Alimata, Jérôme and Tony. Separate generation consumed a reported 1007 of the approved maximum 2500 existing credits. Integration generated no additional audio. These are dialogues, not Cameroonian music. Accent authenticity has not been certified. See [casting](audio-manifest.json) and [rights notice](../public/audio/AUDIO-NOTICE.md).

Only implemented event/condition matches fire: greeting, colleague, horn, near traffic, blocked passage, light impact, client approach, pickup/dropoff. Negotiation, change, traffic lights, fault attribution and NPC motorcycle reactions remain inactive because their mechanics are absent. A recording's presence does not guarantee it triggers now.

The director avoids the two most recent choices when alternatives exist, applies line cooldowns (18/35 seconds), priority and at least 2.5 seconds between starts. A higher-priority line may interrupt after that gap; it never overlays another voice. Actual clip duration plus margin controls its active window. Subtitles continue without recordings.

## Add a recording or track

1. Verify synchronization and redistribution rights; attribution alone is insufficient. Preserve original provenance separately.
2. Put approved local files under `public/audio/voices/` or `public/audio/music/`. No external player URLs.
3. Add ID, exact text, voice, local file, duration, hash, trigger, boolean conditions, priority, cooldown, mechanic/audio status and license object. Music also requires title, artist, source and modifications.
4. Set license status to approved only for the intended use. Missing files use null. `approvedLocalAudio` rejects remote paths and traversal.
5. Wire only an existing game action. Test repeated triggers, pause, mute, subtitles and volumes. Credits read the same manifest.
6. Keep recording rights separate from the future code license; a public source release can omit audio while retaining subtitles.

No Cameroonian music is bundled because reviewed sources did not establish compatible game synchronization and public redistribution rights. The disabled track selector states this; it activates only when approved local tracks exist.

## Optional local installation

The generated MP3s are not in Git. Existing local files are preserved under `public/audio/voices/`, with the full rights-reviewed local mapping in ignored `public/audio/catalog.local.json`.

If you independently possess authorized recordings, place them in that ignored directory and create the local catalog using the public catalog schema. Set each local line's `file` to its `audio/voices/...` path and rights status to `approved` only for an authorized use. Put `VITE_LOCAL_AUDIO=1` in ignored `.env.local`, then restart Vite or rebuild. Never commit those files until redistribution rights are established. Set the flag to 0 for subtitle-only mode.

The delivered Mac already has this setup. Public clones default to `VITE_LOCAL_AUDIO=0`, require no MP3s and run the same mission logic. Tests validate the public text-only catalog; the additional integrity test runs only when the private local catalog exists.

Vite copies local public assets into local builds. Therefore do not upload the existing Mac's `dist/` as a public release: use a clean clone without ignored recordings/catalog, leave local audio disabled, then build. This task pushes source only and does not deploy.
