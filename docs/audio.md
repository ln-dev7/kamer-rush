# Dialogue audio

The game and credits load `public/audio/catalog.json`. All 40 MP3s are included under `public/audio/voices/` and work by default in a fresh clone after a user enables sound. No account, API key, streaming service, local catalog or environment flag is needed. Subtitles and the global sound toggle remain independent; settings expose master/effects/voice/music volumes. Map/settings/pause freeze audio. Engine and horn are original Web Audio synthesis.

## Provenance and rights

40 original lines, four synthetic voices, ten clips each, 63.06 seconds total: ElevenLabs Eleven v3; Ali Alioum, Alimata, Jérôme and Tony. These descriptions do not certify a Cameroonian accent or imply endorsement. [Casting manifest](audio-manifest.json) records IDs, text, voice, model, duration, bytes and hashes. The owner explicitly confirmed their rights and authorized publication on 28 October 2026. [The audio notice](../public/audio/AUDIO-NOTICE.md) identifies separate output terms; recordings do not automatically inherit any future open-source code license. No account data, usage balances or credentials are needed or distributed.

## Event behavior

Twenty lines are connected to present events: greeting, nearby colleague, horn, close traffic, blocked passage, light impact, client approach and pickup/dropoff. The other recordings remain available without fabricated negotiation, change, traffic lights, fault attribution or NPC motorcycle mechanics.

The director avoids the two most recent choices where alternatives exist, enforces line cooldowns (18/35 seconds), priority and at least 2.5 seconds between starts. One voice element prevents overlap; a higher-priority line can interrupt after the gap. Recorded duration plus a margin controls its active window. Subtitles work even while audio is muted.

## Extend safely

1. Verify rights for game synchronization and intended redistribution; preserve provenance.
2. Add the authorized recording under `public/audio/voices/`.
3. Add ID, exact text, voice, file, duration, SHA-256, trigger/conditions, priority, cooldown and rights to the catalog and casting manifest.
4. Wire only an existing action. Test repeated triggers, pause, mute, subtitles and volume, then run the hash tests/build.
5. Credits read the same catalog; keep source notices and audio rights distinct from the code.

No Cameroonian music is bundled: reviewed sources did not establish compatible rights. Music remains separate from this voice authorization; the track selector stays disabled until an authorized music asset exists.
